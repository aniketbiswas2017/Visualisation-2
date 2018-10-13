var color_map = d3.rgb("#d4d4d4");
    var quantiles = [0, 0.2, 0.4, 0.6, 0.8, 1];
    var first_year = 1970;
    var heading = " Number of major terrorist incidents in the year ";

    // Code for slider
    d3.select("body").insert("p", ":first-child").append("input")
        .attr("type", "range")
        .attr("min", "1970")
        .attr("max", "2016")
        .attr("value", first_year)
        .attr("id", "year");

    d3.select("body").insert("h2", ":first-child").text(heading + first_year);

    // Code for map container
    var width = 1000, height = 420;
    var map = d3.select("body").insert("svg")
                  .attr("id", "map")
                  .attr("height", height)
                  .attr("width", width);
    var path = d3.geoPath(d3.geoRobinson());

    // Code for legend container
    map.append("g")
        .attr("class", "legend");
    map.append("g")
        .attr("class", "legend_title")
        .append("text");

    // Code for bar chart
    var margin = {top: 50, right:10, bottom:50, left:30};
    var barWidth = 960 - margin.left - margin.right,
        barHeight = 300 - margin.top - margin.bottom;

    var x = d3.scaleBand()
                .rangeRound([0, barWidth])
                .padding(.05);
    var y = d3.scaleLinear().range([barHeight, 0]);

    var chart = d3.select("body")
        .append("svg")
          .attr("id", "bars")
          .attr("width", barWidth + margin.left + margin.right)
          .attr("height", barHeight + margin.top + margin.bottom)
        .append("g")
          .attr("class", "bars")
          .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    // loading data from gist.github.com
    d3.json("https://gist.githubusercontent.com/aniketbiswas2017/1ae67e9697c927ddf4b5ed6bd7c4b1e7/raw/4fd81091c650dced53f394619a090c57c6602da8/data1.json", function(error, d) {

      if (error) throw error;

      let data_all = d['Incident'];

      let data = data_all[first_year];
      let color = colorScale(data);

      // loading datamap from gist.github.com
      d3.json("https://gist.githubusercontent.com/aniketbiswas2017/dd230890d0e9677c4e9488f55671d342/raw/af5f37c9e500b9b08176892e86ae18c27a83694a/world1102_em.json", function(error, worldmap) {
        if (error) throw error;

        map.append("g")
          .attr("class", "countries")
          .selectAll("path")
          .data(topojson.feature(worldmap, worldmap.objects.world).features)
          .enter().append("path")
            .attr("d", path)
            .attr("id", function(d) { return d.id; })
            .call(fillMap, color, data)
            .append("title")
            .call(hoverText, data);

        renderLegend(color, data);
        renderBars(color, data);
      }); 

      d3.select("#year").on("input", function() {
          let upd_color = colorScale(data_all[this.value]);
          fillCountries(upd_color, data_all[this.value]);
          renderLegend(upd_color, data_all[this.value]);
          renderBars(upd_color, data_all[this.value]);
      });

    }); 
