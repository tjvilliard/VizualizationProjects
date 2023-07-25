/** Class representing a Tree. */
class Tree {
  /**
   * Creates a Tree Object
   * Populates a single attribute that contains a list (array) of Node objects to be used by the other functions in this class
   * @param {json[]} json - array of json objects with name and parent fields
   */
  constructor(json) {
    this.nodes = [];
    for(let x of json){
      this.nodes.push(new Node(x.name,x.parent));
    }

  }

  /**
   * Assign other required attributes for the nodes.
   */
  buildTree () {
    // note: in this function you will assign positions and levels by making calls to assignPosition() and assignLevel()
   
    // n^2 iteration for checking parent-child relationships
    for(let parent of this.nodes){
      for(let child of this.nodes){
        if(parent.name === child.parentName){
          parent.addChild(child);
          child.parentNode = parent;
        }
      }
    }

    this.assignLevel(this.nodes[0], 0)
    this.assignPosition(this.nodes[0],0)
  }

  /**
   * Recursive function that assign levels to each node
   */
  assignLevel (node, level) {
    node.level = level;
    if(node.children.length === 0){
      return;
    }
    level++;
    node.children.forEach(x => this.assignLevel(x, level));
  }

  /**
   * Recursive function that assign positions to each node
   */
  assignPosition (node, position) {
    node.position = position;
    if(node.children.length === 0){
      return;
    }
    for(let index = 0; index < node.children.length; index++){
      if(index ===0){ // first child
        this.assignPosition(node.children[index], position);
      }
      else if(node.children[index-1].children.length===0){ // sibling had no children
        this.assignPosition(node.children[index], position + index)
      }
      else{ // adjust for sibling children
        this.assignPosition(node.children[index], position + node.children[index-1].children.length)
      }
    }


    
  }

  /**
   * Function that renders the tree
   */
  renderTree () {
    // constants for rendering
    const r = 40;
    const xspace = 120;
    const yspace = 120;
    const height = 1200;
    const width = 1200;

    // append svg to body
    d3.select("body")
    .append("svg")
    .attr("height", height)
    .attr("width", width);

    let svg = d3.select("svg");

    // define a scaling function for lings
    let lineScale = n=> xspace*n + r;
    // construct lines using join-enter method
    let lines = svg.selectAll("line")
    .data(this.nodes)
    .join(enter => {
      
      // draw each line from each node to its parent
      let line = enter.append("line")
      .attr("x1", d=>lineScale(d.level))
      .attr("y1", d=>lineScale(d.position))
      .attr("x2", d=>lineScale(d.parentNode ? d.parentNode.level:0) )
      .attr("y2", d=>lineScale(d.parentNode ? d.parentNode.position:0));
      
    });
    
    //code taken from Dr.Lex's tutorials and adjusted for the assignment
    let nodeGroups = svg.selectAll(".nodeGroup")
            .data(this.nodes)
            .join(enter => {
                // ------ taking care of entering elements ----
                let enterGroup = enter.append('g')
                                // assigning the class
                                .classed('nodeGroup', true);

                // appending and initializing the circles but 
                // only with the "static" properties
                enterGroup.append('circle')
                        .attr("r", r);

                // appending text elements
                enterGroup.append("text")
                .classed("label", true)
                .text(d=>d.name);
                        
                return enterGroup;
            })
            // both the old and new "g" elements are merged here
            .attr("transform", d=>`translate(${d.level * xspace + r}, ${d.position * yspace + r})`);

    // original implementation
    /**let groups = svg.selectAll("g").data(this.nodes);

    // creates all nodeGroups for each data node
    groups.enter().append("g")
    .attr("class","nodeGroup")
    .attr("transform", d=>`translate(${d.level *xspace + r}, ${d.position * yspace + r})`);

    // adds circles and text elemnts to all nodeGroups
    let nodeGroups = svg.selectAll(".nodeGroup")
    nodeGroups.append("circle").attr("r", r);
    nodeGroups.append("text")
    .attr("class", "label")
    .text(d=>d.name);**/
    

  }

}