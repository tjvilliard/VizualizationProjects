/** Class implementing the table. */
class Table {
  /**
   * Creates a Table Object
   */
  constructor(forecastData, pollData) {
    this.forecastData = forecastData;
    this.tableData = [...forecastData];

    // add useful attributes
    for (let forecast of this.tableData) {
      forecast.isForecast = true;
      forecast.isExpanded = false;
    }
    this.pollData = pollData;
    this.headerData = [
      {
        sorted: false,
        ascending: false,
        key: "state",
      },
      {
        sorted: false,
        ascending: false,
        key: "mean_netpartymargin",
        alterFunc: (d) => Math.abs(+d),
      },
      {
        sorted: false,
        ascending: false,
        key: "winner_Rparty",
        alterFunc: (d) => +d,
      },
    ];

    this.vizWidth = 300;
    this.vizHeight = 30;
    this.smallVizHeight = 20;
    
    

    this.scaleX = d3
      .scaleLinear()
      .domain([-100, 100])
      .range([0, this.vizWidth]);

    this.attachSortHandlers();
    this.drawLegend();
  }

  drawLegend() {
    ////////////
    // PART 2 //
    ////////////
    /**
     * Draw the legend for the bar chart.
     */

    let svg = d3.select("#marginAxis");

    svg.attr("height", this.vizHeight).attr("width", this.vizWidth);

    let marks = [-75, -50, -25, 25, 50, 75];
    let centerShift = 15

    svg
      .selectAll("text")
      .data(marks)
      .join("text")
      .attr("x", (d) => this.scaleX(d) - centerShift)
      .attr("y", this.vizHeight - 3)
      .style("fill", (d) => (d < 0 ? "steelblue" : "firebrick"))
      .text(function (d) {
        if (d < 0) {
          return "+" + String(-1 * d);
        } else {
          return "+" + String(d);
        }
      });
  }

  drawTable() {

    // remove all shapes before attempting to draw new ones
    d3.selectAll("rect").remove();
    d3.selectAll("circle").remove();

    this.updateHeaders();

    let rowSelection = d3
      .select("#predictionTableBody")
      .selectAll("tr")
      .data(this.tableData)
      .join("tr");

    rowSelection.on("click", (event, d) => {
      if (d.isForecast) {
        this.toggleRow(d, this.tableData.indexOf(d));
      }
    });

    let forecastSelection = rowSelection
      .selectAll("td")
      .data(this.rowToCellDataTransform)
      .join("td")
      .attr("class", (d) => d.class);

    ////////////
    // PART 1 //
    ////////////
    /**
     * with the forecastSelection you need to set the text based on the dat value as long as the type is 'text'
     */

    forecastSelection.filter((d) => d.type === "text").text((d) => d.value);

    let vizSelection = forecastSelection.filter((d) => d.type === "viz");

    let svgSelect = vizSelection
      .selectAll("svg")
      .data((d) => [d])
      .join("svg")
      .attr("width", this.vizWidth)
      .attr("height", (d) =>
        d.isForecast ? this.vizHeight : this.smallVizHeight
      );

    let grouperSelect = svgSelect
      .selectAll("g")
      .data((d) => [d, d, d])
      .join("g");

    this.addGridlines(
      grouperSelect.filter((d, i) => i === 0),
      [-75, -50, -25, 0, 25, 50, 75]
    );
    this.addRectangles(grouperSelect.filter((d, i) => i === 1));
    this.addCircles(grouperSelect.filter((d, i) => i === 2));
  }

  rowToCellDataTransform(d) {
    let stateInfo = {
      type: "text",
      class: d.isForecast ? "state-name" : "poll-name",
      value: d.isForecast ? d.state : d.name,
    };

    let marginInfo = {
      type: "viz",
      value: {
        marginLow: -d.p90_netpartymargin,
        margin: d.isForecast ? -+d.mean_netpartymargin : d.margin,
        marginHigh: -d.p10_netpartymargin,
      },
    };

    let winChance;
    if (d.isForecast) {
      const trumpWinChance = +d.winner_Rparty;
      const bidenWinChance = +d.winner_Dparty;

      const trumpWin = trumpWinChance > bidenWinChance;
      const winOddsValue = 100 * Math.max(trumpWinChance, bidenWinChance);
      let winOddsMessage = `${Math.floor(winOddsValue)} of 100`;
      if (winOddsValue > 99.5 && winOddsValue !== 100) {
        winOddsMessage = "> " + winOddsMessage;
      }
      winChance = {
        type: "text",
        class: trumpWin ? "trump" : "biden",
        value: winOddsMessage,
      };
    } else {
      winChance = { type: "text", class: "", value: "" };
    }

    let dataList = [stateInfo, marginInfo, winChance];
    for (let point of dataList) {
      point.isForecast = d.isForecast;
    }
    return dataList;
  }

  updateHeaders() {
    ////////////
    // PART 7 //
    ////////////
    /**
     * update the column headers based on the sort state
     */


    let hd = this.headerData;

    // sorted by state
    if (hd[0].sorted) {
      let selection = d3.select("#state");

      selection.classed("sorting", true);
      selection.select("i").classed("no-display", false);

      if (hd[0].ascending) {
        selection
          .select("i")
          .classed("fa-sort-down", false)
          .classed("fa-sort-up", true);
      } else {
        selection
          .select("i")
          .classed("fa-sort-up", false)
          .classed("fa-sort-down", true);
      }
    } 
    else { 
      let selection = d3.select("#state");

      selection.classed("sorting", false);
      selection
        .select("i")
        .classed("no-display", true)
        .classed("fa-sort-up", false)
        .classed("fa-sort-down", false);
    }

    // sorting by margin
    if (hd[1].sorted) {
      let selection = d3.select("#margin");

      selection.classed("sorting", true);
      selection.select("i").classed("no-display", false);

      if (hd[1].ascending) {
        selection
          .select("i")
          .classed("fa-sort-down", false)
          .classed("fa-sort-up", true);
      } else {
        let i_select = selection.select("i");
        selection
          .select("i")
          .classed("fa-sort-up", false)
          .classed("fa-sort-down", true);
      }
    } else {
      let selection = d3.select("#margin");

      selection.classed("sorting", false);
      selection
        .select("i")
        .classed("no-display", true)
        .classed("fa-sort-up", false)
        .classed("fa-sort-down", false);
    }
  }

  addGridlines(containerSelect, ticks) {
    ////////////
    // PART 3 //
    ////////////
    /**
     * add gridlines to the vizualization
     */


    // declared for working within closures 
    let scale = this.scaleX;
    let lineHeight = this.vizHeight;

    // iterate through each container and draw lines
    containerSelect.each(function (d) {
      let group = d3.select(this);

      group
        .selectAll("line")
        .data(ticks)
        .join("line")
        .attr("x1", (d) => scale(d))
        .attr("x2", (d) => scale(d))
        .attr("y1", lineHeight)
        .attr("y2", 0)
        .style("stroke", "black")
        .style("opacity", (d) => (d === 0 ? 1 : 0.4));
    });

    d3.select("#marginAxis")
      .append("line")
      .attr("x1", this.scaleX(0))
      .attr("x2", this.scaleX(0))
      .attr("y1", this.vizHeight)
      .attr("y2", 0)
      .style("stroke", "black")
      .style("opacity", 1);
  }

  addRectangles(containerSelect) {
    ////////////
    // PART 4 //
    ////////////
    /**
     * add rectangles for the bar charts
     */

    let scale = this.scaleX;
    
    containerSelect.each(function (d) {
      // skip poll data rows
      if(!d.isForecast){return;}

      let group = d3.select(this);
      let m = d.value;

      // draw the rectangles for the forecast data depending on
      // whether their margins cross the center line
      if (Math.sign(m.marginLow) !== Math.sign(m.marginHigh)) {
        // crosses center line
        let leftRect = group
          .append("rect")
          .attr("x", scale(m.marginLow))
          .attr("y", 7.5)
          .attr("width", scale(0) - scale(m.marginLow))
          .attr("height", 15)
          .classed("biden", true)
          .classed("margin-bar", true);

        let rightRect = group
          .append("rect")
          .attr("x", scale(0))
          .attr("y", 7.5)
          .attr("width", scale(m.marginHigh) - scale(0))
          .attr("height", 15)
          .classed("trump", true)
          .classed("margin-bar", true);
      } else {
        // doesnt cross 
        group
          .append("rect")
          .attr("x", scale(m.marginLow))
          .attr("y", 7.5)
          .attr("width", scale(m.marginHigh) - scale(m.marginLow))
          .attr("height", 15)
          .classed("biden", Math.sign(m.marginHigh) === -1)
          .classed("trump", Math.sign(m.marginLow) === 1)
          .classed("margin-bar", true);
      }
    });
  }

  addCircles(containerSelect) {
    ////////////
    // PART 5 //
    ////////////
    /**
     * add circles to the vizualizations
     */

    let scale = this.scaleX;
    containerSelect.each(function (d) {
      let group = d3.select(this);
      let margin = d.value.margin;

      group
        .append("circle")
        .attr("cx", scale(margin))
        .attr("cy", d.isForecast ? 15 : 10)
        .attr("r", d.isForecast ? 5 : 3)
        .classed("trump", Math.sign(margin) === 1)
        .classed("biden", Math.sign(margin) === -1)
        .classed("margin-circle", true);
    });
  }

  attachSortHandlers() {
    ////////////
    // PART 6 //
    ////////////
    /**
     * Attach click handlers to all the th elements inside the columnHeaders row.
     * The handler should sort based on that column and alternate between ascending/descending.
     */

    let table = this;
    let state = table.headerData[0];
    let margin = table.headerData[1];
    d3.select("#state").on("click", function (d) {
      if (margin.sorted === true) {
        margin.sorted = false;
        margin.ascending = false;
      }
      if (state.sorted === false) {
        state.sorted = true;
      } else {
        state.ascending = !state.ascending;
      }

      table.headerData[0] = state;
      table.headerData[1] = margin;
      table.sortTable();
    });

    d3.select("#margin").on("click", function (d) {
      if (state.sorted === true) {
        state.sorted = false;
        state.ascending = false;
      }
      if (margin.sorted === false) {
        margin.sorted = true;
      } else {
        margin.ascending = !margin.ascending;
      }

      table.headerData[0] = state;
      table.headerData[1] = margin;
      table.sortTable();
    });
  }

  sortTable() {
    let state = this.headerData[0];
    let margin = this.headerData[1];

    if (state.sorted) {
      if (state.ascending) {
        this.tableData.sort((a, b) => d3.ascending(a.state, b.state));
      } else {
        this.tableData.sort((a, b) => d3.descending(a.state, b.state));
      }
    } else if (margin.sorted) {
      if (margin.ascending) {
        this.tableData.sort((a, b) =>
          d3.ascending(
            Math.abs(a.mean_netpartymargin),
            Math.abs(b.mean_netpartymargin)
          )
        );
      } else {
        this.tableData.sort((a, b) =>
          d3.descending(
            Math.abs(a.mean_netpartymargin),
            Math.abs(b.mean_netpartymargin)
          )
        );
      }
    } else {
      let forecastData = this.forecastData;
      this.tableData = [...forecastData];
    }


    this.drawTable();
  }

  toggleRow(rowData, index) {
    ////////////
    // PART 8 //
    ////////////
    /**
     * Update table data with the poll data and redraw the table.
     */

    let pollArray = this.pollData.get(rowData.state);

    // if state has no poll data then skip 
    if(typeof pollArray === 'undefined'){return; }

    pollArray.forEach(function (d){
      // give the poll-name row mean_netpartymargin attribute so 
      // that structure will be maintained during sort 
      d.mean_netpartymargin = rowData.mean_netpartymargin;
    })

    if(!rowData.isExpanded){
      
      this.tableData.splice(index + 1, 0, ...pollArray);
      rowData.isExpanded = true;

    } else{
      
      let deleteCount = pollArray.length;
      this.tableData.splice(index + 1, deleteCount);
      rowData.isExpanded = false;

    }
    
    this.drawTable();
  }

  collapseAll() {
    this.tableData = this.tableData.filter((d) => d.isForecast);
  }
}
