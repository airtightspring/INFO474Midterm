"use strict";
(function(){
    let data = ""
    let svgContainer = ""
    // dimensions for svg
    const measurements = {
        width: 800,
        height: 500,
        marginAll: 50
    }
    

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

    // load data and append svg to body
    svgContainer = d3.select('body').append("svg")
        .attr('width', measurements.width)
        .attr('height', measurements.height);
        var svg = d3.select("body").append("svg")
        .attr('width', 200)
        .attr('height', 500);
    d3.csv("pokemon.csv")
        .then((csvData) => data = csvData)
        .then(() => createEverything())
    
    function createEverything() {
        makeGenOptions(data)
        makeLegendOptions(data)
        makeColorKey();
        makeScatterPlot(data);
        
        let originalData = data;
        let genSelecter = d3.select('#genSelect');
        let legSelecter = d3.select('#legSelect');
        let legendStatus = "(All)";
        let genStatus = "(All)";

        let totalStat = data.map((row) => parseInt(row["Total"]))
        let spDef = data.map((row) =>  parseFloat(row["Sp. Def"]))

       // for(var a = 0; a < totalStat.length; a++)
            /*var matchingTotal = [], i;
            for(i = 0; i < totalStat.length; i++)
                if (totalStat[i] === 680)
                    matchingTotal.push(i);
            
            console.log(matchingTotal);

            var spDefHolder = [], j;
            for(j = 0; j < matchingTotal.length; j++)
                spDefHolder.push(spDef[matchingTotal[j]]);*/

                    /*
        for(var a = 0; a < data.length; a++)
            for(var b = 0; b < data.length; b++)
                if(totalStat[a] == totalStat[b] && a != b && spDef[a] == spDef[b] && data[a]['Name'] != '*')
                    data[a]['Name'] = '*';
        
        console.log('Done'); */

        

        genSelecter.selectAll("option")            
        .on('click', function(d) {
            console.log(d);
            genStatus = d;
            data = findFilteredData(originalData, genStatus, legendStatus)
            d3.select('svg').selectAll('*').remove();
            makeScatterPlot(data);
        });

        legSelecter.selectAll("option")            
        .on('click', function(d) {
            console.log(d);
            legendStatus = d;
            data = findFilteredData(originalData, genStatus, legendStatus)
            d3.select('svg').selectAll('*').remove();
            makeScatterPlot(data);
        });

    }

    function makeScatterPlot(dataSet) {
        //let dataHolder = data;
        let sel = document.getElementById('genSelect');
        let selVal = sel[sel.selectedIndex].value;
        let totalStat = data.map((row) => parseInt(row["Total"]))
        let spDef = data.map((row) =>  parseFloat(row["Sp. Def"]))
        let name = data.map((row) =>  parseFloat(row["Name"]))
        let type01 = data.map((row) =>  parseFloat(row["Type 1"]))
        let type02 = data.map((row) => parseFloat(row["Type 2"]))
        let generation = data.map((row) => parseFloat(row["Generation"]))
        
        /*
        console.log(dataSet.length);
        console.log(data[3]['Name']);
        console.log(data['Name']);
        for(var a = 0; a < dataSet.length; a++)
            for(var b = 0; b < dataSet.length; b++)
                if(totalStat[a] == totalStat[b] && a != b && spDef[a] == spDef[b] && dataSet[a]['Name'] != '*')
                    dataSet[a]['Name'] = '*';
        
        console.log('Done');
        */


        console.log("Generation 1", data.length);
        // find range of data
        const limits = findMinMax(totalStat, spDef)
        // create a function to scale x coordinates
        let scaleX = d3.scaleLinear()
            .domain([limits.spMin - 5, limits.spMax])
            .range([0 + measurements.marginAll, measurements.width - measurements.marginAll])
        // create a function to scale y coordinates
        let scaleY = d3.scaleLinear()
            .domain([limits.totalMax, limits.totalMin - 0.05])
            .range([0 + measurements.marginAll, measurements.height - measurements.marginAll])
        
        drawAxes(scaleX, scaleY)

        plotData(scaleX, scaleY)

        axisLabels()

        // stop point
    }

    function makeGenOptions(data) {
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
    }

    function makeLegendOptions(data) {
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
    }
    function findFilteredData(data, generation, legend) {
        // get arrays of GRE Score and Chance of Admit
        if(generation != "(All)") {
            data = data.filter(function(entry){
                return entry.Generation == generation;
            });
        }

        if(legend != "(All)") {
            legend = legend.toUpperCase();
            data = data.filter(function(entry){
                return entry.Legendary == legend;
            });
        }
        /*
        for(var a = 0; a < data.length; a++)
            for(var b = 0; b < data.length; b++)
                if(data[a]['Total'] == data[b]['Total'] && a != b && data[a]['Sp. Def'] == data[b]['Sp. Def'] && data[a]['Name'] != '*')
                    data[a]['Name'] = '*';
        */
        return data;
    }

    function makeColorKey() {
        let colorValues = colors.values();
        let typeValues = colors.keys();

        for (let i = 0; i < colorValues.length; i++) {
            svg.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("x", 10)
            .attr("y", 20 * i)
            .attr("fill",  colorValues[i])

            svg.append("text")
            .attr("class", "type label")
            .attr("text-anchor", "beginning")
            .attr("x", 25)
            .attr("y", 20 * i + 8)
            .attr("font-size", 10)
            .text(typeValues[i]);
        }
    }

    function findMinMax(totalStat, spDef) {
        return {
            totalMin: d3.min(totalStat) - 20,
            totalMax: d3.max(totalStat) + 20,
            spMin: d3.min(spDef),
            spMax: d3.max(spDef)
        }
    }

    function drawAxes(scaleX, scaleY) {
        // these are not HTML elements. They're functions!
        let xAxis = d3.axisBottom()
            .scale(scaleX)

        let yAxis = d3.axisLeft()
            .scale(scaleY)
        
        // append x and y axes to svg
        svgContainer.append('g')
            .attr('transform', 'translate(0,450)')
            .call(xAxis)

        svgContainer.append('g')
            .attr('transform', 'translate(50, 0)')
            .call(yAxis)
    }

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
            // Creates a Notification Box with Bin Name and Count
            .on("mouseover", function(d) {		
                div.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                div	.html(d["Name"] + " " + d["Type 1"] + " " + d["Type 2"])	
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
            .attr("x", 550)
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