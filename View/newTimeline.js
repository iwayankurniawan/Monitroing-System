//  A timeline component for d3
//  version v0.1


var newDatas = [];
var totalData = [];
var alarmList = {};

var bandForStacked;


function timeline(domElement,minDate,maxDate,sortTypeOption,channelOptionsOption,removeAlarmOption) {

  //--------------------------------------------------------------------------
  //
  // chart
  //

  // global timeline variables
  var timeline = {},   // The timeline
  data = {},       // Container for the data
  components = [], // All the components of the timeline for redrawing
  bandGap = 25,    // Arbitray gap between to consecutive bands
  bands = {},      // Registry for all the bands in the timeline
  bandY = 0,       // Y-Position of the next band
  bandNum = 0;     // Count of bands for ids
  var marginleftToSuitableWithStackedBar = 35;

  // Create svg element for MainBanD
var svg = d3.select(domElement).append("svg")
.attr("class", "svg")
.attr("id", "svg")
.attr("width", outerWidth)
.attr("height", outerHeight)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top +  ")");

  svg.append("clipPath")
  .attr("id", "chart-area")
  .append("rect")
  .attr("width", width)
  .attr("height", height);

  var chart = svg.append("g")
  .attr("class", "chart")
  .attr("clip-path", "url(#chart-area)");


  var rightLabel = d3.select("#svg").append("g")
  .attr("class","leftName")
  .attr("transform", "translate(" + 0 + "," + margin.top +  ")");


  var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltips");

  // Create svg element for NaviBand
  var svgNaviBand = d3.select("#naviBarClass").append("svg")
  .attr("id", "svg")
  .attr("width", outerWidth)
  .attr("height", naviHeight)
  .append("g")
  .attr("transform", "translate(" + marginleftToSuitableWithStackedBar + "," + margin.top +  ")");
  //.attr("transform", "translate(" + margin.left + "," + margin.top +  ")");

  var chartNaviBand = svgNaviBand.append("g")
  .attr("class", "chart")
  .attr("clip-path", "url(#chart-area)");

  //--------------------------------------------------------------------------
  //
  // data
  //

  timeline.data = function(items) {
    newDatas = [];
    totalData = [];
    alarmList = {};
    var alarmListName= [];
    var color_hash_list = [];
    var colorLibrary = ["#4363d8","#42d4f4","#3cb44b","#bfef45","#ffe119","#f58231","#e6194B","#911eb4","#f032e6","#a9a9a9","#469990","#808000","#fabebe","#ffd8b1","#aaffc3","#e6beff"];


    var today = new Date(),
    tracks = [],
    labelName = [],
    newData = [],
    yearMillis = 31622400000,
    instantOffset = 100 * yearMillis;

    data.items = items;

//-------------------------Convert data structure from excel--------------------------------
  function ConvertDataFromExcel(){
      var j = 0;
      var k = 0;

      while (j<data.items.length){
        if (data.items[j].severity == "MAJOR"){
          newData[k] = data.items[j];
          newData[k].start = data.items[j].delivered_time;
          newData[k].end = null;

          for (var i = j-1; 0 <= i; i--) {
            if(data.items[i].alarm_hash == newData[k].alarm_hash  && data.items[i].channelname == newData[k].channelname && data.items[i].nodeid == newData[k].nodeid && data.items[i].successful =="TRUE" && data.items[i].severity == "CLEARED" ){
              newData[k].end = data.items[i].delivered_time;
              if(parseDataFromUnix(newData[k].start)>=minDate && parseDataFromUnix(newData[k].end)<=maxDate && channelOptionsOption==2)
              {
                newDatas.push(newData[k]);
              }else if(channelOptionsOption==1)
              {
                newDatas.push(newData[k]);
              }
              k++;
              break;
            }
          }
        }
        j++
      }
    }

//-------------------------GET ALARM List name Data--------------------------------
  function getAlaramListName(){
    //list alarm list
    for (var i = 0; i < data.items.length; i++)  {
      var temp = data.items[i].alarm_type;
      var found = alarmListName.find(function(element) {
        return element === temp
      });
      if (found == undefined){
        alarmListName.push(temp);
      }
    }
  }

//-------------------------Set Color for Alarm List Data--------------------------------
  function setColorForAlarmList(){
    //set color_hash
    for (var i = 0; i < alarmListName.length; i++) {
      var color = [];
      color[0] = alarmListName[i];
      color[1] = colorLibrary[i];
      color_hash_list.push(color);
    }
  }

//-------------------------Eliminate Alarm Data--------------------------------
  function filterCheckbox (){
        for (var i = 0; i < removeAlarmOption.length; i++) {
          var  dataAfterSort =  newDataAfterSort.filter(function(hero) {
            return hero.alarm_type != removeAlarmOption[i];
          });
          newDataAfterSort = dataAfterSort;
        }
      }

      getAlaramListName();
      alarmList.Name = alarmListName;

      ConvertDataFromExcel();
      data.items = newDatas;

      setColorForAlarmList();

      data.alarmListName = color_hash_list;
      var newDataAfterSort = data.items;
      filterCheckbox();
      data.items = newDataAfterSort;

//------------------Data for Timeline-----------------------------------------------
    function showItems(n) {
      var count = 0, n = n || 10;
      console.log("\n");
      items.forEach(function (d) {
        count++;
        if (count > n) return;
        //console.log(toTimeAxis(d.start) + " - " + toTimeAxis(d.end) + ": " + d.label);
      })
    }

    function compareAscending(item1, item2) {
      // Every item must have two fields: 'start' and 'end'.
      var result = item1.start - item2.start;
      // earlier first
      if (result < 0) { return -1; }
      if (result > 0) { return 1; }
      // longer first
      result = item2.end - item1.end;
      if (result < 0) { return -1; }
      if (result > 0) { return 1; }
      return 0;
    }

    function compareDescending(item1, item2) {
      // Every item must have two fields: 'start' and 'end'.
      var result = item1.start - item2.start;
      // later first
      if (result < 0) { return 1; }
      if (result > 0) { return -1; }
      // shorter first
      result = item2.end - item1.end;
      if (result < 0) { return 1; }
      if (result > 0) { return -1; }
      return 0;
    }

    function calculateTracks(items, sortOrder, timeOrder) {
      var i, track;

      sortOrder = sortOrder || "descending"; // "ascending", "descending"
      timeOrder = timeOrder || "backward";   // "forward", "backward"

      function sortBackward() {
        // older items end deeper
        //sort by name and recent error
        if(sortTypeOption==4){
          items.sort(function(a, b){
              var a1= a.label.toLowerCase();
              var b1= b.label.toLowerCase();
              if(a1== b1) return 0;
              return a1> b1? 1: -1;
          });
        }else if(sortTypeOption==1){
          items.sort(function(a, b){
              var a1= a.start;
              var b1= b.start;
              if(a1== b1) return 0;
              return a1> b1? 1: -1;
          });
        }else if(sortTypeOption==2){
          items.sort(function(a, b){
              var a1= a.label.toLowerCase();
              var b1= b.label.toLowerCase();
              if(a1== b1) return 0;
              return (a1> b1? 1: -1)*-1;
          });
        }

        items.forEach(function (item) {
          for (i = 0, track = 0; i < labelName.length; i++, track++) {
            if (item.label == labelName[i]) {
              break;
            }
          }
          item.track = track;
          tracks[track] = item.start;
          labelName[track] = item.label;
        });
      }

      function sortForward() {
        // younger items end deeper
        //sort by name and recent error
        if(sortTypeOption==4){
          items.sort(function(a, b){
              var a1= a.label.toLowerCase();
              var b1= b.label.toLowerCase();
              if(a1== b1) return 0;
              return a1> b1? 1: -1;
          });
        }else if(sortTypeOption==1){
          items.sort(function(a, b){
              var a1= a.start;
              var b1= b.start;
              if(a1== b1) return 0;
              return a1> b1? 1: -1;
          });
        }else if(sortTypeOption==2){
          items.sort(function(a, b){
              var a1= a.label.toLowerCase();
              var b1= b.label.toLowerCase();
              if(a1== b1) return 0;
              return (a1> b1? 1: -1)*-1;
          });
        }
        items.forEach(function (item) {
          for (i = 0, track = 0; i < tracks.length; i++, track++) {
            if (item.label == labelName[i]) {
              break;
            }
          }
          item.track = track;
          tracks[track] = item.start;
          labelName[track] = item.label;

        });
      }

      if (sortOrder === "ascending")
      data.items.sort(compareAscending);
      else
      data.items.sort(compareDescending);

      if (timeOrder === "forward")
      sortForward();
      else
      sortBackward();
    }

    // Convert yearStrings into dates
    data.items.forEach(function (item){

      item.start = parseDataFromUnix(item.start); //Will be Used

      if (item.end == "") {
        //console.log("1 item.start: " + item.start);
        //console.log("2 item.end: " + item.end);
        item.end = new Date(item.start.getTime() + instantOffset);
        //console.log("3 item.end: " + item.end);
        item.instant = true;
      } else {
        //console.log("4 item.end: " + item.end);
        item.end = parseDataFromUnix(item.end); //Will be Used
        item.instant = false;
      }
      // The timeline never reaches into the future.
      // This is an arbitrary decision.
      // Comment out, if dates in the future should be allowed.
      if (item.end > today) { item.end = today};

    });


    //calculateTracks(data.items);
    // Show patterns
    //calculateTracks(data.items, "ascending", "backward");
    //calculateTracks(data.items, "descending", "forward");

    // Show real data
    calculateTracks(data.items, "descending", "backward");
    //calculateTracks(data.items, "ascending", "forward");
    data.nTracks = tracks.length;

    data.minDate = d3.min(data.items, function (d) { return d.start; });
    data.maxDate = d3.max(data.items, function (d) { return d.end; });

    data.minDate = changeValueMinDate();
    data.maxDate = changeValueMaxDate();

    if(minDate != undefined){
      data.minDate = minDate;
      data.maxDate = maxDate;
    }


//------------------------Data for stackedbar----------------------------------------------
    //Calculate data for stackedbar

    var timeCalculation = Math.round((data.maxDate-data.minDate)/3600000);
    var timeCalculationBelowHour = Math.round((data.maxDate-data.minDate)/60000);
    var timeCalculationBelowMinutes = Math.round((data.maxDate-data.minDate)/1000);
    var timeRangeDenominator = 0; //determine the multiply for timerange
    var listOfTimeRange = [];
    var timeRangeList = [];
    var listOfAlarm = [];
    var listOfTrack = [];


//-------------------------Get Time Range Condition--------------------------------
    function getTimeRangeConditionn (){
      //Determine the xaxis for stacked bar based on maxdate and mindate
      //5 Minutes condition
      if(timeCalculation<=1){
        //5 Minutes Condition
        if(timeCalculationBelowHour>30 && timeCalculationBelowHour<=75){

          timeRangeDenominator=1/12;
          timeCalculation= Math.round((data.maxDate-data.minDate)/(3600000*timeRangeDenominator));
          // 1 minutes condition
        }else if(timeCalculationBelowHour>8 && timeCalculationBelowHour<=30){
          timeRangeDenominator=1/60;
          timeCalculation= Math.round((data.maxDate-data.minDate)/(3600000*timeRangeDenominator));
          //30 seconds Condition
        }else if(timeCalculationBelowHour>2 && timeCalculationBelowHour<=8){
          timeRangeDenominator=1/120;
          timeCalculation= Math.round((data.maxDate-data.minDate)/(3600000*timeRangeDenominator));
        }

        //15 Minutes condition
      }else if(timeCalculation>1 && timeCalculation<=3){
        timeRangeDenominator = 0.25; //determine the multiply for timerange
        timeCalculation = Math.round((data.maxDate-data.minDate)/(3600000*timeRangeDenominator));
        //30 minutes condition
      }else if(timeCalculation>3 && timeCalculation<=7){
        timeRangeDenominator = 0.5; //determine the multiply for timerange
        timeCalculation = Math.round((data.maxDate-data.minDate)/(3600000*timeRangeDenominator));
        //1 hour condition
      }else if(timeCalculation>7 && timeCalculation<=24){
        timeRangeDenominator = 1; //determine the multiply for timerange
        timeCalculation = Math.round((data.maxDate-data.minDate)/(3600000*timeRangeDenominator));
        //3 hour condition
      }else if (timeCalculation>24 && timeCalculation<=36){
        timeRangeDenominator = 3;
        timeCalculation = Math.round((data.maxDate-data.minDate)/(3600000*timeRangeDenominator));
        //6 hour condition
      }else if(timeCalculation>36 && timeCalculation<=96){
        timeRangeDenominator = 6;
        timeCalculation = Math.round((data.maxDate-data.minDate)/(3600000*timeRangeDenominator));
      }else if(timeCalculation>96){
        //12 hour condition
        timeRangeDenominator = 12;
        timeCalculation = Math.round((data.maxDate-data.minDate)/(3600000*timeRangeDenominator));
      }

      //list time range
      for (var i = 1; i <= timeCalculation; i++) {
        if (timeRangeDenominator<1){
          var coeff = 60 * timeRangeDenominator;
          var time = new Date(data.minDate);
          time.setMinutes(Math.round(time.getMinutes()/coeff)*coeff);
          time.setTime(time.getTime() + i*timeRangeDenominator*60*60*1000);
        }else{
          var time = new Date(data.minDate);
          time.setMinutes(0);
          time.setSeconds(0);
          time.setHours(time.getHours() + i*timeRangeDenominator);
        }
        listOfTimeRange.push(time);
      }
    }

//-------------------------fitered StackedBar Data Based On TimeRange--------------------------------
    function fiteredStackedBarDataBasedOnTimeRange(){
      //filtered the stackedbar data
      for (var i = 0; i < alarmList.Name.length; i++) {
        timeRangeList = [];
        for (var j = 0; j < listOfTimeRange.length - 1; j++) {

          var sum = 0;

          for (var k = 0; k < data.items.length; k++) {
            if(listOfTimeRange[j] <= data.items[k].start && data.items[k].start < listOfTimeRange[j+1]){
              if(alarmList.Name[i] == data.items[k].alarm_type){
                sum = sum + 1;
              }
            }
          }
          timeRangeList.push({ 'time':listOfTimeRange[j], 'timeNext':listOfTimeRange[j+1], 'y': sum , 'nameOfError':alarmList.Name[i]});
        }
        listOfAlarm.push(timeRangeList);
      }
      data.listOfAlarm = listOfAlarm;
    }

//-------------------------make Track Number Array--------------------------------
    function makeTrackNumberArray(){
      //make track list
      for (var i = 0; i < data.nTracks; i++) {
        listOfTrack.push(i);
      }
      data.listOfTrack = listOfTrack;
    }

    getTimeRangeConditionn();
    fiteredStackedBarDataBasedOnTimeRange();
    makeTrackNumberArray();

    totalData = data;
    
    //at the firsttime, build legend
    //when search button use, legend not build
    //searchstatus variabel in index
    if (searchStatus){
      stackedbar(totalData)
    }else{
      stackedbar(totalData).legend();
    }

    return timeline;
  };


  //----------------------------------------------------------------------
  //
  // band
  //

  timeline.band = function (bandName, sizeFactor) {

    var band = {};
    band.id = "band" + bandNum;
    band.x = 0;
    //band.y = bandY;
    band.y = 0;

    band.w = width;
    band.h = height * (sizeFactor || 1);
    band.trackOffset = 4;
    // Prevent tracks from getting too high
    band.trackHeight = Math.min((band.h - band.trackOffset) / data.nTracks,20);
    band.itemHeight = band.trackHeight * 0.8,
    band.parts = [],
    band.instantWidth = 100; // arbitray value



    //band scaling
    band.xScale = d3.time.scale()
    .domain([data.minDate, data.maxDate])
    .range([0, band.w]);

    var offset = 0;
    band.yScale = function (track) {
      return band.trackOffset + track * band.trackHeight;
    };


    band.g = chart.append("g")
    .attr("id", band.id)
    .attr("transform", "translate(0," + band.y +  ")");


    //To differentiate line with different color

    band.g.selectAll("g")
    .data(data.listOfTrack)
    .enter().append("rect")
    .attr("class", "band")
    .attr("id", function(d){return d;})
    .attr("width", band.w)
    .attr("height", band.h)
    .attr("y", function (d,i) {return band.yScale(d);})
    .attr("height", band.itemHeight)
    .attr("width", band.w)
    .style("fill",function(d,i){
      if(d%2 == 1){
        return "#FFFFFF";
      }else if(d%2 == 0){
        return "#F0F0F0";
      }
    })
    .on("mouseover", function(d){return changeYscale(d)});

    function changeYscale(d) {

    }


    // Items
    var items = band.g.selectAll("g")
    .data(data.items)
    .enter().append("svg")
    .attr("y", function (d) { return band.yScale(d.track); })
    .attr("height", band.itemHeight)
    .attr("class", function (d) { return d.instant ? "part instant" : "part interval";})
    .attr("id",function(d,i){return i;});

    var intervals = d3.select("#band" + bandNum).selectAll(".interval");
    intervals.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("class", "interval")
    .attr("id",function(d,i){return i;})
    .style("fill", function(d, i) {
      var alarmNumber = alarmList.Name.indexOf(d.alarm_type)
      return data.alarmListName[alarmNumber][1];
    }).on("click", function(d){                               //When click Highlight the eror interval
      d3.select("#highlight-error").remove();                 //Remove previous highlight
      d3.select(this.parentNode)
        .append("rect")
        .attr("id","highlight-error")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("stroke-width",3)
        .style("stroke","#FFFF00")
        .style("fill", function(d, i) {
          var alarmNumber = alarmList.Name.indexOf(d.alarm_type)
          return data.alarmListName[alarmNumber][1];
        });
    }).on("mouseover", function(d){                           //mouseover then highlight
      d3.select(this)
        .style("stroke-width",3)
        .style("stroke","#FFFF00");
    }).on("mouseout", function(d){                            //Mouseout unhighlight error
      d3.select(this)
        .style("stroke-width",0)
        .style("stroke","#ffffff");
    });


    var instants = d3.select("#band" + bandNum).selectAll(".instant");
    instants.append("circle")
      .attr("cx", band.itemHeight / 2)
      .attr("cy", band.itemHeight / 2)
      .attr("r", 5);
    instants.append("text")
      .attr("class", "instantLabel")
      .attr("x", 15)
      .attr("y", 10)
      .text(function (d) { return d.label; });

band.addActions = function(actions) {
  actions.forEach(function (action) {
    items.on(action[0], action[1]);
  })
};

band.redraw = function () {
  items
    .attr("x", function (d) {return band.xScale(d.start);})
    .attr("width", function (d) {
      return band.xScale(d.end) - band.xScale(d.start); });

    band.parts.forEach(function(part) { part.redraw(); })
  };

  bands[bandName] = band;
  components.push(band);
  // Adjust values for next band
  bandY += band.h + bandGap;
  //bandNum += 1;

  return timeline;
};


  timeline.legend = function (bandName, sizeFactor) {

  var band = {};
  band.id = "band" + bandNum;
  band.x = 0;
  //band.y = bandY;
  band.y = 0;

  band.w = width;
  band.h = height * (sizeFactor || 1);
  band.trackOffset = 4;
  // Prevent tracks from getting too high
  band.trackHeight = Math.min((band.h - band.trackOffset) / data.nTracks,20);
  band.itemHeight = band.trackHeight * 0.8,
  band.parts = [],
  band.instantWidth = 100; // arbitray value



  //band scaling
  band.xScale = d3.time.scale()
    .domain([data.minDate, data.maxDate])
    .range([0, band.w]);

  var offset = 0;
  band.yScale = function (track) {
    return band.trackOffset + track * band.trackHeight;
  };

  //------------------Make Leftbar to show list of channel-----------------------

  if (bandNum == 1){

  var trackNumList = [];
  var trackNumList1 = [];
  //Left Label name
  band.leftName = rightLabel.append("g")
    .attr("id", "bandleftname")
    .attr("transform", "translate(0," + band.y +  ")");


  band.leftName
    .append("rect")
    .attr("class", "bandleftname")
    .attr("x",0)
    .attr("width", leftNameMargin)
    .attr("height", band.h);


  band.leftName.selectAll("g")
    .data(data.listOfTrack)
    .enter().append("rect")
    .attr("class", "band")
    .attr("id", function(d){return d;})
    .attr("width", leftNameMargin)
    .attr("height", band.h)
    .attr("x",0)
    .attr("y", function (d,i) {return band.yScale(d);})
    .attr("height", band.itemHeight)
    .attr("width", leftNameMargin-1)
    .style("fill",function(d,i){
      if(d%2 == 1){
        return "#FFFFFF";
      }else if(d%2 == 0){
        return "#F0F0F0";
      }
    });

var itemsLabel = band.leftName.selectAll("g")
  .data(data.items)
  .enter().append("svg")
  .attr("y", function(d){return band.yScale(d.track)})
  .attr("height", band.itemHeight)
  .attr("class", "part intervalLabels");

var intervalLabels = d3.select("#bandleftname").selectAll(".intervalLabels");

intervalLabels.data(data.items)
  .append("text")
  .attr("class", "intervalLabels")
  .attr("x", 1)
  .attr("y", 7)
  .text(function (d) {
    var temp = d.track;
    var found = trackNumList1.find(function(element) {
      return element === temp
      });
    if (found == undefined){
      trackNumList1.push(temp);
      return d.label;
      }
    });
}


return timeline;


};


  timeline.bandNaviBand = function (bandName, sizeFactor) {

  var band = {};
  band.id = "band" + bandNum;
  band.x = 0;
  //band.y = bandY;
  band.y = 2;

  band.w = width;
  band.h = height * (sizeFactor || 1);

  band.trackOffset = 4;
  // Prevent tracks from getting too high
  band.trackHeight = Math.min((band.h - band.trackOffset) / data.nTracks,20);
  band.itemHeight = band.trackHeight * 0.8,
  band.parts = [],
  band.instantWidth = 100; // arbitray value



  //band scaling
  band.xScale = d3.time.scale()
  .domain([data.minDate, data.maxDate])
  .range([0, band.w]);

  var offset = 0;
  band.yScale = function (track) {
    return band.trackOffset + track * band.trackHeight;
  };


  band.g = chartNaviBand.append("g")
  .attr("id", band.id)
  .attr("transform", "translate(0," + band.y +  ")");


  // Items
  var items = band.g.selectAll("g")
  .append("svg")
  .attr("y", 0)
  .attr("height", band.itemHeight)
  .attr("class",  "part interval");


  band.addActions = function(actions) {
    // actions - array: [[trigger, function], ...]
    actions.forEach(function (action) {
      items.on(action[0], action[1]);
    })
  };

  band.redraw = function () {
    items
    .attr("x", function (d) {return band.xScale(d.start);})
    .attr("width", function (d) {
      return band.xScale(d.end) - band.xScale(d.start); });

      band.parts.forEach(function(part) { part.redraw(); })
    };

    bands[bandName] = band;
    components.push(band);
    // Adjust values for next band
    bandY += band.h + bandGap;
    bandNum += 1;


    return timeline;


  };


  //----------------------------------------------------------------------
  //
  // labels
  //

  timeline.labels = function (bandName) {

    var band = bands[bandName],
    labelWidth = 46,
    labelHeight = 20,
    labelTop = band.y + band.h - 10,
    y = band.y + band.h + 1,
    yText = 15;


    var labelDefs = [
      ["start", "bandMinMaxLabel", 0, 0,
      function(min, max) {return toTimeAxisForMin(min); },
      "Start of the selected interval", band.x + 30, labelTop],
      ["end", "bandMinMaxLabel", band.w - labelWidth, band.w,
      function(min, max) { return toTimeAxisForMin(max); },
      "End of the selected interval", band.x + band.w - 152, labelTop],
      ["middle", "bandMidLabel", (band.w - labelWidth) / 2, band.w / 2,
      function(min, max) { return toTimeAxisForMinMonthYear(min); },
      "Length of the selected interval", band.x + band.w / 2 - 75, labelTop]
    ];

    if (bandName=="naviBand") {
      var bandLabels = chartNaviBand.append("g")
      .attr("id", bandName + "Labels")
      .attr("transform", "translate(0," + (band.y + band.h-15) +  ")")
      .selectAll("#" + bandName + "Labels")
      .data(labelDefs)
      .enter().append("g");
    }else{
      var bandLabels = chartNaviBand.append("g")
      .attr("id", bandName + "Labels")
      .attr("transform", "translate(0," + (band.y + 80+moveAxis+15) +  ")")
      .selectAll("#" + bandName + "Labels")
      .data(labelDefs)
      .enter().append("g");
    }



    bandLabels.append("rect")
    .attr("class", "bandLabel")
    .attr("x", function(d) { return d[2];})
    .attr("width", labelWidth)
    .attr("height", labelHeight)
    .style("opacity", 0);

    var labels = bandLabels.append("text")
    .attr("class", function(d) { return d[1];})
    .attr("id", function(d) { return d[0];})
    .attr("x", function(d) { return d[3];})
    .attr("y", function(d){
      if (bandName == "naviBand"){
        return yText-20;
      }else{
        return yText-20;
      }
    }) //change label height
    .attr("text-anchor", function(d) { return d[0];});

    labels.redraw = function () {
      var min = band.xScale.domain()[0],
      max = band.xScale.domain()[1];

      labels.text(function (d) { return d[4](min, max); })
    };

    band.parts.push(labels);
    components.push(labels);

    return timeline;
  };

  //----------------------------------------------------------------------
  //
  // tooltips
  //

  timeline.tooltips = function (bandName) {

    var band = bands[bandName];

    band.addActions([
      // trigger, function
      ["mouseover", showTooltip],
      ["mouseout", hideTooltip]
    ]);

    function getHtml(element, d) {
      var html;
      var duration = (new Date(d.end).getTime() -new Date(d.start).getTime())/1000;
      html = "Channel Name: "+d.label + "<br>" + "Error Type: "+ d.alarm_type + "<br>" + "Error Start: " +tooltipDateFormat(d.start) + "<br>" +"Error End: "+tooltipDateFormat(d.end)+ "<br>" +"Error Duration: "+duration+" seconds";

      return html;
    }

    function showTooltip (d) {

      $(".interval").mouseover(function(event){

        var x = event.pageX + 30,
        y = event.pageY + 20;

        tooltip
        .html(getHtml(d3.select(this), d))
        .style("top", y + "px")
        .style("left", x + "px")
        .style("visibility", "visible");
      });
    }

    function hideTooltip () {
      tooltip.style("visibility", "hidden");
    }

    return timeline;
  };

  //----------------------------------------------------------------------
  //
  // xAxis
  //

  timeline.xAxis = function (bandName, orientation) {

    var band = bands[bandName];

    var axis = d3.svg.axis()
    .scale(band.xScale)
    .orient(orientation || "bottom")
    .tickSize(6, 0)
    .tickFormat(function (d) {
      return toTimeAxis(d); });

      if (bandName == "naviBand") {
        var xAxis = chartNaviBand.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (band.y + band.h+moveAxis+5)  + ")");
      }else{
        var xAxis = chartNaviBand.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (band.y + 80+moveAxis)  + ")");
      }


      xAxis.redraw = function () {
        xAxis.call(axis);
      };

      band.parts.push(xAxis); // for brush.redraw
      components.push(xAxis); // for timeline.redraw

      return timeline;
    };

    //----------------------------------------------------------------------
    //
    // brush
    //

  timeline.brush = function (bandName, targetNames) {

      var band = bands[bandName];
      bandForStacked = bands[bandName];

      var brush = d3.svg.brush()
      .x(band.xScale.range([0, band.w]))
      .extent(band.xScale.domain()) //navi bar not empty add begining
      .on("brush", function() {
        var domain = brush.empty()
        ? band.xScale.domain()
        : brush.extent();

        targetNames.forEach(function(d) {
          bands[d].xScale.domain(domain);
          bands[d].redraw();
        });
      });

      //located the brush in stackedbar
      var xBrush = d3.select(".stackedbar-svg").append("svg")
      .attr("transform", "translate("+paddingValueFromStackedbar.left+","+  band.y +  ")")
      .attr("id", "chartForBrush")
      .attr("class", "x brush")
      .call(brush);

      xBrush.selectAll("rect")
      .attr("y", 4)
      .attr("height", heightFromStackedBar-paddingValueFromStackedbar.bottom-5);

      //Add code to show affordances if the navi bar can be dragged
      //add handle to the navi bar
      xBrush.selectAll('g.resize')
  			.selectAll('rect')
  			.attr('rx', 3)
  			.attr('ry', 3)
  			.attr('width', 5)
  			.style('visibility', 'visible')
  			.style('fill', '#019ed5')
  			.style('fill-opacity', .7)
  			.transition()
  			.each('end', function() {
  				var slider = d3.select(this);

  				d3.select(this.parentNode).append('rect')
  					.attr('class', 'handle')
  					.attr('x', parseInt(slider.attr('x')) - 1)
  					.attr('y', function(){return (heightFromStackedBar)/3})
  					.attr('rx', 3)
  					.attr('ry', 3)
  					.attr('width', parseInt(slider.attr('width')) + 3)
  					.attr('height', function() {
  						return Math.floor((height * 0.015)/2);
  					})
  					.style('fill', 'white')
  					.style('stroke', '#008b8b')
  					.style('stroke-width', 1)
  					.style('opacity', 1);
  			});

      d3.select(".background").style("visibility", "visible");

      //Move brush to first, so brush will be located at the back of stackedbar
      $("#chartForBrush").prependTo(".stackedbar-svg");

      return timeline;
    };

    //----------------------------------------------------------------------
    //
    // redraw
    //

  timeline.redraw = function () {
      components.forEach(function (component) {
        component.redraw();
      })
    };

    //--------------------------------------------------------------------------
    //
    // Utility functions
    //


    function parseDataFromUnix(dateString){
      var date;
      date = new Date(dateString*1000);
      return date;
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

    function toTimeAxisForMin(date) {
      var customTimeFormat = d3.time.format("%dth %X");
      return customTimeFormat(date);
    }

    function toTimeAxisForMinMonthYear(date) {
      var customTimeFormat = d3.time.format("%B %Y");
      return customTimeFormat(date);
    }


    return timeline;

  }

  getDataFromTimeline = function(){
    return totalData;
  }

  getDataOfBandforStacked = function(){
    return bandForStacked;
  }
