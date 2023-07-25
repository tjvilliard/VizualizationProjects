// Constants for the charts, that would be useful.
const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 50 };
const ANIMATION_DURATION = 300;
// parser and formatter for time data
const parseDate = d3.timeParse("%m/%d");
const formatDate = d3.timeFormat("%m/%d");

setup();

function setup() {
  // Fill in some d3 setting up here if you need
  // for example, svg for each chart, g for axis and shapes

  // Barchart svg and appended groups
  let barchartSvg = d3
    .select("#Barchart-div")
    .append("svg")
    .attr("id", "bar-svg")
    .attr("height", CHART_HEIGHT)
    .attr("width", CHART_WIDTH);
  // axes
  barchartSvg.append("g").attr("class", "x-axis");
  barchartSvg.append("g").attr("class", "y-axis");
  barchartSvg.append("g").attr("class", "bar-chart").attr("id", "BarChart");

  // Linechart svg and appended groups
  let linechartSvg = d3
    .select("#Linechart-div")
    .append("svg")
    .attr("id", "line-svg")
    .attr("height", CHART_HEIGHT)
    .attr("width", CHART_WIDTH);
  // axes
  linechartSvg.append("g").attr("class", "x-axis");
  linechartSvg.append("g").attr("class", "y-axis");
  linechartSvg.append("path").attr("class", "line-chart").attr("id", "LineChart");

  // Linechart svg and appended groups
  let areachartSvg = d3
    .select("#Areachart-div")
    .append("svg")
    .attr("id", "area-svg")
    .attr("height", CHART_HEIGHT)
    .attr("width", CHART_WIDTH);
  // axes
  areachartSvg.append("g").attr("class", "x-axis");
  areachartSvg.append("g").attr("class", "y-axis");
  areachartSvg.append("path").attr("class", "area-chart").attr("id", "AreaChart");

  // Scatterplot svg and appended groups
  let scatterSvg = d3
    .select("#Scatterplot-div")
    .append("svg")
    .attr("id", "scatter-svg")
    .attr("height", CHART_HEIGHT)
    .attr("width", CHART_WIDTH);
  // axes
  scatterSvg.append("g").attr("id", "scatter-x");
  scatterSvg.append("g").attr("id", "scatter-y");
  scatterSvg
    .append("g")
    .attr("class", "scatter-plot")
    .attr("id", "ScatterPlot");

  //listeners
  d3.select("#dataset").on("change", changeData);
  d3.select("#metric").on("change", changeData);
  d3.select("#random").on("change", changeData);

  

  changeData();

}


function handleMouseOver(d, i){
  d3.select(this).classed("hovered", true);
}
function handleMouseOut(d,i){
  d3.selectAll(".hovered").classed("hovered", false);
}
function handleClick(d,i){
  console.log(`( cases: ${i.cases}, deaths: ${i.deaths} )`);
}


/**
 * Render the visualizations
 * @param data
 */
function update(data) {

  // xAxis scale for date data
  
  let xScaleDate = d3
    .scaleTime()
    .domain([
      d3.min(data, (d) => parseDate(d.date)),
      d3.max(data, (d) => parseDate(d.date)),
    ])
    .range([MARGIN.left, CHART_WIDTH - MARGIN.right]).nice();

  // yAxis scale for deaths and cases
  let yScaleDeaths = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.deaths)])
    .range([CHART_HEIGHT - MARGIN.bottom, MARGIN.top]).nice();

  let yScaleCases = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.cases)])
    .range([CHART_HEIGHT - MARGIN.bottom, MARGIN.top]).nice();

  let yScale;
  let showDeaths = d3.select("#metric").node().value === "deaths";
  showDeaths ? (yScale = yScaleDeaths) : (yScale = yScaleCases);

  // initialize axes for bar, line and area chart
  let xAxis = d3.axisBottom(xScaleDate).ticks(data.length).tickFormat(formatDate);
  let yAxis = d3.axisLeft(yScale);

  d3.selectAll(".x-axis")
    .attr("transform", "translate(0," + (CHART_HEIGHT - MARGIN.bottom) + ")")
    .call(xAxis);

  d3.selectAll(".y-axis")
    .attr("transform", "translate(" + MARGIN.left + ", 0)")
    .call(yAxis);

  
  updateBarChart(xScaleDate, yScale, data, showDeaths);
  updateLineChart(xScaleDate, yScale, data, showDeaths);
  updateAreaChart(xScaleDate, yScale, data, showDeaths);
  updateScatterPlot(yScaleCases.range([MARGIN.left, CHART_WIDTH - MARGIN.right]), yScaleDeaths, data);
}

/**
 * Update the bar chart
 */

function updateBarChart(xScale, yScale, data, showDeaths) {
  let minDate= d3.min(data, (d) => parseDate(d.date));
  let maxDate= d3.max(data, (d) => parseDate(d.date));
  let numDays =Math.ceil((maxDate - minDate) / 86400000);
  let dataWidth = (CHART_WIDTH - MARGIN.left - MARGIN.right) / numDays;

  // center ticks under bars
  d3.select("#bar-svg")
    .select("g.x-axis")
    .attr(
      "transform",
      `translate(${dataWidth / 2}, ${CHART_HEIGHT - MARGIN.bottom})`
    );
    

  // get group containg all bar rects
  let barGroup = d3.select("#BarChart");
  let bars = barGroup.selectAll("rect").data(data);

  bars
    .join("rect")
    .transition()
    .duration(ANIMATION_DURATION)
    .attr("x", (d) => xScale(parseDate(d.date)))
    .attr("y", function (d) {
      if (showDeaths) {
        return yScale(d.deaths) - MARGIN.bottom;
      } else {
        return yScale(d.cases) - MARGIN.bottom;
      }
    })
    .attr("width", dataWidth - 2)
    .attr("height", function (d) {
      if (showDeaths) {
        return CHART_HEIGHT - yScale(d.deaths);
      } else {
        return CHART_HEIGHT - yScale(d.cases);
      }
    });
    
    d3.selectAll("rect").on("mouseover", handleMouseOver).on("mouseout", handleMouseOut);

  
}

/**
 * Update the line chart
 */
function updateLineChart(xScale, yScale, data, showDeaths) {
  const lineGenerator = d3
    .line()
    .x((d) => xScale(parseDate(d.date)))
    .y(function (d) {
      return showDeaths
        ? yScale(d.deaths) - MARGIN.bottom
        : yScale(d.cases) - MARGIN.bottom;
    });

  d3.select("#LineChart").datum(data).join('path').transition(ANIMATION_DURATION).attr("d", lineGenerator);
}

/**
 * Update the area chart
 */
function updateAreaChart(xScale, yScale, data, showDeaths) {
  let areaGenerator = d3
    .area()
    .x((d) => xScale(parseDate(d.date)))
    .y1(function (d) {
      return showDeaths
        ? yScale(d.deaths) - MARGIN.bottom
        : yScale(d.cases) - MARGIN.bottom;
    })
    .y0(CHART_HEIGHT - MARGIN.bottom);

  d3.select("#AreaChart")
    .datum(data)
    .join('path')
    .transition(ANIMATION_DURATION)
    .attr("d", areaGenerator);
}

/**
 * update the scatter plot.
 */

function updateScatterPlot(xScale, yScale, data) {

  let xAxis = d3.axisBottom(xScale);
  let yAxis = d3.axisLeft(yScale);

  d3.select("#scatter-x")
    .attr("transform", "translate(0," + (CHART_HEIGHT - MARGIN.bottom) + ")")
    .call(xAxis);

  d3.selectAll("#scatter-y")
    .attr("transform", "translate(" + MARGIN.left + ", 0)")
    .call(yAxis);



  // get group containg all bar rects
  let scatterGroup = d3.select("#ScatterPlot");
  let points = scatterGroup.selectAll("circle").data(data);

  points
    .join("circle")
    .transition()
    .duration(ANIMATION_DURATION)
    .attr("cx", (d) => xScale(d.cases))
    .attr("cy", d => yScale(d.deaths))
    .attr("r", 5);
  // listener for all points
  d3.selectAll("circle")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick);
}

/**
 * Update the data according to document settings
 */
function changeData() {
  //  Load the file indicated by the select menu
  const dataFile = d3.select("#dataset").property("value");

  d3.csv(`data/${dataFile}.csv`)
    .then((dataOutput) => {
      /**
       * D3 loads all CSV data as strings. While Javascript is pretty smart
       * about interpreting strings as numbers when you do things like
       * multiplication, it will still treat them as strings where it makes
       * sense (e.g. adding strings will concatenate them, not add the values
       * together, or comparing strings will do string comparison, not numeric
       * comparison).
       *
       * We need to explicitly convert values to numbers so that comparisons work
       * when we call d3.max()
       **/

      const dataResult = dataOutput.map((d) => ({
        cases: parseInt(d.cases),
        deaths: parseInt(d.deaths),
        date: d3.timeFormat("%m/%d")(d3.timeParse("%d-%b")(d.date)),
      }));
      if (document.getElementById("random").checked) {
        // if random subset is selected
        update(randomSubset(dataResult));
      } else {
        update(dataResult);
      }
    })
    .catch((e) => {
      console.log(e);
      alert("Error!");
    });
}

/**
 *  Slice out a random chunk of the provided in data
 *  @param data
 */
function randomSubset(data) {
  return data.filter((d) => Math.random() > 0.5);
}
