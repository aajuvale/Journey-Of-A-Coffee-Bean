// javascript/wordcloud.js - shows wordcloud from survey data

document.addEventListener('DOMContentLoaded', () => {
  loadCloudLibraryAndDraw();
});

function loadCloudLibraryAndDraw() {
  
  if (typeof d3.layout === "undefined" || typeof d3.layout.cloud === "undefined") {
    
    const script = document.createElement('script');
    
    script.src = "https://cdn.jsdelivr.net/npm/d3-cloud@1.2.7/build/d3.layout.cloud.min.js";
    script.onload = () => {
      if (typeof d3.layout !== "undefined" && typeof d3.layout.cloud !== "undefined") {
           drawWordCloud();
      } 
    };
    document.body.appendChild(script);
  } else {
    drawWordCloud();
  }
}


function drawWordCloud() {
  const container = d3.select("#wordcloud");
  const csvFilePath = "datasets/Class_survey_results.csv";
 

  d3.csv(csvFilePath).then(data => {

    const drinkCoffeeCol = 'Do you Drink Coffee?';
    const choiceCol = 'What is your choice of drink?';


    // filter for non-coffee drinkers
    const nonCoffee = data.filter(d => d[drinkCoffeeCol]?.trim().toLowerCase() === "no");

    // extract their drink choices, filtering out empty responses
    const reasonsRaw = nonCoffee
      .map(d => d[choiceCol]) 
      .filter(d => d && d.trim().length > 0); 


    // *** Pre-process strings to combine phrases BEFORE splitting ***
    const reasonsProcessed = reasonsRaw.map(reason => {
        let processed = String(reason).toLowerCase(); 
        processed = processed.replace(/cardamom tea/g, 'cardamom__tea');
        processed = processed.replace(/masala chai/g, 'masala__chai');
        processed = processed.replace(/orange juice/g, 'orange__juice');
        processed = processed.replace(/energy drink/g, 'energy__drink');
        processed = processed.replace(/chocolate milkshakes/g, 'chocolate__milkshake');
        processed = processed.replace(/chocolate milkshake/g, 'chocolate__milkshake');
        processed = processed.replace(/chocolate milk/g, 'chocolate__milk');
        return processed;
    });

    const additionalStopWords = new Set([
        "usually", "like", "tho", "the", "soft", "hot", "fresh", "pro", "drinks", "drink"
    ]);

    // process words: split, clean, filter, and handle specific terms
    const words = reasonsProcessed.flatMap(d =>
        d.split(/[,\s\(\)\/]+/) 
            .map(w => w.trim()) 
             // *** Replace double underscores back to spaces AFTER splitting ***
            .map(w => w.replace(/__/g, ' '))
             // Filter based on length, n/a, and stop words
            .filter(w => w.length > 1 && w !== "n/a" && !additionalStopWords.has(w))
            .map(w => { 
                if (w === "baller") return "energy"; // combine "pro" and "baller" under energy
                if (w === "soda/") return "soda"; // remove slash from "soda/"
                // add more replacements here if needed
                return w;
            })
            // final filter after potential replacements
            .filter(w => w.length > 1 && !additionalStopWords.has(w)) // filter again after potential replacements
    );

    // count word frequencies using d3.rollup
    const freq = d3.rollup(words, v => v.length, d => d);

    // convert frequency map to array format [{text: 'word', size: count}]
    const finalWords = Array.from(freq, ([text, size]) => ({ text, size }));

    const sizeExtent = d3.extent(finalWords, d => d.size);
   
    const sizeScale = d3.scaleLinear()
      .domain(sizeExtent)
      .range([35, 150]) 
      .clamp(true); 

    const width = container.node().clientWidth || 600;
    const height = 500;

    const layout = d3.layout.cloud()
      .size([width, height])
      .words(finalWords.map(d => ({ text: d.text, size: sizeScale(d.size) })))
      .padding(3) 
      .rotate(() => 0)
      .font("Futura") 
      .fontSize(d => d.size)
      .on("end", drawLayout);

    layout.start(); 

    // --- Drawing Function ---
    function drawLayout(calculatedWords) {

        container.selectAll("*").remove();

        const svg = container.append("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", "100%")
            .attr("height", height)
            .style("background-color", "#d4c4b1");

        const color = d3.scaleOrdinal([
            "#6f4e37",
            "#b5651d", 
            "#c09363",
            "#6d3b18",	
            "#673a1d",	
            "#c4986a",	
            "#54422b"
        ]);

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        g.selectAll("text")
            .data(calculatedWords)
            .join("text")
              .attr("class", "wordcloud-word")
              .style("font-family", "Futura")
              .style("fill", (d, i) => color(i % color.range().length)) 
              .attr("text-anchor", "middle")
              .attr("transform", d => `translate(${d.x || 0},${d.y || 0}) rotate(${d.rotate || 0})`) 
              .style("font-size", d => `${d.size}px`) 
              .style("opacity", 0)
              .text(d => d.text)
            .transition() 
              .duration(800)
              .style("opacity", 1); 
    }
  });
}
