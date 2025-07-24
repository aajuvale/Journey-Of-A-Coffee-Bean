// javascript/pricechart.js - shows the line chart of historical coffee prices

//global variables
let totalPriceArray = [];
let showAllYears = true;
let currentYear = '';

//will grab the dataset
document.addEventListener('DOMContentLoaded', function(){
    //will load the csv file and store it into an array
    Promise.all([d3.csv('datasets/coffee-prices-historical-chart-data.csv').then(data =>
        data.map(r => ({
            //extarct the attributes in the correct type
            Date: new Date(r.date),
            Year: new Date(r.date).getFullYear(),
            Price: +r.value
        }))
    )])
    .then(function(values) {
        totalPriceArray = values[0];
        console.log(totalPriceArray)
        createLineGraph();
    })
})

//will listen for the checkbox
const checkbox = document.getElementById('priceCheckBox');

// Add an event listener for the 'change' event
checkbox.addEventListener('change', function() {
    if (checkbox.checked) {
        //will enable the range
        var range = document.getElementById('priceYearRange');

        //changed to false for specific year and will grab the year its on
        showAllYears = false;
        currentYear = range.value;

        range.disabled = false;

        createLineGraph();
    }
    else{
        //will disable the range
        var range = document.getElementById('priceYearRange');

        //changed to true for specific year
        showAllYears = true;

        range.disabled = true; 
        createLineGraph();
    }
});

//will adjust graph if radio year is changed
function getRadioYear(){
    //will grab the range and chane label
    var range = document.getElementById('priceYearRange');
    var label = document.getElementById('priceRangeLabel');

    currentYear = range.value;
    label.textContent = currentYear;
    console.log(currentYear)

    createLineGraph();
}

//will create the price graph
function createLineGraph(){
    let priceArray = totalPriceArray;
    let lineWidth = 1;
    let lineOpacity = 1;

    console.log(showAllYears)
    if(!showAllYears){
        priceArray = priceArray.filter(d => d['Year'] == currentYear);
        lineWidth = 5;
        lineOpacity = 0.5;
    }

    //grab the svg and max price
    const svg = d3.select('#priceChartSvg');
    const maxPrice = d3.max(priceArray, d => d['Price']);

    svg.selectAll('*').remove();

    const width = 1000;
    const height = 430;
    const xDiff = 100;

    //will create the xScale based on years
    var xScale = d3.scaleTime()
        .domain(d3.extent(priceArray, d => d['Date']))
        .range([0, width])

    //will create the yScale based on 
    var yScale = d3.scaleLinear()
        .domain([0, 4.5])
        .range([height, 10])

    //will append the x and y axis
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(${xDiff}, ${height})`)
        .call(d3.axisBottom().scale(xScale));

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${xDiff}, 0)`)
        .call(d3.axisLeft().scale(yScale))

    //add x axis title
    svg.append('text')
        .attr("x", (width / 2) + xDiff) 
        .attr("y", height + 60)  
        .attr("text-anchor", "middle")
        .attr("font-size", "25px")
        .text("Years");

    //add y axis title
    svg.append("text")
        .attr("class", "yAxis")
        .attr("x", (-height / 2)) 
        .attr("y", 55)  
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("font-size", "25px")
        .text("Price of Coffee Per Pound (USD)");

    //will create and append the line
    const line = d3.line()
        .x(d => xScale(d['Date']) + xDiff)
        .y(d => yScale(d['Price']))


    svg.append('path')
        .datum(priceArray)
        .attr('class', 'priceLine')
        .attr("fill", "none")
        .attr("stroke", "#574237")
        .attr("stroke-width", 1)
        .attr("d", line);
    

    //will create the tooltip
    var toolTip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('width', '90px')
        .style('height', '15px')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('border', '2px solid black')
        .style('border-radius', '3px')

    var dateToolTip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('width', '90px')
        .style('height', '15px')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .style('color', 'white')
        .style('background', '#574237')
        .style('padding', '10px')
        .style('border', '2px solid black')
        .style('border-radius', '3px')

    //will add lines for each date that will have an opacity of 0
    //until hovered over and a tooltip will appear
    svg.selectAll('priceLines')
        .data(priceArray)
        .enter()
        .append('line')
            .attr('class', 'verticalLines')
            .attr('x1', d => xScale(d['Date']) + xDiff)
            .attr('x2', d => xScale(d['Date']) + xDiff)
            .attr('y1', yScale(0))
            .attr('y2', yScale(4.0))
            .attr('stroke', '#1e4a36')
            .attr('stroke-width', lineWidth)
            .style('opacity', 0)
            //add the tooltip event
            .on('mouseover', function(event,d) {
                const price = (+d['Price']).toFixed(2);
                
                //will get correct date format
                const formatTime = d3.timeFormat("%m-%d-%Y");
                const priceDate = formatTime(d['Date']);

                //will get svg position
                const svgPosition = svg.node().getBoundingClientRect().top + window.scrollY; 

                //add the tooltips for the date and price
                toolTip.transition()
                    .duration(200)
                    .style('opacity', 1)
                    toolTip.html(`Price: $${price}`)
                    .style("left", (event.pageX + 1) + "px")
                    .style("top", (event.pageY + 28) + "px")
                    .style("stroke", "black")
                    .style("fill", "blue");
                dateToolTip.transition()
                    .duration(200)
                    .style('opacity', 1)
                    dateToolTip.html(`${priceDate}`)
                    .style("left", (event.pageX - 48) + "px")
                    .style("top", (svgPosition) + "px")
                    .style("stroke", "black")
                    .style("fill", "blue");
                d3.select(this)    
                    .style('opacity', lineOpacity);
            })
            .on('mousemove', function(event, d) {
                //grab svg mouse position
                const svgPosition = svg.node().getBoundingClientRect().top + window.scrollY; 

                toolTip.style("left", (event.pageX + 1) + "px")
                    .style("top", (event.pageY - 43) + "px");
                dateToolTip.style("left", (event.pageX - 48) + "px")
                    .style("top", (svgPosition + 25) + "px");
            })
            .on("mouseout", function(event, d) {
                toolTip.transition()
                    .duration(100)
                    .style("opacity", 0);
                dateToolTip.transition()
                    .duration(100)
                    .style("opacity", 0);
                d3.select(this)
                    .style('opacity', 0)
            });
}