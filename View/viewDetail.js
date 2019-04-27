function setDetailView(data){

  //------------SET ERROR DETAIL------------------
  var detail = d3.select("#Detail-View")
    .append("div")
    .attr("id","error-detail")
    .append("table");

  var detail1 = detail.append("tr");
    detail1.append("td")
    .text("Channel Name: ");
    detail1.append("td")
    .text(data.label);

  var detail2 = detail.append("tr");
    detail2.append("td")
    .text("Alarm Type: ");
    detail2.append("td")
    .text(data.alarm_type);

  var detail3 = detail.append("tr");
    detail3.append("td")
    .text("Event Type: ");
    detail3.append("td")
    .text(data.event_type);

  var detail4 = detail.append("tr");
    detail4.append("td")
    .text("Start Time: ");
    detail4.append("td")
    .text(data.start);

  var detail5 = detail.append("tr");
    detail5.append("td")
    .text("End Time: ");
    detail5.append("td")
    .text(data.end);

  var duration = (new Date(data.end).getTime() -new Date(data.start).getTime())/1000;

  var detail6 = detail.append("tr");
    detail6.append("td")
    .text("Duration: ");
    detail6.append("td")
    .text(duration+" seconds");

  var detail7 = detail.append("tr");
    detail7.append("td")
    .text("Flex Location: ");
    detail7.append("td")
    .text(data.nodeid);

  var detail8 = detail.append("tr");
    detail8.append("td")
    .text("Location: ");
    detail8.append("td")
    .text(data.location);

  var detail9 = detail.append("tr");
    detail9.append("td")
    .text("Probable Cause: ");
    detail9.append("td")
    .text(data.probable_cause);

  var detail10 = detail.append("tr");
    detail10.append("td")
    .text("Message: ");
    detail10.append("td")
    .text(data.message);

  var detail11 = detail.append("tr");
    detail11.append("td")
    .text("Details ");
    detail11.append("td")
    .text(data.details);

  //------------SET ERROR LOCATION-------------

  var treeData = [
    {
      "name": "Encoding",
      "parent": "null",
      "children": [
        {
          "name": "Transcoding",
          "parent": "Encoding",
          "children": [
            {
              "name": "Packaging",
              "parent": "Transcoding"
            }
          ]
        }
      ]
    }
  ];


  // ************** Generate the tree diagram	 *****************
  var margin = {top: 1, right: 20, bottom: 20, left: 30},
  	width = 450 - margin.right - margin.left,
  	height = 70 - margin.top - margin.bottom;

  var i = 0,
  	duration = 750,
  	root;

  var tree = d3.layout.tree()
  	.size([height, width]);

  var diagonal = d3.svg.diagonal()
  	.projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select("#Detail-Location-View").append("svg")
  	.attr("width", width + margin.right + margin.left)
  	.attr("height", height + margin.top + margin.bottom)
    .attr("id","error-location-detail")
    .append("g")
  	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  root = treeData[0];
  root.x0 = height / 2;
  root.y0 = 0;

  update(root);

  d3.select(self.frameElement).style("height", "500px");

  function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
  	  links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = svg.selectAll("g.node")
  	  .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
  	  .attr("class", "node")
  	  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });
  	 // .on("click", click);

    nodeEnter.append("circle")
  	  .attr("r", 1e-6)
  	  .style("fill", function(d) {return d._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.append("text")
  	  .attr("x", function(d) { return d.children || d._children ? 30 : -32; })
  	  .attr("dy", "35")
  	  .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
  	  .text(function(d) { return d.name; })
  	  .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
  	  .duration(duration)
  	  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
  	  .attr("r", 10)
  	  //.style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
      .style("fill", function(d) {
        if((data.nodeid == "agama-flex2" || data.nodeid == "agama-flex3") && d.name == "Encoding" ){
          return "#FF0000";
        }else if((data.nodeid == "agama-flex1" || data.nodeid == "agama-flex4" || data.nodeid == "agama-flex5" || data.nodeid == "agama-flex6" || data.nodeid == "agama-flex7" || data.nodeid == "agama-flex8" || data.nodeid == "agama-flex9" || data.nodeid == "agama-flex10" ) &&  d.name == "Transcoding"){
          return "#FF0000";
        }else{
          return "#FFFFFF";
        }
      });


    nodeUpdate.select("text")
  	  .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
  	  .duration(duration)
  	  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
  	  .remove();

    nodeExit.select("circle")
  	  .attr("r", 1e-6);

    nodeExit.select("text")
  	  .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
  	  .data(links, function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
  	  .attr("class", "link")
  	  .attr("d", function(d) {
  		var o = {x: source.x0, y: source.y0};
  		return diagonal({source: o, target: o});
  	  });

    // Transition links to their new position.
    link.transition()
  	  .duration(duration)
  	  .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
  	  .duration(duration)
  	  .attr("d", function(d) {
  		var o = {x: source.x, y: source.y};
  		return diagonal({source: o, target: o});
  	  })
  	  .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
  	d.x0 = d.x;
  	d.y0 = d.y;
    });
  }

}


function setSearchHistoryList(historyList){

  var searchHistory = d3.select("#search-history-panel")
                        .append("div")
                        .attr("id","searchHistory")
  var search = searchHistory.append("div")
                            .attr("class","search");

  search.selectAll("g").data(historyList)
      .enter()
      .append('div').attr("class","row").style("margin-right","0px").attr("id",function (d,i){return i;})
      .each(function(d,i){
        var g = d3.select(this);

        g.append("text")
          .style("margin-left","15px")
          .text("Min Date: "+toTimeAxisForMin(d.minDate));

        g.append("text")
         .style("margin-left","7px")
         .text("Max Date: "+toTimeAxisForMin(d.maxDate));

        g.append("input")
          .attr("id",i)
          .attr("value","Search "+i)
          .style("margin-left","5px")
          .attr("type","button");
      });
}

function toTimeAxisForMin(date) {
  var customTimeFormat = d3.time.format("%dth %X");
  return customTimeFormat(date);
}
