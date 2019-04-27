var minDate;
var maxDate;
var searchHistoryList = [];

var removeListAlarm = [];

function buildTimeline(minDate,maxdate){
  var domElement = "#timeline";
  var sourceFile = "Model/test.csv";
  searchStatus = true;

  // Read in the data and construct the timeline
  d3.csv(sourceFile, function(dataset) {
    // Define domElement and sourceFile
    timeline(domElement,minDate,maxdate)
    .data(dataset)
    .bandNaviBand("naviBand", 0.015)
    .band("mainBand", 0.98) //sumation of this supposed to be 0.9
    .legend("mainBand", 0.98)
    .xAxis("mainBand","top")
    .tooltips("mainBand")
    //.xAxis("naviBand")
    .labels("mainBand")
    .labels("naviBand")
    .brush("naviBand", ["mainBand"])
    .redraw();

    //clicked on Error to show error detail
    $('.interval').on('click', function(e){
      setDetailView(getDataFromTimeline().items[e.target.id]);
      d3.select("#error-detail").remove();
      d3.select("#error-location-detail").remove();
    });

    $('.search').on('click', function(e){
      console.log(e.target.id);
    });

    //clicked Stackedbar to change min and max date
    $('.rect-stacked-bar').on('click', function(e){
      $(".tooltips").remove();
      $("#svg").remove();
      $("#svg").remove();
      $("#svg").remove();
      $(".chart").remove();
      $("#searchHistory").remove();

      $('#mindate').val(new Date(setValueMinDateFromStackedBar(e.target.id)));
      $('#maxDate').val(new Date(setValueMaxDateFromStackedBar(e.target.id)));

      buildTimeline(setValueMinDateFromStackedBar(e.target.id),setValueMaxDateFromStackedBar(e.target.id));

      searchHistoryList.push({'minDate':setValueMinDateFromStackedBar(e.target.id),'maxDate':setValueMaxDateFromStackedBar(e.target.id),'sortType':$( "#channel-sort" ).val(),'channelOptions':$( "#channel-options" ).val(),'removealarm':removeListAlarm});
      setSearchHistoryList(searchHistoryList);
    });
  });
}


function changeValue(){

  $(".tooltips").remove();
  $("#svg").remove();
  $("#svg").remove();
  $("#svg").remove();
  $(".chart").remove();
  $("#searchHistory").remove();

  removeListAlarm = [];
  for (var i = 0; i < getDataFromTimeline().alarmListName.length; i++) {
    var checkedValue = $('#error'+i).is(':checked');
    if(!checkedValue){
      removeListAlarm.push(getDataFromTimeline().alarmListName[i][0]);
    }
  }
  buildTimeline(changeValueMinDate(),changeValueMaxDate());

  searchHistoryList.push({'minDate':changeValueMinDate(),'maxDate':changeValueMaxDate(),'sortType':$( "#channel-sort" ).val(),'channelOptions':$( "#channel-options" ).val(),'removealarm':removeListAlarm});
  setSearchHistoryList(searchHistoryList);
}

function clickSearchHistory(i){
  console.log(i);
}

function changeValueMinDate(){
  return new Date($('#mindate').val());
}

function changeValueMaxDate() {
  return new Date($('#maxDate').val());
}

function setValueMinDateFromStackedBar(e){
  return getDataFromTimeline().listOfAlarm[0][parseInt(e)].time;
}

function setValueMaxDateFromStackedBar(e){
  var maxValue = parseInt(e)+1;
  return getDataFromTimeline().listOfAlarm[0][maxValue].time;
}

//Format for tooltips Date
function tooltipDateFormat(date){
  var customTimeFormat = d3.time.format("%d %b %Y %X");
  return customTimeFormat(date);
}

function selectAllCheckbox(){
  for (var i = 0; i < getDataFromTimeline().alarmListName.length; i++) {
    $('#error'+i).prop('checked', true);
  }
}

function unselectAllCheckbox(){
  for (var i = 0; i < getDataFromTimeline().alarmListName.length; i++) {
    $('#error'+i).attr('checked', false);
  }
}
