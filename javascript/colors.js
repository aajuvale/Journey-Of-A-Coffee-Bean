// javascript/colors.js - this file allows for consistent colors per country.

window.getColorScale = function (data) {
    // Count number of records per country
    const countryCounts = d3.rollup(
        data,
        v => v.length,
        d => d["Country.of.Origin"]
    );

    const maxCount = d3.max(Array.from(countryCounts.values()));

    const linearScale = d3.scaleLinear()
        .domain([0, maxCount])
        .range(["#965f41", "#016738"]);

    // Return a function that maps country name to its color
    return function(country) {
        return linearScale(countryCounts.get(country) || 0);
    };
};