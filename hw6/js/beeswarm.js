class Beeswarm {
  constructor(globalApplicationState) {
    // Display variables
    this.visWidth = 600;
    this.visHeight = 600;
    this.axisHeight = this.visHeight / 12;
    this.labelHeight = 15;
    this.smallVisHeight = (this.visHeight - this.axisHeight) / 6;
    this.padding = { top: 10, bottom: 10, left: 15, right: 10 };
    this.tranLength = 500;

    // tracking variables
    this.separated = false;
    this.categories = Array.from(
      d3.group(globalApplicationState.wordData, (d) => d.category).keys()
    );
    // Brushes held in beeswarm object
    this.activeBrush = null;
    this.activeBrushNode = null;
    this.brushedSwarm = null;

    // Global State
    this.globalState = globalApplicationState;

    // initialize scales
    let wordData = globalApplicationState.wordData;
    this.setScales(wordData);

    // SVG initialization
    d3.select("#beeswarm")
      .attr("height", this.visHeight)
      .attr("width", this.visWidth)
      .on("click");

    // Draw axis and line of demarcation
    this.drawAxis();
    this.drawLines();

    // Handle the swarm group
    let shift = this.axisHeight + this.labelHeight;
    d3.select("#swarm").attr("transform", `translate(${0}, ${shift})`);
    this.drawSwarmsAlt();

    // add brushes
    this.addBrushes();

    // Initialize labels as invisible
    this.drawLabels(0);
  }

  setScales(wordData) {
    // scales: size of circles
    this.scaleR = d3
      .scaleLinear()
      .domain([
        d3.min(wordData, (d) => parseFloat(d.total)),
        d3.max(wordData, (d) => parseFloat(d.total)),
      ])
      .range([2, 8]);

    // scales: general x scale for labels
    this.scaleX = d3
      .scaleLinear()
      .domain([
        d3.min(wordData, (d) => parseFloat(d.position)),
        d3.max(wordData, (d) => parseFloat(d.position)),
      ])
      .range([this.padding.left, this.visWidth - this.padding.right]);

    // scales: source values of data
    this.scaleSourceX = d3
      .scaleLinear()
      .domain([
        d3.min(wordData, (d) => parseFloat(d.sourceX)),
        d3.max(wordData, (d) => parseFloat(d.sourceX)),
      ])
      .range([this.padding.left, this.visWidth - this.padding.right]);

    this.scaleSourceY = d3
      .scaleLinear()
      .domain([
        d3.min(wordData, (d) => parseFloat(d.sourceY)),
        d3.max(wordData, (d) => parseFloat(d.sourceY)),
      ])
      .range([this.padding.top, this.smallVisHeight - this.padding.bottom]);

    // scales: category -> color
    this.scaleColor = d3
      .scaleOrdinal()
      .domain(this.categories)
      .range(d3.schemeDark2);

    //************************************************unneccessaryy */
    this.scaleSeparate = d3
      .scaleOrdinal()
      .domain(this.categories)
      .range([0, 1, 2, 3, 4, 5]);
    //**************************************************************** */
  }

  drawAxis() {
    // axes
    let marks = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50];
    let centerShift = 5;
    let lineshift = 15;
    let labelshift = 20;
    let visHeader = d3.select("#vis-header");
    let scale = this.scaleX;

    // create text markings above the swarm
    let axis = visHeader.select("g.axis-text");
    axis
      .selectAll("text")
      .data(marks)
      .join("text")
      .attr("x", function (d) {
        if (d === 0) {
          return scale(d) - centerShift / 2;
        } else {
          return scale(d) - centerShift;
        }
      })
      .attr("y", this.axisHeight)
      .style("fill", "black")
      .text(function (d) {
        if (d < 0) {
          return String(-1 * d);
        } else {
          return String(d);
        }
      });

    // draw the marking lines
    visHeader
      .selectAll("line")
      .data(marks)
      .join("line")
      .attr("x1", (d) => scale(d))
      .attr("x2", (d) => scale(d))
      .attr("y1", 0)
      .attr("y2", 7)
      .attr("transform", `translate(${0}, ${this.axisHeight - lineshift})`);

    // draw axis labels
    let labels = visHeader.select("g.label");

    labels
      .append("text")
      .attr("y", this.axisHeight - labelshift)
      .text("Democratic Leaning");

    labels
      .append("text")
      .attr("x", this.visWidth - 130 - this.padding.right)
      .attr("y", this.axisHeight - labelshift)
      .style("text-align", "right")
      .text("Republican Leaning");
  }

  drawLabels() {
    let catLabels = d3.select("#cat-labels");
    let labels = this.categories;

    catLabels.attr(
      "transform",
      `translate(${this.padding.left}, ${this.axisHeight + this.labelHeight})`
    );

    catLabels
      .selectAll("text")
      .data(labels)
      .join("text")
      .transition(this.tranLength)
      .text(function (d) {
        return d.charAt(0).toUpperCase() + d.slice(1);
      })
      .attr("y", (d, i) => (this.separated ? i * this.smallVisHeight + 5 : 0))
      .style("opacity", this.separated ? 0.5 : 0);

    catLabels.selectAll("text").classed("label", true);
  }

  drawLines() {

    // Draw line depending on separated or nah
    let linestart = this.axisHeight + this.labelHeight;
    let lineend = this.separated ? this.visHeight : this.smallVisHeight;

    let lines = d3
      .select("#gridline")
      .transition(this.tranLength)
      .attr("x1", this.scaleX(0))
      .attr("x2", this.scaleX(0))
      .attr("y1", 0)
      .attr("y2", lineend);

    d3.select("#gridline").attr(
      "transform",
      `translate(0, ${this.axisHeight + this.labelHeight})`
    );
  }

  drawSwarmsAlt() {
    let data = this.globalState.wordData;

    d3.select("#swarm")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .transition(this.tranLength)
      .attr("cx", (d) =>
        this.separated
          ? this.scaleSourceX(d.moveX)
          : this.scaleSourceX(d.sourceX)
      )
      .attr("cy", (d) =>
        this.separated
          ? this.scaleSourceY(d.moveY)
          : this.scaleSourceY(d.sourceY)
      )
      .attr("r", (d) => this.scaleR(d.total))
      .style("fill", (d) => this.scaleColor(d.category));
  }


  addBrushes() {
    let shift = this.axisHeight + this.labelHeight;

    let brushGroups = d3
      .select("#brushes")
      .selectAll("g")
      .data(this.categories)
      .join("g")
      .attr("id", (d) => d)
      .attr(
        "transform",
        (d, i) => `translate(${0}, ${shift + i * this.smallVisHeight})`
      );

    let brushmargin = 7;
    let brushHeight = this.smallVisHeight;
    let brushWidth = this.visWidth;

    let beeswarm = this;

    //******ADAPTED FROM HW6 LAB */
    // We loop through the g elements, and attach brush for each g
    brushGroups.each(function () {
      const selection = d3.select(this);
      selection
        .append("rect")
        .attr("height", brushHeight)
        .attr("width", brushWidth)
        .attr("fill", "none");

      const brush = d3
        .brushX()
        // This defines how far and wide the brush goes
        .extent([
          [0, brushmargin],
          [brushWidth, brushHeight - brushmargin],
        ])
        .on("start", function () {
          // on start, change all nodes to excluded, reversed when brush is removed
          d3.select("#swarm").selectAll("circle").classed("excluded", true);
          // if there is an active brush, and that is not on the current g
          if (beeswarm.activeBrush && selection !== beeswarm.activeBrushNode) {
            // we remove that brush on the other g element
            beeswarm.activeBrushNode.call(beeswarm.activeBrush.move, null);
            // beeswarm.brushedSwarm = null;
          }

          beeswarm.activeBrush = brush;
          beeswarm.activeBrushNode = selection;
        })
        .on("brush end", (brushSelection) =>
          handleBrushSelection(brushSelection, beeswarm, selection.attr("id"))
        );

      selection.call(brush);

      return selection;
    });


  }

//   clearBrush() {
//     this.activeBrushNode.call(beeswarm.activeBrush.move, null);
//     this.activeBrush = null;
//     this.activeBrushNode = null;
//     d3.selectAll("circle").classed("excluded", false);
//   }
}

// /**Event handle for brush selections */
// function handleBrushSelection({ selection }, beeswarm, brushid) {
//   // an object is passed into beeswarm function, and we are using the value of key selection

//   let x = beeswarm.scaleSourceX;
//   let y = beeswarm.scaleSourceY;

//   // get all circles
//   let swarm = d3.select("#swarm").selectAll("circle");

//   // reset brushed selection
//   if (beeswarm.brushedSwarm) {
//     beeswarm.brushedSwarm.classed("excluded", true);
//   }

//   if (selection) {
//     const [x0, x1] = selection;

//     // we apply the filter to find the dots that are inside the brush
//     if (beeswarm.separated) {
//       beeswarm.brushedSwarm = swarm.filter(
//         (d) => x0 <= x(d.moveX) && x(d.moveX) < x1 && d.category === brushid
//       );
//     } else {
//       beeswarm.brushedSwarm = swarm.filter(
//         (d) => x0 <= x(d.sourceX) && x(d.sourceX) < x1
//       );
//     }

//     beeswarm.brushedSwarm.classed("excluded", false);

//     // finally send the selected data to the global state for table use
//     globalApplicationState.tableData = beeswarm.brushedSwarm.data();
//   } else {
//     // there is no brush currently. so we want to update the selection to none
//     beeswarm.brushedSwarm = null;
//     globalApplicationState.tableData = beeswarm.globalState.wordData;
//   }

//   // Tell the table to update
//   globalApplicationState.table.drawTable();
// }
