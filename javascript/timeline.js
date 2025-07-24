// javascript/timeline.js - shows coffee timeline

//pics for each point on timeline
const pointOnTimeline = [
    { name: "Coffee Plant", image: "images/coffee_plant.png", info: "Taiwan's coffee plants are typically cultivated and maintained at altitudes between 600 to 1000 meters above sea level, with coffee plant farms reaching heights of 1300 meters. The primary species of coffee plant grown at these farms is Arabica (Typica). Other specifies grown in smaller quantities include Yellow Bourbon and Caturra. Key growing regions im Taiwam include Dongshan District in Tainan City, Alishan in Chiayi County, and Nantou County." },
    { name: "Coffee Bean", image: "images/bagged_raw_beans.png", info: "In Taiwan, coffee cherries are handpicked when fully ripe to ensure the best flavor. Due to the altitude at which they are grown, the coffee cherries have slower maturation and higher bean density. After harvest, beans are typically processed using the washed method, where the fruit pulp is removed before fermentation and drying processes taken place at a larger scale in factories. The freshly harvested beans are known for their higher acidity, enhanced by Taiwan’s careful harvesting techniques and unique growing environment." },
    { name: "Factory", image: "images/coffee_factory.png", info: "After harvest in Taiwan, coffee beans are often processed locally at small-scale washing stations or family-run factories near the farms. Close to 90% of Taiwan’s coffee are wet processed, where beans are pulped, fermented, and then dried to a target moisture content of around 10–12%. Following drying, beans are hand-sorted to remove defects, graded by size and appearance, and bagged for aging or export." },
    { name: "Processed Bean", image: "images/processed_beans.png", info: "After careful washing and drying, the beans are milled to remove the parchment layer. These processed beans are dense, clean, and graded to ensure only the finest make it to export. They are now ready for shipment to roasters and coffee shops worldwide."},
    { name: "Shipped", image: "images/coffee_packaged.png", info: "Once processed, the coffee beans are cleaned, dried, sorted, and prepped for shipment. After grading for size (typically screens 16–18 for beans in Taiwan) and quality, defects are minimized through hand-sorting. Before export, the beans are stored in controlled environments to preserve their freshness and delicate flavor characteristics." },
    { name: "Coffee Shop", image: "images/coffee_shop.png", info: "After arriving at coffee shops, Taiwan’s specialty beans are freshly roasted. High-altitude Arabica beans deliver complex flavors with floral and lightly fruity notes. Shops often highlight Taiwanese beans for their smooth body and vibrant acidity, reflecting the meticulous farming and processing journey." },
    { name: "Ground", image: "images/press.png", info: "Taiwanese Arabica beans, after roasting, are carefully ground to match the brewing method. A finer grind is used for espresso to capture bright acidity, while a coarser grind preserves clarity in pour-overs." },
    { name: "Cup of Coffee", image: "images/espresso_shot.png", info: "Taiwanese Arabica coffee results in a clean, bright, and aromatic cup. Expect delicate floral aromas, a gentle nutty sweetness, and a light to medium body. The cup showcases the craftsmanship from farm to brew, offering a smooth, vibrant, and refreshing final taste. Enjoy your cup of coffee!" }
]; //all will actually not be displayed at once, one by one based on coffee bean on timeline

//instantiste base timeline
const svg = d3.select("#timeline")
.append("svg")
.attr("width", 1100)
.attr("height", 600);

//line to drag bean on
svg.append("line")
.attr("x1", 100)
.attr("x2", 1100)
.attr("y1",  410)
.attr("y2", 410)
.attr("stroke", "#016738")
.attr("stroke-width", 5); 

//place dots equally on timeline, need to align across whole length - finish spacing after
const dotsOnLine = [];
for (let i = 0; i < 8; i++) {
    const x = 135 * (i + 1); //for dot spacing, need to var it for cx value
    dotsOnLine.push(x);
    svg.append("circle")
        .attr("cx", x - 10)
        .attr("cy", 410)
        .attr("r", 12)
        .attr("fill", "#965f41");
}

//just display one at time as per bean location of timeline - start with first coffee tree one
const pictureForPoint = svg.append("image") //just first one
    .attr("x", 440)  
    .attr("y", 73)           
    .attr("width", 310)
    .attr("height", 310)
    .attr("href", pointOnTimeline[0].image);

pictureForPoint
.on("mouseover", function(event) {
    d3.select("#tooltip")
    .style("opacity", 1)
    .style("background", "white")
    .style("color", "black") 
    .style("font-size", "18px")
    .style("width", "600px")   
    .style("padding", "10px")  
    .style("white-space", "normal")          
    .style("word-wrap", "break-word")         
    .style("overflow-wrap", "break-word")     
    .html(pointOnTimeline[0].info); 
    })
    .on("mousemove", function(event) {
        d3.select("#tooltip")
        .style("left", (event.pageX - 100) + "px")
        .style("top", (event.pageY + 20) + "px");
    })
    .on("mouseout", function() {
        d3.select("#tooltip").style("opacity", 0);
    });

//include a tooltip for image here, need it to say smth diff for each point on timeline

    const coffeeBean = svg.append("image")
    .attr("x", 79)
    .attr("y", 370)
    .attr("width", 80)
    .attr("height", 80)
    .attr("href", "images/the-coffee-bean.png")
    .call(d3.drag()
        .on("drag", function(event) {
            // cant go past the coffee cup pic, stay in div - to actually move bean
            d3.select(this).attr("x", (Math.max(100, Math.min(1050, event.x))));  //when not at last point, need to check if actual event mooved to

            //change to next point on timeline's picture when moved past dot based on the past point, make sure pic for next point on timeline not shown till that point is reached
            let pointATM = Math.floor(((Math.max(100, Math.min(1050, event.x))) - 70) / 135);
            if (pointATM >= 0 && pointATM < pointOnTimeline.length) {
                pictureForPoint.attr("href", pointOnTimeline[pointATM].image);
                //also change tooltip information
                pictureForPoint.on("mouseover", function(event) { 
                    d3.select("#tooltip")
                    .style("opacity", 1)
                    .html(pointOnTimeline[pointATM].info);
                });

                // added timeline stage label
                d3.select("#timeline-stage-label").text(
                    pointOnTimeline
                        .slice(0, pointATM + 1)
                        .map(d => d.name)
                        .join(" → ")
                );
            }
        })
    );
