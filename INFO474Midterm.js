"use strict";
(function(){
    let data = ""
    let svgContainer = ""
    // Dimensions for bigger SVG Container
    const measurements = {
        width: 800,
        height: 500,
        marginAll: 50
    }
    
    // Map of Pokemon Colors
    const colors = d3.map({

        "Bug": "#4E79A7",
    
        "Dark": "#A0CBE8",
    
        "Electric": "#F28E2B",
    
        "Fairy": "#FFBE7D",
    
        "Fighting": "#59A14F",
    
        "Fire": "#8CD17D",
    
        "Ghost": "#B6992D",
    
        "Grass": "#499894",
    
        "Ground": "#86BCB6",
    
        "Ice": "#FABFD2",
    
        "Normal": "#E15759",
    
        "Poison": "#FF9D9A",
    
        "Psychic": "#79706E",
    
        "Steel": "#BAB0AC",
    
        "Water": "#D37295",
        
        "Dragon": "#7132a8",

        "Rock": "#d9911e",

        "Flying": "#1ae5e8"
    
    });

    // Load data, append SVG Container, and create/append second SVG
    svgContainer = d3.select('body').append("svg")
        .attr('width', measurements.width)
        .attr('height', measurements.height);
    var svg = d3.select("body").append("svg")
        .attr('width', 125)
        .attr('height', 500);
    d3.csv("pokemon.csv")
        .then((csvData) => data = csvData)
        .then(() => createEverything())
    
    // Function: Handles creating everything... Meaning it figures out what data we need
    // handles filters, and passes that data on to make a scatterplot 
    function createEverything() {
        // Creates the basic plot and keys
        makeGenOptions(data)
        makeLegendOptions(data)
        makeColorKey();
        makeScatterPlot(data);
        
        // Stores original copy of data
        let originalData = data;

        // Gets generation/legend selecters
        let genSelecter = d3.select('#genSelect');
        let legSelecter = d3.select('#legSelect');

        // Default options for Legendary and Generation before click
        let legendStatus = "(All)";
        let genStatus = "(All)";

        console.log("Initial Setup Successful");

        // Handles clicking the generation select box
        d3.select("#legSelect").on("change", function (d) {
            legendStatus = d3.select("#legSelect").node().value;
            console.log(legendStatus);
            data = findFilteredData(originalData, genStatus, legendStatus);
            d3.select('svg').selectAll('*').remove();
            makeScatterPlot(data);
        })

        // Handles clicking the legendary select box
        d3.select("#genSelect").on("change", function (d) {
            genStatus = d3.select("#genSelect").node().value;
            console.log(genStatus);
            data = findFilteredData(originalData, genStatus, legendStatus);
            d3.select('svg').selectAll('*').remove();
            makeScatterPlot(data);
        })

    }

    // Creates the Scatterplot of Data
    function makeScatterPlot(dataSet) {
        // Gets the Total and Sp. Def datasests
        let totalStat = data.map((row) => parseInt(row["Total"]))
        let spDef = data.map((row) =>  parseFloat(row["Sp. Def"]))
        
        // Find Data Range
        const limits = findMinMax(totalStat, spDef)
        // X Coordinate Scaling Function
        let scaleX = d3.scaleLinear()
            .domain([limits.spMin - 5, limits.spMax])
            .range([0 + measurements.marginAll, measurements.width - measurements.marginAll])
        // Y Coordinate Scaling Function
        let scaleY = d3.scaleLinear()
            .domain([limits.totalMax, limits.totalMin - 0.05])
            .range([0 + measurements.marginAll, measurements.height - measurements.marginAll])
        
        // Draws Axes and Plots Ddata
        drawAxes(scaleX, scaleY)
        plotData(scaleX, scaleY)
        axisLabels()

        console.log("Scatterplot Successfuly Drawn");
    }

    // Creates Dropdown for Generation Select
    function makeGenOptions(data) {
        var genText = d3.select("body").append("text")
        .style("margin-right", "2px")
            .text("Generation:");

        var dropDown = d3.select("body").append("select")
            .attr("id", "genSelect");

        var dataSet = ["(All)", 1, 2, 3, 4, 5, 6];

        var options = dropDown.selectAll("option")
            .data(dataSet)
            .enter()
            .append("option");

        options.text(function(d) {
            return d;
        })
            .attr("value", function(d) {
                return d;
            });

        console.log("Generation Options Made");
    }

    // Creates Dropdown for Legend Select
    function makeLegendOptions(data) {
        var legendText = d3.select("body").append("text")
        .style("margin-left", "10px")
        .style("margin-right", "2px")
        .text("Legend Status:");
        
        var dropDown = d3.select("body").append("select")
            .attr("id", "legSelect");

        var dataSet = ["(All)", "False", "True"];

        var options = dropDown.selectAll("option")
            .data(dataSet)
            .enter()
            .append("option");

        options.text(function(d) {
            return d;
        })
            .attr("value", function(d) {
                return d;
            });

        console.log("Legend Buttons Made");
    }

    // Gets the Data based on Filters
    function findFilteredData(data, generation, legend) {
        // Handles Non-Default Generation
        if(generation != "(All)") {
            data = data.filter(function(entry){
                return entry.Generation == generation;
            });
        }

        // Handles Non-Default Legend Status
        if(legend != "(All)") {
            legend = legend.toUpperCase();
            data = data.filter(function(entry){
                return entry.Legendary == legend;
            });
        }

        return data;
    }

    // Creatse a Key for the Type - Color Matchups
    function makeColorKey() {
        // Looks at Color Map to find Color - Type Matchups
        let colorValues = colors.values();
        let typeValues = colors.keys();

        // Loops Through Values
        for (let i = 0; i < colorValues.length; i++) {
            // Type Text
            svg.append("text")
            .attr("class", "type header")
            .attr("text-anchor", "beginning")
            .attr("x", 10)
            .attr("y", 20)
            .attr("font-size", 20)
            .text("Type Key");

            // Type Color
            svg.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("x", 10)
            .attr("y", 20 * i + 30)
            .attr("fill",  colorValues[i])

            // Overall Header
            svg.append("text")
            .attr("class", "type label")
            .attr("text-anchor", "beginning")
            .attr("x", 25)
            .attr("y", 20 * i + 38)
            .attr("font-size", 10)
            .text(typeValues[i]);
        }
    }

    // Returns Min/Max Values Used
    function findMinMax(totalStat, spDef) {
        return {
            totalMin: d3.min(totalStat) - 20,
            totalMax: d3.max(totalStat) + 20,
            spMin: d3.min(spDef),
            spMax: d3.max(spDef)
        }
    }

    // Draws Axes for X and Y
    function drawAxes(scaleX, scaleY) {
        let xAxis = d3.axisBottom()
            .scale(scaleX)

        let yAxis = d3.axisLeft()
            .scale(scaleY)
        
        // Appends Axes to SVG Container
        svgContainer.append('g')
            .attr('transform', 'translate(0,450)')
            .call(xAxis)

        svgContainer.append('g')
            .attr('transform', 'translate(50, 0)')
            .call(yAxis)
    }

    // Plots the Data
    function plotData(scaleX, scaleY) {
        const xMap = function(d) { return scaleX(+d["Sp. Def"]) }
        const yMap = function(d) { return scaleY(+d["Total"]) }
        
        let colorValues = colors.values();
        let typeValues = colors.keys();
        
        const circles = svgContainer.selectAll(".circle")
            .data(data)
            .enter()
            .append('circle')
                .attr('cx', xMap)
                .attr('cy', yMap)
                .attr('r', 3)
                .attr('fill', function(d) { return colors.get(d["Type 1"]) })
            // Creates a ToolTip Box with Pokemon Name, Type, and Second Type (If Exists)
            .on("mouseover", function(d) {		
                div.transition()		
                    .duration(200)		
                    .style("opacity", .9);
                // Actual Text for ToolTip on 2-3 Lines		
                div	.html(d["Name"] + "<br/>" + d["Type 1"] + "<br/> " + d["Type 2"])	
                    .style("left", (d3.event.pageX) + "px")		
                    .style("top", (d3.event.pageY - 28) + "px")
                    .style("color", "white");
                })					
            .on("mouseout", function(d) {		
                div.transition()		
                    .duration(500)		
                    .style("opacity", 0)});

        // Define Div For Tooltip
        var div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);  
    }

    
    // Function to Label X and Y Axis
    function axisLabels() {
        svgContainer.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", 425)
            .attr("y", 484)
            .attr("font-size", 12)
            .text("Sp. Def");

            svgContainer.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", -225)
            .attr("y", 16)
            .attr("font-size", 12)    
            .attr("transform", "rotate(-90)")
            .text("Total");
    }

})()