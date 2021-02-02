// @TODO: YOUR CODE HERE!

// TASK: Create a scatter plot between two of the data variable.
// use data.csv for plotting:pull using d3.csv
// create axes and labels to the left and bottom of the chart.

var svgWidth = 960;
var svgHeight = 500;

// set margin 
let margin = {top: 20,
  right: 40,
  bottom: 80,
  left: 100
};
// Calculate chart dimension by adjusting the margin
let chartWidth = svgWidth - margin.left - margin.right;
let chartHeight = svgHeight - margin.top - margin.bottom;

// Step 2: Create an SVG wrapper,
// append an SVG group that will hold the chart

var svg = d3.select("#scatter")
.append(svg)
.attr("width", svgWidth)
.attr("height", svgHeight)

var chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

// import data
d3.csv("./assets/data/data.csv", rowConverter).then(createChart).catch(function (error) {
    console.log("*********unexpected error occured*********");
    console.log(error);
});

function rowConverter(row){
  row.healthcare = +row.healthcare;
  row.age = +row.age;
  row.poverty = +row.poverty;
  row.smokes = +row.smokes;
  row.obesity = +row.obesity;
  row.income = +row.income;
  return row
};

function createChart(trendData) {
  console.table(trendData, [
    "abbr",
    "heathcare",
    "age",
    "poverty",
    "smokes",
    "obesity",
    "income"
  ]);
  
  // store the chartinfo into activeinfo object
  let activeInfo ={
    data:trendData,
    currentX: "poverty",
    currentY: "healthcare" 
  };

  // creating a scale for the graph
  activeInfo.xScale = d3.scaleLinear().domain(getXDomain(activeInfo)).range([0,chartWidth]);

  activeInfo.yScale = d3.scaleLinear().domain(getYDomain(activeInfo)).range([chartHeight, 0]);

  activeInfo.xAxis = d3.axisBottom(activeInfo.xScale);
  activeInfo.yAxis = d3.axisLeft(activeInfo.yScale);

  createAxis(activeInfo);

// will need to set the circle to display state abbr 
  createCircles(activeInfo);

  createToolTip(activeInfo);

  createLabels();

  d3.selectAll(".aText").on("click", function(event){
    console.log(event);
    handleClick(d3.select(this), activeInfo);
  });
};

function handleClick(label,activeInfo){
  let axis = label.attr("data-axis");
  let name = label.attr("data-name");

  if (label.classed("active")){
    return;
  }
  updateLabel(label,axis);

  if (axis === "x"){
    activeInfo.currentX = name;
    activeInfo.xScale.domain(getXDomain(activeInfo));
    renderXAxes(activeInfo);
    renderHorizontal(activeInfo);
  }
  else { 
    activeInfo.currentY = name;
    activeInfo.yScale.domain(getYDomain(activeInfo));
    renderYAxes(activeInfo);
    renderVertical(activeInfo);
    }
};


function createLabels(){
  let xlabelsGroup = chartGroup
    .append("g")
    .attr("class", "xText")
    .attr("transform", `translate(${chartWidth},${chartHeight+ 20})`);

  xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("x", "aText active x")
    .text("In Poverty (%)");

  xlabelsGroup
  .append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("x", "aText inactive x")
  .text("Age (Median)");

let ylabelsGroup = chartGroup
  .append("g")
  .attr("class", "yText")
  .attr("transform", `translate(-60, ${chartHeight/2}) rotate(-90)`);

ylabelsGroup
  .append("text")
  .attr("y", -60)
  .attr("x", -chartHeight/2)
  // .attr("dy", "1em")
  .attr("data-name", "healthcare")
  .attr("class", "aText active y")
  .text("Lack of HealthCare (%)")

  ylabelsGroup
  .append("text")
  .attr("y", -80)
  .attr("x", -chartHeight/2)
  // .attr("dy", "1em")
  .attr("data-name", "smokes")
  .attr("class", "aText inactive y")
  .text("Smokes (%)")

}

// creating circle will need to revist to fix the fill
function createCircles(activeInfo) {
  let currentX = activeInfo.currentX;
  let currentY = activeInfo.currentY;
  let xScale = activeInfo.xScale;
  let yScale = activeInfo.yScale;

  chartGroup
    .selectAll("circle")
    .data(activeInfo.data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d[currentX]))
    .attr("cy", (d)=> yScale(d[currentY]))
    .attr("fill", "lightblue")
    .attr("oppacity", "0.5")

}

function createAxis(activeInfo){
  chartGroup.append("g")
    .call(activeInfo.yAxis)
    .attr("class", "y-axis")
    // .attr("transform", `translate(0, ${chartWidth})`);

  chartGroup
    .append("g")
    .call(activeInfo.xAxis)
    .attr("class", "x-axis")
    .attr("transfrom", `translate(0, ${chartHeight})`);
}

function renderXAxes(activeInfo) {
  chartGroup
    .select(".x-axis")
    .transition()
    .duration(axisDelay)
    .call(activeInfo.xAxis);
};

function renderYAxes(activeInfo) {
  chartGroup
    .select(".y-axis")
    .transition()
    .duration(axisDelay)
    .call(activeInfo.yAxis);
};

function getXDomain(activeInfo) {
  let min = d3.min(activeInfo.data, (d) => d[activeInfo.currentX]);
  let max = d3.max(activeInfo.data, (d) => d[activeInfo.currentx]);
  return[min *0.8, max *1.2];
};

function getYDomain(activeInfo) {
  let min = d3.min(activeInfo.data, (d) => d[activeInfo.currentY]);
  let max = d3.max(activeInfo.data, (d) => d[activeInfo.currentY]);
  return [min,max];
}

function renderHorizontal(activeInfo){
  d3.selectAll("circle").each(adjustCircles);

  function adjustCircles(){
    d3.select(this)
      .transition()
      .attr("cx", (d) => activeInfo.xScale(d[activeInfo.currentX]))
      .duration(circleDelay);
  }
}

function createToolTip(activeInfo) {
  let label = "state"
  if (activeInfo.currentX === "poverty"){
    label = "In Poverty (%)";
  }
  else {
    label = "Age"
  }

  let toolTip = d3
    .tip()
    .attr("class", "tooltip")
    .offset([80,-60])
    .html(function (event, d) {
      let html = d.state + "<br>" + d[activeInfo.currentX] + "<br>" + d[activeInfo.currentY];
      return html;
    });
}

