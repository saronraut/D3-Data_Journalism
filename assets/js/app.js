var svgWidth = 960;
var svgHeight = 500;

let axisDelay = 2500;
let circleDelay = 2500;

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
let svg = d3.select("#scatter")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight);

// Append an SVG group
let chartGroup = svg
.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// d3 read the csv file 
d3.csv("./assets/data/data.csv", rowConverter)
.then(createChart)
.catch(function(error){
    console.log("ERROR OCCURED")
    console.log(error)
});

// function for converting rows
function rowConverter(row){
    row.poverty = +row.poverty;
    row.healthcare = +row.healthcare;
    row.smokes = +row.smokes;
    row.age = +row.age;
    return row;
}

// function for creating the chart
function createChart(data){
    console.table(data, ['state','poverty','age','healthcare','smokes']
    )

// we store the current chart info in active info object
    let activeInfo = {
        data: data ,
        currentX: "poverty",
        CurrentY : "healthcare"
    };

    activeInfo.xScale = d3
        .scaleLinear()
        .domain(getXDomain(activeInfo))
        .range([0,chartWidth]);

    activeInfo.yScale = d3
        .scaleLinear()
        .domain(getYDomain(activeInfo))
        .range([chartHeight, 0]);

    activeInfo.xAxis = d3.axisBottom(activeInfo.xScale);
    activeInfo.yAxis = d3.axisLeft(activeInfo.yScale);

    createAxis(activeInfo);

    createCircles(activeInfo);

    createToolTip(activeInfo);

    createLabels();

    d3.selectAll(".aText").on("click", function (event) {
        console.log(event)
        handleClick(d3.select(this), activeInfo);
    });
};

function handleClick(label, activeInfo) {
    let axis = label.attr("data-axis");
    let name = label.attr("data-name");

    if(label.classed("active")){
        //  no need to do anything if clicked on active axis
        return;
    }
    updateLabel(label,activeInfo);

    if (axis === 'x'){
        activeInfo.currentX = name;
        activeInfo.xScale.domain(getXDomain(activeInfo));
        renderXaxes(activeInfo);
        renderHorizontal(activeInfo);
    }
    // add logic to handle y axis click
    else {
        activeInfo.CurrentY = name;
        activeInfo.yScale.domain(getYDomain(activeInfo));
        renderYAxes(activeInfo);
        renderVertical(activeInfo);
    }
}

function createLabels() {
    let xlabelsGroup = chartGroup
        .append("g")
        .attr("class", "xText")
        .attr("transform", `translate(${chartWidth/2}, ${chartHeight + 20})`);

    xlabelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("data-name", "poverty")
        .attr("data-axis", "x")
        .attr("class", "aText active x")
        .text("in Poverty (%)");

    // xlabelsGroup
    //     .append("text")
    //     .attr("x", 0)
    //     .attr("y", 40)
    //     .attr("data-name", "age")
    //     .attr("data-axis", "x")
    //     .attr("class", "aText inactive x")
    //     .text("Age (Median)");

    let ylabelsGroup = chartGroup
        .append("g")
        .attr("class", "yText")
        .attr("transform", `translate( 0, ${chartHeight/2 - 200}) rotate(-90)`);

    ylabelsGroup
        .append("text")
        .attr("y", -60)
        .attr("x", -chartHeight/2)
        .attr("data-name", "healthcare")
        .attr("class", "aText active y")
        .text("Lack of Healthcare (%)")
    
    // ylabelsGroup
    // .append("text")
    // .attr("y", -80)
    // .attr("x", -chartHeight/2)
    // .attr("data-name", "smokes")
    // .attr("class", "aText inactive y")
    // .text("Smokes (%)")       
}

function createCircles(activeInfo) {
    let currentX = activeInfo.currentX;
    let CurrentY = activeInfo.CurrentY;
    let xScale = activeInfo.xScale;
    let yScale = activeInfo.yScale;

    chartGroup
        .selectAll("circle")
        .data(activeInfo.data)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d[currentX]))
        .attr("cy", (d) => yScale(d[CurrentY]))
        .attr("r", 8)
        .attr("fill", "grey")
        .attr("stroke", "black")
        .attr("oppacity", "0.5")
        
        
}

function createAxis(activeInfo) {
    chartGroup.append("g").call(activeInfo.yAxis).attr("class", "y-axis");

    chartGroup
        .append('g')
        .call(activeInfo.xAxis)
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${chartHeight})`);
}

function renderXaxes(activeInfo) {
    chartGroup
        .select(".x-axis")
        .transition()
        .duration(axisDelay)
        .call(activeInfo.xAxis);
}

function renderYAxes() {
    chartGroup
        .select(".y-axis")
        .transition()
        .duration(axisDelay)
        .call(activeInfo.yAxis);
}

function getXDomain(activeInfo) {
    let min = d3.min(activeInfo.data, (d)=> d[activeInfo.currentX]);
    let max = d3.max(activeInfo.data, (d) => d[activeInfo.currentX]);
    return[min * 0.8, max * 1.2];
}

function getYDomain(activeInfo) {
    let min = 0;
    let max = d3.max(activeInfo.data, (d)=>d[activeInfo.CurrentY]);
    return[min,max]
}

function renderHorizontal(activeInfo) {
    d3.selectAll("circle").each(adjustCircles);

    function adjustCircles() {
        d3.select(this)
        .transition()
        .attr("cx", (d) => activeInfo.xScale(d[activeInfo.currentX]))
        .duration(circleDelay);
    }
}

function renderVertical(activeInfo) {
    d3.selectAll("circle").each(function () {
        d3.select(this)
        .transition()
        .attr("cy", (d) => activeInfo.yScale(d[activeInfo.CurrentY]))
        .duration(circleDelay)
    });
}

function updateLabel(label, axis) {
    d3.selectAll(".aText")
        .filter("." + axis)
        .filter(".active")
        .classed("active", false)
        .classed("inactive", true);

    label.classed("inactive", false).classed("active", true);
}

function createToolTip(activeInfo) {
    let label = "Poverty Plot";

    if (activeInfo.currentX === 'poverty'){
        label = "Poverty Plot";
    } else {
        label = "Age % ";
    }

    if (activeInfo.currentY === 'healthcare'){
        label = "Healthcare ";
    }
    else {
        label ="null";
    }


    let toolTip = d3
        .tip()
        .attr("class", "tooltip")
        .offset([0,0])
        .html(function (event, d){
            let html = 
            d.state 
            // + "<br>" + "In poverty: " +  d[activeInfo.currentX] + "<br>" + d[activeInfo.currentY]
            return html;
        })
    
    chartGroup.call(toolTip);

    let circles = d3.selectAll("circle");

    circles.on("mouseover", toolTip.show);
    circles.on("mouseout", toolTip.hide)
}



