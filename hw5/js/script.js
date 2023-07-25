preGrouped = d3.json("./data/senate_polls.json");
extraCredit = d3.csv("./data/senate_polls.csv");

Promise.all([
  d3.csv("./data/senate_forecasts.csv"),
  preGrouped,
  extraCredit,
]).then((data) => {
  let forecastData = data[0];
  let pollData = data[1];
  let extraCredit = data[2];

  // extraCredit roll up
  let ecGroup = d3.rollup(
    extraCredit,
    function (v) {
      let returnArray = [];

      console.log(v[0].state);
      let pollGrouping = d3.group(v, (d) => d.poll_id);
      let pollMargin = 0;

      pollGrouping.forEach(function (value, key) {
        // if (value[0].state === "Alaska") {
        //     // alaska is special case
        //     // one candidate runs for multiple parties in poll data 
        //   let partyGroup = d3.group(value, (d) => d.party);
          
        //   let redMean = d3.mean(partyGroup.get("REP"), (d) =>
        //     parseFloat(d.pct)
        //   );

        //   let blueMean = 0;
        //   if(partyGroup.size === 2){
        //     blueMean = d3.mean(partyGroup.get("DEM"), (d) =>
        //     parseFloat(d.pct));
        //   }
          
          

        //   pollMargin = redMean - blueMean;

        // } else {
            
        // }

        // general case 
        // pollMargin = d3.mean(value, function (d) {
        //     if (d.party === "REP") {
        //       return parseFloat(d.pct);
        //     } else if (d.party === "DEM") {
        //       return -1 * parseFloat(d.pct);
        //     } else {
        //       return 0;
        //     }
        //   });

        let partyGroup = d3.group(value, d=> d.party);

        let redMean = 0;
        let blueMean = 0;

        if(typeof partyGroup.get("REP") !== 'undefined'){
            redMean = d3.mean(partyGroup.get("REP"), d=>d.pct);
        } 

        if(typeof partyGroup.get("DEM") !== 'undefined'){
            blueMean = d3.mean(partyGroup.get("DEM"), d=>d.pct);
        }

        let pollMargin = redMean - blueMean; 
        

        let obj = {
          state: value[0].state,
          name: value[0].pollster,
          margin: pollMargin,
        };

        returnArray.push(obj);
      });

      return returnArray;
    },
    (d) => d.state
  );

  /////////////////
  // EXTRA CREDIT//
  /////////////////
  /**
   * replace preGrouped with extraCredit and uncomment the line that defines extraCredit.
   * Then use d3.rollup to group the csvfile on the fly.
   *
   * If you are not doing the extra credit, you do not need to change this file.
   */

  //rolledPollData = new Map(pollData); //  convert to a Map object for consistency with d3.rollup
  rolledPollData = new Map(ecGroup);
  let table = new Table(forecastData, rolledPollData);
  table.drawTable();
});
