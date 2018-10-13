var margin = {top: 20, right:10, bottom:52, left:40};

d3.select("input[value=\"attacks\"]").property("checked", true);

var heading = " Number of major terrorist incidents in ";

var svg = d3.select("body")
	.append("svg")
	.append("g")

svg.append("g")
	.attr("class", "slices");
svg.append("g")
	.attr("class", "labelName");
svg.append("g")
	.attr("class", "labelValue");
svg.append("g")
	.attr("class", "lines");

var width = 680,
    height = 500,
	radius = 230;

var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) {
		return d.value;
	});

var arc = d3.svg.arc()
	.outerRadius(radius * 0.9)
	.innerRadius(0.1);

var outerArc = d3.svg.arc()
	.innerRadius(radius * 0.9)
	.outerRadius(radius * 0.9);

var sizeLegend = (radius * 0.1);
var spaceLegend = radius * 0.023;


var div = d3.select("body").append("div").attr("class", "toolTip");

svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var colorRange = d3.scale.category20b();
var color = d3.scale.ordinal()
	.range(colorRange.range());

dataCount = [
		{label:"Armed Assault", value:40223}, 
		{label:"Unarmed Assault", value:913},
        {label:"Assasination", value:18402}, 
		{label:"Infrastructure", value:9581},
        {label:"Bombing", value:83073},        
        {label:"Hijacking", value:598},
        {label:"Hostage", value:11135},
        {label:"Unknown", value:6425}
        ];

dataKills = [
		{label:"Armed Assault", value:153131},
		{label:"Unarmed Assault", value:788},		
        {label:"Assasination", value:24030},
		{label:"Infrastructure", value:3476},		
        {label:"Bombing", value:145326},
		{label:"Hijacking", value:3685},
        {label:"Hostage", value:24801},		
        {label:"Unknown", value:28317}
        ];

dataAverage = [
		{label:"Armed Assault", value:4.03}, 
		{label:"Unarmed Assault", value:0.88},
        {label:"Assasination", value:1.31}, 
		{label:"Infrastructure", value:0.39},
        {label:"Bombing", value:1.83},        
        {label:"Hijacking", value:6.65},		
        {label:"Hostage", value:2.82},		
        {label:"Unknown", value:4.86}
        ];

change(dataCount);

d3.selectAll("input")
	.on("change", dataSelect);
	
function dataSelect()
{
	var value = this.value;
	if (value == "attacks")
	{
		change(dataCount);
	}
	else if (value == "deaths")
	{
		change(dataKills);
	}
	else if (value == "average")
	{
		change(dataAverage);
	}
}

function change(data) {
	// http://jsfiddle.net/jaqj3usb/2/
	var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), function(d){ return d.data.label });

    slice.enter()
        .insert("path")
        .style("fill", function(d) { return color(d.data.label); })
        .attr("class", "slice");

    slice
        .transition().duration(1500)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        }) 
		// https://bl.ocks.org/rshaker/225c6df494811f46f6ea53eba63da817
    slice
        .on("mousemove", function(d){
            div.style("left", d3.event.pageX+10+"px");
            div.style("top", d3.event.pageY-25+"px");
            div.style("display", "inline-block");
            div.html((d.data.label)+"<br>"+(d.data.value)+"");
        });
    slice
        .on("mouseout", function(d){
            div.style("display", "none");
        });

    slice.exit()
        .remove();
	// http://blockbuilder.org/guilhermesimoes/49ba71346a956ed0a12e9bc515be5804
	
    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = sizeLegend + spaceLegend + 7;
            var offset =  height * color.domain().length / 2;
            var horz = -3 * sizeLegend + 550;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });
	// https://bit.ly/2HkNyWM
    legend.append('rect')
        .attr('width', sizeLegend)
        .attr('height', sizeLegend)
        .style('fill', color)
        .style('stroke', color);

    legend.append('text')
        .attr('x', sizeLegend + spaceLegend + 2.1)
        .attr('y', sizeLegend - spaceLegend )
        .text(function(d) { return d; });

    var text = svg.select(".labelName").selectAll("text")
        .data(pie(data), function(d){ return d.data.label });

    text.enter()
        .append("text")
        .attr("dy", ".35em")
        .text(function(d) {
            return (d.data.label+": "+d.value+"");
        });

    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text
        .transition().duration(1000)
        .attrTween("transform", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate("+ pos +")";
            };
        })
        .styleTween("text-anchor", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
            };
        })
        .text(function(d) {
            return (d.data.label+": "+d.value+"");
        });

    text.exit()
        .remove();


    var polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(data), function(d){ return d.data.label });

    polyline.enter()
        .append("polyline");

    polyline.transition().duration(1000)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.97 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };
        });

    polyline.exit()
        .remove();
};
