// javascript/packedchart.js - shows a packed bubble chart w/ d3 pack
(function(fetcher) {
    fetcher("datasets/arabica_data_cleaned.csv").then(function(raw) {
        const cleaned = normalizeCountries(
            removeEmpty(
                countByOrigin(raw)
            )
        );

        const dims = getCanvasSize();
        const colors = buildColorScale(cleaned);
        const tip = d3.select("#tooltip");
        const chart = createCanvas("#bubble-chart", dims.w, dims.h);
        const layout = computeLayout(cleaned, dims);

        const nodeGroups = renderBubbles(chart, layout, tip);
        decorateBubbles(nodeGroups, colors);
        addLegend(chart, cleaned, colors);
    });

    function countByOrigin(records) {
        return Array.from(
            d3.rollup(
                records,
                function(group) { return group.length; },
                function(item) { return item["Country.of.Origin"]; }
            ),
            function(entry) {
                return { country: entry[0], count: entry[1] };
            }
        );
    }

    function removeEmpty(data) {
        return data.filter(function(item) {
            return item.country;
        });
    }

    function normalizeCountries(data) {
        const aliasMap = {
            "United States (Hawaii)": "Hawaii",
            "United States (Puerto Rico)": "Puerto Rico",
            "Tanzania, United Republic Of": "Tanzania",
            "Cote d?Ivoire": "Côte d'Ivoire"
        };
        return data.map(function(d) {
            if (aliasMap[d.country]) d.country = aliasMap[d.country];
            return d;
        });
    }

    function getCanvasSize() {
        return {
            w: window.innerWidth,
            h: 1000
        };
    }

    function buildColorScale(data) {
        return d3.scaleSequential()
            .domain([0, d3.max(data, function(x) { return x.count; })])
            .range(["#965f41", "#016738"]);
    }

    function createCanvas(selector, w, h) {
        return d3.select(selector)
            .append("svg")
            .attr("width", w)
            .attr("height", h);
    }

    function computeLayout(data, dims) {
        const fx = d3.scaleSqrt()
            .domain([0, d3.max(data, q => q["count"])])
            .range([40, 120]);

        for (let idx = 0; idx < data.length; idx++) {
            const obj = data[idx];
            obj["r"] = fx(obj["count"]);
            obj["x"] = Math.random() * dims["w"];
            obj["y"] = Math.random() * dims["h"];
        }

        const sim = d3.forceSimulation(data)
            .force("α", d3.forceX(0.25 * dims["w"]).strength(1 / 20))
            .force("β", d3.forceY(0.5 * dims["h"]).strength(0.05))
            .force("γ", d3.forceCollide(e => e["r"] + 2))
            .stop();

        Array.from({ length: 200 }).forEach(() => sim.tick());

        return data;
    }

    function renderBubbles(svg, nodes, tooltip) {
        const elements = svg.selectAll("g")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "bubble")
            .attr("transform", function(p) {
                return "translate(" + p.x + "," + p.y + ")";
            });

        elements.on("mouseover", function(evt, d) {
                let msg = "<strong>" + d.country + "</strong><br/>Exports: " + d.count;
                if (d.country === "Taiwan") {
                    msg += "<br/><em>This is where I am from!☕️🇹🇼</em>";
                }
                tooltip
                    .style("opacity", 1)
                    .html(msg)
                    .style("left", (evt.pageX + 10) + "px")
                    .style("top", (evt.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("opacity", 0);
            });

        return elements;
    }

    function decorateBubbles(groups, cScale) {
        groups.append("circle")
            .attr("r", function(d) { return d.r; })
            .attr("fill", function(d) { return cScale(d.count); })
            .attr("stroke", "#000")
            .attr("stroke-width", 2);

        groups.each(function(d) {
            const g = d3.select(this);
            const fontSize = d.country === "Taiwan" ? d.r / 3 : d.r / 5;
            const label = d.country === "Taiwan" ? "Taiwan" : d.country;

            if (d.country === "Taiwan") {
                g.append("image")
                    .attr("xlink:href", "images/the-coffee-bean.png")
                    .attr("width", d.r * 1)
                    .attr("height", d.r * 1.5)
                    .attr("x", -d.r * 0.5)
                    .attr("y", -d.r * 0.15);
            }

            g.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", ".3em")
                .style("pointer-events", "none")
                .style("fill", d.country === "Taiwan" ? "white" : "#ffff")
                .style("font-weight", "bold")
                .style("text-shadow", "1px 1px 2px black")
                .style("font-size", fontSize < 5 ? "5px" : fontSize + "px")
                .text(label);
        });
    }

    function addLegend(svg, entries, cScale) {
        const box = svg.append("g")
            .attr("transform", "translate(1050, 150)");

        box.append("text")
            .text("Legend")
            .attr("x", 0)
            .attr("y", -20)
            .style("font-size", "28px")
            .style("font-weight", "bold")
            .attr("fill", "#333");

        box.append("line")
            .attr("x1", -10)
            .attr("y1", -10)
            .attr("x2", 150)
            .attr("y2", -10)
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5);

        entries.forEach(function(d, i) {
            const row = box.append("g")
                .attr("transform", "translate(0," + (i * 20) + ")");

            row.append("rect")
                .attr("width", 14)
                .attr("height", 14)
                .attr("fill", cScale(d.count))
                .attr("stroke", "#000")
                .attr("stroke-width", 2);

            row.append("text")
                .attr("x", 20)
                .attr("y", 11)
                .text(d.country)
                .style("font-size", "13.5px")
                .attr("fill", "#333");
        });
    }

})(d3.csv, d3.select);