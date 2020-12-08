import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import "./PinnedGraph.css";


const PinnedGraph = () => {
  /// refs ///
  const svgRef = useRef();
  const gRef = useRef();

  /// Dimensions ///
  const width = 600;
  const height = width;
  const innerRadius = 0;
  const outerRadius = 300;
  const margin = {top: 10, bottom: 10, right: 10, left: 10}

  /// colours ///
  const coloursDeaths = ["#4f000b", "black"];
  const coloursInjuries = ["#4f000b", "black"];
  const coloursMissing = ["#4f000b", "black"];

  // DUMMY DATA //
  // Simulating what the data would look like for the 
  // earthquakes project 
  // for all the earthquakes data would be like this 
  const myallData = [
    {
      "earthquake1": {
        "name": "deaths", 
        "value": 500 
      },
      "earthquake2": {
        "name": "deaths", 
        "value": 600 
      },
      "earthquake3": {
        "name": "deaths", 
        "value": 300 
      },
    },
    {
      "earthquake1": {
        "name": "injuries", 
        "value": 1000 
      },
      "earthquake2": {
        "name": "injuries", 
        "value": 800 
      },
      "earthquake3": {
        "name": "injuries", 
        "value": 1200 
      },
    },
    {
      "earthquake1": {
        "name": "missing", 
        "value": 2000 
      },
      "earthquake2": {
        "name": "missing", 
        "value": 1800 
      },
      "earthquake3": {
        "name": "missing", 
        "value": 1000 
      },
    },
  ]

  // for a single earthquake data would be like this 
  const mydata = [
    { "name": "deaths", "value": 500 },
    { "name": "injuries", "value": 1000 },
    { "name": "missing", "value": 2000 }
  ]
  // the max data which is static 
  const mymaxData = [
    { "name": "deaths", "value": 1000 },
    { "name": "injuries", "value": 2000 },
    { "name": "missing", "value": 3000 }
  ]

  /// states /// 
  const [data, setData] = useState(mydata);
  const [maxData, setMaxData] = useState(mymaxData);
  const [allData, setAllData] = useState(myallData);
  const [selectedEarthquake, setSelectedEarthquake] = useState("earthquake1")

  useEffect(() => {

    gsap.registerPlugin(ScrollTrigger);

    /// SCALES ///
    // X Scale 
    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, 2 * Math.PI])
      //.align(0)
      .padding(0.1)
    // Y Scale 
    // This scale maintains area proportionality of radial bars
    const y = d3.scaleRadial()
      .domain([0, 3000]) // use this if you don't want the scale to jump when data changes 
      //.domain([0, d3.max(maxData, d => d.value)]) // for 0 to the max value for any bar 
      .range([innerRadius, outerRadius])

    // Color Scale 
    const z = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(["red", "maroon", "pink"])

    /// GRAPH ///
    const svg = d3.select(gRef.current)
      .style("font", "10px sans-serif")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      
    
    // GRADIENTS AND PATTERNS //
    //Append a defs (for definition) element to SVG
    var defs = svg.append("defs");

    // Linear gradients // 
    //Append a linearGradient element to the defs and give it a unique id
    function getLinearGradient(x1, y1, x2, y2, startColor, endColor, id){
      const linearGradient = defs.append("linearGradient")
        .attr("id", id)
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2);
      //Set the color for the start (0%)
      linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", startColor); 
      //Set the color for the end (100%)
      linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", endColor); 
      return linearGradient
    }

    const linearGradient0 = getLinearGradient("0%", "70%", "70%", "0%", coloursDeaths[0], coloursDeaths[1], "linear-gradient-0")
    const linearGradient1 = getLinearGradient("30%", "0%", "70%", "70%", coloursInjuries[0], coloursInjuries[1], "linear-gradient-1")
    const linearGradient2 = getLinearGradient("100%", "50%", "0%", "0%", coloursMissing[0], coloursMissing[1], "linear-gradient-2")

    // Striped pattern //
    const pattern = defs
      .append("pattern")
      .attr("id", "striped-pattern")
      .attr("height", 0.02)
      .attr("width", 0.03);
    pattern
      .append("rect")
      .attr("height", "100%")
      .attr("width", "100%")
      .attr("fill", "black");
    pattern
      .append("rect")
      .attr("x", 0)
      .attr("y", 2)
      .attr("height", "1%")
      .attr("width", "5%")
      .attr("fill", "grey");


    // Draw the graph // 
    // animation for transitioning the radial bars 
    const t = d3.transition().duration(1000);

    // Arc //
    const arc = d3.arc()
      .innerRadius(y(0))
      .outerRadius(d => y(d.value))
      .startAngle(d => x(d.name))
      .endAngle(d => x(d.name) + x.bandwidth() - 0.9)
      .padRadius(innerRadius)

    // Graph - this is bound to the dynamic earthquake data  
    // dynamic earthquake graph
    const graph = svg.select(".graph")
      .selectAll("g")
      .data(allData)
      //.data(data)
      .join("g")
      .attr("transform", `translate(${width/2 + margin.left}, ${height/2 + margin.top})`)
      .attr("class", "all-cases")
      //.attr("fill", d => z(d.name))
      .style("fill", (d, i) => `url(#linear-gradient-${i})`)
      //.attr("fill", d => z(d['earthquake1'].name))
      .attr("opacity", 1)

    // segments of constant values for the maxes 
    const maxes = svg.select(".maxes")
      .selectAll("g")
      .data(maxData)
      .join("g")
      .attr("transform", `translate(${width/2 + margin.left}, ${height/2 + margin.top})`)
      //.attr("fill", d => z(d.name))
      .attr('fill', "url('#striped-pattern')")
      .attr("opacity", 0.1)
      .selectAll("path")
      .data(d => [d])
      .join("path")
      .transition(t)
      .attr("d", arc); 



    // define this separately just so that we ca n refer to it later 
    const graphDraw = graph
      .selectAll("path")
      .data(d => [d[selectedEarthquake]])
      //.data(d => [d])
      .join("path")
      .transition(t)
      .attr("d", arc);


    // AXES //

    const yAxis = g => g
      .attr("text-anchor", "middle")
      .call(g => g.append("text")
        .attr("y", d => -y(y.ticks(3).pop()))
        .attr("dy", "-1em")
        .text("Number of People"))
      .call(g => g.selectAll("g")
        .data(y.ticks(3).slice(1))
        .join("g")
        .attr("transform", `translate(${width/2 + margin.left}, ${height/2 + margin.top})`)
        .attr("fill", "none")
        .call(g => g.append("circle")
          .attr("stroke", "#ddbea9")
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", "5,5")
          .attr("r", y))
        .call(g => g.append("text")
          .attr("y", d => -y(d))
          .attr("dy", "0.35em")
          .attr("stroke", "#fff")
          .attr("stroke-width", 5)
          .text(y.tickFormat(5, "s"))
          .clone(true)
          .attr("fill", "#000")
          .attr("stroke", "none")))

    svg.append("g")
      .call(yAxis);

    // Legend 
    const legend = g => g.append("g")
      .selectAll("g")
      .data([1, 2, 3])
      .join("g")
      .attr("transform", (d, i) => `translate(-150,${(i - ([1, 2, 3].length - 1) / 2) * 20 - 200})`)
        .call(g => g.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", (d, i) => z[i])) // fix 
        .call(g => g.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .text("text"))

    svg.append("g")
        .call(legend);


    // SCROLLY //
    // PINNING THE CHART //
    //This pins the SVG chart wrapper when it hits the center of the viewport
    //and releases the pin when the final textbox meets the bottom of the chart
    //we use a function to define the end point to line up the bottom of the
    //text box with the bottom of the chart
    ScrollTrigger.create({
      trigger: '#chart-wrapper',
      endTrigger: '#step-3', // id of the last text box 
      start: 'center center',
      end: 'center top',
      pin: true,
      pinSpacing: false,
      id: 'chart-pin'
    });

    // ANIMATIONS //

    // Animation 1: Get the second earthquake
    ScrollTrigger.create({
      trigger: '#step-2',
      start: 'top center',
      onEnter: getSecondEarthquake,
      onLeaveBack: getFirstEarthquake,
      markers: false,
      id: 'first-box'
    });

    // Animation 2: Get the third earthquake
    ScrollTrigger.create({
        trigger: '#step-3',
        start: 'top center',
        onEnter: getThirdEarthquake,
        onLeaveBack: getSecondEarthquake,
        markers: false,
        id: 'first-box'
      });

    function getThirdEarthquake() {
        setSelectedEarthquake("earthquake3")
      }; 
    function getSecondEarthquake() {
      setSelectedEarthquake("earthquake2")
    };
    function getFirstEarthquake() {
      setSelectedEarthquake("earthquake1")
    };

    //sets up the class toggle on each scrolling text box
    //so that it becomes opaque when in view and transparent when exiting
    gsap.utils.toArray('.step').forEach(step => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top center',
        end: 'center top',
        toggleClass: 'active',
        markers: false,
        id: 'toggle-active-class'
      });
    });

  }, [data, maxData, allData, selectedEarthquake])

  function buttonClick() {
    const newMaxData = [
      { "name": "deaths", "value": 800 },
      { "name": "injuries", "value": 1500 },
      { "name": "missing", "value": 1000 }
    ]
    //setMaxData(newMaxData)
    setSelectedEarthquake("earthquake3")
  }


  return (
    <div id="pinned-graph-container">
      <div className="heading-wrapper">
        <h1 className="pinned-graph-heading">
          Earthquake victims over time
        </h1>     
        <p className="pinned-graph-p">
          There have been many devstating earthquakes in Japanese history. 
          How does the damage done and number of casualties compare over time? 
          Were the largest earthquakes the most destructive, or are there other factors at play? 
          Are the improved building stardards helping reduce the amount of destruction done 
          by large earthquakes? 
        </p>
      </div>

      <div id="chart-and-steps">
        <svg id="chart-wrapper" 
        width={width + margin.left + margin.right} 
        height={height + margin.top + margin.bottom} 
        ref={svgRef}>
          <g id="chart-wrapper-g" ref={gRef}>
            <g className="maxes"></g>
            <g className="graph"></g>         
            <g className="x-axis"></g>
            <g className="y-axis"></g>
            <g className="legend"></g>
          </g>
        </svg>
        <div id="scroll-steps">
          <section className="step" id="step-1">
            This is the first section with some text in it
          </section>
          <section className="step" id="step-2">
            This is the second section with some text in it
          </section>
          <section className="step" id="step-3">
            This is the third section with some text in it
          </section>
        </div>
      </div>
    </div>
  )
};

export default PinnedGraph;