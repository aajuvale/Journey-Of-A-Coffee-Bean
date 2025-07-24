// javascript/piechart.js – 5 largest companies for coffee in taiwan ever

d3.csv("datasets/arabica_data_cleaned.csv").then(data => {
    const taiwanComp = d3.rollup(
        data.filter(d => d["Country.of.Origin"] === "Taiwan"),
        v => v.length,
        d => d["Company"]
    ); //get totals, verify on smaller values

    const dataset = Array.from(taiwanComp, ([company, count]) => ({ company, count }))
    .sort((a, b) => d3.descending(a.count, b.count))
    .slice(0, 5); //just 5 largest for pie chart

    //set pos and create pie chart svg - center on ur screen, verify with ahmed it looks the same on his
    const svg = d3.select("#pie-chart")
        .append("svg")
        .attr("width", 1150)
        .attr("height", 1150)
        .append("g")
        .attr("transform", `translate(${450}, ${400})`);

//from colors.j with more in range
    const colorScale = d3.scaleOrdinal()
    .domain(dataset.map(d => d.company))
    .range(["#965f41", "#766242", "#577044", "#377d45", "#016738"]);

//start pie chart
    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(280);

    const arcLabel = d3.arc()
        .innerRadius(210)
        .outerRadius(200);

//do tolltip stuff for exact num of eacch comp's farms
    svg.selectAll("path")
    .data(pie(dataset))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => colorScale(d.data.company))
    .attr("stroke", "#000")               
    .attr("stroke-width", 2)                
    .on("mouseover", function (event, d) {
         d3.select("#tooltip")
         .style("opacity", 1)
        //info
        .html(`<strong>${d.data.company}</strong><br/>Farms Run by Company: ${d.data.count}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {             // <--- FIX: make tooltip disappear correctly
        d3.select("#tooltip")
          .style("opacity", 0);
    });
//pie chart text - need to fix pos of small one

    svg.selectAll("text")
    .data(pie(dataset))
    .enter()
    .append("text")
    .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
    .attr("text-anchor", "middle")
    .text(d => d.data.company)
    .style("fill", "#fff")
    .style("font-size", "17.5px")
    .style("text-shadow", "1px 1px 2px black")
    .style("font-weight", "bold");

    const legend = svg.append("g")
    .attr("transform", `translate(${350}, -50)`);

    //pplace bean png to for narrating bean's origin
    svg.selectAll("image")
    .data(pie(dataset))
    .enter()
    .append("image")
    .attr("href", "images/the-coffee-bean.png")
    .attr("width", 70)  
    .attr("height", 70)
    .attr("transform", `translate(${90}, ${-30})`); //place on blossom valley piece

    // legend header
    legend.append("text")
        .text("Top 5 Taiwanese Coffee Companies")
        .attr("x", -10)
        .attr("y", -20)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .attr("fill", "#331");

    //row in legend placement
    dataset.forEach((d, i) => {
        const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 32})`);
        
        //ccolor boxe below
        legendRow.append("rect")
        .attr("width", 25)
        .attr("height", 25)
        .attr("fill", colorScale(d.company))
        .attr("stroke", "#331")
        .attr("stroke-width", 2.5);

        //legend row text forr comps
        legendRow.append("text")
        .attr("x", 35)
        .attr("y", 14)
        .text(d.company)
        .style("font-size", "12px")
        .attr("fill", "#331");
    });
});
