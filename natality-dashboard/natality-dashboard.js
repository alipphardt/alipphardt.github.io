/* Files to be loaded */
var csv_file = "natality-dashboard.csv";

/* Chart Title for each indicator */
var chartTitles = {	"Age-specific Birth Rates": "Age-specific Birth Rates:",
					"General Fertility Rates": "General Fertility Rate:",
					"Teen Birth Rates": "Teen Birth Rates:",
					"Cesarean Delivery Rates": "Total and Low-risk Cesarean Delivery Rates:",
					"Preterm Birth Rates": "Preterm Birth Rates:",
					"Term Birth Rates": "Term Birth Rates:"};


/* yAxisLabels for each indicator */
var yAxisLabels = {	"Age-specific Birth Rates": "Births per 1,000",
					"General Fertility Rates": "Births per 1,000",
					"Teen Birth Rates": "Births per 1,000",
					"Cesarean Delivery Rates": "Percentage of Births", 
					"Preterm Birth Rates": "Percentage of Births",
					"Term Birth Rates": "Percentage of Births"};
					
/* yAxisLabels for each indicator */
var groupNameForTable = {	"Age-specific Birth Rates": "Age Group",
							"General Fertility Rates": "Indicator",
							"Teen Birth Rates": "Age Group",
							"Cesarean Delivery Rates": "Indicator", 
							"Preterm Birth Rates": "Gestational Age",
							"Term Birth Rates": "Gestational Age"};					

/* Hex values for color of each line */				
var lineColors = {	"15-19 years": "#0070C0",
					"20-24 years": "#84C448",
					"25-29 years": "#00AAC0",
					"30-34 years": "#84E1F4",
					"35-39 years": "#FFC91D",
					"40-44 years": "#BED648",
					"45+ years": "#FF0000",	
					
					"General Fertility Rate": "#0070C0",
																									
					"10-14 years": "#0070C0",
					"15-17 years": "#84C448",
					"18-19 years": "#FF0000",

					"Cesarean": "#0070C0",
					"Low-risk Cesarean": "#84C448",
					
					"Late preterm (34-36 weeks)": "#0070C0",					
					"Early preterm (<34 weeks)": "#84C448",
					"Total preterm (<37 weeks)": "#FF0000",
					

					"Early term (37-38 weeks)": "#0070C0",
					"Full term (39-40 weeks)": "#84C448",
					"Late term (41 weeks)": "#FF0000"																													
};


/* Margins/Dimensions for chart in Viewport 4 */
var margin = {top: 90, right: 150, bottom: 70, left: 70},
	width = 880 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;


/* Set scales for x and y axes - domain must be set after CSV is read */

var xScale = d3.scale.ordinal()
    .rangePoints([0, width]);

var y = d3.scale.linear()
	.range([height, 0]);


/* xAxis will be defined once CSV dataset is read. Date values will be pushed
   into dateArray and provided for axis tickValues */

var xAxis;
var dateArray = new Array();


/* yAxis defined as numerical axis, domain to be updated when CSV dataset is read */

var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

/* Date range for dataset */
var dateRange;

/* Holds original CSV Data */
var dataset;	

/* Holds filtered CSV Data based on selected indicator and time period */
var filteredData;

/* Maximum value of rates from filteredData*/
var maxValue;

/* Holds nested data based on different grouping options (Year_Quarter, Group) */
var nestedData;

/* Selected indicator from radio buttons */
var indicator;

/* Store ID of prior selected indicator to toggle previously shown trends/footnotes to hidden */
var priorIndicatorID = "INDICATOR-AGE";

/* Selected time period from radio buttons */
var timePeriod;

/* Store ID of prior selected time period to toggle previously shown trends/footnotes to hidden */
var priorTimePeriodID = "TIME-3-MONTH";

/* SVG Canvas that chart is drawn to */
var svg;

/* Define the line function to be applied to each group */
var trendline = d3.svg.line()
    .x(function(d) { return xScale(d.Year_Quarter); })
    .y(function(d) { return y(d.Rate); });
	
/* Store current viewport based on browser window width */
var viewPort = 4;


$(document).ready(function(e) {
	
			
	/* Load CSV Data for Line Graph */
	d3.csv(csv_file, 
		function(error, data){

			dataset = data;
			
			/* Format each rate in dataset as number */						
			dataset.forEach(function(d) {
				d["Rate"] = +d["Rate"];
			});			
			
			/* Update options under 'Groups' based on selected indicator */
			updateOptions();

			/* Check size of browser window and update chart width for correct viewport */
			updateChartWidth();

			/* Set listener to reset chart dimensions when browser is resized */
			$( window ).resize(function() {
			  updateChartWidth();
			  updateChart();	
			});	

			/* Update chart after options and sizes have been applied */			
			updateChart();		
	
		});

});

function updateOptions(){

	/* Find selected indicator from radio buttons */
	indicator = $('input[name=INDICATOR]:checked').val();
	
	/* Find selected time period from radio buttons */
	timePeriod = $('input[name=TIME]:checked').val();	

	/* Filter data based on selected indicator and time period */
	filteredData = dataset.filter(function(d) 
	{ 
	
		if( d["IndicatorGroup"] == indicator && d["Type"] == timePeriod) 
		{ 
			return d;
		} 
	
	});	


	/* Break date into groups based on available Year/Quarter values */
	
	nestedData = d3.nest()
		.key(function(d) { return d.Year_Quarter; }).sortKeys(d3.ascending)
		.entries(filteredData);	

	/* Create array of unique date values to define domain of ordinal scale for x-axis */
	
	dateArray = new Array();
	
	nestedData.forEach(
		function(d){
			dateArray.push(d["key"]);
		}
	);	
	
	
	/* Break data into groups based on grouping variables/options */
	
	nestedData = d3.nest()
	.key(function(d) { return d.Group; }).sortKeys(d3.ascending)
	.entries(filteredData);		
	

	
	/* Update list of available grouping options */

	groups = d3.select("#groups");
	
	groups.html("");
	
	groups.selectAll("option")
	.data(nestedData)
	.enter()			
	.append('label')
        .attr("class","groupLabel")
		.text(function(d) { return '\xa0' + d.key; })
	.append("input")
		.attr("checked", true)
		.attr("type", "checkbox")
        .attr("class","groupCheckbox")
		.attr("value", function(d) { return d.key; });	
	
}

function updateChart(){

	/* Remove current SVG drawing from page if it exists */
	d3.select("svg").remove();

	/* Create SVG object as specified dimensions */
	svg = d3.select("div#vssr_visual").append("svg")
		.attr("id","chart")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	/* Dynamically determine date range of data from values in dateArray */
	getDateRange();


	/* Update text trends/footnotes */

	$("#trend-"+priorIndicatorID+"-"+priorTimePeriodID).toggleClass("hiddenFN", true);
	$("#fn-"+priorIndicatorID+"-"+priorTimePeriodID).toggleClass("hiddenFN", true);	

	priorIndicatorID = $('input[name=INDICATOR]:checked').attr("id");
	priorTimePeriodID = $('input[name=TIME]:checked').attr("id");	
	
	$("#trend-"+priorIndicatorID+"-"+priorTimePeriodID).toggleClass("hiddenFN", false);
	$("#fn-"+priorIndicatorID+"-"+priorTimePeriodID).toggleClass("hiddenFN", false);	


	/* Update title (TITLE1 = TIME-PERIOD, TITLE2 = INDICATOR, TITLE3 = DATERANGE) */

	svg.append("text")
	.attr("id","title1")
	.attr("x", function(d){
						if(viewPort != 1){
							return ((width + margin.left)/2);
						}
						else{
							return ((width/2)-20);
						}
					})
	.attr("y", -65)
	.attr("text-anchor", "middle")
	.attr("font-family", "sans-serif")
	.attr("font-size", function(d){ if(viewPort > 2){return "16px";}else{return "12px";}})
	.attr("font-weight", "bold")
	.attr("fill", "black")
	.text(timePeriod);

	svg.append("text")
	.attr("id","title2")
	.attr("x", function(d){
						if(viewPort != 1){
							return ((width + margin.left)/2);
						}
						else{
							return ((width/2)-20);
						}
					})
	.attr("y", -40)
	.attr("text-anchor", "middle")
	.attr("font-family", "sans-serif")
	.attr("font-size", function(d){ if(viewPort > 2){return "16px";}else{return "12px";}})
	.attr("font-weight", "bold")
	.attr("fill", "black")
	.text(chartTitles[indicator]);
	
	svg.append("text")
		.attr("id","title3")
		.attr("x", function(d){
						if(viewPort != 1){
							return ((width + margin.left)/2);
						}
						else{
							return ((width/2)-20);
						}
					})
		.attr("y", -15)
		.attr("text-anchor", "middle")
		.attr("font-family", "sans-serif")
		.attr("font-size", function(d){ if(viewPort > 2){return "16px";}else{return "12px";}})
		.attr("font-weight", "bold")
		.attr("fill", "black")
		.text("United States, " + dateRange);	


	/* Get max value for x-axis */
	maxValue = d3.max(filteredData, 
		function(d) {
			if( $('input[type=checkbox][value="' + d.Group + '"]:checked').length > 0 ){			
				return d["Rate"];
			}
		});


	/* If max value exceeds a certain threshold, round up to the nearest 1's, 10's, or 100's place */

	var roundedMax;

	if(maxValue >= 100){

		roundedMax= d3.round((maxValue*1.1),-2);
		
		if(roundedMax < maxValue){
			roundedMax += 20;	
		}
		
	}
	else if(maxValue >= 10){
				
		roundedMax= d3.round((maxValue*1.1),-1);
		
		if(roundedMax < maxValue){
			roundedMax += 10;	
		}		
	}
	else{

		roundedMax= d3.round((maxValue*1.1),0);
		
		if(roundedMax < maxValue){
			roundedMax += 1;	
		}			
	}

	/* Update x and y axes and call them */

	y.domain([0, roundedMax]);
	xScale.domain(dateArray);

	xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.tickValues(dateArray);	


	if(viewPort > 2){	
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.append("text")
			.attr("x", (width/2))
			.attr("y", 40)
			.attr("dy", ".71em")
			.attr("font-family", "Arial, Helvetica, sans-serif")
			.attr("font-size", "14px")
			.style("text-anchor", "middle")
			.text("Quarter");
	}
	else if(viewPort == 2){
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.selectAll("text")
				.attr("y", 0)
				.attr("x", 9)
				.attr("dy", "1em")
				.attr("transform", "rotate(50)")
				.style("text-anchor", "start");
		
	}
	else{
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.selectAll("text")
				.attr("y", 0)
				.attr("x", 9)
				.attr("dy", "0.25em")
				.attr("transform", "rotate(90)")
				.style("text-anchor", "start");		
	}

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", function(d){return -(height/2);})
		.attr("y", -50)
		.attr("dy", ".71em")
		.attr("font-family", "Arial, Helvetica, sans-serif")
		.attr("font-size", "14px")
		.style("text-anchor", "middle")
		.text(yAxisLabels[indicator]);

	/* Create legend */
	
	if(viewPort != 1){	
	
		svg.append("g")
			.attr("class","legend")
			.attr("x",width+30)
			.attr("y",0)
			.attr("width",120)
			.attr("height",250);
							
		svg.select(".legend")
			.append("text")
			.attr("x", width+25)
			.attr("y", 20)
			.attr("text-anchor","start")
			.attr("font-family", "sans-serif")
			.attr("font-size", "12px")
			.attr("font-weight","bold")
			.attr("fill", "black")	
			.attr("class","legend-title")
			.text("Legend:");	
	
		var legend = d3.select(".legend");
		var iterator = 1;
		
		legend.selectAll(".legend-item text")
		.data(nestedData)
		.enter()			
		.append("text")
			.attr("x", width+38)
			.attr("y", function(d){
							var yValue = (iterator*20)+20;
							if( $('input[type=checkbox][value="' + d.key + '"]:checked').length > 0 ){
								iterator++;
							}
							return yValue;
						})
			.attr("text-anchor","start")
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("class","legend-item")
			.text(
				function(d) { 
					if( $('input[type=checkbox][value="' + d.key + '"]:checked').length > 0 ){
						return (d.key).split("(")[0]; 
					}
				});	
			
		iterator = 1;	
			
		legend.selectAll(".legend-rect rect")
		.data(nestedData)
		.enter()			
		.append("rect")
			.attr("class","legend-rect")
			.attr("x", width+28 )
			.attr("y", function(d){
							var yValue = (iterator*20)+12.5;
							if( $('input[type=checkbox][value="' + d.key + '"]:checked').length > 0 ){
								iterator++;
							}
							return yValue;
						})
			.attr("width",7)
			.attr("height",7)
			.attr("fill",function(d) {return lineColors[d.key];})
			.attr("stroke",function(d) {return lineColors[d.key];})
			.attr("opacity", function(d){
							var yValue = (iterator*20)+12.5;
							if( $('input[type=checkbox][value="' + d.key + '"]:checked').length > 0 ){
								iterator++;
								return 1;
							}
							else{
								return 0;	
							};
						});			

	}

	/* Manually select and add style attributes to all lines and paths so PNG is created accurately */
		
	svg.selectAll(".axis path")
		.attr("fill","none")
		.attr("stroke","black")
		.attr("stroke-width","1.5px")				
		.attr("shape-rendering","crispEdges");	
	
	svg.selectAll(".axis line")
		.attr("fill","none")
		.attr("stroke","black")
		.attr("stroke-width","1.5px")		
		.attr("shape-rendering","crispEdges");
		
	svg.selectAll("text")
		 .attr("font-family", "Arial, Helvetica, sans-serif");
		 
	svg.selectAll("g.tick text")
		 .attr("font-size", "12px");	

		 
    /* Add line for each group in nested data */
    nestedData.forEach(function(d) {

		if( $('input[type=checkbox][value="' + d.key + '"]:checked').length > 0 ){
			svg.append("path")
				.attr("class", "line")
				.attr("d", trendline(d.values))
				.attr("fill", "none")
				.attr("stroke", lineColors[d.key])
				.attr("stroke-width", "5px")
				.attr("shape-rendering", "geometricPrecision"); 
		}
		
    });		
	
	
    /* Add circle for each data point in filtered data and define tooltip on mouse over and out */
    filteredData.forEach(function(d) {

		if( $('input[type=checkbox][value="' + d["Group"] + '"]:checked').length > 0 ){
			svg.append("circle")
				.attr("class","dataPoints")
				.attr("cx", function(e) { return xScale(d["Year_Quarter"]); } )
				.attr("cy", function(e) { return y(d["Rate"]); })
				.attr("r",5)
				.attr("fill", function(e) { 
								if(d["Significant"]=="*"){
									return "white";
								}
								else
								{
									return lineColors[d["Group"]];
								} 
							})
				.attr("stroke",function(e) {return lineColors[d["Group"]];})
				.on("mouseover", function(e) {
					
						if(viewPort == 1){
							return;	
						}
					
						var xPosition = parseFloat(d3.select(this).attr("cx"));
						var yPosition = parseFloat(d3.select(this).attr("cy")) - 20;


			/*			// Used if there is not sufficient margin on the right to accomodate tooltip
			
						var triangleXPosition = xPosition;
						
						if((xPosition + 120) >= width){
							xPosition -= 100;
						}*/
				
						svg.append("g")
							.attr("id", "tooltip");
						
						svg.select("g#tooltip").append("rect")
							.attr("fill","black")
							.attr("stroke","black")
							.attr("x",xPosition - 60)
							.attr("y",yPosition - 35)
							.attr("width",175)
							.attr("height",40)
							.attr("rx",5)
							.attr("ry",5);		
				
						svg.select("g#tooltip").append("text")
							.attr("x", xPosition-50)
							.attr("y", yPosition-20)
							.attr("font-family", "sans-serif")
							.attr("font-size", "12px")
							.attr("fill", "white")
							.text(function(e){
									return "Group: " + (d["Group"]).split("(")[0];;
								});
							
						svg.select("g#tooltip").append("text")
							.attr("x", xPosition-50)
							.attr("y", yPosition-5)
							.attr("font-family", "sans-serif")
							.attr("font-size", "12px")
							.attr("fill", "white")							
							.text(function(e){
									if(indicator != "Preterm Birth Rates" && indicator != "Term Birth Rates" ){
										return "Rate (" + d["Year_Quarter"]+"): "+d["Rate"].toFixed(1);
									}
									else{
										return "Rate (" + d["Year_Quarter"]+"): "+d["Rate"].toFixed(2);									
									}
								});
							
/*						svg.select("g#tooltip").append("text")
							.attr("x", xPosition-50)
							.attr("y", yPosition-10)
							.attr("font-family", "sans-serif")
							.attr("font-size", "12px")
							.attr("fill", "white")							
							.text("Significant: " + d["Significant"]);	*/	
							
						var triangle = d3.svg.symbol().type('triangle-down')
											.size(50);	
											
						svg.select("g#tooltip").append("path")
							.attr("d",triangle)
							.attr("stroke","black")
							.attr("fill","black")
							.attr("transform",function(){ return "translate("+xPosition+","+(yPosition+10)+")";	});																							
													
						})
				.on("mouseout", function() {
					
						if(viewPort == 1){
							return;	
						}					
					
						d3.select("g#tooltip").remove();
						});				
		}
		
    });	
	
	

	
	
	
	/* Create data table from nestedData */
	d3.select("#vssr_table").html(tabulate());	 	 	
		
}

function getDateRange(){
	
	/* Dynamically determine date range from dateArray */
	
	var startDate, startQuarter, startYear;
	var endDate, endQuarter, endYear;	
	
	startDate = dateArray[0].toString();
	endDate = dateArray[dateArray.length - 1].toString();	
	
	startYear = startDate.split(" ")[0];
	startQuarter = startDate.split(" ")[1];
	
	endYear = endDate.split(" ")[0];
	endQuarter = endDate.split(" ")[1];	
	
	if(startQuarter == "Q1"){
		dateRange = startYear;	
	}
	else{
		dateRange = "Quarter " + startQuarter.split("Q")[1] + ", " + startYear;	
	}
	
	dateRange += "-Quarter " + endQuarter.split("Q")[1] + ", " + endYear;	

}

function updateChartWidth(){
	
	/* Check current width of browser window and resize chart dimensions/margins/axes */
	
	var windowWidth = $( window ).width();
	
	if(windowWidth > 1183){
		viewPort = 4;
		margin.right = 150;		
		width = 880 - margin.left - margin.right;
		height = 500 - margin.top - margin.bottom;		
		y = d3.scale.linear()
		.range([height, 0]);		
		yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");			
	}
	else if(windowWidth > 963 && windowWidth <= 1183){
		viewPort = 3;		
		margin.right = 150;		
		width = 705 - margin.left - margin.right;
		height = 400 - margin.top - margin.bottom;		
		y = d3.scale.linear()
		.range([height, 0]);		
		yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");		
	}
	else if(windowWidth > 751 && windowWidth <= 963){
		viewPort = 2;
		margin.right = 150;		
		width = 543 - margin.left - margin.right;
		height = 350 - margin.top - margin.bottom;		
		y = d3.scale.linear()
		.range([height, 0]);		
		yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(4);							
	}
	else{
		viewPort = 1;
		margin.right = 20;
		width = windowWidth - 20 - margin.left - margin.right;	
		height = 350 - margin.top - margin.bottom;		
		y = d3.scale.linear()
		.range([height, 0]);		
		yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(4);			
	}
	
	xScale = d3.scale.ordinal()
	.rangePoints([0, width]);	
	
}


function tabulate(){
	
	/* Create HTML for data table from nestedData */
	
    var table = "";

	var headerRow = dateArray.slice();


	headerRow.unshift(groupNameForTable[indicator]);

	
	table += "<table><thead><tr>";

	headerRow.forEach(function(row){
		table += "<th scope='col'>" + row + "</th>";
	});
		
	table += "</tr></thead><tbody>";
		
	nestedData.forEach(function(row){
		
		if( $('input[type=checkbox][value="' + row["key"] + '"]:checked').length > 0 ){		
		
			table += "<tr><th scope='row'><span style='font-weight: 800;font-size: 40px;color:" + lineColors[row["key"]] + "'>—</span> " + row["key"] + "</th>";
			
			row["values"].forEach(function(cell){
				
	
	
	
				if(indicator != "Preterm Birth Rates" && indicator != "Term Birth Rates" ){
					table += "<td>" + cell["Rate"].toFixed(1) + cell["Significant"] + "</td>";
				}
				else{
					table += "<td>" + cell["Rate"].toFixed(2) + cell["Significant"] + "</td>";										
				}
				
				
												
	
			});
			
			table += "</tr>";
		
		}
		
	});
	
	table += "</tbody></table>";	
    
    return table;	
}

function savePNG(){

	/* Create PNG from chart when clicking on Save as PNG button */
	/* Note EN-DASH stripped out as IE throws error on non-ASCII characters */
	
	var html = d3.select("svg#chart")
			.attr("version", 1.1)
			.attr("xmlns", "http://www.w3.org/2000/svg")
			.node().parentNode.innerHTML.replace("–","-");
			
	var imgsrc = "data:image/svg+xml;base64,"+ btoa(html);
	var img = '<img src="'+imgsrc+'">'; 
	
	var w = window.open();
	var savePrompt = "<p>To save image to desktop, right click and select Save Picture As...</p><hr />";
	$(w.document.body).html(savePrompt+img);
			
}