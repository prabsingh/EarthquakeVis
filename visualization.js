
function display(minDate, maxDate, minMag)
{

const svg = d3.select('svg').style('background-color', '#333');
    const path = svg.append('path').attr('stroke', 'white');
    const citiesG = svg.append('g');
    const projection = d3.geoOrthographic();
    const initialScale = projection.scale();
    const geoPath = d3.geoPath().projection(projection);

    const rValue = d => d.Magnitude;
    const rScale = d3.scaleSqrt().range([0, 20]);
    
	
	var parser = d3.timeParse("%Y-%m-%d")
	var parser2 = d3.timeParse("%m/%d/%Y")
	var formater = d3.timeFormat("%m/%d/%Y")
	
	minDate = parser(minDate);
	maxDate = parser(maxDate);

    var commaFormat = d3.format(',');
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(d => `${formater(d.Date)}: ${commaFormat(d.Magnitude)}`);
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
      
        rScale.domain([0, d3.max(cities, rValue)]);
		s = d3.extent(cities, function(d){
				return d.Mag;
			});
			
		var colorScale = d3.scaleLinear()
						   .domain(s)
						   .range(['yellow','red']);
		
        cities.forEach(d => {
          d.radius = rScale(rValue(d));
		  d.color = 'yellow'
		  if (d.Magnitude >= 6)
		  {
			  d.color = 'red'
		  }
        });
        const render = () => {
          
          path.attr('d', geoPath(countries110m));
          
          const point = {
            type: 'Point',
            coordinates: [0, 0]
          };
          cities.forEach(d => {
            point.coordinates[0] = d.Longitude;
            point.coordinates[1] = d.Latitude;
            d.projected = geoPath(point) ? projection(point.coordinates) : null;
          });
          
          const k = Math.sqrt(projection.scale() / 900);
          const circles = citiesG.selectAll('circle')
            .data(cities.filter(d => d.projected && d.Magnitude > +minMag
			&& d.Date > minDate && d.Date < maxDate));
          circles.enter().append('circle')
            .merge(circles)
              .attr('cx', d => d.projected[0])
              .attr('cy', d => d.projected[1])
              .attr('fill', d => d.color)
              .attr('fill-opacity', 0.35)
              .attr('r', d => d.radius * k)
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide);
          circles.exit().remove();
        };
        render();

        let rotate0, coords0;
        const coords = () => projection.rotate(rotate0)
          .invert([d3.event.x, d3.event.y]);

        svg
          .call(d3.drag()
            .on('start', () => {
              rotate0 = projection.rotate();
              coords0 = coords();
            })
            .on('drag', () => {
              const coords1 = coords();
              projection.rotate([
                rotate0[0] + coords1[0] - coords0[0],
                rotate0[1] + coords1[1] - coords0[1],
              ])
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
