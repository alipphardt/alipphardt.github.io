$(document).ready(function() {

  /* do these things when ready() */
  //sodaConsumer = new soda.Consumer('chronicdata.cdc.gov');

  processInput() // run visualization on load

  /* event handlers */
  $("#form select").change(function(event) {
    event.preventDefault();
    formSubmitted()
  });
  $("#form").submit(function(event) { // needed for accessibility reasons
    event.preventDefault();
    formSubmitted()
  });

});

/* helper methods */
function formSubmitted(){
  $("#visualizations").html("")
  processInput()
}

function processInput() {
  params = {
    indicator: $("#form #indicatorDropdown").val(),
    state: $("#form #stateDropdown").val(),
    break_out: $("#form #breakOutDropdown").val()
  }

  // set header text
  $("h2#visualizations-header").text(params.indicator)

  // get data from socrata API
  /*var sodaQuery = sodaConsumer.query()
    .withDataset('b8xk-mhtt')
    .where({
      'question': params.indicator,
      'break_out_category': params.break_out
    })
    .select('year, locationdesc, locationabbr, break_out, data_value, data_value_type, data_value_unit, high_confidence_limit, low_confidence_limit, sample_size, datasource')
    // .where('locationabbr IN ("US","' + params.state + '")')
    .where('year IS NOT NULL')

  var queryURL = decodeURIComponent(sodaQuery.getURL())
  $("code#query-url").text(queryURL)

  sodaQuery
    .getRows()
    .on('success', handleData)
    .on('error', function(error) {
      console.error(error);
    });*/
  
  // get data from CSV file

var dataset;  
  
d3.csv("nhis-dummy-rows.csv", function(error, data) { dataset=data; handleData(dataset); });           

}

function handleData(rows) {
    
  rows = rows.filter(
      function(d){
          return ((d.indicator == params.indicator) && (d.break_out_category == params.break_out) && (d.year > 1998))
      });
    

  var rowsForStateAndCountry = _.filter(rows, function(o){
    return (o.locationabbr == params.state || o.locationabbr == "US")
  })

  /*  for each Value Type, create a chart */
  var rowsGroupedByValueType = _.groupBy(rowsForStateAndCountry,'data_value_type')
  _.each(rowsGroupedByValueType, function(rowsForValueType,valueType){
    var valueTypeSlug = slugify(valueType)

    /* ------------------------------------------------------------------------ */

    var trendChartHTML = c3VisualizationPanelTemplate({
      slug:valueTypeSlug,
      title:"<small>Trend of </small><br />"+valueType,
      css_class:"line-chart",
      caption:"<strong>SOURCE:</strong> CDC, NCHS. National Health Interview Survey."
    });
    
    $("#visualizations").append(trendChartHTML);

    var suffix = rowsForValueType[0].data_value_unit
    var sum = $.pivotUtilities.aggregatorTemplates.sumOrNull;
    var numberFormat = $.pivotUtilities.numberFormat;
    var intFormat = numberFormat({digitsAfterDecimal: 1});
      
    $("."+valueTypeSlug+" .line-chart").pivot(rowsForValueType, {
      cols: ["year"],
      rows: ["locationdesc", "break_out"],
      aggregator: sum(intFormat)(["data_value"]),
      aggregatorName: suffix,
      renderer: $.pivotUtilities.c3_renderers["Line Chart"]
    });

    /* ------------------------------------------------------------------------ */

    /* look at the most recent year and let's make a column chart */
    var rowCountByYear = _.countBy(rowsForStateAndCountry,'year')
    var maxYear = _.max(Object.keys(rowCountByYear))
    var rowsOnlyMaxYear = _.where(rowsForStateAndCountry,{year:maxYear})

    var latestValueColumnChartHTML = c3VisualizationPanelTemplate({
      slug:valueTypeSlug,
      title:"<small>"+maxYear+" Values of </small><br />"+valueType,
      css_class:"column-chart",
      caption:"<strong>SOURCE:</strong> CDC, NCHS. National Health Interview Survey."
    })
    
    $("#visualizations").append(latestValueColumnChartHTML)

    $("."+valueTypeSlug+" .column-chart").pivot(rowsOnlyMaxYear, {
      cols: ["break_out"],
      rows: ["locationdesc"],
      aggregator: sum(intFormat)(["data_value"]),
      renderer: $.pivotUtilities.c3_renderers["Bar Chart"]
    });

    /* ------------------------------------------------------------------------ */
    var rowsForAllStatesForMaxYear = _.where(rows, {year: maxYear})
    var rowsForAllStatesForMaxYearGroupedByBreakoutValue = _.groupBy(rowsForAllStatesForMaxYear,'break_out')
    
    _.each(rowsForAllStatesForMaxYearGroupedByBreakoutValue, function(rowsForBreakout,breakout){   
        
      var breakoutValueMapSlug = valueTypeSlug+"_"+slugify(breakout)
      
      console.log(breakoutValueMapSlug)
      
      // $("#visualizations").append('<svg width="960" height="600" class="svg-map" id="'+breakoutValueMapSlug+'"></svg>')

      var latestValueColumnChartHTML = leafletMapPanelTemplate({
        slug:breakoutValueMapSlug,
        title:"<small>Choropleth Map of "+maxYear+" Values of</small><br />"+valueType+" ("+breakout+")",
        css_class:"column-chart",
        caption:"<strong>SOURCE:</strong> CDC, NCHS. National Health Interview Survey."
      })
      
      $("#visualizations").append(latestValueColumnChartHTML)

      // map stuff from http://leafletjs.com/examples/choropleth.html
      var map = L.map(breakoutValueMapSlug+'-map').setView([37.8, -96], 2);
        
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
          '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.light'
      }).addTo(map);
        
      // disable zoom and stuff
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.keyboard.disable();
        
      // control that shows state info on hover
      var info = L.control();
        
      info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
      };
        
      var nationwideDataForBreakout = _.find(rowsForBreakout, {locationabbr: "US"});    
        
      info.update = function (props) {
        this._div.innerHTML = (props ? '<b>' + props.name + '</b><br />' + props.data.data_value + ' ' + (props.data.data_value_unit ? props.data.data_value_unit : '') + '<br /> (National average: ' + nationwideDataForBreakout.data_value + nationwideDataForBreakout.data_value_unit : 'Hover over a state');
      };
        
      info.addTo(map);
        
      // get color depending on population density value
      function getColor(d) {
        return d > 13 ? '#800026' :
               d > 11  ? '#BD0026' :
               d > 9  ? '#E31A1C' :
               d > 7  ? '#FC4E2A' :
               d > 5  ? '#FD8D3C' :
               d > 3  ? '#FEB24C' :
               d > 1  ? '#FED976' :
                          '#FFEDA0';
      }
        
      function style(feature) {
          
        var rowForFeature = _.find(rowsForBreakout, {locationabbr: feature.properties.postal})
        
        feature.properties.data = rowForFeature
        
        
        if(feature.properties.data && feature.properties.data.data_value){
          var color = getColor(feature.properties.data.data_value)  
        } else {
          var color = "#CCC"
        }
          
        return {
          weight: 1.5,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7,
          fillColor: color
        };
      }
        
      function highlightFeature(e) {
        var layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.7
        });
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
        info.update(layer.feature.properties);
      }
        
      var geojson;
        
      function resetHighlight(e) {
        geojson.resetStyle(e.target);
        info.update();
      }
        
      function onEachFeature(feature, layer) {
        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: clickedOnState
        });
      }

      $.getJSON("https://cdn.rawgit.com/marks/2ec0287bfbf8e6d55b76/raw/d77f4c490147e0739745dca9735c37cdd6732d65/states.geojson", function(statesData) {
        geojson = L.geoJson(statesData, {
          style: style,
          onEachFeature: onEachFeature
        }).addTo(map);
          
        map.attributionControl.addAttribution('Population data &copy; <a href="http://cdc.gov/nchs">National Center for Health Statistics</a>');
          
        var legend = L.control({position: 'bottomright'});
          
        legend.onAdd = function (map) {
          var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 3, 5, 7, 9, 11, 13],
            labels = [],
            from, to;
          for (var i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];
            labels.push(
              '<i style="background:' + getColor(from + 1) + '"></i> ' +
              from + (to ? '&ndash;' + to : '+'));
          }
          div.innerHTML = labels.join('<br>');
          return div;
        };
          
        legend.addTo(map);
      })


    })
  })

   /* interactive pivot table */
   $("#pivot").pivotUI(rowsForStateAndCountry, {
     cols: ["break_out_category","break_out"],
     rows: ["year", "locationdesc"],
     aggregatorName: "Sum",
     vals: ["data_value"],
     renderers: $.extend($.pivotUtilities.renderers, $.pivotUtilities.c3_renderers)
   });

   /* static pivot table */    
    var utils = $.pivotUtilities;
    var tableRenderer =  utils.renderers["Table"];
    var sum =  utils.aggregators["Sum"];

    $("#pivot2-title").html("<p>Table. Sample size for residents with " + params.indicator + " by sex: United States");
    
    $("#pivot2").pivot(rowsForStateAndCountry, {
         rows: ["year", "locationdesc"],
         cols: ["break_out_category","break_out"],
         aggregator: sum(["sample_size"]),
         renderer: tableRenderer
      });

}

function slugify(text){
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function mapTooltipHTML(n, d){ /* function to create html content string in tooltip div. */
  return "<h4>"+n+"</h4><table>"+
    "<tr><td>Low</td><td>"+(d.low)+"</td></tr>"+
    "<tr><td>Average</td><td>"+(d.avg)+"</td></tr>"+
    "<tr><td>High</td><td>"+(d.high)+"</td></tr>"+
    "</table>";
}

var c3VisualizationPanelTemplate = _.template('<div class="col-md-6 <%= slug %>"> \
  <div class="panel panel-default"> \
    <div class="panel-body"> \
      <h3><%= title %></h3> \
      <div class="<%= css_class %> chart"></div> \
      <p><%= caption %></p> \
    </div>\
  </div> \
</div>')



var leafletMapPanelTemplate = _.template('<div class="col-md-4 <%= slug %>"> \
  <div class="panel panel-default"> \
    <div class="panel-body"> \
      <h3><%= title %></h3> \
      <div id="<%= slug %>-map" class="<%= css_class %> map"></div>\
      <p><%= caption %></p> \
    </div>\
  </div> \
</div>')

function clickedOnState(e) {
  $("#form #stateDropdown").val(e.target.feature.properties.postal)
  $("#visualizations").html("")
  processInput()
  // map.fitBounds(e.target.getBounds());
}