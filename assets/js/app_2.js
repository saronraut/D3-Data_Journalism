var svgWidth = 960;
var svgHeight = 500;

let axisDely = 2500;
let circleDely = 2500;

// set margin 
let margin = {top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

// Calculate chart dimension by adjusting the margin
let chartWidth = svgWidth - margin.left - margin.right;
let chartHeight = svgHeight - margin.top - margin.bottom;

// create an SVG wrapper, append an SVG group that will hold our chart
