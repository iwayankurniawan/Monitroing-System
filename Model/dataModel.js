var minDate;
var maxDate;
var searchHistoryList = [];

var removeListAlarm = [];
var historyPosition;

function buildTimeline(minDate,maxdate,sortTypeOption,channelOptionsOption,removeAlarmOption){
  var domElement = "#timeline";
  var sourceFile = "Model/test.csv";
  searchStatus = true;

  $("#backClicked").prop( "disabled", false );
  $("#nextClicked").prop( "disabled", false );

  // Read in the data and construct the timeline
  d3.csv(sourceFile, function(dataset) {
    // Define domElement and sourceFile
    timeline(domElement,minDate,maxdate,sortTypeOption,channelOptionsOption, removeAlarmOption)
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


//---------------clicked on Error to show error detail--------------------
    $('.interval').on('click', function(e){
      var target;
      if (target == e.target.id){
        return;
      }else{
        setDetailView(getDataFromTimeline().items[e.target.id]);
        d3.select("#quality-detail").remove();
        d3.select("#legend-quality-detail").remove();
        d3.select("#error-detail").remove();
        d3.select("#error-location-detail").remove();
      }
      target = e.target.id;

    });


//---------------clicked for history features---------------------------
    $('.search').on('click', function(e){
      $(".tooltips").remove();
      $("#svg").remove();
      $("#svg").remove();
      $("#svg").remove();
      $(".chart").remove();
      $("#searchHistory").remove();

      //SELECT ALL CHECKBOX
      selectAllCheckbox();
      //GET ALARM LIST
      var alarmName = [];
      for (var i = 0; i < getDataFromTimeline().alarmListName.length; i++) {
        alarmName.push(getDataFromTimeline().alarmListName[i][0]);
      }
      //FIND REMOVE ALARM AND UNCHECKED IN LEGEND
      for (var i = 0; i < searchHistoryList[e.target.id].removealarm.length; i++) {
        $('#error'+ alarmName.indexOf( searchHistoryList[e.target.id].removealarm[i])).attr('checked', false);
      }
      //SET VALUE FOR SORT AND DATE TIME BASED ON HISTORY FEATURES
      $( "#channel-sort" ).val(searchHistoryList[e.target.id].sortType);
      $( "#channel-options" ).val(searchHistoryList[e.target.id].channelOptions);
      $('#mindate').val(searchHistoryList[e.target.id].minDate);
      $('#maxDate').val(searchHistoryList[e.target.id].maxDate);
      //BUILD THE MONITORING SYSTEM
      buildTimeline(searchHistoryList[e.target.id].minDate,searchHistoryList[e.target.id].maxDate,searchHistoryList[e.target.id].sortType,searchHistoryList[e.target.id].channelOptions,searchHistoryList[e.target.id].removealarm);
      //CREATE HISTORY LIST
      setSearchHistoryList(searchHistoryList);
      //GIVE BORDER FOR SELECTED HISTORY
      d3.select("#searchHistory"+e.target.id).style("border-style","solid").style("border-width", "1.5px").style("border-color","#515151").style("background-color","#dbdbdb");
      historyPosition=e.target.id;
    });


//-----------------clicked Stackedbar to change min and max date-----------------
    $('.rect-stacked-bar').on('click', function(e){
      $(".tooltips").remove();
      $("#svg").remove();
      $("#svg").remove();
      $("#svg").remove();
      $(".chart").remove();
      $("#searchHistory").remove();

      $('#mindate').val(setDateFormat(setValueMinDateFromStackedBar(e.target.id)));
      $('#maxDate').val(setDateFormat(setValueMaxDateFromStackedBar(e.target.id)));



      buildTimeline(setValueMinDateFromStackedBar(e.target.id),setValueMaxDateFromStackedBar(e.target.id),$( "#channel-sort" ).val(),$( "#channel-options" ).val(),removeListAlarm);

      //UPDATE HISTORY ARRAY
      searchHistoryList.push({'minDate':setValueMinDateFromStackedBar(e.target.id),'maxDate':setValueMaxDateFromStackedBar(e.target.id),'sortType':$( "#channel-sort" ).val(),'channelOptions':$( "#channel-options" ).val(),'removealarm':removeListAlarm});
      setSearchHistoryList(searchHistoryList);
      //GIVE BORDER FOR SELECTED HISTORY
      d3.select("#searchHistory"+parseInt(searchHistoryList.length-1)).style("border-style","solid").style("border-width", "1.5px").style("border-color","#515151").style("background-color","#dbdbdb");
      historyPosition=parseInt(searchHistoryList.length-1);
    });
  });
}

//-------------WORK WHEN SEARCH BUTTON CLICKED----------------------
function changeValue(){

  $(".tooltips").remove();
  $("#svg").remove();
  $("#svg").remove();
  $("#svg").remove();
  $(".chart").remove();
  $("#searchHistory").remove();

  //GET UNCHECKED FOR REMOVE ALARM ARRAY
  removeListAlarm = [];
  for (var i = 0; i < getDataFromTimeline().alarmListName.length; i++) {
    var checkedValue = $('#error'+i).is(':checked');
    if(!checkedValue){
      removeListAlarm.push(getDataFromTimeline().alarmListName[i][0]);
    }
  }
  buildTimeline(changeValueMinDate(),changeValueMaxDate(),$( "#channel-sort" ).val(),$( "#channel-options" ).val(),removeListAlarm);

  searchHistoryList.push({'minDate':changeValueMinDate(),'maxDate':changeValueMaxDate(),'sortType':$( "#channel-sort" ).val(),'channelOptions':$( "#channel-options" ).val(),'removealarm':removeListAlarm});
  setSearchHistoryList(searchHistoryList);

  //GIVE BORDER FOR SELECTED HISTORY
  d3.select("#searchHistory"+parseInt(searchHistoryList.length-1)).style("border-style","solid").style("border-width", "1.5px").style("border-color","#515151").style("background-color","#dbdbdb");
  historyPosition = parseInt(searchHistoryList.length-1);
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

function backClicked(){
  $("#nextClicked").prop( "disabled", false );
  if (historyPosition == 0){
    $("#backClicked").prop( "disabled", true );
    return;
  }else{
    historyPosition=historyPosition-1;
  }

  $(".tooltips").remove();
  $("#svg").remove();
  $("#svg").remove();
  $("#svg").remove();
  $(".chart").remove();
  $("#searchHistory").remove();

  //SELECT ALL CHECKBOX
  selectAllCheckbox();
  //GET ALARM LIST
  var alarmName = [];
  for (var i = 0; i < getDataFromTimeline().alarmListName.length; i++) {
    alarmName.push(getDataFromTimeline().alarmListName[i][0]);
  }
  //FIND REMOVE ALARM AND UNCHECKED IN LEGEND
  for (var i = 0; i < searchHistoryList[historyPosition].removealarm.length; i++) {
    $('#error'+ alarmName.indexOf( searchHistoryList[historyPosition].removealarm[i])).attr('checked', false);
  }
  //SET VALUE FOR SORT AND DATE TIME BASED ON HISTORY FEATURES
  $( "#channel-sort" ).val(searchHistoryList[historyPosition].sortType);
  $( "#channel-options" ).val(searchHistoryList[historyPosition].channelOptions);
  $('#mindate').val(searchHistoryList[historyPosition].minDate);
  $('#maxDate').val(searchHistoryList[historyPosition].maxDate);
  //BUILD THE MONITORING SYSTEM
  buildTimeline(searchHistoryList[historyPosition].minDate,searchHistoryList[historyPosition].maxDate,searchHistoryList[historyPosition].sortType,searchHistoryList[historyPosition].channelOptions,searchHistoryList[historyPosition].removealarm);
  //CREATE HISTORY LIST
  setSearchHistoryList(searchHistoryList);
  //GIVE BORDER FOR SELECTED HISTORY
  d3.select("#searchHistory"+historyPosition).style("border-style","solid").style("border-width", "1.5px").style("border-color","#515151").style("background-color","#dbdbdb");
}

function nextClicked(){
  $("#backClicked").prop( "disabled", false );
  if (historyPosition == (searchHistoryList.length-1)){
    $("#nextClicked").prop( "disabled", true );
    return;
  }else{
    historyPosition=historyPosition+1;
  }

  $(".tooltips").remove();
  $("#svg").remove();
  $("#svg").remove();
  $("#svg").remove();
  $(".chart").remove();
  $("#searchHistory").remove();

  //SELECT ALL CHECKBOX
  selectAllCheckbox();
  //GET ALARM LIST
  var alarmName = [];
  for (var i = 0; i < getDataFromTimeline().alarmListName.length; i++) {
    alarmName.push(getDataFromTimeline().alarmListName[i][0]);
  }
  //FIND REMOVE ALARM AND UNCHECKED IN LEGEND
  for (var i = 0; i < searchHistoryList[historyPosition].removealarm.length; i++) {
    $('#error'+ alarmName.indexOf( searchHistoryList[historyPosition].removealarm[i])).attr('checked', false);
  }
  //SET VALUE FOR SORT AND DATE TIME BASED ON HISTORY FEATURES
  $( "#channel-sort" ).val(searchHistoryList[historyPosition].sortType);
  $( "#channel-options" ).val(searchHistoryList[historyPosition].channelOptions);
  $('#mindate').val(searchHistoryList[historyPosition].minDate);
  $('#maxDate').val(searchHistoryList[historyPosition].maxDate);
  //BUILD THE MONITORING SYSTEM
  buildTimeline(searchHistoryList[historyPosition].minDate,searchHistoryList[historyPosition].maxDate,searchHistoryList[historyPosition].sortType,searchHistoryList[historyPosition].channelOptions,searchHistoryList[historyPosition].removealarm);
  //CREATE HISTORY LIST
  setSearchHistoryList(searchHistoryList);
  //GIVE BORDER FOR SELECTED HISTORY
  d3.select("#searchHistory"+historyPosition).style("border-style","solid").style("border-width", "1.5px").style("border-color","#515151").style("background-color","#dbdbdb");

}

function setDateFormat(date){
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDay();

  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  return year+"-"+month+"-"+day+"T"+hour+":"+minute+":"+second;
}
