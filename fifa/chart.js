function rankingChart() {
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = 200,
      height = 400,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.time.scale(),
      yScale = d3.scale.linear();

  function chart(selection) {

    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [30, d.elo];
      });

      // Update the x-scale.
      xScale
          .domain(d3.extent(data, xValue))
          .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      yScale
          .domain(d3.extent(data, yValue))
          .range([height - margin.top - margin.bottom, 0]);

      xMap = function(d) { return xScale(xValue(d)) };
      yMap = function(d) { return yScale(yValue(d)) };

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");

      // draw dots
      gEnter.selectAll(".dot")
          .data(data)
          .enter().append("circle")
          .attr("class", "dot")
          .attr("r", 3.5)
          .attr("cx", 30)
          .attr("cy", yMap)
          .style("fill", function(d) { return "red";});
    });
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  return chart;
}
