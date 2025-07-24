// javascript/processingChart.js - makes the bar chart of per country techniques

//global variables
let processingArray = []
let northAmerica = []
let southAmeica = []
let asia = []
let africa = []
let barDifference = new Map();
let currentContinent = 'Asia';
let methodDescription = new Map([
    ['Washed / Wet','The Washed / Wet method is where the coffee cherries are harvested and then the outer skin is removed. The beans are soaked in water to remove the sticky pulp, leaving only the beans. Afterward, the beans are fermented to help remove any remaining fruit material and then dried. This tends to produce a clean, bright, and fruity cup of coffee with pronounced acidity.'],
    ['Natural / Dry','The Natural / Dry method is where the coffee cherries are harvested and then dried, usually by layinh out in the sun, with the whole fruit still attached to the bean. This is one of the oldest and most traditional methods. Natural processed coffees tend to have a heavier body with lower acidity and sometimes a fuller, earthy flavor profile.'],
    ['Pulped natural / honey','The Pulped natural / honey method is a hybrid between washed and natural processing. The outer skin of the coffee cherry is removed, but some or all of the mucilage (the sugary substance around the bean) is left on the bean during the drying process. This produces a rounder, sweeter flavor in comparison to washed coffee.'],
    ['Semi-washed / Semi-pulped','The Semi-washed / Semi-pulped method is where the coffee cherries are processed similarly to the wet method, but the beans are only partially washed. The mucilage is left on the beans during the drying process. After fermentation, the beans are dried with the remaining mucilage still attached. The semi-washed method has a smooth, balanced profile with medium acidity and a light to medium body.'],
    ['Other','There are other, not as common, processing methods which consists or non-traditional or experimental methods. The flavor of coffee processed this way can vary widely depending on the specific technique.']
]);

//will grab the dataset
document.addEventListener('DOMContentLoaded', function(){
    //will load the csv file and store it into an array
    Promise.all([d3.csv('datasets/Coffee_Qlty.csv').then(data =>
        data.map(r => ({
            //extarct the attributes in the correct type
            Continent: r['Continent.of.Origin'],
            Country: r['Country.of.Origin'],
            Variety: r['Variety'],
            Method: r['Processing.Method'],
            Value: r['Aroma']
        }))
    )])
    .then(function(values) {
        processingArray = values[0];
        processingArray = d3.filter(processingArray, d => d['Method'] != "")
        processingArray = d3.filter(processingArray, d => d['Variety'] != "")

        //will remove duplicate varieties per country
        processingArray = Array.from(d3.group(processingArray, d => `${d['Country']}-${d['Variety']}`).values()).map(group => group[0]);

        northAmerica = d3.filter(processingArray, d => d['Continent'] == 'North America');
        southAmeica = d3.filter(processingArray, d => d['Continent'] == 'South America');
        asia = d3.filter(processingArray, d => d['Continent'] == 'Asia');
        africa = d3.filter(processingArray, d => d['Continent'] == 'Africa');

        createBarGraph(asia, 18, 110, 1, 90);
    })
})

//will create the bar graph
function createBarGraph(continentData, barWidth, methodGap, barGap, axisGap){
    //grab the svg
    const svg = d3.select('#processingChart');
    svg.selectAll('*').remove();

    //will change the chart title
    let chartTitle = document.getElementById('barchartLabel');
    chartTitle.innerHTML = `The Aroma of Coffee Beans Based on <br> Processing Types in ${currentContinent}`;

    //establish the margins, etc
    const width = 1100;
    const height = 400;

    //create and append the x axis
    const xScale = d3.scaleBand()
        .domain([])
        .range([0, width-30])
        .padding(0.2);

    svg.append("g")
        .attr("transform", `translate(70,${height+5})`)
        .call(d3.axisBottom(xScale));

    //add x axis title
    svg.append('text')
        .attr("x", (width / 2) + 50) 
        .attr("y", height + 70)  
        .attr("text-anchor", "middle")
        .attr("font-size", "25px")
        .text("Processing Type");

    //create and append the y axis
    const yScale = d3.scaleLinear()
        .domain([0, 10])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(70, 5)`)
        .call(d3.axisLeft(yScale));

    //add y axis title
    svg.append("text")
        .attr("class", "yAxis")
        .attr("x", (-height / 2)) 
        .attr("y", 35)  
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("font-size", "25px")
        .text("Aroma of Coffee Beans");

    //create a color scale for each country
    const countries = Array.from(new Set(continentData.map(d => d.Country)));
    const interpolator = d3.interpolateRgb("#965f41", "#016738");
    const color = d3.scaleOrdinal()
        .domain(countries)
        .range(d3.range(countries.length).map(d => d3.color(interpolator(d / (countries.length - 1))).formatHex()));

    //create groups by method
    const methodGroups = d3.group(continentData, d => d.Method);
    const methodGroupsData = Array.from(
        d3.group(continentData, d => d.Method),
        ([method, values]) => ({ method, values })
    );
    var maxLength = 0;
    
    //will get the max length out of all method groups
    methodGroups.forEach((method) => {
        if(method.length > maxLength){
            maxLength = method.length;
        }
    })

     //will create the tooltip
     var toolTip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('width', '150px')
        .style('height', '30px')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('color', 'white')
        .style('border', '2px solid #42594f')
        .style('box-shadow', '2px 4px 8px hsl(0deg 0% 25%)')
        .style('background', '#6b9985');

    var typeToolTip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('width', '275px')
        .style('height', '250px')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('font-size', '15px')
        .style('color', 'white')
        .style('background', '#574237')
        .style('padding', '10px')
        .style('border', '1px solid #66554b')
        .style('border-radius', '0px')


    //will compute the X position for each method group
    let currentX = 0;
    const methodPositions = {};

    methodGroupsData.forEach(({ method, values }) => {
        methodPositions[method] = currentX;
        currentX += values.length * barWidth + methodGap;
    });

    methodGroupsData.forEach(({ method, values }) => {
        svg.selectAll(`.bars`)
            .data(values)
            .enter()
            .append("rect")
            .attr("x", (d, i) => (methodPositions[method] + i * (barWidth + barGap)) + axisGap) 
            .attr("y", (d) => yScale(parseFloat(d.Value)))
            .attr("width", barWidth)
            .attr("height", (d) => (height+5) - yScale(parseFloat(d.Value)))
            .attr("fill", (d) => color(d.Country))
            .on('mouseover', function(event,d) {
                toolTip.transition()
                    .duration(200)
                    .style('opacity', 1)
                    toolTip.html(`${d.Country}<br>Variety: ${d.Variety}`)
                    .style("left", (event.pageX + 8) + "px")
                    .style("top", (event.pageY - 58) + "px")
                    .style("stroke", "black")
                    .style("fill", "blue");
            })
            .on('mousemove', function(event, d) {
                toolTip.style("left", (event.pageX + 8) + "px")
                    .style("top", (event.pageY - 58) + "px");
            })
            .on("mouseout", function(event, d) {
                toolTip.transition()
                    .duration(100)
                    .style("opacity", 0);
            });
    });

    svg.selectAll('.methodLabel')
        .data(methodGroupsData)
        .enter()
        .append('g')  
        .each(function({ method, values }) {
            var group = d3.select(this);

            //add the text labels
            var methodLabel = group.append('text')
                .attr('x', (methodPositions[method] + (values.length * barWidth) / 2) + axisGap)
                .attr('y', height + 30)
                .style('text-anchor', 'middle')
                .style('font-size', '13px')
                .style('fill', 'white') 
                .text(method)
                //add the tooltip to show processing information
                .on('mouseover', function(event, d) {
                    typeToolTip.transition()
                        .duration(200)
                        .style('opacity', 1)
                    typeToolTip.html(methodDescription.get(method))
                        .style('left', (event.pageX - 80) + 'px')
                        .style('top', (event.pageY + 20) + 'px')
                        .style('stroke', 'black')
                        .style('fill', 'blue')
                        .style('border-radius', '5px')
                        .style('box-shadow', '0 4px 12px rgba(0,0,0,0.1)')
                        .style('border', '1.5px solid black');
                })
                .on('mousemove', function(event, d) {
                    typeToolTip.style('left', (event.pageX - 80) + 'px')
                        .style('top', (event.pageY + 20) + 'px');
                })
                .on('mouseout', function(event, d) {
                    typeToolTip.transition()
                        .duration(100)
                        .style('opacity', 0);
                });

            //find the bounding box for the rect
            methodLabel.node().getBoundingClientRect();

            //delay the rect until text is added
            setTimeout(function() {
                var bbox = methodLabel.node().getBBox();  

                //add a rectangle under the text
                group.insert('rect', 'text')
                    .attr('x', bbox.x - 5) 
                    .attr('y', bbox.y - 5)  
                    .attr('width', bbox.width + 10)  
                    .attr('height', bbox.height + 10)  
                    .style('fill', '#3d2d24')
            }, 0); 

        });
}

//will draw the north america graph
function northAmericaGraph(chosenContinent){
    if(currentContinent != chosenContinent){
        currentContinent = chosenContinent;
        createBarGraph(northAmerica, 18, 90, 1, 80);
    }
    
}

//will draw the south america graph
function southAmericaGraph(chosenContinent){
    if(currentContinent != chosenContinent){
        currentContinent = chosenContinent;
        createBarGraph(southAmeica, 30, 150, 3, 180);
    }
    
}

//will draw the asia graph
function asiaGraph(chosenContinent){
    if(currentContinent != chosenContinent){
        currentContinent = chosenContinent;
        createBarGraph(asia, 18, 110, 1, 90);
    }
    
}

//will draw the africa graph
function africaGraph(chosenContinent){
    if(currentContinent != chosenContinent){
        currentContinent = chosenContinent;
        createBarGraph(africa, 28, 200, 3, 180);
    }
    
}