class Table {
  constructor(globalState) {
    this.globalState = globalState;
    this.defaultData = globalState.tableData
    this.tableData = globalState.tableData;

    
    this.categories = Array.from(d3.group(globalApplicationState.wordData, d=>d.category).keys());

    this.vizWidth = 100;
    this.vizHeight = 15;
    this.headerData = [
        {
          sorted: false,
          ascending: false,
          key: "phrase",
        },
        {
          sorted: false,
          ascending: false,
          key: "frequency",
          alterFunc: (d) => +d,
        },
        {
          sorted: false,
          ascending: false,
          key: "percent",
          alterFunc: (d) => +d,
        },
        {
            sorted: false,
            ascending: false,
            key: "total",
            alterFunc: (d) => +d,
          },
        ];
    this.defaultHeader= [
        {
          sorted: false,
          ascending: false,
          key: "phrase",
        },
        {
          sorted: false,
          ascending: false,
          key: "frequency",
          alterFunc: (d) => Math.abs(+d),
        },
        {
          sorted: false,
          ascending: false,
          key: "percent",
          alterFunc: (d) => Math.abs(+d),
        },
        {
            sorted: false,
            ascending: false,
            key: "total",
            alterFunc: (d) => +d,
          },
        ];

    this.scalePercent = d3
      .scaleLinear()
      .domain([-100, 100])
      .range([10, this.vizWidth -10]);
    
    this.scaleFreq = d3
    .scaleLinear()
    .domain([0, 1])
    .range([10, this.vizWidth -10]);


    this.scaleColor = d3
      .scaleOrdinal()
      .domain(this.categories)
      .range(d3.schemeDark2);

      // set axis headers
    d3.selectAll('svg.axis').attr('height', 15).attr('width', this.vizWidth)
    d3.select('#freqAxis').append('g').style("font", "7px arial").call(d3.axisTop(this.scaleFreq).ticks(3)).attr("transform",  `translate(${0}, ${18})`);
    d3.select('#percAxis').append('g').style("font", "7px arial").call(d3.axisTop(this.scalePercent).ticks(5)).attr("transform",  `translate(${0}, ${18})`);

      this.attachSortHandlers()
      this.drawTable();
  }

  drawTable(){

    

    // remove all shapes before attempting to draw new ones
    d3.select('#table').selectAll("rect").remove();



    let rowSelection = d3
    .select("#predictionTableBody")
    .selectAll("tr")
    .data(this.tableData)
    .join("tr");

    let forecastSelection = rowSelection
    .selectAll("td")
    .data(this.rowToCellDataTransform)
    .join("td");

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
    .attr("height", this.vizHeight);

    let freqSvg = svgSelect.filter(d=> d.name === "Frequency");
    let percSvg = svgSelect.filter(d=> d.name === "Percentage")

  

//   this.addGridlines(
//     grouperSelect.filter((d, i) => i === 0),
//     [-75, -50, -25, 0, 25, 50, 75]
//   );
  this.addFreqPlot(freqSvg);
  this.addPercPlot(percSvg);
  }

  addFreqPlot(containerSelect){

    let scale = this.scaleFreq
    let color = this.scaleColor

    containerSelect.each(function(d){
        let svg = d3.select(this)
        
        let fRect = svg
          .append("rect")
          .attr("x", scale(0))
          .attr("y", 2.5)
          .attr("width", scale(d.value))
          .attr("height", 10)
          .style("fill", color(d.category))
          .classed("frequency-bar", true);

    })

  }

  addPercPlot(containerSelect){

    let scale = this.scalePercent;

    containerSelect.each(function(d){
        let svg = d3.select(this);
        let m = d.value;
        let leftRect = svg
          .append("rect")
          .attr("x", scale(m.dem))
          .attr("y", 2.5)
          .attr("width", scale(0) - scale(m.dem))
          .attr("height", 10)
          .classed("dem", true)
          .classed("frequency-bar", true);

        let rightRect = svg
          .append("rect")
          .attr("x", scale(0))
          .attr("y", 2.5)
          .attr("width", scale(m.rep) - scale(0))
          .attr("height", 10)
          .classed("rep", true)
          .classed("frequency-bar", true);
    })

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
    let phrase = table.headerData[0];
    let frequency = table.headerData[1];
    let percent = table.headerData[2];
    let total = table.headerData[3];

    d3.select("#phrase").on("click", function (d) {
      
      if (phrase.sorted === false) {
        phrase.sorted = true;
      } else {
        phrase.ascending = !phrase.ascending;
      }

      table.headerData[0] = phrase;
      table.headerData[1] = table.defaultHeader[1];
      table.headerData[2] = table.defaultHeader[2];
      table.headerData[3] = table.defaultHeader[3];
      table.sortTable();
    });

    d3.select("#frequency").on("click", function (d) {
    
      if (frequency.sorted === false) {
        frequency.sorted = true;
      } else {
        frequency.ascending = !frequency.ascending;
      }

      table.headerData[0] = table.defaultHeader[0];
      table.headerData[1] = frequency;
      table.headerData[2] = table.defaultHeader[2];
      table.headerData[3] = table.defaultHeader[3];
      table.sortTable();
    });

    d3.select("#percent").on("click", function (d) {
        
        if (percent.sorted === false) {
          percent.sorted = true;
        } else {
          percent.ascending = !percent.ascending;
        }
  
        table.headerData[0] = table.defaultHeader[0];
        table.headerData[1] = table.defaultHeader[1];
        table.headerData[2] = percent;
        table.headerData[3] = table.defaultHeader[3];
        table.sortTable();
      });

      d3.select("#total").on("click", function (d) {
        
        if (total.sorted === false) {
          total.sorted = true;
        } else {
          total.ascending = !total.ascending;
        }
  
        table.headerData[0] = table.defaultHeader[0];
        table.headerData[1] = table.defaultHeader[1];
        table.headerData[2] = table.defaultHeader[2];
        table.headerData[3] = total;
        table.sortTable();
      });
  }

  sortTable() {
    let phrase = this.headerData[0]
    let frequency = this.headerData[1];
    let percent = this.headerData[2];
    let total = this.headerData[3]

    if (frequency.sorted || total.sorted) {
      if (frequency.ascending || total.ascending) {
        this.tableData.sort((a, b) => d3.ascending(+a.total , +b.total));
      } else {
        this.tableData.sort((a, b) => d3.descending(+a.total, +b.total));
      }
    } else if (percent.sorted) {
      if (percent.ascending) {
        this.tableData.sort((a, b) =>
        d3.descending(
            Math.abs(+a.percent_of_d_speeches),
            Math.abs(+b.percent_of_d_speeches)
          )
        );
      } else {
        this.tableData.sort((a, b) =>
          d3.descending(
            Math.abs(+a.percent_of_r_speeches),
            Math.abs(+b.percent_of_r_speeches))
        );
      }
    }else if(phrase.sorted){
        if (phrase.ascending) {
            this.tableData.sort((a, b) =>
              d3.ascending(a.phrase, b.phrase)
            );
          } else {
            this.tableData.sort((a, b) =>
              d3.descending(a.phrase, b.phrase)
            );
          }
    } else {
      let d = this.defaultData;
      this.tableData = d;
    }


    this.drawTable();
  }







  rowToCellDataTransform(d) {
    let phraseInfo = {
      type: "text",
      //class: d.isForecast ? "state-name" : "poll-name",
      value: d.phrase,
    };

    let frequencyInfo = {
        type: "viz",
        name: "Frequency",
        category: d.category,
        value: +d.total / 50
      };


    let percentageInfo = {
      type: "viz",
      name: "Percentage",
      value: {
        dem: -d.percent_of_d_speeches,
        rep: +d.percent_of_r_speeches,
      },
    };

    let totalInfo = {
        type: "text",
        value: d.total
      };

    let datalist = [phraseInfo, frequencyInfo, percentageInfo, totalInfo]

    return datalist
}

  update() {
    return;
  }
}
