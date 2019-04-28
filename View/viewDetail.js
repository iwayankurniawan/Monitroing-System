function setDetailView(data){
  //----------------------NAMING THE CHANNEL AND DURATION-------------------
  d3.select(".detail-title").html("Channel Quality: "+data.label+"<br>"+"Start Date: "+ toTimeAxisForMinMonthYear(getDataFromTimeline().minDate)+"  End Date: "+toTimeAxisForMinMonthYear(getDataFromTimeline().maxDate));



  //----------------------SET QUALITY DETAIL VIEW---------------------------
    var w = 180,                        //width
    h = 125,                            //height
    r = 60,
    left = 50;                          //radius

  // Set Data for one Channel
    newAlarm = []; //Store Error in One Channel
    alarmType = [];//Store Error Type
    var color_hash = getDataFromTimeline().alarmListName; //Get Color patterns

    //GET ALARM LIST
    var alarmName = [];
    for (var i = 0; i < getDataFromTimeline().alarmListName.length; i++) {
      alarmName.push(getDataFromTimeline().alarmListName[i][0]);
    }

    //Get All Error in In one Channel
    for (var i = 0; i < getDataFromTimeline().items.length; i++) {
      if(getDataFromTimeline().items[i].track == data.track){
        var duration = (new Date(getDataFromTimeline().items[i].end).getTime() -new Date(getDataFromTimeline().items[i].start).getTime())/1000;
        newAlarm.push({"label":getDataFromTimeline().items[i].alarm_type, "value":duration})

    // Store Chosen Error in Array, This array will be used to calculate the total time duration in each error
        var temp = getDataFromTimeline().items[i].alarm_type;
        var found = alarmType.find(function(element) {
          return element === temp
        });
        if (found == undefined){
          alarmType.push(temp);
        }
      }
    }

    dataForPieChart = []; // Store final data of error and duration of the error
    var allValue = 0;
    for (var i = 0; i < alarmType.length; i++) {
      var value=0;
      for (var j = 0; j < newAlarm.length; j++) {
        if(newAlarm[j].label == alarmType[i]){
          value = parseInt(value) + parseInt(newAlarm[j].value);
        }
      }
      allValue = allValue + value;
      dataForPieChart.push({"label":alarmType[i],"value":value})
    }
    //Store Normal Data, when error not occurs
    dataForPieChart.push({"label":"Normal","value":parseInt((getDataFromTimeline().maxDate.getTime() -getDataFromTimeline().minDate.getTime())/1000)-parseInt(allValue)})

    datas = dataForPieChart; // Pass the data to the Pie Chart Data


//------------------------------CREATE THE PIE CHART--------------------------------
    var vis = d3.select("#Detail-Quality-View")
        .append("svg:svg")
        .attr("class","col-sm-6")         //create the SVG element inside the <body>
        .data([datas])                   //associate our data with the document
            .attr("width", w)           //set the width and height of our visualization (these will be attributes of the <svg> tag
            .attr("height", h)
        .attr("id","quality-detail")
        .append("svg:g")                //make a group to hold our pie chart
            .attr("transform", "translate(" +parseInt(r+left) + "," + r + ")")    //move the center of the pie chart from 0, 0 to radius, radius
            .attr("class","pieGraph");

    var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
        .outerRadius(r);

    var pie = d3.layout.pie()           //this will create arc data for us given a list of values
        .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array

    var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties)
        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
                .attr("class", "slice");    //allow us to style things in the slices (like text)

        arcs.append("svg:path")
                .attr("id", function(d,i) {return "pieChart"+i})
                .attr("fill", function(d, i) { if(d.data.label=="Normal"){
                    return "#C8C8C8";
                  }else{
                    return color_hash[alarmName.indexOf(d.data.label)][1];
                  }}) //set the color for each slice to be chosen from the color function defined above
                .attr("d", arc)                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function
                 .on("mouseover", function(d,i){
                   d3.select(this).style("stroke","#9D0000").style("stroke-width","1.5");
                   return showTooltipsForPieGraph(d.data);
                 })
                 .on("mouseout", function(){
                   d3.select(this).style("stroke","#9D0000").style("stroke-width","0");
                   return tooltipPieChart.style("visibility", "hidden");
                 });



//----------------Legend for Pie Chart-------------------------
    var tooltipPieChart = d3.select("body")
      .append("div")
      .attr("class","tooltips")
      .style("visibility", "hidden");

    var legendPieChart = d3.select("#Detail-Quality-View") //Create Legend for the Pie Chart
      .append("div")
      .attr("id","legend-quality-detail")
      .attr("class","col-sm-6");

      var legend = legendPieChart.append("div")
              .attr("class","legendPieChart");

      legend.selectAll("g").data(datas)
          .enter()
          .append('div').attr("class","row").style("margin-right","0px").attr("id",function (d,i){return i;})
          .each(function(d,i){
            var color;
            if(d.label=="Normal"){
                color = "#C8C8C8";
              }else{
                color = color_hash[alarmName.indexOf(d.label)][1];
              }

            var g = d3.select(this)
              .on("mouseover", function(d,i){
                d3.select("#pieChart"+this.id).style("stroke","#9D0000").style("stroke-width","1.5");
                return showTooltipsForPieChart(d);
              })
      	      .on("mouseout", function(){
                d3.select("#pieChart"+this.id).style("stroke","#9D0000").style("stroke-width","0");
                return tooltipPieChart.style("visibility", "hidden");});

            g.append("svg").style("margin-left","5px")
              .attr("y", i*25 + 10)
              .attr("width", 10)
              .attr("height",10)
              .append("rect")
              .attr("width", 10)
              .attr("height",10)
              .style("fill",color);


            g.append("text")
             .style("margin-left","7px")
             .style("color",color)
             .text(d.label);
          });

//----------------Tooltips for Pie Chart-------------------------
          function getHtmlPieChart(d) {
              var allTime = (getDataFromTimeline().maxDate.getTime() -getDataFromTimeline().minDate.getTime())/1000;
              var duration = Math.round((d.value/allTime)*100);

              var html;
              html = "Alarm Type: "+d.label+ "<br>" +"Duration: " + d.value +" seconds"+ "<br>" + "Percentage: "+duration+"%"  ;
              return html;
          }

          //Function to create tooltip position from Legend
          function showTooltipsForPieChart (d) {

            $(".legendPieChart").mouseover(function(event){
                var x = event.pageX -100;
                var y = event.pageY + 20;

              tooltipPieChart
                  .html(getHtmlPieChart(d))
                  .style("top", y + "px")
                  .style("left", x + "px")
                  .style("visibility", "visible");
              });
          }

          //Function to create tooltip position from Pie Graph
          function showTooltipsForPieGraph (d) {

            $(".pieGraph").mouseover(function(event){
                var x = event.pageX + 30;
                var y = event.pageY + 20;

              tooltipPieChart
                  .html(getHtmlPieChart(d))
                  .style("top", y + "px")
                  .style("left", x + "px")
                  .style("visibility", "visible");
              });
          }




//-------------------------SET ERROR DETAIL------------------
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
  var margin = {top: 0, right: 20, bottom: 20, left: 30},
  	width = 450 - margin.right - margin.left,
  	height = 55 - margin.top - margin.bottom;

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

  var tooltip = d3.select("body")
    .append("div")
    .attr("class","tooltips")
    .style("visibility", "hidden");

  var searchHistory = d3.select("#search-history-panel")
                        .append("div")
                        .attr("id","searchHistory")
  var search = searchHistory.append("div")
                            .attr("class","search");

  search.selectAll("g").data(historyList)
    .enter()
    .append('div')
    .attr("class","row")
    .style("margin-left","0px")
    .style("margin-right","0px")
    .attr("id",function (d,i){return "searchHistory"+ i;})
    .each(function(d,i){
      var g = d3.select(this)
        .on("mouseover", function(d){
          return showTooltipsForSearchHistory(d);
        })
	      .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

      g.append("text")
        .style("margin-left","5px")
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


    function getHtmlSearchHistory(d) {
        var html;
        var sortType;
        var channelOptions;
        switch (d.sortType) {
          case "1":
            sortType = "Recent Error";
            break;
          case "4":
            sortType = "Name (A to Z)";
            break;
          case "2":
            sortType = "Name (Z to A)";
            break;
          }

          switch (d.channelOptions) {
            case "1":
              channelOptions = "Show All Channels";
              break;
            case "2":
              channelOptions = "Show Only Channels With Error";
              break;
          }

        html = "Start Date and Time: "+toTimeAxisForMinMonthYear(d.minDate)+ "<br>" +"End Date and Time: "+toTimeAxisForMinMonthYear(d.maxDate) + "<br>" + "Sort the Data by: "+ sortType  + "<br>" + "Show Only: " +channelOptions+"<br>"+"<br>"+"Removed Alarm Type: "+ d.removealarm;
        return html;
    }

    //Function to create tooltip position
    function showTooltipsForSearchHistory (d) {

      $(".search").mouseover(function(event){
        var x;

        if (event.pageX>1180 && event.pageX<1340) {
          x = event.pageX - 120;
        }else if(event.pageX>=1340){
          x = event.pageX - 240;
        }else{
          x = event.pageX + 30;
        }
          var y = event.pageY + 20;

        tooltip
            .html(getHtmlSearchHistory(d))
            .style("top", y + "px")
            .style("left", x + "px")
            .style("visibility", "visible");
        });
    }
}

function toTimeAxisForMin(date) {
  var customTimeFormat = d3.time.format("%dth %X");
  return customTimeFormat(date);
}

function toTimeAxisForMinMonthYear(date) {
  var customTimeFormat = d3.time.format("%dth %B %Y %X");
  return customTimeFormat(date);
}
