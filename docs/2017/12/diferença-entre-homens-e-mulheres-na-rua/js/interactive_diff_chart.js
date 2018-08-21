function diff_interactive_chart(){
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      bisectDate = d3.bisector(function(d) { return d.date; }).left,
      formatCurrency = function(d) { return "$" + formatValue(d); },
      formatValue = d3.format(",.2f"),
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

  var svga = d3.select("#diff-chart-interativo").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json("data/diff_char_interactive.json", function(error, data) {
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

    var dataFiltradoTodos = data.filter(function(d){return d.local === "todos";});
    var dataFiltradoBurrinhos = data.filter(function(d){return d.local === "burrinhos";});
    var dataFiltradoJackson = data.filter(function(d){return d.local === "jackson";});
    var dataFiltradoBobs = data.filter(function(d){return d.local === "bobs";});

    x.domain(d3.extent(dataFiltradoTodos, function(d) { return d.date; }));

    y.domain([
      d3.min(dataFiltradoTodos, function(d) { return Math.min(d["n_homens"], d["n_mulheres"]); }),
      d3.max(dataFiltradoTodos, function(d) { return Math.max(d["n_homens"], d["n_mulheres"]); })
    ]);

    svga.datum(dataFiltradoTodos);

    // var clipBelow = svga.append("clipPath")
    //     .attr("id", "clip-below")
    //   .append("path")
    //     .attr("d", area.y0(height));
    //
    // var clipAbove = svga.append("clipPath")
    //     .attr("id", "clip-above")
    //   .append("path")
    //     .attr("d", area.y0(0));

    var pathAreaAbove = svga.append("path")
        .attr("class", "area above")
        //.attr("clip-path", "url(#clip-above)")
        .attr("d", area.y0(function(d) { return y(d["n_mulheres"]); }));

    var clicked = false;

    var pathAreaBelow = svga.append("path")
        .attr("class", "area below")
        //.attr("clip-path", "url(#clip-below)")
        .attr("d", area)
        .on("click", verificaGraficoExibicao)
        .on("mouseover", mostraTooltip)
        .on("mouseout", escondeTooltip);

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

    var focus = svga.append("g")
                   .attr("class", "focus")
                   .style("display", "none");

    focus.append("circle")
          .attr("r", 4.5);

    focus.append("text")
          .attr("x", 9)
          .attr("dy", ".35em");

        // Os botões
    const dataKeys = ["todos", "jackson", "burrinhos", "bobs"];

    d3.select("#controls").selectAll("button.teams")
                          .data(dataKeys)
                          .enter()
                          .append("button")
                          .attr("class", "btn-default")
                          .on("click", selecionaLocal)
                          .html(d => d);

    function selecionaLocal(d){
      switch (d) {
        case "burrinhos":
          x.domain(d3.extent(dataFiltradoBurrinhos, function(d) { return d.date; }));

          y.domain([
            d3.min(dataFiltradoBurrinhos, function(d) { return Math.min(d["n_homens"], d["n_mulheres"]); }),
            d3.max(dataFiltradoBurrinhos, function(d) { return Math.max(d["n_homens"], d["n_mulheres"]); })
          ]);

          svga.datum(dataFiltradoBurrinhos);
          svga.select("path")
              .attr("class", "area above")
              //.attr("clip-path", "url(#clip-above)")
              .attr("d", area.y0(function(d) { console.log(d); return y(d["n_mulheres"]); })).transition().duration(500);
          svga.select("path")
              .attr("class", "area below")
              //.attr("clip-path", "url(#clip-below)")
              .attr("d", area).transition().duration(500)
              .on("click", verificaGraficoExibicao);
          // area.y1(function(d) { console.log(d); return y(d["n_homens"]); });
          // area.y0(function(d) { return y(d["n_mulheres"]); });
          pathAreaBelow.transition().duration(500).remove();
          pathAreaAbove.remove();
          break;
        case "jackson":
          x.domain(d3.extent(dataFiltradoJackson, function(d) { return d.date; }));

          y.domain([
            d3.min(dataFiltradoJackson, function(d) { return Math.min(d["n_homens"], d["n_mulheres"]); }),
            d3.max(dataFiltradoJackson, function(d) { return Math.max(d["n_homens"], d["n_mulheres"]); })
          ]);

          svga.datum(dataFiltradoJackson);
          svga.select("path")
              .attr("class", "area above")
              //.attr("clip-path", "url(#clip-above)")
              .attr("d", area.y0(function(d) { console.log(d); return y(d["n_mulheres"]); })).transition().duration(500);
          svga.select("path")
              .attr("class", "area below")
              //.attr("clip-path", "url(#clip-below)")
              .attr("d", area).transition().duration(500)
              .on("click", verificaGraficoExibicao);
          // area.y1(function(d) { console.log(d); return y(d["n_homens"]); });
          // area.y0(function(d) { return y(d["n_mulheres"]); });
          pathAreaBelow.transition().duration(500).remove();
          break;
        case "bobs":
          x.domain(d3.extent(dataFiltradoBobs, function(d) { return d.date; }));

          y.domain([
            d3.min(dataFiltradoBobs, function(d) { return Math.min(d["n_homens"], d["n_mulheres"]); }),
            d3.max(dataFiltradoBobs, function(d) { return Math.max(d["n_homens"], d["n_mulheres"]); })
          ]);

          svga.datum(dataFiltradoBobs);
          svga.select("path")
              .attr("class", "area above")
              //.attr("clip-path", "url(#clip-above)")
              .attr("d", area.y0(function(d) { console.log(d); return y(d["n_mulheres"]); })).transition().duration(500);
          svga.select("path")
              .attr("class", "area below")
              //.attr("clip-path", "url(#clip-below)")
              .attr("d", area).transition().duration(500)
              .on("click", verificaGraficoExibicao);
          // area.y1(function(d) { console.log(d); return y(d["n_homens"]); });
          // area.y0(function(d) { return y(d["n_mulheres"]); });
          pathAreaBelow.transition().duration(500).remove();
          break;
        case "todos":
          x.domain(d3.extent(dataFiltradoTodos, function(d) { return d.date; }));

          y.domain([
            d3.min(dataFiltradoTodos, function(d) { return Math.min(d["n_homens"], d["n_mulheres"]); }),
            d3.max(dataFiltradoTodos, function(d) { return Math.max(d["n_homens"], d["n_mulheres"]); })
          ]);

          svga.datum(dataFiltradoTodos);
          svga.select("path")
              .attr("class", "area above")
              //.attr("clip-path", "url(#clip-above)")
              .attr("d", area.y0(function(d) { console.log(d); return y(d["n_mulheres"]); })).transition().duration(500);
          svga.select("path")
              .attr("class", "area below")
              //.attr("clip-path", "url(#clip-below)")
              .attr("d", area).transition().duration(500)
              .on("click", verificaGraficoExibicao);
          // area.y1(function(d) { console.log(d); return y(d["n_homens"]); });
          // area.y0(function(d) { return y(d["n_mulheres"]); });
          pathAreaBelow.transition().duration(500).remove();
          break;
        default:
          console.log("vish");
      }
    }

    function mostraTooltip(data, i){
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i]
          d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      console.log(d3.select(this)[0]);
      console.log(d0);
      console.log(i);
      console.log(d);
      console.log(x0);
      focus.attr("transform", "translate(" + x(d.date) + "," + y(d.n_homens) + ")")
      focus.select("text").text(formatCurrency(d.n_homens));
    }

    function escondeTooltip(d){
      d3.select("#tooltip").classed("hidden", true);
    }

    function verificaGraficoExibicao(d){
      if (clicked) {
        mostraOriginal(d);
        clicked = false;
      } else {
        mostraDiferenca(d);
        clicked = true;
      }
    }

    function mostraOriginal(d){
      console.log(d);
      area.y1(function(d) { return y(d["n_homens"]); });
      area.y0(function(d) { return y(d["n_mulheres"]); });
      pathAreaBelow.transition().duration(500).attr("d", area).style("fill", "MediumPurple");
    }

    function mostraDiferenca(d){
      console.log(d);
      area.y0(height);
      area.y1(function(d) { return y(d["n_homens"]-d["n_mulheres"]); });
      pathAreaBelow.transition().duration(500).attr("d", area).style("fill", "crimson");
      pathAreaAbove.remove();
    }
  });

}
