// javascript/sankey.js - shows sankey chart

document.addEventListener('DOMContentLoaded', () => {
  const sankeyContainer = document.querySelector('.step[data-step="8"] #sankey-diagram');

  d3.csv("datasets/Class_survey_results.csv").then(data => {
    const graphData = processCoffeeData(data);
    if (graphData) {
      drawCoffeeSankey(graphData, sankeyContainer);
    } 
  });
});

function processCoffeeData(data) {
  const drinkCol = 'Do you Drink Coffee?';
  const sourceCol = 'Where do you like to get your coffee from? ';
  const targetCol = 'How do you like your coffee?';

  const links = {};
  const nodeSet = new Set(['Coffee Lovers']);

  data.forEach(row => {
    if (row[drinkCol]?.trim().toLowerCase() === 'yes') {
      const sources = (row[sourceCol] || '').split(',').map(d => d.trim()).filter(d => d);
      const target = row[targetCol]?.trim();
      if (target) {
        nodeSet.add(target);
        sources.forEach(source => {
          if (source) {
            nodeSet.add(source);
            const key = `${source}|${target}`;
            links[key] = (links[key] || 0) + 1;
          }
        });
      }
    }
  });

  const nodes = Array.from(nodeSet).map(name => ({ name }));
  const nodeIndex = new Map(nodes.map((d, i) => [d.name, i]));

  const sankeyLinks = [];

  // Coffee Lovers → Coffee Shops
  const storeTotals = {};
  Object.keys(links).forEach(key => {
    const [store] = key.split('|');
    storeTotals[store] = (storeTotals[store] || 0) + links[key];
  });

  Object.entries(storeTotals).forEach(([store, value]) => {
    sankeyLinks.push({
      source: nodeIndex.get('Coffee Lovers'),
      target: nodeIndex.get(store),
      value
    });
  });

  // Coffee Shops → Coffee Preferences
  Object.entries(links).forEach(([key, value]) => {
    const [source, target] = key.split('|');
    sankeyLinks.push({
      source: nodeIndex.get(source),
      target: nodeIndex.get(target),
      value
    });
  });

  return { nodes, links: sankeyLinks };
}

function drawCoffeeSankey(graphData, container) {
  const width = container.clientWidth - 20;
  const height = 650;

  d3.select(container).select("svg").remove();

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", "100%")
    .attr("height", height);

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
      .style("font-family", "Futura")
      .style("opacity", 0);
  }

  // Draw links
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

  // Draw nodes
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
      tooltip.html(`<strong>${d.name}</strong><br>Total Cups: ${d.value}`)
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
