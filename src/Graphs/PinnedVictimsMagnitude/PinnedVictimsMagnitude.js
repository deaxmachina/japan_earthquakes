import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import _ from "lodash";
import * as chroma from "chroma-js";
import "./PinnedVictimsMagnitude.css";
import dataLoad from "../../data/earthquakes_sample.csv"
import InfoCard from "./InfoCard";


const PinnedVictimsMagnitude = () => {
  /// refs ///
  const svgRef = useRef();
  const victimsGraphRef = useRef();
  const victimsCircleRef = useRef();
  const magnitudeGraphRef = useRef();
  const magnitudesAxisRef = useRef();
  let steps = [
    useRef(), useRef(), useRef(), useRef(), useRef(), useRef(), 
    useRef(), useRef(), useRef(), useRef(), useRef(), useRef(), useRef()
  ]

  /// Dimensions ///
  const width = 800;
  const height = width;
  const margin = {top: 10, bottom: 10, right: 10, left: 10}
  // min and max radius 
  const minRadius = 160;
  const maxRadius = 360;
  // power of magnitude increase -- CHECK this 
  const magnitudePower = 2;
  // colours 
  const magnitudeMinColour = chroma("#7d8597").brighten(0.5);
  const magnitudeMaxColour = chroma("#004666").brighten(0.5);
  const circleDeathsFill = "#fffcf2";
  //const magnitudeMaxColour = chroma(magnitudeMinColour).darken(2)
  const victimsColour = "#5C0A27";
  const separatingLineColour = chroma.blend("slategrey", "rgba(255,252,242,0.9)", 'darken');


  /// states /// 
  const [data, setData] = useState(null);
  const [selectedEarthquake, setSelectedEarthquake] = useState("earthquake-0")
  const kanto = "1923 Great Kantō earthquake"

  useEffect(() => {
    d3.csv(dataLoad, d3.autoType).then(d => {
      d.forEach(element => {
        if (element.nameEnglish !== kanto){
          element.value = element.deaths
        } else {
          // just for the Great Kanto Earthquake reduce the size 
          // so that it's possible to fit it into the screen -- fix this later so that it's accurate!! 
          element.value = element.deaths 
        }
      });
      // filter only to include largest earthquakes -- now over 5000 deaths
      let filteredData = _.filter(d, function(el) { return el.value >=  5000});
      //filteredData = _.filter(filteredData, d => d.nameEnglish !== "1923 Great Kantō earthquake");
      filteredData.forEach((element, i) => {
        element.name = `earthquake-${i}`
      })
      // sort by date 
      filteredData = filteredData.sort((a, b) => a.date - b.date);
      setData(filteredData)
    })
  }, [])

  useEffect(() => {

    if (data) {
    const deathsData = _.find(data, { 'name': selectedEarthquake});
    /// SCALES ///
    // Deaths Scale
    // map x number of deaths to one circle 
    // start from 1 circle = 1000 deaths
    const deathsToCircles = numDeaths => Math.round(numDeaths/1000)
    // Magnitude Scale
    const magnitudeScale = d3.scalePow()
      .exponent(magnitudePower)
      .domain([0, d3.max(data, d => d.magnitude)])   
      .range([minRadius, maxRadius])
    const magnitudeScaleColour = chroma.scale([magnitudeMinColour, magnitudeMaxColour]
      .map(color => chroma(color).saturate(0)))
      .domain([5, d3.max(data, d => d.magnitude)])  


    /// SVG  define ///
    // the group for the force graph with deaths circles 
    const gVictimsGraph = d3.select(victimsGraphRef.current) // note that overflow prop is set in the css 
      .style("font", "10px sans-serif")
      .attr("transform", `translate(${width/2}, ${height/2})`)
    // the group for the magnitudes graph 
    const gMagnitudeGraph = d3.select(magnitudeGraphRef.current) // note that overflow prop is set in the css 
      .style("font", "10px sans-serif")
      .attr("transform", `translate(${width/2}, ${height/2})`)

    /// GRAPH ///

    // 1. Circle around the death circles, i.e. the force graph
    const circleDeaths = d3.select(victimsCircleRef.current)
        .attr("r", minRadius)
        .attr("fill", circleDeathsFill)
        .attr("fill-opacity", 0.9)
        .attr("stroke", separatingLineColour)
        .attr("stroke-width", 5)
        //.attr("stroke-dasharray", "10,3")

    // 2. Force graph for the death circles 
    // 2.1. Prep the data 
    // need an array of objects for the force layout
    let nodes = _.range(deathsToCircles(deathsData.deaths))
    nodes = Array.from({length: nodes.length}, (j, i) => ({
      id: Math.random(),
      r: 9,
    }));
    // 2.2. Create the circles that correspond to the deaths 
    const node = gVictimsGraph 
      .selectAll(".circle")
      .data(nodes, d => d)
      .join("circle")
        .attr("class", "circle")
        .attr("r", 3) // give them a fixed radius to start from 
        .attr("fill", victimsColour)
        .attr("stroke", victimsColour)
        .attr("stroke-opacity", 0.35)
        .attr("stroke-width", 5)
    // 2.3. Add the force simulation 
    function tick() {
        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
    }
    const simulation = d3.forceSimulation(nodes)
      .on("tick", tick)
      .force("collide", d3.forceCollide().radius(d => 1 + d.r))
      .force("y", d3.forceY( height / 1/4).strength(0.001))
      .stop();
    // this is how long it takes for the simulation to happen 
    setTimeout(() => {
      simulation.restart();
      node.transition().attr("r", d => d.r);
    }, 100);
    // show the initial arrangement
    tick();

    // 3. Magnitude graph 
    // 3.1. Arc for the magnitudes 
    var arc = d3.arc()
    const t = d3.transition().duration(500);
    const magnitudesGraph = gMagnitudeGraph
      .selectAll("path")
      .data([deathsData])
      .join("path")
      //.style("fill", "maroon")
      .attr("fill", d => magnitudeScaleColour(d.magnitude))
      .attr("opacity", 0.5)
      .transition(t)
      .attr("d", d => arc({
        innerRadius: minRadius,
        outerRadius: magnitudeScale(d.magnitude),
        startAngle: 0,
        endAngle: 2*Math.PI
      }));
    // 3.2 Arcs for the axis
    const magnitudesAxis = g => g
      .attr("text-anchor", "middle")
      .call(g => g
        .selectAll(".magnitude-text")
        .data(d => [d])
        .join("text")
        .attr("class", "magnitude-text")
        .attr("y", `-${maxRadius+10}px`)
        .attr("font-size", "12px")
        .attr("fill", "white")
        .text("magnitude"))
      .call(g => g.selectAll("g")
        .data(magnitudeScale.ticks(11).slice(2))
        .join("g")
        .attr("fill", "none")
        .call(g => g
          .selectAll("circle")
          .data(d=>[d])
          .join("circle")
          .attr("stroke", "#ddbea9")
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", "2,3")
          .attr("r", magnitudeScale))
        .call(g => g
          .selectAll("text")
          .data(d => [d])
          .join("text")
          .attr("y", d => -magnitudeScale(d))
          .attr("dy", "0.35em")
          .attr("stroke", "#fff")
          .attr("stroke-width", 0)
          .attr("font-size", d => `${d*1.25+7}px`)
          .text(d => d)
          .attr("fill", "white")
          .attr("stroke", "white")))
      // call the axis
      d3.select(magnitudesAxisRef.current).call(magnitudesAxis)

  } else {
    console.log("missing data")
  }
  }, [data, selectedEarthquake])


// GSAP Code //
useEffect(() => {
  gsap.registerPlugin(ScrollTrigger); 
    ScrollTrigger.create({
        trigger: svgRef.current,
        //endTrigger: `#step-${data.length - 1}`, // id of the last text box 
        endTrigger: steps[steps.length - 1].current,
        start: 'center center',
        end: 'center center',
        pin: true,
        pinSpacing: false,
        id: 'chart-pin'
    });
    // animation for each of the boxes triggering a change in the graph 
    steps.forEach( (d, i) => {
      if (i !== 0){
        ScrollTrigger.create({
          //trigger: `#step-${i}`,
          trigger: steps[i].current,
          start: 'top center',
          onEnter: () => setSelectedEarthquake(`earthquake-${i}`),
          onLeaveBack: () => setSelectedEarthquake(`earthquake-${i-1}`),
          markers: false,
          id: `box-${i}`
        });
      }
      else if(i === 0) {
        ScrollTrigger.create({
          //trigger: `#step-0`,
          trigger: steps[0].current,
          start: 'top center',
          onEnter: () => setSelectedEarthquake(`earthquake-0`),
          markers: false,
          id: `box-0`
        });
      } 
    });

    steps.forEach(step => {
      ScrollTrigger.create({
        trigger: step.current,
        duration: 1,
        start: 'top center',
        end: 'center top',
        toggleClass: 'active',
        markers: false,
        id: 'toggle-active-class'
      });
    }); 
}, [data])


  return (
    <div id="pinned-graph-container">
      <div className="heading-wrapper">
        <h1 className="pinned-graph-heading">
          Largest Japanese Earthaqukes
        </h1> 
        <h2 className="pinned-graph-subheading"> 
          in the last 1000 years
        </h2>    
        <p className="pinned-graph-p">
          There have been many devstating earthquakes in Japanese history. 
          How does the damage done and number of casualties compare over time? 
          Were the largest earthquakes the most destructive, or are there other factors at play? 
          Are the improved building stardards helping reduce the amount of destruction done 
          by large earthquakes? We examine below the earthquakes over the last 1000 years with 
          recorded victims over 5000 people. 
        </p>
        <p>[ work in progress ]</p>
        <p>best viewed on a desktop-sized screen, Chrome browser</p>
      </div>

      <div id="chart-and-steps">
        <svg id="chart-wrapper" 
        width={width} 
        height={height + margin.top} 
        ref={svgRef}>
          <g ref={magnitudeGraphRef}>
            <g ref={magnitudesAxisRef}></g>
          </g> 
          <g id="chart-wrapper-g" ref={victimsGraphRef}>
            <circle ref={victimsCircleRef}></circle>
          </g> 
        </svg>
        <div id="scroll-steps">
          { data 
            ? data.map((d, i) => (
              <section className="step" id={`step-${i}`} ref={steps[i]}>
                <InfoCard d={d}/>
              </section>
            ))
            : null
          }    
        </div>
      </div>

    </div>
  )
};

export default PinnedVictimsMagnitude;