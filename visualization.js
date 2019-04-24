
function display(minDate, maxDate, minMag)
{

	const svg = d3.select('svg').style('background-color', '#005C99');
    const path = svg.append('path').attr('stroke', 'white');
    const earthQuakeCitiesG = svg.append('g');
    const projection = d3.geoOrthographic();
    const initProjectionScale = projection.scale();
    const geoPath = d3.geoPath().projection(projection);

    const rmagValue = d => d.Magnitude;
    const rSqrtScale = d3.scaleSqrt().range([0, 10]);
    
	var parser = d3.timeParse("%Y-%m-%d")
	var parser2 = d3.timeParse("%m/%d/%Y")
	var formater = d3.timeFormat("%m/%d/%Y")
	
	minDate = parser(minDate);
	maxDate = parser(maxDate);
// tooltip output date and magnitude of earthquake
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
	  .html(d => `${formater(d.Date)} , Magnitude: ${d.Magnitude}`);
    svg.call(tip);

    d3.queue()
      .defer(d3.json, 'https://unpkg.com/world-atlas@1/world/110m.json')
      .defer(d3.csv, 'database.csv')
      .await((error, world110m, cities) => {
        const countries110m = topojson
          .feature(world110m, world110m.objects.countries);

        cities.forEach(d => {
          d.latitude = +d.Latitude;
          d.longitude = +d.Longitude;
          d.Magnitude = +d.Magnitude;
		  d.Date = parser2(d.Date);
        });
      
        rSqrtScale.domain([0, d3.max(cities, rmagValue)]);

        cities.forEach(d => {
          d.radius = rSqrtScale(rmagValue(d));
		  d.color = 'yellow'
		  if (d.Magnitude >= 6)
		  {
			  d.color = 'red'
		  }
        });
        const render = () => {
          
          path.attr('d', geoPath(countries110m));
          const locationPoint = {
            type: 'Point',
            coordinates: [0, 0]
          };
          cities.forEach(d => {
            locationPoint.coordinates[0] = d.Longitude;
            locationPoint.coordinates[1] = d.Latitude;
            d.projected = geoPath(locationPoint) ? projection(locationPoint.coordinates) : null;
          });
          
          const k = Math.sqrt(projection.scale() / 400);
          const circles = earthQuakeCitiesG.selectAll('circle')
            .data(cities.filter(d => d.projected && d.Magnitude > +minMag
			&& d.Date > minDate && d.Date < maxDate));
          circles.enter().append('circle')
            .merge(circles)
              .attr('cx', d => d.projected[0])
              .attr('cy', d => d.projected[1])
              .attr('fill', d => d.color)
              .attr('fill-opacity', 0.45)
              .attr('r', d => d.radius * k)
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide);
          circles.exit().remove();
        };
        render();

        let rotateGraph, coordsGraph;
        const coords = () => projection.rotate(rotateGraph)
          .invert([d3.event.x, d3.event.y]);

		svg
		//dragging events
          .call(d3.drag()
            .on('start', () => {
              rotateGraph = projection.rotate();
              coordsGraph = coords();
            })
            .on('drag', () => {
              const coords1 = coords();
              projection.rotate([
                rotateGraph[0] + coords1[0] - coordsGraph[0],
                rotateGraph[1] + coords1[1] - coordsGraph[1],
              ])
              render();
            })
            .on('end', () => {
              render();
            })
            
          )  
		  //Zooming events
          .call(d3.zoom()
            .on('zoom', () => {
              projection.scale(initProjectionScale * d3.event.transform.k);
              render();
            })
            .on('start', () => {
            })
            .on('end', () => {
              render();
            })  
          )  
		 
      });   
}


function filter(){
	minDate = document.getElementById("minDate").value;
	maxDate = document.getElementById("maxDate").value;
	minMag = document.getElementById("minMag").value
	d3.select("svg").selectAll("*").remove()
	display(minDate, maxDate, minMag);
}

display('2011-03-10', '2011-03-12', '8');
