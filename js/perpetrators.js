
var svg = d3.select("svg"),
    width = 900;
    height = 600;

var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

var pack = d3.pack()
    .size([width, height-100])
    .padding(1.5);

d3.csv("https://gist.githubusercontent.com/aniketbiswas2017/48f8594c5c6dfb04bb2e19d61962ac7d/raw/a203efc0caf9a7c1537d9d3a1e744b5284384a2c/Groups.csv", function(d) {
  d.value = +d["Count"];
  d.Group = d["Group"]

 	return d;
}, function(error, data) {
  if (error) throw error;  
 
 
  var color = d3.scaleOrdinal()
  .domain(data.map(function(d){ return d.Group;}))
  .range(['#fbb4ae','#b3cde3','#ccebc5','#decbe4','#fed9a6',
  '#ffe9a8','#b9bfe3','#fddaec','#cccccc']);
  
  var root = d3.hierarchy({children: data})
      .sum(function(d) { return d.value; })

  var bubble = svg.selectAll(".bubble")
    .data(pack(root).leaves())
    .enter().append("g")
      .attr("class", "bubble")
      .attr("transform", function(d) { return "translate(" + d.x+ "," + d.y + ")"; });
  
  bubble.append("circle")
      .attr("id", function(d) { return d.id; })
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return color(d.data.Group); })
      .on("mouseover", function(d) {		
    div.transition()		
      .duration(500)		
      .style("opacity", .8);	
    
      var duration = 300;
  data.forEach(function(d, i) {
    console.log(d.value);
    bubble.transition().duration(duration).delay(i * duration)
        .attr("r", d.value);
});
         
    div.html(d.data.Group + ": "+d.data.value  )	
      .style("left", (d3.event.pageX) + "px")		
      .style("top", (d3.event.pageY - 28) + "px");	
  })					
    .on("mouseout", function(d) {		
    div.transition()		
      .duration(1000)	  
      .style("opacity", 0);	
  });
  
});
