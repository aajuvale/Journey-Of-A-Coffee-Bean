// javascript/upset.js - shows upset plot

const cellSize = 7;
const logoSize = 35;
const logoSizeSmall = 20;
const margin = { top: 80, right: 20, bottom: 30, left: 50 };

const verticalGap1 = 20;
const verticalGap2 = 20;
const horizontalGap = 20;

const matrixWidth = 800;
const matrixHeight = 250;

const barPadding = 0.3;
const roundedCorner = 8;

const restaurantColors = {
    "Make it at Home": "#378cff",
    "Starbucks": "#00643c",
    "Dutch Bros": "#006098",
    "Other": "#e56c00",
    "Dunkin Donuts": "#c8475d",
    "Blackrock": "#000000",
}

d3.csv("datasets/Class_survey_results.csv").then(function (data) {
    let intersectionCountMap = new Map();
    let restaurantCountMap = new Map();
    for (let row of data) {
        if (row["Do you Drink Coffee?"] === "Yes") {
            let restStr = row["Where do you like to get your coffee from? "].trim();
            intersectionCountMap.set(restStr, (intersectionCountMap.get(restStr) || 0) + 1);

            for (let rst of restStr.split(', ')) {
                restaurantCountMap.set(rst, (restaurantCountMap.get(rst) || 0) + 1);
            }
        }
    }

    const intersectionCountData = Array.from(intersectionCountMap, ([st, sz]) => ({ sets: st.split(', '), count: sz }));
    intersectionCountData.sort((a, b) => (a.count - b.count) * 1000 + (b.sets.length - a.sets.length));
    const restaurantCountData = Array.from(restaurantCountMap, ([n, s]) => ({ name: n, count: s }));
    restaurantCountData.sort((a, b) => b.count - a.count);

    const horizontalOffsets = [margin.left, cellSize * restaurantCountData[0].count, verticalGap1, matrixWidth, verticalGap2, margin.right, 0];
    let sum = 0;
    for (let i = 0; i < horizontalOffsets.length; i++) {
        let val = horizontalOffsets[i];
        horizontalOffsets[i] = sum;
        sum += val;
    }

    const verticalOffsets = [margin.top, cellSize * intersectionCountData[intersectionCountData.length - 1].count, horizontalGap, matrixHeight, margin.bottom, 0];
    sum = 0;
    for (let i = 0; i < verticalOffsets.length; i++) {
        let val = verticalOffsets[i];
        verticalOffsets[i] = sum;
        sum += val;
    }

    const svg = d3.select("#upset-diagram")
        .append("svg")
        .attr("width", horizontalOffsets[6])
        .attr("height", verticalOffsets[5])
        .append("g")

    const yIntersectionScale = d3.scaleLinear()
        .domain([0, intersectionCountData[intersectionCountData.length - 1].count])
        .range([verticalOffsets[2], verticalOffsets[1]]);

    const xIntersectionScale = d3.scaleBand()
        .domain(d3.range(intersectionCountData.length))
        .range([horizontalOffsets[3], horizontalOffsets[4]])
        .padding(barPadding);

    const yRestaurantScale = d3.scaleBand()
        .domain(restaurantCountData.map(d => d.name))
        .range([verticalOffsets[3], verticalOffsets[4]])
        .padding(barPadding);

    const xRestaurantCountScale = d3.scaleLinear()
        .domain([0, restaurantCountData[0].count])
        .range([horizontalOffsets[2], horizontalOffsets[1]]);

    const gIntersectionBars = svg.append("g")
        .attr("class", "intersection-bars");

    gIntersectionBars.selectAll("rect")
        .data(intersectionCountData)
        .enter()
        .append("rect")
        .attr("x", (_, i) => xIntersectionScale(i))
        .attr("y", d => yIntersectionScale(d.count))
        .attr("rx", roundedCorner)
        .attr("ry", d => Math.min(roundedCorner, cellSize * d.count / 2))
        .attr("width", xIntersectionScale.bandwidth())
        .attr("height", d => yIntersectionScale(0) - yIntersectionScale(d.count))
        .attr("fill", "#444");

    gIntersectionBars.selectAll("text")
        .data(intersectionCountData)
        .enter()
        .append("text")
        .attr("class", "intersection-label")
        .attr("x", (_, i) => xIntersectionScale(i) + xIntersectionScale.bandwidth() / 2)
        .attr("y", d => yIntersectionScale(d.count) - 5)
        .attr("text-anchor", "middle")
        .text(d => d.count);

    const gRestaurantBars = svg.append("g")
        .attr("class", "restaurant-bars")

    gRestaurantBars.selectAll(".restaurant-count-bar")
        .data(restaurantCountData)
        .enter()
        .append("rect")
        .attr("class", "restaurant-count-bar")
        .attr("x", d => xRestaurantCountScale(d.count))
        .attr("y", d => yRestaurantScale(d.name))
        .attr("rx", d => Math.min(roundedCorner, cellSize * d.count / 2))
        .attr("ry", roundedCorner)
        .attr("width", d => xRestaurantCountScale(0) - xRestaurantCountScale(d.count))
        .attr("height", yRestaurantScale.bandwidth())
        .attr("fill", d => restaurantColors[d.name]);

    gRestaurantBars.selectAll(".restaurant-count-label")
        .data(restaurantCountData)
        .enter()
        .append("text")
        .attr("class", "restaurant-count-label")
        .attr("x", d => xRestaurantCountScale(d.count) - 5)
        .attr("y", d => yRestaurantScale(d.name) + yRestaurantScale.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(d => d.count);

    const gMatrix = svg.append("g")
        .attr("class", "matrix")

    // let lineData = [];
    // intersectionCountData.forEach((intersection, index) => {
    //     for (let i = 0; i < intersection.sets.length - 1; i++) {
    //         const rst1 = intersection.sets[i];
    //         const rst2 = intersection.sets[i + 1];
    //         lineData.push({
    //             restaurant1: rst1,
    //             restaurant2: rst2,
    //             intersectionIndex: index
    //         });
    //     }
    // });

    // gMatrix.selectAll("line")
    //     .data(lineData)
    //     .enter()
    //     .append("line")
    //     .attr("x1", d => xIntersectionScale(d.intersectionIndex) + xIntersectionScale.bandwidth() / 2)
    //     .attr("y1", d => yRestaurantScale(d.restaurant1) + yRestaurantScale.bandwidth() / 2)
    //     .attr("x2", d => xIntersectionScale(d.intersectionIndex) + xIntersectionScale.bandwidth() / 2)
    //     .attr("y2", d => yRestaurantScale(d.restaurant2) + yRestaurantScale.bandwidth() / 2)
    //     .attr("stroke", "#444")
    //     .attr("stroke-width", 2);

    let circleData = [];
    intersectionCountData.forEach((intersection, index) => {
        for (let rst of restaurantCountData) {
            circleData.push({
                restaurant: rst.name,
                isInIntersection: intersection.sets.includes(rst.name),
                intersectionIndex: index
            });
        }
    })

    // gMatrix.selectAll("circle")
    //     .data(circleData)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", d => xIntersectionScale(d.intersectionIndex) + xIntersectionScale.bandwidth() / 2)
    //     .attr("cy", d => yRestaurantScale(d.restaurant) + yRestaurantScale.bandwidth() / 2)
    //     .attr("r", 5)
    //     .attr("fill", d => d.isInIntersection ? "#444" : "#e0e0e0");

    gMatrix.selectAll("image")
        .data(circleData)
        .enter()
        .append("image")
        .attr("class", d => d.isInIntersection ? "logo-active" : "logo-inactive")
        .attr("x", d => xIntersectionScale(d.intersectionIndex) + xIntersectionScale.bandwidth() / 2 - (d.isInIntersection ? logoSize : logoSizeSmall) / 2)
        .attr("y", d => yRestaurantScale(d.restaurant) + yRestaurantScale.bandwidth() / 2 - (d.isInIntersection ? logoSize : logoSizeSmall) / 2)
        .attr("width", d => d.isInIntersection ? logoSize : logoSizeSmall)
        .attr("height", d => d.isInIntersection ? logoSize : logoSizeSmall)
        .attr("href", d => d.isInIntersection ? `./images/${d.restaurant}.svg` : `./images/${d.restaurant}_bw.svg`);

    svg.append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", horizontalOffsets[2] - 10)
        .attr("x", -verticalOffsets[2] + 20)
        .attr("dy", "0.5em")
        .style("text-anchor", "start")
        .text("Overlap Count");

    svg.append("text")
        .attr("class", "axis-title")
        .attr("x", horizontalOffsets[2] - 20)
        .attr("y", verticalOffsets[2])
        .style("text-anchor", "end")
        .text("Source Count");
})
