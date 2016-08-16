//files to load: file1 contains data that are on bigger interval than file2 e.g. taking time series as an example, file1 get the data every minute while file2 per second. 
// use case: to determine if there is any deviation 
/*
[file1]
X1,	Y1,	X2,	Y2
1,	3,	60,	23
61,	34,	120,52
...
[file2] 
X1,	Y1,	X2,	Y2
1,	3,	2,	4
3,	5,	4,	7
...
59,	22,	60,	23
...
*/
var file1 = "d3_testdata1.csv";
var file2 = "d3_testdata2.csv"; 

//load first file 
d3.csv(file1, function(error, lines){
var data = lines; 

// get the max and min for x and y axis 
// due to the speciality of the data, otherwise d3.extent  
var maxX1 = d3.max(data, function(d){ return d.X1; }); 
var maxX2 = d3.max(data, function(d){ return d.X2; }); 

var maxY1 = d3.max(data, function(d){ return d.Y1; });  
var maxY2 = d3.max(data, function(d){ return d.Y2; }); 

var maxX = Math.max(maxX1, maxX2);
var maxY = Math.max(maxY1, maxY2); 

//to plot as same range/scale for x and y axis, using maxValue istead of maxX/maxY
var maxValue = Math.max(maxX, maxY);

//width, height
var margin = {top: 20, right: 80, bottom: 30, left: 100},
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

//***************************  domain and scale  ************************************************************************
var x = d3.scale.linear()
    .range([0,width])
    .domain([0,maxX*1.1]);

var y = d3.scale.linear()
    .range([height,0])
    .domain([0, maxY*1.1]);

//***************************  Zoom  ************************************************************************
var zoom = d3.behavior.zoom()
			 .x(x)
			 .y(y)
			 .on("zoom", zoomed);
			 

//***************************  Tooltips  ************************************************************************
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>L1:</strong> <span style='color:red'>" + d.X1 + "</span>" +
	"<strong>E1:</strong> <span style='color:red'>" + d.Y1 + "</span>";
  });
  
 var tip2 = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
  return "<strong>L2:</strong> <span style='color:red'>" + d.X2 + "</span>" +
  "<strong>E2:</strong> <span style='color:red'>" + d.Y2 + "</span>";
  });

//***************************  define graph  ************************************************************************ 
svg = d3.select("#graph")
	.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	.call(zoom);
	
svg.call(tip);
svg.call(tip2);

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "plot")

//***************************  Axis  ************************************************************************
var make_x_axis = function () {
    return d3.svg.axis()
        .scale(x)
        .orient("bottom")
		.ticks(5);
};

var make_y_axis = function () {
    return d3.svg.axis()
        .scale(y)
        .orient("left")
		.ticks(5);
};

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
	.ticks(5);
	
svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  .call(xAxis);
  
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
	.ticks(5);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis);
  
  
svg.append("g")
    .attr("class", "x grid")
    .attr("transform", "translate(0," + height + ")")
    .call(make_x_axis()
    .tickSize(-height, 0, 0)
    .tickFormat(""));

 svg.append("g")
    .attr("class", "y grid")
    .call(make_y_axis()
    .tickSize(-width, 0, 0)
    .tickFormat(""));

//***************************  Remove the content outside axis plane  ********************************************	
var clip = svg.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height);

var chartBody = svg.append("g")
    .attr("clip-path", "url(#clip)");
 
// This loop will run once for each line
// within one loop: start and end point, a discrete line is draw accordingly  
// Red line 
 for (var i=0; i < data.length; i++) {
    chartBody.append("line")
      .attr("class", "plot1")
      .datum(lines[i])
      .attr("x1", function(d){return x(d.X1);})
	  .attr("y1", function(d){return y(d.Y1);})
	  .attr("x2", function(d){return x(d.X2);})
	  .attr("y2", function(d){return y(d.Y2);});
  }

//nested file loading and this loop will run once for each line
//for one line, a line is plotted between start and end points, and points are plotted as circles
d3.csv(file2, function(error, lines){
for (var i=0; i < lines.length; i++) {
      chartBody.append("line")
      .attr("class", "line")
      .datum(lines[i])
      .attr("x1", function(d){return x(d.X1);})
	  .attr("y1", function(d){return y(d.Y1);})
	  .attr("x2", function(d){return x(d.X2);})
	  .attr("y2", function(d){return y(d.Y2);});
	 
	chartBody.append("circle")
		.attr("class", "circle1")
		.datum(lines[i])
		.attr("cx", function(d){return x(d.X1);})
		.attr("cy", function(d){return y(d.Y1);})
		.attr("r", 4)
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide);
		
	chartBody.append("circle")
		.attr("class", "circle2")
		.datum(lines[i])
		.attr("cx", function(d){return x(d.X2);})
		.attr("cy", function(d){return y(d.Y2);})
		.attr("r", 4)
		.on('mouseover', tip2.show)
		.on('mouseout', tip2.hide);		
		
}
 });

//***************************  Zooming handler  *********************************************************** 
function zoomed() {
	var zoomscale = d3.event.scale;
	var panVector = d3.event.translate; 
	
	//select by css class and apply on all elements 
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);
    svg.select(".x.grid")
        .call(make_x_axis()
        .tickSize(-height, 0, 0)
        .tickFormat(""));
    svg.select(".y.grid")
        .call(make_y_axis()
        .tickSize(-width, 0, 0)
        .tickFormat(""));
	
 svg.selectAll(".plot1")
      .attr("class", "plot1")
      .attr("x1", function(d){return x(d.X1);})
	  .attr("y1", function(d){return y(d.Y1);})
	  .attr("x2", function(d){return x(d.X2);})
	  .attr("y2", function(d){return y(d.Y2);});	
		
   svg.selectAll(".line")
      .attr("class", "line")
      .attr("x1", function(d){return x(d.X1);})
	  .attr("y1", function(d){return y(d.Y1);})
	  .attr("x2", function(d){return x(d.X2);})
	  .attr("y2", function(d){return y(d.Y2);});
	  
	svg.selectAll(".circle1")
      .attr("class", "circle1")
      .attr("cx", function(d){return x(d.X1);})
	  .attr("cy", function(d){return y(d.Y1);})
	  .attr("r", 4);
	  
	svg.selectAll(".circle2")
      .attr("class", "circle2")
      .attr("cx", function(d){return x(d.X2);})
	  .attr("cy", function(d){return y(d.Y2);})
	  .attr("r", 4);	
}
});