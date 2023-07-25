/** Class representing the line chart view. */
class LineChart {
  /**
   * Creates a LineChart
   * @param globalApplicationState The shared global application state (has the data and map instance in it)
   */
  constructor(globalApplicationState) {
    // Set some class level variables
    this.globalApplicationState = globalApplicationState;

    // class level for showing selected countries and for padding
    this.showSelected = false;
 
    this.svg_width = 700;
    this.svg_height = 500;
    this.padding = { top: 10, bottom: 65, left: 90, right: 50 };
    const parseDate = d3.timeParse("%Y-%m-%d");
    const dateFormat = d3.timeFormat("%Y-%m-%d");

    // get the data formatted
    let covidData = this.globalApplicationState.covidData;

    // parse data values upfront
    covidData.forEach(function(d){
      d.date = parseDate(d.date);
      if(d.total_cases_per_million === ""){
        d.total_cases_per_million = 0;
      } else {
        d.total_cases_per_million = parseFloat(d.total_cases_per_million);
      }
      
    });

    

    // Universal xScale
    this.xScale = d3
      .scaleTime()
      .domain([
        d3.min(covidData, (d) => d.date),
        d3.max(covidData, (d) => d.date),
      ])
      .range([this.padding.left, this.svg_width - this.padding.right])
      .nice();

    // x-axis

    d3.select("#x-axis")
      .attr("transform", `translate(0, ${this.svg_height - this.padding.bottom})`)
      .call(
        d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%b %y"))
      );


    this.drawContinent();

    //
    let svg = d3.select('#line-chart');
      
    // y-axis label
    let ylabel = svg.append("g")
    ylabel.append("text")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Cases Per Million");

    ylabel.attr("transform", `translate(${5}, ${(this.svg_height - this.padding.bottom) / 2 - 50})`);

    // x-axis labele
    let xlabel = svg.append("g")
    xlabel.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .text("Date");

    xlabel.attr("transform",`translate(${this.svg_width / 2 + this.padding.right}, ${this.svg_height - (this.padding.bottom / 3)})`);

  }

  updateSelectedCountries() {
    
    if(globalApplicationState.selectedLocations.length === 0){
      this.drawContinent();
    } else {
      this.drawSelected();
    }
  }

  drawContinent() {
    // filter only the continent data
    let data = this.globalApplicationState.covidData;
    let contData = data.filter(function (d) {
      return d.iso_code.startsWith("OWID");
    });

    // group by cont
    let contGroups = d3.group(contData, (d) => d.iso_code); 

    // color scheme
    this.color = d3
      .scaleOrdinal(d3.schemeTableau10)
      .domain(contGroups.keys());
    

    // yscale for max range
    let yScaleMax = d3
      .scaleLinear()
      .domain([
        0,
        400000,
      ])
      .range([this.svg_height - this.padding.bottom, this.padding.top])
      .nice();

    // y-axis

    d3.select("#y-axis")
      .attr("transform", `translate(${this.padding.left}, 0)`)
      .call(d3.axisLeft(yScaleMax));
    

    const lineGenerator = d3
      .line()
      .x((d) => this.xScale(d.date))
      .y((d) => yScaleMax(d.total_cases_per_million));

    d3.select("#lines").selectAll('path')
      .data(contGroups)
      .join("path")
      .classed("line", true)
      .attr("fill", "none")
      .attr("stroke", ([group, values]) => this.color(group))
      .attr("d", ([group, values]) => lineGenerator(values));

    this.drawOverlay(contData);

  }

  drawSelected() {

    let selected = this.globalApplicationState.selectedLocations;

    // filter only the continent data
    let data = this.globalApplicationState.covidData;
    let selectedData = data.filter(function (d) {
      return selected.includes(d.iso_code);
    });

    // group by cont
    let selectedGroups = d3.group(selectedData, (d) => d.iso_code); 

    // color scheme
    this.color = d3
      .scaleOrdinal(d3.schemeTableau10)
      .domain(selectedGroups.keys());

    // yscale for max range
    let yScaleSelected = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(selectedData, (d) => d.total_cases_per_million),
      ])
      .range([this.svg_height - this.padding.bottom, this.padding.top])
      .nice();

    // y-axis

    d3.select("#y-axis")
      .attr("transform", `translate(${this.padding.left}, 0)`)
      .call(d3.axisLeft(yScaleSelected));


    const lineGenerator = d3
      .line()
      .x((d) => this.xScale(d.date))
      .y((d) => yScaleSelected(d.total_cases_per_million));

    d3.select("#lines").selectAll('path')
      .data(selectedGroups)
      .join("path")
      .classed("line", true)
      .attr("fill", "none")
      .attr("stroke", ([group, values]) => this.color(group))
      .attr("d", ([group, values]) => lineGenerator(values));

    this.drawOverlay(selectedData);
  }

  drawOverlay(overlayData ){
    let padding = this.padding;
    let svg_height = this.svg_height;
    let svg_width = this.svg_width;
    const parseDate = d3.timeParse("%Y-%m-%d");
    const dateFormat = d3.timeFormat("%Y-%m-%d");

    d3.select("#line-chart").on('mousemove', (event) => {

      //et line_chart_svg = d3.select("#line-chart");

      //let line_chart_x = event.clientX - 800; // width of map
      //console.log("line_chart_x: " + String(line_chart_x) + ", clientX: " + String(event.clientX));

      let view_adjustment = 810;

      if (event.clientX > view_adjustment + padding.left && event.clientX < view_adjustment + svg_width - padding.right) {
        
        // Find the relevant data (by date and location)
        const yearHovered =  dateFormat(this.xScale.invert(event.clientX-view_adjustment));
        const filteredData = overlayData
          .filter((row) => dateFormat(row.date) === yearHovered)
          .sort((rowA, rowB) => rowB.total_cases_per_million - rowA.total_cases_per_million);

        
        // Some additional logic to prevent to the overlay line from drawing over the legend
        let xInterrupt = this.xScale(parseDate("2021-01-01"));
        let groups = d3.group(filteredData, d=>d.iso_code);
        let yAdjust = 20 * groups.size;

        let cutLine = (event.clientX - view_adjustment) < xInterrupt;

        d3
          .select('#overlay')
          .select('line')
          .attr('stroke', 'black')
          .attr("stroke-width", 1)
          .attr('x1', event.clientX - view_adjustment)
          .attr('x2', event.clientX - view_adjustment)
          .attr('y1', svg_height - padding.bottom)
          .attr('y2', cutLine ? padding.top + yAdjust: padding.top);
    
        
        
       
        d3.select('#overlay')
          .selectAll('text')
          .data(filteredData)
          .join('text')
          .text(d=>`${d.location}: ${d.total_cases_per_million}`)
          .attr('x', padding.left + 2)
          .attr('y', (d, i) => 20*i + padding.top)
          .attr('alignment-baseline', 'hanging')
          .attr('fill', (d) => this.color(d.iso_code));
      }
    });
  }
}
