function diff_chart(){
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var line = d3.svg.area()
      .interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d["n_homens"]); });

  var area = d3.svg.area()
      .interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y1(function(d) { return y(d["n_homens"]); });

  var svga = d3.select("#diff-chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json("data/diff_char.json", function(error, data) {
    if (error) throw error;

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var todayMillis = today.getTime();

    data.forEach(function(d) {
      var parts = d.date.split(":");
      var timePeriodMillis = (parseInt(parts[0], 10) * 60 * 60 * 1000) +
        (parseInt(parts[1], 10) * 60 * 1000);

      d.date = new Date();
      d.date.setTime(todayMillis + timePeriodMillis);

      d["n_homens"]= +d["n_homens"];
      d["n_mulheres"] = +d["n_mulheres"];
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));

    y.domain([
      d3.min(data, function(d) { return Math.min(d["n_homens"], d["n_mulheres"]); }),
      d3.max(data, function(d) { return Math.max(d["n_homens"], d["n_mulheres"]); })
    ]);

    svga.datum(data);

    svga.append("clipPath")
        .attr("id", "clip-below")
      .append("path")
        .attr("d", area.y0(height));

    svga.append("clipPath")
        .attr("id", "clip-above")
      .append("path")
        .attr("d", area.y0(0));

    svga.append("path")
        .attr("class", "area above")
        .attr("clip-path", "url(#clip-above)")
        .attr("d", area.y0(function(d) { return y(d["n_mulheres"]); }));

    svga.append("path")
        .attr("class", "area below")
        .attr("clip-path", "url(#clip-below)")
        .attr("d", area);

    svga.append("path")
        .attr("class", "line")
        .attr("d", line);

    svga.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svga.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Quantidade de pessoas (Pedestres e ciclistas)");
  });
}
