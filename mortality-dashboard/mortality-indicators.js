/* Files to be loaded */
var csv_file = "mortality-dashboard.csv";
					
/* yAxisLabels for each indicator */
var groupNameForTable = {	"Age-Specific Birth Rates": "Age Group",
							"General Fertility Rates": "Indicator",
							"Teen Birth Rates": "Age Group",
							"Cesarean Delivery Rates": "Indicator", 
							"Preterm Birth Rates": "Gestational Age",
							"Other Gestational Age Rates": "Gestational Age"};					

/* Hex values for color of each line */				
var lineColors = {	"12 months ending with quarter": "#84C448",
					"3-month period": "#0070C0",																													
};


/* Margins/Dimensions for chart in Viewport 4 */
var margin = {top: 90, right: 30, bottom: 70, left: 70},
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
var priorIndicator = "All Causes";

/* Selected time period from radio buttons */
var rateType;

/* Store ID of prior selected time period to toggle previously shown trends/footnotes to hidden */
var priorRateType = "RATE-CRUDE";

/* SVG Canvas that chart is drawn to */
var svg;

/* Define the line function to be applied to each group */
var trendline = d3.svg.line()
    .x(function(d) { return xScale(d.Year_Quarter); })
    .y(function(d) { return y(d.Rate); })
	.defined(function(d) { return d.Rate!=0; });
	
/* Store current viewport based on browser window width */
var viewPort = 4;

var groups;

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

	/* Break data into groups based on Indicator to generate unique indicator list */
	
	nestedData = d3.nest()
	.key(function(d) { return d.Indicator; }).sortKeys(d3.ascending)
	.entries(dataset);		

	
	/* Update dropdown list of available indicator options */

	groups = d3.select("#indicators select");
	
	groups.html("");
	
	groups.selectAll("option")
	.data(nestedData)
	.enter()			
	.append("option")
		.attr("value", function(d) { return d.key; })
		.text(function(d) { return d.key; });	
	
}

function updateChart(){
	
	/* Find selected time period from radio buttons */
	rateType = $('input[name=RATE]:checked').val();	
	
	/* Set indicator from drop down menu */
	indicator = $("#vsrr_indicator").val();		
	
	
	/* Update text trends/footnotes */

	$("div[name='trend-"+priorIndicator+"']").toggleClass("hiddenFN", true);
	$("div[name='fn-"+priorIndicator+"']").toggleClass("hiddenFN", true);	

	priorIndicator = indicator;
	priorRateType = rateType;	
	
	$("div[name='trend-"+priorIndicator+"']").toggleClass("hiddenFN", false);
	$("div[name='fn-"+priorIndicator+"']").toggleClass("hiddenFN", false);		
	
	
	
	
	
	/* Filter data based on selected indicator and rate type */
	filteredData = dataset.filter(function(d) 
	{ 
	
		if( d["Rate Type"] == rateType && d["Indicator"] == indicator) 
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
	
	/* Break date into groups based on available Type (Quarterly/12 month ending) values */
	
	nestedData = d3.nest()
		.key(function(d) { return d.Type }).sortKeys(d3.descending)
		.entries(filteredData);					
	
	

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


	/* Update title (TITLE1 = TIME-PERIOD, TITLE2 = INDICATOR, TITLE3 = DATERANGE) */

	svg.append("text")
	.attr("id","title1")
	.attr("x", (width)/2)
	.attr("y", -65)
	.attr("text-anchor", "middle")
	.attr("font-family", "sans-serif")
	.attr("font-size", function(d){ if(viewPort > 2){return "16px";}else{return "12px";}})
	.attr("font-weight", "bold")
	.attr("fill", "black")
	.text(rateType+" death rates for " + indicator.toLowerCase().replace("hiv","HIV").replace("alzheimer","Alzheimer").replace("parkinson","Parkinson") + ": "); 

	svg.append("text")
	.attr("id","title2")
	.attr("x", (width)/2)
	.attr("y", -40)
	.attr("text-anchor", "middle")
	.attr("font-family", "sans-serif")
	.attr("font-size", function(d){ if(viewPort > 2){return "16px";}else{return "12px";}})
	.attr("font-weight", "bold")
	.attr("fill", "black")
	.text("United States, " + dateRange);
	



	/* Get max value for x-axis */
	maxValue = d3.max(filteredData, 
		function(d) {			
				return d["Rate"];
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
		.text("Deaths per 100,000");
	
	/* Draw legend box */
	
	svg.append("rect")
		.attr("fill","#0070C0")
		.attr("x",(width/2)-185)
		.attr("y",-20)
		.attr("width",14)
		.attr("height",10);
			
	svg.append("text")
			.attr("fill","#0070C0")
			.attr("x",(width/2)-165)
			.attr("y",-10)
			.attr("font-family", "Arial, Helvetica, sans-serif")
			.attr("font-size", "14px")
			.attr("font-weight", "normal")
			.text("3-month period");

	svg.append("rect")
		.attr("fill","#84C448")
		.attr("x",(width/2)-25)
		.attr("y",-20)
		.attr("width",14)
		.attr("height",10);
			
	svg.append("text")
			.attr("fill","#84C448")
			.attr("x",(width/2)-5)
			.attr("y",-10)
			.attr("font-family", "Arial, Helvetica, sans-serif")
			.attr("font-size", "14px")
			.attr("font-weight", "normal")
			.text("12 months ending with quarter");		

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

		svg.append("path")
			.attr("class", "line")
			.attr("d", trendline(d.values))
			.attr("fill", "none")
			.attr("stroke", lineColors[d.key])
			.attr("stroke-width", "5px")
			.attr("shape-rendering", "geometricPrecision"); 
		
    });		
	
	
    /* Add circle for each data point in filtered data and define tooltip on mouse over and out */
    filteredData.forEach(function(d) {

		if(d["Rate"] != 0){

		svg.append("circle")
			.attr("class","dataPoints")
			.attr("cx", function(e) { return xScale(d["Year_Quarter"]); } )
			.attr("cy", function(e) { return y(d["Rate"]); })
			.attr("r",5)
			.attr("fill", function(e) {return lineColors[d["Type"]];})
			.attr("stroke",function(e) {return lineColors[d["Type"]];})
			.on("mouseover", function(e) {
				
					if(viewPort == 1){
						return;	
					}
				
					var xPosition = parseFloat(d3.select(this).attr("cx"));
					var yPosition = parseFloat(d3.select(this).attr("cy")) - 20;


					// Used if there is not sufficient margin on the right to accomodate tooltip
		
					var triangleXPosition = xPosition;
					
					if((xPosition + 210) >= width){
						xPosition -= 120;
					}
			
					svg.append("g")
						.attr("id", "tooltip");
					
					svg.select("g#tooltip").append("rect")
						.attr("fill","black")
						.attr("stroke","black")
						.attr("x",xPosition - 60)
						.attr("y",yPosition - 35)
						.attr("width",210)
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
								return "Type: " + d["Type"].split("(")[0];;
							});
						
					svg.select("g#tooltip").append("text")
						.attr("x", xPosition-50)
						.attr("y", yPosition-5)
						.attr("font-family", "sans-serif")
						.attr("font-size", "12px")
						.attr("fill", "white")							
						.text(function(e){
								if(indicator != "Preterm Birth" && indicator != "Other Gestational Age Categories" ){
									return "Rate (" + d["Year_Quarter"]+"): "+d["Rate"].toFixed(1);
								}
								else{
									return "Rate (" + d["Year_Quarter"]+"): "+d["Rate"].toFixed(2);									
								}
							});
											
					var triangle = d3.svg.symbol().type('triangle-down')
										.size(50);	
										
					svg.select("g#tooltip").append("path")
						.attr("d",triangle)
						.attr("stroke","black")
						.attr("fill","black")
						.attr("transform",function(){ return "translate("+triangleXPosition+","+(yPosition+10)+")";	});																							
												
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
		margin.right = 30;		
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
		margin.right = 30;		
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
		margin.right = 30;		
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


	headerRow.unshift("Rate");

	
	table += "<table><thead><tr>";

	headerRow.forEach(function(row){
		table += "<th scope='col'>" + row + "</th>";
	});
		
	table += "</tr></thead><tbody>";
		
	nestedData.forEach(function(row){
		
	
			table += "<tr><th scope='row'><span style='font-weight: 800;font-size: 40px;color:" + lineColors[row["key"]] + "'>—</span> " + indicator + ", " + row["key"] + " (" + rateType + ")</th>";
			
			row["values"].forEach(function(cell){

				if(cell["Rate"] != 0){
					table += "<td>" + cell["Rate"].toFixed(1) + "</td>";
				}
				else{
					table += "<td>---</td>";
				}

			});
			
			table += "</tr>";
		

		
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