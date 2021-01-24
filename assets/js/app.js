// @TODO: YOUR CODE HERE!
//  I FUCKED UP SOMEWHERE NEED TO FIX IT!!!!
// TASK: Create a scatter plot between two of the data variable.
// use data.csv for plotting:pull using d3.csv
// create axes and labels to the left and bottom of the chart.

// using the method from inclass activity, creating the width/height of the container
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100,
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//creating an SVG wrapper, append an SVG group that will hold the chart
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// append an SVG group
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function for updating x-scale based on click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d[chosenXAxis]) * 0.8,
      d3.max(data, (d) => d[chosenXAxis]) * 1.2,
    ])
    .range([0, width]);
}

// function used for updating xAxis var upon click on axis label
function rederAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  // transition duration is in millisec
  xAxis.transition().duration(1000).call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", (d) => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for upating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
  var label;

  if (chosenXAxis === "poverty") {
    label = "In Poverty";
  } else {
    label = "Age";
  }

  var toolTip = d3
    .tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return `${d.state}`;
    });

  circlesGroup.call(toolTip);

  circlesGroup
    .on("mouseover", function (data) {
      toolTip.show(data);
    })

    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// d3.csv("./assets/data/data.csv").then(function(data){
//     console.log(data)
// })

d3.csv("./assets/data/data.csv").then(function (data, err) {
  if (err) throw err;

  // parse data
  data.forEach(function (dta) {
    dta.poverty = +dta.poverty;
    dta.healthcare = +dta.healthcare;
    dta.smokes = +dta.smokes;
    dta.age = +dta.age;
    // console.log(dta.age)
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.healthcare)])
    .range([height, 0]);

  // create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup
    .append("g")
    .classed("x-axis", true)
    .attr("transform", `translate ${height}`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g").call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xLinearScale(d[chosenXAxis]))
    .attr("cy", (d) => yLinearScale(d.healthcare))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", "0.5");

  // create group for two x-axis labels
  var labelsGroup = chartGroup
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var xPoverty = labelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty") //grab for event listner
    .classed("active", true)
    .text("In Poverty (%)");

  var xAges = labelsGroup
    .append("text")
    .attr("x", 0)
    .attr("x", 40)
    .attr("value", "age") //grab for event listner
    .classed("inactive", true)
    .text("Ages");

  // create group for two y-axis labels
  chartGroup
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .classed("active", true)
    .text("Heathcare");

  chartGroup
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Smokers");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text").on("click", function () {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {
      // replaces chosenXAxis with value
      chosenXAxis = value;
      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(data, chosenXAxis);

      // update x axis with transition
      xAxis = renderAxes(xLinearScale, xAxis);

      // updates circles with new x values
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenXAxis === "poverty") {
        xPoverty.classed("active", true).classed("inactive ", false);
        xAges.classed("active", false).classed("inactive", true);
      } else {
        xPoverty.classed("active", false).classed("inactive ", true);
        xAges.classed("active", true).classed("inactive", false);
      }
    }
  });
});
// // .catch(function(error) {
//     console.log(error);
// });
