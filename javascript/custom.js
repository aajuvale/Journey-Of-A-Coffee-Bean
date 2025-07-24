// javascript/custom.js - shows a custom visualization of the survey data, specifically how many times ppl drink coffee and what types

const customMargin = { top: 130, right: 30, bottom: 40, left: 270 };
const customMatrixWidth = 950;
const customMatrixHeight = 420;

const hexAngleOffset = 0;
const iconSize = 40;
const hexSeparation = iconSize * 1.5;
const hexWidth = iconSize * 51 / 55 * Math.cos(Math.PI / 6); // 51/55
const hexHeight = -iconSize * 1.081 * Math.sin(Math.PI / 6);

const xAxisGap = 40;
const yAxisGap = 40;
const axisLabelGap = 10;
const axisNameGap = 30;

Promise.all([
    d3.csv("datasets/Class_survey_results.csv"),
]).then(function ([data]) {
    function getOffset(i) {
        if (i === 0) return [0, 0];

        let fr = Math.floor((3 + Math.sqrt(12 * i - 3)) / 6);
        let gr = ((i - 1) / 3 / fr - fr + 1) * Math.PI;

        let len = fr / Math.cos((gr % (Math.PI / 3)) - Math.PI / 6);
        return [
            len * Math.cos(gr + hexAngleOffset) * hexWidth,
            len * Math.sin(gr + hexAngleOffset) * hexHeight
        ];
    }

    function getIndex(strengthOrFrequency) {
        switch (strengthOrFrequency) {
            case "It needs to be sweet or else I won't drink it":
            case "1-3 times a week":
                return 0;
            case "With a touch of creamer or milk":
            case "4-6 times a week":
                return 1;
            case "Strong (Black Coffee)":
            case "More than 7 times a week":
                return 2;
            default:
                console.warn("Invalid strength or frequency: " + strengthOrFrequency);
                return -1;
        }
    }

    let offsets = Array.from({ length: 7 }, (_, i) => getOffset(i));
    const icedCoffeeData = [];
    const hotCoffeeData = [];
    let icedIndexMap = Array.from({ length: 3 }, () => Array(3).fill(-1));
    let hotIndexMap = Array.from({ length: 3 }, () => Array(3).fill(-1));

    for (let row of data) {
        if (row["Do you Drink Coffee?"] === "Yes") {
            let coffeeData = (row["Which do you prefer?"] === "Iced coffee") ? icedCoffeeData : hotCoffeeData;
            let indexMap = (row["Which do you prefer?"] === "Iced coffee") ? icedIndexMap : hotIndexMap;
            let strength = getIndex(row["How do you like your coffee?"]);
            let frequency = getIndex(row["How often do you drink coffee?"]);
            let asuriteID = row["Email Address"] ? row["Email Address"].split("@")[0] : "Unknown";

            indexMap[strength][frequency] += 1;
            coffeeData.push({
                strength: strength,
                frequency: frequency,
                index: indexMap[strength][frequency],
            });
        }
    }


    icedCoffeeData.sort((a, b) => getOffset(a.index)[1] - getOffset(b.index)[1]);
    hotCoffeeData.sort((a, b) => getOffset(a.index)[1] - getOffset(b.index)[1]);

    const yScale = d3.scaleBand()
        .domain(d3.range(3))
        .range([customMargin.top + customMatrixHeight, customMargin.top]);

    const xScale = d3.scaleBand()
        .domain(d3.range(3))
        .range([customMargin.left, customMargin.left + customMatrixWidth]);

    const svg = d3.select("#custom-diagram")
        .append("svg")
        .attr("width", customMatrixWidth + customMargin.left + customMargin.right)
        .attr("height", customMatrixHeight + customMargin.top + customMargin.bottom)
        .append("g")

    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 8)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "black");

    coldCoffees = svg.append("g")
        .attr("class", "cold-coffees");

    coldCoffees.selectAll("image")
        .data(icedCoffeeData)
        .enter()
        .append("image")
        .attr("xlink:href", "images/Iced Coffee.svg")
        .attr("x", d => xScale(d.strength) + offsets[d.index][0] - hexSeparation - iconSize / 2)
        .attr("y", d => yScale(d.frequency) + offsets[d.index][1] - iconSize / 2)
        .attr("width", iconSize)
        .attr("height", iconSize);

    hotCoffees = svg.append("g")
        .attr("class", "hot-coffees");


    hotCoffees.selectAll("image")
        .data(hotCoffeeData)
        .enter()
        .append("image")
        .attr("xlink:href", "images/Hot Coffee.svg")
        .attr("x", d => xScale(d.strength) + offsets[d.index][0] + hexSeparation - iconSize / 2)
        .attr("y", d => yScale(d.frequency) + offsets[d.index][1] - iconSize * 1.127 / 2 - 1.7)
        .attr("width", iconSize)
        .attr("height", iconSize * 1.127);

    var xAxis = svg.append("line")
        .attr("id", "custom-x-axis")
        .attr("x1", xScale(0) - hexSeparation + offsets[4][0] - iconSize / 2 - xAxisGap)
        .attr("y1", yScale(0) + offsets[5][1] + iconSize / 2 + yAxisGap)
        .attr("x2", xScale(2) + hexSeparation + offsets[1][0] + iconSize / 2 + xAxisGap)
        .attr("y2", yScale(0) + offsets[5][1] + iconSize / 2 + yAxisGap)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)");

    svg.append("line")
        .attr("id", "custom-y-axis")
        .attr("x1", xScale(0) - hexSeparation + offsets[4][0] - iconSize / 2 - xAxisGap)
        .attr("y1", yScale(0) + offsets[5][1] + iconSize / 2 + yAxisGap)
        .attr("x2", xScale(0) - hexSeparation + offsets[4][0] - iconSize / 2 - xAxisGap)
        .attr("y2", yScale(2) + offsets[2][1] - iconSize / 2 - yAxisGap - 10)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)");

    svg.selectAll(".custom-x-axis-label")
        .data([
            "\"If it isn't Sweet, I won't take a sip.\"",
            "\"With a touch of Creamer.\"",
            "\"I like Black coffee.\""
        ])
        .enter()
        .append("text")
        .attr("class", "custom-x-axis-label")
        .attr("x", (_, i) => xScale(i))
        .attr("y", yScale(0) + offsets[5][1] + iconSize / 2 + yAxisGap + axisLabelGap)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "hanging")
        .text(d => d);

    svg.append("text")
        .attr("x", xScale(1))
        .attr("y", yScale(0) + offsets[5][1] + iconSize / 2 + yAxisGap + axisLabelGap + axisNameGap)
        .attr("class", "custom-x-axis-name")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "hanging")
        .text("How do you like your coffee?");

    svg.selectAll(".custom-y-axis-label")
        .data([
            "1 to 3",
            "4 to 6",
            "7 or more"
        ])
        .enter()
        .append("text")
        .attr("class", "custom-y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", (_, i) => -yScale(i))
        .attr("y", xScale(0) - hexSeparation + offsets[4][0] - iconSize / 2 - xAxisGap - axisLabelGap)
        .attr("text-anchor", "middle")
        .each(function (d) {
            const textElement = d3.select(this);
            const lines = d.split('\n');

            lines.forEach((line, index) => {
                textElement.append("tspan")
                    .attr("x", textElement.attr("x"))
                    .attr("dy", index === 0 ? -20 * lines.length + 20 : 20)
                    .text(line);
            });
        });

    let yAxisName = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -yScale(1))
        .attr("y", xScale(0) - hexSeparation + offsets[4][0] - iconSize / 2 - xAxisGap - axisLabelGap - 2 * axisNameGap)
        .attr("class", "custom-y-axis-name")
        .attr("text-anchor", "middle");

    ["How many times a week", "do you drink coffee?"].forEach((line, index) => {
        yAxisName.append("tspan")
            .attr("x", yAxisName.attr("x"))
            .attr("dy", index === 0 ? 0 : 25)
            .text(line);
    });
})