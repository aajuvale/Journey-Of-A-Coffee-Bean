// javascript/radarchart.js - shows radar chart and gets colors

const RadarChart = {
    draw: function(id, data, options = {}) {
        const fillColor = options.color || "rgba(23, 190, 207, 1)";
        console.log(options.color)
        const strokeColor = d3.color(fillColor);

      d3.select(id).select("svg").remove();
  
      const margin = { top: 50, right: 50, bottom: 50, left: 100 },
            width = 500,
            height = 500,
            radius = Math.min(width / 2, height / 2),
            levels = 5;
  
      const allAxis = data[0].axes.map(i => i.axis),
            total = allAxis.length,
            angleSlice = Math.PI * 2 / total;
  
      const rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, 10]); 
  
      const svg = d3.select(id)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${(width / 2) + margin.left}, ${(height / 2) + margin.top})`);
  
      // Circular grid
      for (let level = 0; level < levels; level++) {
        const r = radius / levels * (level + 1);
        svg.append("circle")
          .attr("r", r)
          .attr("fill", "none")
          .attr("stroke", "#000")
          .attr("stroke-width", 0.5);
      }
  
      // Axis lines and labels
      allAxis.forEach((axis, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
  
        svg.append("line")
          .attr("x1", 0).attr("y1", 0)
          .attr("x2", x).attr("y2", y)
          .attr("stroke", "#000")
          .attr("stroke-width", 1);
  
        svg.append("text")
          .attr("x", x * 1.13)
          .attr("y", y * 1.07)
          .style("font-size", "13.5px")
          .attr("text-anchor", "middle")
          .text(axis);
      });
  
      // Radar path
      const line = d3.lineRadial()
        .radius(d => rScale(d.value))
        .angle((d, i) => i * angleSlice)
        .curve(d3.curveLinearClosed);
  
      
        svg.append("path")
        .datum(data[0].axes)
        .attr("d", line)
        .attr("fill", fillColor)
        .attr("fill-opacity", 0.2)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2);
    }

  };
  

d3.csv("datasets/arabica_data_cleaned.csv").then(function(data) {
  
    data.forEach(d => {
      d.Aroma      = +d.Aroma;
      d.Flavor     = +d.Flavor;
      d.Aftertaste = +d.Aftertaste;
      d.Acidity    = +d.Acidity;
      d.Sweetness  = +d.Sweetness;
      d.country    = d["Country.of.Origin"];
    });
  
    // Function to update radar chart for a given country
    function updateChart(selectedCountry) {
      const countryData = data.filter(d => d.country === selectedCountry);
      const avgAroma      = d3.mean(countryData, d => d.Aroma);
      const avgFlavor     = d3.mean(countryData, d => d.Flavor);
      const avgAftertaste = d3.mean(countryData, d => d.Aftertaste);
      const avgAcidity    = d3.mean(countryData, d => d.Acidity);
      const avgSweetness  = d3.mean(countryData, d => d.Sweetness);

      const colorScale = getColorScale(data);
      const selectedColor = colorScale(selectedCountry);

      const radarData = [{
        axes: [
          { axis: "Aroma",      value: avgAroma },
          { axis: "Flavor",     value: avgFlavor },
          { axis: "Aftertaste", value: avgAftertaste },
          { axis: "Acidity",    value: avgAcidity },
          { axis: "Sweetness",  value: avgSweetness }
        ]
      }];

      let taiwanData = null;
      if (selectedCountry === "Taiwan" && countryData.length > 0) {
        const first = countryData[0];
        taiwanData = {
          axes: [
            { axis: "Aroma",      value: first.Aroma },
            { axis: "Flavor",     value: first.Flavor },
            { axis: "Aftertaste", value: first.Aftertaste },
            { axis: "Acidity",    value: first.Acidity },
            { axis: "Sweetness",  value: first.Sweetness }
          ]
        };
      }

      d3.select("#taiwan-info").remove();

      RadarChart.draw("#radar-chart", radarData, {
        color: selectedColor
      });
      
      // Edge case handling for taiwan specific, because it is where the bean is from now
      if (taiwanData) {
        const container = d3.select("#radar-chart")
        .append("div")
        .attr("id", "taiwan-info")
        .style("position", "absolute")
        .style("top", "150px")
        .style("right", "200px")
        .style("text-align", "center")
        .style("padding", "10px")
        .style("border-radius", "8px");
      
        const headerRow = container.append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .style("gap", "5px") 
        .style("margin-bottom", "5px");

        headerRow.append("img")
          .attr("src", "images/the-coffee-bean.png")
          .style("width", "100px");

        headerRow.append("span")
          .text("These are my values:")
          .style("font-weight", "bold")
          .style("font-size", "20px")
          .style("padding", "8px 20px")
          .style("background", "#f6e7d5")
          .style("border-radius", "12px")
          .style("position", "relative")
          // .style("margin-left", "8px") // small space from image
          .style("box-shadow", "1px 1px 4px rgba(0,0,0,0.2)")
          .style("max-width", "200px")
          .style("text-align", "left")
          .style("display", "inline-block")
          .style("color", "#333")
          .style("line-height", "1.2")
          .style("margin-bottom", "0px")
          .style("margin-top", "4px")
          .style("margin-right", "15px")
          .style("font-family", "Futura")
          .style("::after", null);

        taiwanData.axes.forEach(d => {
          container.append("p")
            .text(`${d.axis}: ${d.value}`)
            .style("margin", "4px 0")
            .style("font-size", "20px");
        });
      }
      
    }
  
    const initialCountry = data[0].country;
    updateChart(initialCountry);
  
    // Update the chart when the user selects a different country
    d3.select("#country-select").on("change", function() {
      const newCountry = d3.select(this).property("value");
      updateChart(newCountry);
    });
  });
  