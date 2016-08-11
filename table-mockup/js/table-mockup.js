$(document).ready(function() {

    // run visualization on load
    processInput(); 

});



function processInput() {

    var dataset;  

    d3.csv("AHB.csv", function(error, data) { dataset=data; handleData(dataset); });           

}

function handleData(rows) {

   /* static pivot table */    
    var utils = $.pivotUtilities;
    var tableRenderer =  utils.renderers["Table"];
    
    var sum =  utils.aggregatorTemplates.sum;
    
    var numberFormat = utils.numberFormat;
    var intFormat = numberFormat({digitsAfterDecimal: 1});     
    
    var valueDeriver = function(value,standard_error){
        return value + " (" + standard_error + ")";
    };
    
    $("#AHB-table").pivot(rows, {
        /*derivedAttributes: {
                    "value-SE": valueDeriver("Value","Standard Error")
                },*/
         rows: ["Sex","Selected Characteristic","Group"],
         cols: ["Lifetime alcohol drinking status","Measure"],
         aggregator: sum(intFormat)(["Value"]),
         renderer: tableRenderer
      });

}