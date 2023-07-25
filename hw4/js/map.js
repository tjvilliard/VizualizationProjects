/** Class representing the map view. */
class MapVis {
  /**
   * Creates a Map Visuzation
   * @param globalApplicationState The shared global application state (has the data and the line chart instance in it)
   */
  constructor(globalApplicationState) {
    this.globalApplicationState = globalApplicationState;

    // Set up the map projection
    const projection = d3
      .geoWinkel3()
      .scale(150) // This set the size of the map
      .translate([400, 250]); // This moves the map to the center of the

    this.drawMap(this.globalApplicationState, projection);
  }

  updateSelectedCountries() {
    // configure states of all currently selected locations
    globalApplicationState.selectedLocations.forEach(function (d) {
      let selection = d3.select("#" + d);
      selection.classed("selected", true);
    });

    // declass unselected locations
    d3.selectAll(".selected").each(function (d) {
      if (!globalApplicationState.selectedLocations.includes(d.id)) {
        d3.select(this).classed("selected", false);
      }
    });
  }

  // Event Handlers
  countryClicked() {
    let countryId = d3.select(this).attr("id");

    if (globalApplicationState.selectedLocations.includes(countryId)) {
      // remove country from selected if it is clicked again
      let index = globalApplicationState.selectedLocations.indexOf(countryId);
      globalApplicationState.selectedLocations.splice(index, 1);
    } else {
      // if country not selected, select country
      globalApplicationState.selectedLocations.push(countryId);
    }

    globalApplicationState.worldMap.updateSelectedCountries();
    globalApplicationState.lineChart.updateSelectedCountries();
  }

  // Contruct the dom
  drawMap(globalState, projection) {
    // convert mapdata to geojson and get path from projection
    let mapData = globalState.mapData;
    let geoJson = topojson.feature(mapData, mapData.objects.countries);
    let path = d3.geoPath().projection(projection);

    // Find the max total cases for each country for color coding
    let countryMax = {};
    let groupedData = d3.group(globalState.covidData, (d) => d.iso_code);

    for (let key of groupedData.keys()) {
      countryMax[key] = d3.max(groupedData.get(key), (d) =>
        parseFloat(d.total_cases_per_million)
      );
    }

    // color states according to max cases
    let color = d3
      .scaleQuantize()
      .domain([
        0,
        d3.max(globalState.covidData, (d) =>
          parseFloat(d.total_cases_per_million)
        ),
      ])
      .range(d3.schemeReds[9]);

    // Draw the projection
    d3.select("#countries")
      .selectAll("path")
      .data(geoJson.features)
      .join("path")
      .attr("d", path)
      .attr("id", (d) => d.id)
      .style("fill", function (d) {
        if (typeof countryMax[d.id] === "undefined") {
          return color(0);
        }
        return color(countryMax[d.id]);
      })
      .classed("country", true)
      .on("mouseover", function (d) {
        d3.select(this).classed("hovered", true);
      })
      .on("mouseout", function (d) {
        d3.selectAll(".hovered").classed("hovered", false);
      })
      .on("click", this.countryClicked);

    // Draw graticules
    let graticule = d3.geoGraticule();
    d3.select("#graticules")
      .append("path")
      .attr("d", path(graticule()))
      .attr("fill", "none")
      .attr("stroke", "black")
      .style("opacity", 0.2);

    d3.select("#graticules")
      .append("path")
      .attr("d", path(graticule.outline()))
      .attr("fill", "none")
      .attr("stroke", "black");

    // draw legend
    let legend = d3.select("#map").append("g").attr("id", "legend");

    let defs = d3.select("#map").append("defs");
    let linearGradient = defs.append("linearGradient").attr("id", "redScale");

    //Set the color for the start (0%)
    linearGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", d3.schemeReds[9][0]); 

    linearGradient
      .append("stop")
      .attr("offset", "50%")
      .attr("stop-color", d3.schemeReds[9][4]); 

    //Set the color for the end (100%)
    linearGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", d3.schemeReds[9][8]); 

    
    legend.append("text").text("0");
    legend.append("text").attr("x", 130).text("660k");
    legend
      .append("rect")
      .attr("width", 160)
      .attr("height", 20)
      .attr("y", 5)
      .attr("fill", "url(#redScale)");

    legend.attr("transform", `translate(${0}, ${475})`)
  }
}
