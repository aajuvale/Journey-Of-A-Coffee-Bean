// javascript/cupprogress.js - does the coffee cup filling animation

d3.select(window).on("scroll.progress", () => {
    function scrollingY() {
        return window.scrollY;
      }
      
      function getDist() {
        const fullPageHeight = document.body.scrollHeight;
        const viewportHeight = window.innerHeight;
        return fullPageHeight - viewportHeight;
      }
      
      function calc(offset, maxDistance) {
        return Math.min(offset / maxDistance, 1);
      }
      
      function fillcoffee(percentage) {
        const fillHeight = `${percentage * 60}%`;
        d3.select('.coffee-fill').style("height", fillHeight);
      }
      
      const currentOffset = scrollingY();
      const maxScrollable = getDist();
      const scrolledFraction = calc(currentOffset, maxScrollable);
      fillcoffee(scrolledFraction);
  });