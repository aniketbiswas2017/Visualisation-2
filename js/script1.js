function fillMap(selection, color, data) {
  selection
    .attr("fill", function(d) { return typeof data[d.id] === 'undefined' ? color_map :
                                              d3.rgb(color(data[d.id])); });
}

function hoverText(selection, data) {
    selection
    .text(function(d) { return "" + d.id + ", " +
                               (typeof data[d.id] === 'undefined' ? 'neglizible' : data[d.id]); });
}

function fillCountries(color, data) {

  d3.selectAll("svg#map path").transition()
    .delay(80)
    .call(fillMap, color, data);

  d3.selectAll("svg#map path title")
    .call(hoverText, data);

  d3.select("h2").text(heading + d3.select("#year").node().value);
}

function renderLegend(color, data) {

  let svg_height = +d3.select("svg#map").attr("height");
  let legend_items = quantPairing(color.domain());

  let legend = d3.select("svg#map g.legend").selectAll("rect")
               .data(color.range());

  legend.exit().remove();

  legend.enter()
          .append("rect")
        .merge(legend)
          .attr("width", "20")
          .attr("height", "20")
          .attr("y", function(d, i) { return (svg_height-29) - 25*i; })
          .attr("x", 30)
          .attr("fill", function(d, i) { return d3.rgb(d); });

  let text = d3.select("svg#map g.legend").selectAll("text");

  text.data(legend_items)
    .enter().append("text").merge(text)
      .attr("y", function(d, i) { return (svg_height-14) - 25*i; })
      .attr("x", 60)
      .text(function(d, i) { return d; });

  d3.select("svg#map g.legend_title text")
        .text("Legend (Incident count ranges)")
        .attr("x", 30)
        .attr("y", 276);
}

function sortArray(arr,sortkey) {

  sorted_keys = arr.map( function(elem) {return elem[sortkey];}).sort();

  arr2 = [];
  for(let key of sorted_keys){
    for(i in arr){
      if(arr[i][sortkey] === key){
        arr2.push(arr[i]);
        continue;
      }
    }
  }

  return arr2;
}
function renderBars(color, data) {

  array = [];
  for( let key of Object.keys(data)) {
    array.push({'id':key, 'value': data[key]})
  }

  array = sortArray(array, 'id');

  x.domain(array.map(function(d) {return d.id;}));
  y.domain([0, d3.max(Object.values(data), function(d) {return d;})]);

  d3.select("svg#bars g.axis").remove();
  let axis = d3.select("svg#bars").append("g")
              .attr("class", "axis axis--x")
              .attr("transform", "translate("+ 30 +"," + (barHeight+margin.top) + ")")
              .call(d3.axisBottom(x))
                .selectAll("text")
                  .style("text-anchor", "middle")
                  .attr("dx", "-.18em")
                  .attr("dy", ".85em")
                  .attr("transform", "rotate()");

  let bars = d3.select("svg#bars g.bars").selectAll("rect").data(array);
  bars.exit().remove();
  bars.enter().append("rect")
        .merge(bars)
        .attr("fill", function(d) { return color(d.value); })
        .attr("x", function(d) { return x(d.id); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) {return barHeight - y(d.value); });

  let annot = d3.select("svg#bars g.bars").selectAll("text").data(array);
  annot.exit().remove();
  annot.enter().append("text")
        .merge(annot)
        .text(function(d) {return d3.format(",")(d.value);})
        .attr("class", "barlabel")
        .attr("x", function(d) { return x(d.id) + x.bandwidth()/2; })
        .attr("y", function(d) { return y(d.value) - 5; });
}

function colorScale(data) {

  let data_values = Object.values(data).sort( function(a, b){ return a-b; });

  quantScale = quantiles.map( function(elem) {
                  return Math.ceil(d3.quantile(data_values, elem));
  });

  let scale = d3.scaleQuantile()
              .domain(quantScale)
              .range(d3.schemeReds[(quantScale.length)-1]);

  return scale;
}

function quantPairing(arr) {

  arr3 = [];
  for (let i=0; i<arr.length-1; i++) {
    if(i == arr.length-2) {
      arr3.push([arr[i],  arr[i+1]]);
    }
    else {
      arr3.push([arr[i], arr[i+1]-1]);
    }
  }

  arr3 = arr3.map(function(elem) { return elem[0] === elem[1] ?
    d3.format(",")(elem[0]) :
    d3.format(",")(elem[0]) + " - " + d3.format(",")(elem[1]);
  });

  return arr3;
}
