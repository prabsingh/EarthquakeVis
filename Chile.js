function graph(){
	var margin = {top: 30,
				  right: 20,
				  bottom: 30,
				  left: 50},
		width = 800 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;
	
	var parser = d3.timeParse("%m/%d/%Y")
	
	var xScale = d3.scaleTime().range([0, width]);
	var yScale = d3.scaleLinear().range([height, 0]);

	var xAxis = d3.axisBottom().scale(xScale).ticks(10);
	var yAxis = d3.axisLeft().scale(yScale).ticks(2);
					
	var svg = d3.select("body")
				.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.csv('database.csv', function(dataset){
		dataset.forEach(
			function(d){
				d.Latitude = +d.Latitude;
				d.Longitude = +d.Longitude;
				d.Magnitude = +d.Magnitude;
				d.Date = parser(d.Date);
			})
			
		var filteredData = dataset.filter(function(d){
			return d.Latitude >= -50 &&
		           d.Latitude <= -4 &&
				   d.Longitude >= -85 &&
				   d.Longitude <= -60 &&
				   d.Magnitude >= 7.5
		})
		
		xScale.domain(d3.extent(filteredData, function(d){
			return d.Date;
		}));
		
		yScale.domain([0, 2]);
		
		svg.selectAll("dot")
		.data(filteredData)
		.enter()
		.append("circle")
		.style("fill", "red")
		.attr("r", function(d) {return d.Magnitude})
		.attr("cx", function(d) {return xScale(d.Date);})
		.attr("cy", function(d) {return yScale(1);});
		
		svg.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
			
		svg.append("g")
			.call(yAxis);
	})
}

graph()