/* DATA LOADING */
async function loadData () {
    const wordData = await d3.json('data/words.json');
    return wordData;
  }
  
  const globalApplicationState = {
    tableData: null,
    wordData: null,
    separated: false,
    beeswarm: null,
    table: null,
  };

  /* OPTION BAR SETUP */
  d3.select("#separate").on("click", toggleSeparate);


  loadData().then((loadedData) => {

    globalApplicationState.wordData = loadedData;
    globalApplicationState.tableData = loadedData;

    globalApplicationState.beeswarm = new Beeswarm(globalApplicationState);
    globalApplicationState.table = new Table(globalApplicationState);
    

  });

  function toggleSeparate() {

    let beeswarm = globalApplicationState.beeswarm;
    // trigger seperated state
    beeswarm.separated = !beeswarm.separated;

    // clear brushes 
    if(beeswarm.activeBrush){
        beeswarm.activeBrushNode.call(beeswarm.activeBrush.move, null);
        beeswarm.activeBrush = null;
        beeswarm.activeBrushNode = null;
        beeswarm.brushedSwarm = null;

        globalApplicationState.tableData = globalApplicationState.wordData
        globalApplicationState.table.drawTable();
    }

    
    // Collapse or expand category labels
    beeswarm.drawLabels();
    
    // change line size
    beeswarm.drawLines();

    // seperate or collapse swarms
    beeswarm.drawSwarmsAlt();

    d3.selectAll('circle').classed("excluded", false)


  }

// function addBrushes(){
//     let beeswarm = globalApplicationState.beeswarm;
//     let shift = beeswarm.axisHeight + beeswarm.labelHeight;

//     let brushGroups = d3
//       .select("#brushes")
//       .selectAll("g")
//       .data(beeswarm.categories)
//       .join("g")
//       .attr('id', d=>d)
//       .attr(
//         "transform",
//         (d, i) => `translate(${0}, ${shift + (i * beeswarm.smallVisHeight)})`
//       );


//       let brushmargin = 7
//       let brushHeight = beeswarm.smallVisHeight;
//       let brushWidth = beeswarm.visWidth;
    

//       //******ADAPTED FROM HW6 LAB */
//       // We loop through the g elements, and attach brush for each g
//       brushGroups.each(function(){

//         const selection = d3.select(beeswarm);
//         selection.append('rect').attr('height', brushHeight).attr('width', brushWidth).attr('fill', 'none');
        
//         const brush = d3.brushX()
//           //  defines how far and wide the brush goes
//           .extent([[0, brushmargin], [brushWidth, brushHeight - brushmargin]])
//           .on('start', function () {
//             // on start, change all nodes to excluded, reversed when brush is removed
//             d3.select('#swarm').selectAll('circle').classed("excluded", true);
//             // if there is an active brush, and that is not on the current g
//             if (beeswarm.activeBrush && selection !== beeswarm.activeBrushNode) {

//               // we remove that brush on the other g element
//               beeswarm.activeBrushNode.call(beeswarm.activeBrush.move, null);
//               beeswarm.brushedSwarm = null;
//             }

//             beeswarm.activeBrush = brush;
//             beeswarm.activeBrushNode = selection;
//           }).on("brush end", brushSelection => handleBrushSelection(brushSelection, beeswarm, selection.attr("id")));

//         selection.call(brush);

//         return selection;
//       })
      
//       //return brush_svg.node() //  <--- observable syntax
//   }

  /**Event handle for brush selections */
function handleBrushSelection({selection}, beeswarm, brushid){
    // an object is passed into beeswarm function, and we are using the value of key selection
  let x = beeswarm.scaleSourceX
  let y = beeswarm.scaleSourceY
  
  // get all circles  
  let swarm = d3.select("#swarm").selectAll('circle')

  // reset brushed selection
  if(beeswarm.brushedSwarm){
    beeswarm.brushedSwarm.classed("excluded", true);
  }
  

  if (selection) {
    
    const [x0, x1] = selection;

    // we apply the filter to find the dots that are inside the brush
    if(beeswarm.separated){
      beeswarm.brushedSwarm = swarm.filter(d => x0 <= x(d.moveX) 
                    && x(d.moveX) < x1 
                   && d.category === brushid );
    } else {
      beeswarm.brushedSwarm = swarm.filter(d => x0 <= x(d.sourceX) 
                    && x(d.sourceX) < x1 );
    }
    
    beeswarm.brushedSwarm.classed("excluded", false)
    
    // finally send the selected data to the global state for table use
    globalApplicationState.table.tableData = beeswarm.brushedSwarm.data();
  } else {    
    // there is no brush currently. so we want to update the selection to none
    beeswarm.brushedSwarm = null;
    globalApplicationState.table.tableData = globalApplicationState.wordData;
  }

  // Tell the table to update 
  globalApplicationState.table.drawTable();
  
}