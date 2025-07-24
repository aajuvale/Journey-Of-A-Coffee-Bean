// javascript/professor.js - shows professor results in sankey format
// Prof Survey Data: 4/23/2025 12:35:52,cbryan16@asu.edu,Yes,,"Dutch Bros, Starbucks, Blackrock, Make it at Home, Dunkin Donuts, Other",Strong (Black Coffee),More than 7 times a week,Hot coffee
// note to graders and TA: this is an EXTRA VISUALIZATION for fun so it's just modified version of the sankey js file, bc the stuff needed for that is basically identical

document.addEventListener('DOMContentLoaded', () => {
    const sankeyContainer = document.querySelector('.step[data-step="10"] #professor-results');
  
    const graphData = processProfessorData();
    if (graphData) {
      drawCoffeeSankey(graphData, sankeyContainer);
    } 
  });
  
  // Hardcoded professor-specific data from the data he put in survey
  function processProfessorData() {
    const sources = ["Starbucks", "Other", "Dutch Bros", "Make it at Home", "Blackrock", "Dunkin Donuts"];
    const preference = "Strong";
    const frequency = "More than 7 times a week";
    const temperature = "Hot coffee";
  
    const nodes = ["Professor", ...sources, preference, frequency, temperature].map(name => ({ name }));
    const nodeIndex = new Map(nodes.map((d, i) => [d.name, i]));
  
    const sankeyLinks = [];
  
    // Professor → Each Source
    sources.forEach(source => {
      sankeyLinks.push({
        source: nodeIndex.get("Professor"),
        target: nodeIndex.get(source),
        value: 1
      });
    });
  
    // Each Source → Strong Coffee
    sources.forEach(source => {
      sankeyLinks.push({
        source: nodeIndex.get(source),
        target: nodeIndex.get(preference),
        value: 1
      });
    });
  
    // Strong Coffee → Frequency
    sankeyLinks.push({
      source: nodeIndex.get(preference),
      target: nodeIndex.get(frequency),
      value: sources.length
    });
  
    // Frequency → Hot Coffee
    sankeyLinks.push({
      source: nodeIndex.get(frequency),
      target: nodeIndex.get(temperature),
      value: sources.length
    });
  
    return { nodes, links: sankeyLinks };
  }
  
  function drawCoffeeSankey(graphData, container) {
    const width = container.clientWidth - 20;
    const height = 650;
  
    d3.select(container).select("svg").remove();
    container.insertAdjacentHTML("afterbegin", `<h3 style="text-align:center;font-family:Futura,sans-serif;color:#3e2f27;margin-bottom:0.5rem;">Bonus: The Professor's Survey Results</h3>`);
  
    const svg = d3.select(container)
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", "100%")
      .attr("height", height)
      .style("background", "#d4c4b1"); 
  
    const sankey = d3.sankey()
      .nodeWidth(30)
      .nodePadding(12)
      .nodeAlign(d3.sankeyJustify)
      .extent([[1, 5], [width - 1, height - 5]]);
  
    const { nodes, links } = sankey({
      nodes: graphData.nodes.map(d => Object.assign({}, d)),
      links: graphData.links.map(d => Object.assign({}, d))
    });
  
    const coffeePalette = d3.scaleOrdinal()
      .domain(nodes.map(d => d.name))
      .range([
        "#6f4e37", // coffee brown
        "#b5651d", // caramel
        "#c0a98e", // latte cream
        "#d6c2b0", // mocha
        "#4b3832", // dark roast
        "#8b5a2b", // espresso
        "#aa6c39"  // cappuccino
      ]);
  
    let tooltip = d3.select(".tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#fff8f0")
        .style("border", "1px solid #d4c4b1")
        .style("padding", "10px")
        .style("border-radius", "6px")
        .style("box-shadow", "2px 4px 10px rgba(0,0,0,0.2)")
        .style("font-family", "Georgia, serif")
        .style("opacity", 0);
    }
  
    svg.append("g")
      .attr("fill", "none")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", d => coffeePalette(d.source.name))
      .attr("stroke-width", d => Math.max(1, d.width))
      .attr("stroke-opacity", 0.4)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).transition().duration(200).attr("stroke-opacity", 0.7);
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`<strong>Beans Flow:</strong> ${d.value}<br>${d.source.name} → ${d.target.name}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget).transition().duration(200).attr("stroke-opacity", 0.4);
        tooltip.transition().duration(500).style("opacity", 0);
      });

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g");
  
    node.append("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => Math.max(1, d.y1 - d.y0))
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", d => coffeePalette(d.name))
      .attr("stroke", "#3e2f27")
      .attr("stroke-width", 0.8)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).transition().duration(200).attr("stroke-width", 2);
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`<strong>${d.name}</strong><br>Total Cups: ${d.value || 1}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget).transition().duration(200).attr("stroke-width", 0.8);
        tooltip.transition().duration(500).style("opacity", 0);
      });
  
    node.append("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 8 : d.x0 - 8)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => d.name)
      .style("font-size", "13px")
      .style("font-family", "Georgia, serif")
      .style("fill", "#3e2f27")
      .style("pointer-events", "none");
  }
  