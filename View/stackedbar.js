function stackedbar(dataFromTimeline){

  var w = 835;                        //width
  var h = 175;                        //height
  var padding = {top: 10, right: 30, bottom: 20, left:40};
  var dataset;

  paddingValueFromStackedbar = padding;
  widthFromStackedBar = w;
  heightFromStackedBar = h;
  //Set up stack method
  var stack = d3.layout.stack();

    dataset = dataFromTimeline.listOfAlarm;
    //dataset = json;

    //Data, stacked
    stack(dataset);

    var color_hash = dataFromTimeline.alarmListName;


    var xScale =d3.time.scale()
        .domain([dataFromTimeline.minDate, dataFromTimeline.maxDate])
        .range([0, w-padding.left-padding.right]);



    var yScale = d3.scale.linear()
      .domain([0,
        d3.max(dataset, function(d) {
          return d3.max(d, function(d) {
            return d.y0 + d.y;
          });
        })
      ])
      .range([h-padding.bottom-padding.top,0]);

     var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .tickSize(6, 0)
                .tickFormat(function (d) {return toTimeAxis(d); });


    var yAxis = d3.svg.axis()
             .scale(yScale)
             .orient("left")
             .ticks(10);




    //Easy colors accessible via a 10-step ordinal scale
    var colors = d3.scale.category10();

    //Create SVG element for stackedbar
    var svgStack = d3.select("#mbars")
          .append("svg")
          .attr("id","svg")
          .attr("class", "stackedbar-svg")
          .attr("width", w)
          .attr("height", h);


    // Add a group for each row of data
    var groups = svgStack.selectAll("g")
      .data(dataset)
      .enter()
      .append("g")
      .attr("class","rgroups")
      .attr("transform","translate("+ padding.left + "," + (h - padding.bottom) +")")
      .style("fill", function(d, i) {
        return color_hash[dataset.indexOf(d)][1];
      });

      //-----------------Create Tooltip element for stacked Bar----------------
      var tooltip = d3.select("body")
      	.append("div")
        .attr("class","tooltips")
      	.style("visibility", "hidden");

    // Add a rect for each data value
    var rects = groups.selectAll("rect")
      .data(function(d) { return d; })
      .enter()
      .append("rect")
      .attr("class","rect-stacked-bar")
      .attr("id",function (d,i){ return i;})
      .attr("width", 2)
      .style("fill-opacity",1e-6) //Tolltip Script for stacked bar start
	    .on("mouseover", function(d){return showTooltipStackedBar(d)})
	    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

      function getHtmlStackedBar(d) {
          var html;
          html = "Type of Error: "+d.nameOfError+ "<br>" +"Number Of Error: "+d.y + "<br>" + "Time Start: "+tooltipDateFormat(d.time)  + "<br>" + "Time End: "+ tooltipDateFormat(d.timeNext);
          return html;
      }


      //Function to create tooltip position
      function showTooltipStackedBar (d) {

        $(".rect-stacked-bar").mouseover(function(event){

          var x = event.pageX + 30,
              y = event.pageY + 20;

          tooltip
              .html(getHtmlStackedBar(d))
              .style("top", y + "px")
              .style("left", x + "px")
              .style("visibility", "visible");
          });
      }


    rects.transition()
         .duration(function(d,i){
           return 500 * i;
         })
         .ease("linear")
        .attr("x", function(d) {
        return xScale(new Date(d.time));
      })
      .attr("y", function(d) {
        return -(- yScale(d.y0) - yScale(d.y) + (h - padding.top - padding.bottom)*2);
      })
      .attr("height", function(d) {
        return -yScale(d.y) + (h - padding.top - padding.bottom);
      })
      .attr("width", 15)
      .style("fill-opacity",1);

      svgStack.append("g")
        .attr("class","x axis")
        .attr("transform","translate(" + padding.left + "," + (h - padding.bottom) + ")")
        .call(xAxis);


      svgStack.append("g")
        .attr("class","y axis")
        .attr("transform","translate(" + padding.left + "," + padding.top + ")")
        .call(yAxis);

      // adding legend
    stackedbar.legend = function() {
          var svgLegend = d3.select("#legendPanel")
                .append("div")
                .style("width","150%")
                .attr("id","svgLegendPanel");

          var legend = svgLegend.append("div")
                  .attr("class","legend");
/*
        //Create Select All Element for legend
          var selectAll = legend.append('div')
              .attr("class","row")
              .style("margin-right","0px");

            selectAll.append("input")
            .attr("id","SelecAllButton")
            .attr("type","checkbox");

            selectAll.append("text")
            .style("margin-left","7px")
            .text("Select All");

        //Create unSelect All Element for legend
          var unSelectAll = legend.append('div')
              .attr("class","row")
              .style("margin-right","0px");

            unSelectAll.append("input")
            .attr("id","UnselectAllButton")
            .attr("type","checkbox");

            unSelectAll.append("text")
            .style("margin-left","7px")
            .text("Unselect All");
*/
          legend.selectAll("g").data(dataset)
              .enter()
              .append('div').attr("class","row").style("margin-right","0px").attr("id",function (d,i){return i;})
              .each(function(d,i){
                var g = d3.select(this);

                g.append("input")
                  .attr("id","error"+i)
                  .attr("value",color_hash[String(i)][0])
                  .attr("type","checkbox")
                  .attr('checked','checked');

                g.append("svg").style("margin-left","5px")
                  .attr("y", i*25 + 10)
                  .attr("width", 10)
                  .attr("height",10)
                  .append("rect")
                  .attr("width", 10)
                  .attr("height",10)
                  .style("fill",color_hash[String(i)][1]);

                g.append("text")
                 .style("margin-left","7px")
                 .style("color",color_hash[String(i)][1])
                 .text(color_hash[String(i)][0]);
              });

      svgStack.append("text")
      .attr("transform","rotate(-90)")
      .attr("y", padding.left-40)
      .attr("x", -30-(h/2))
      .attr("dy","1em")
      .style("font-size","11px")
      .text("Number of Errors");

    svgStack.append("text")
       .attr("class","xtext")
       .attr("x",w/2 - padding.left)
       .attr("y",h - 5)
       .attr("text-anchor","middle")
       .text("");

    return stackedbar;
  }
  return stackedbar;
}

function toTimeAxis(date) {

  var customTimeFormat = d3.time.format.multi([
    [".%L", function(d) { return d.getMilliseconds(); }],
    [":%S", function(d) { return d.getSeconds(); }],
    ["%I:%M", function(d) { return d.getMinutes(); }],
    ["%I %p", function(d) { return d.getHours(); }],
    ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
    ["%b %d", function(d) { return d.getDate() != 1; }],
    ["%B", function(d) { return d.getMonth(); }],
    ["%Y", function() { return true; }]
  ]);
    return customTimeFormat(date);
}
