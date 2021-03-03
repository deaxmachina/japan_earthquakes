import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import _ from "lodash";
import * as chroma from "chroma-js";
import "./PinnedVictimsMagnitude.css";
import dataLoad from "../../data/earthquakes_sample.csv"
import InfoCard from "./InfoCard";

// map 
const jsonUrlOriginal = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'
const jsonUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-50m.json'; // this one is more granular


const PinnedVictimsMagnitude = () => {
  /// refs ///
  const svgRef = useRef();
  const victimsGraphRef = useRef();
  const victimsCircleRef = useRef();
  const magnitudeGraphRef = useRef();
  const magnitudesAxisRef = useRef();
  const legendCircleRef = useRef();
  const legendMagnitudeRef = useRef();
  const svgLegendRef = useRef();
  const mapRef = useRef();
  let steps = [
    useRef(), useRef(), useRef(), useRef(), useRef(), useRef(), 
    useRef(), useRef(), useRef(), useRef(), useRef(), useRef(), useRef()
  ]

  /// Dimensions ///
  const width = 800;
  const height = width;
  const margin = {top: 10, bottom: 10, right: 10, left: 10}
  // min and max radius for the big circle 
  const minRadius = 170;
  const maxRadius = 370;
  // radius for the victim circles 
  const victimsRadius = 9;
  // power of magnitude increase -- CHECK this 
  const magnitudePower = 2;
  // colours 
  const magnitudeMinColour = chroma("#7d8597").brighten(0.5);
  const magnitudeMaxColour = chroma("#004666").brighten(0.5);
  const circleDeathsFill = "#fffcf2";
  //const magnitudeMaxColour = chroma(magnitudeMinColour).darken(2)
  const victimsColour = "#5C0A27";
  const separatingLineColour = chroma.blend("slategrey", "rgba(255,252,242,0.9)", 'darken');
  const legendColour = "#fffcf2"


  /// states /// 
  const [data, setData] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [selectedEarthquake, setSelectedEarthquake] = useState("earthquake-0")


  /// Data Load ///
  useEffect(() => {
    /// For the cirlces ///
    d3.csv(dataLoad, d3.autoType).then(d => {
      d.forEach(element => {element.value = element.deaths});
      // filter only to include largest earthquakes -- now over 5000 deaths
      let filteredData = _.filter(d, function(el) { return el.value >=  5000});
      // add earthquakes name to use later more easily with ennumerated steps
      filteredData.forEach((element, i) => { element.name = `earthquake-${i}` })
      // sort by date 
      filteredData = filteredData.sort((a, b) => a.date - b.date);
      setData(filteredData)
    })

    /// For the map ///
    d3.json(jsonUrlOriginal).then(d => {
      // filter out just Japan
      const mapJapan = d.features.filter(el => el.properties.name == 'Japan')
      setMapData(mapJapan)
    })

  }, [])

  useEffect(() => {

    if (data && mapData) {

    // get the data for the currently selected earthquake 
    const deathsData = _.find(data, { 'name': selectedEarthquake});
    /// SCALES ///
    // Deaths Scale - map x number of deaths to one circle; start from 1 circle = 1000 deaths
    const deathsToCircles = numDeaths => Math.round(numDeaths/1000)
    // Magnitude Scale - use power scale because of the nature of magnitude increase
    const magnitudeScale = d3.scalePow()
      .exponent(magnitudePower)
      .domain([1, d3.max(data, d => d.magnitude)])   
      .range([minRadius, maxRadius])
    const magnitudeScaleColour = chroma.scale([magnitudeMinColour, magnitudeMaxColour]
      .map(color => chroma(color).saturate(0.5)))
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


    
    ///////////////////////////////////////////////////////////////
    ////////////////////// CIRCLES GRAPH //////////////////////////
    ///////////////////////////////////////////////////////////////

    // 1. Circle around the death circles, i.e. the force graph

    const circleDeaths = d3.select(victimsCircleRef.current)
        .attr("r", minRadius - 20)
        .attr("fill", circleDeathsFill)
        .attr("fill-opacity", 0)
        .attr("stroke", separatingLineColour)
        .attr("stroke-width", 0)

    // 2. Force graph for the death circles 
    // 2.1. Prep the data 
    // need an array of objects for the force layout
    let nodes = _.range(deathsToCircles(deathsData.deaths))
    nodes = Array.from({length: nodes.length}, (j, i) => ({
      id: Math.random(),
      r: victimsRadius,
    }));
    // 2.2. Create the circles that correspond to the deaths 
    const node = gVictimsGraph 
      .selectAll(".circle")
      .data(nodes, d => d)
      .join("circle")
        .attr("class", "circle")
        .attr("r", 2) // give them a fixed radius to start from 
        .attr("fill", victimsColour)
        .attr("stroke", victimsColour)
        .attr("stroke-opacity", 0.35)
        .attr("stroke-width", 7)
    // 2.3. Add the force simulation 
    function tick() {
        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
    }
    const simulation = d3.forceSimulation(nodes)
      .on("tick", tick)
      .force("collide", d3.forceCollide().radius(d => 1 + d.r))
      .force("y", d3.forceY( height/10).strength(0.002))
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
      .attr("opacity", 0.6)
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
        .data(magnitudeScale.ticks(11).slice(1))
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


    ///////////////////////////////////////////////////////////////
    ////////////////////////// LEGEND /////////////////////////////
    ///////////////////////////////////////////////////////////////

    // 4. Legend  
    // 4.1. Legend for the circles for the victims
    const legendCircleGroup = d3.select(legendCircleRef.current)
      .style("font", "12px sans-serif")
      .attr("transform", `translate(${0}, ${0})`)
    const legendCircle = legendCircleGroup
      .selectAll(".legend-circle")
      .data([1, 0])
      .join("circle")
        .attr("class", "legend-circle")
        .attr("r", victimsRadius)
        .attr("fill", d => d==0? victimsColour : circleDeathsFill)
        .attr("opacity", d => d==0? 1 : 0.9)
        .attr("stroke", d => d==0? victimsColour : circleDeathsFill)
        .attr("stroke-opacity", 0.35)
        .attr("stroke-width", 5)
    const legendCircleText = legendCircleGroup
      .selectAll(".legendCircleText")
      .data([1])
      .join("text")
        .classed("legendCircleText", true)
        .text("1 circle = 1,000 victims (to the nearest 1,000)")
        .attr("fill", "#fffcf2")
        .attr("dx", victimsRadius*2)
        .attr("dy", "0.35em")

    // 4.1. Legend for the magnitude colour 
    const legendWidth = 100;
    const legendHeight = 20;

    const legendMagnitudeGroup = d3.select(legendMagnitudeRef.current)
      .style("font", "12px sans-serif")
      .attr("transform", `translate(${10}, ${20})`)
      .attr("fill", legendColour)

    // linear gradient for the magnitude legend // 
    var defs = legendMagnitudeGroup.append("defs");
    function getLinearGradient(startColor, endColor, id){
      const linearGradient = defs.append("linearGradient")
        .attr("id", id)
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
    const legendGradient = getLinearGradient(
      magnitudeScaleColour(d3.min(data, d => d.magnitude)),
      magnitudeScaleColour(d3.max(data, d => d.magnitude)),
      "legend-gradient"
     )

     // rectangle coloured with magnitude scale 
     const legendMagnitudeRect = legendMagnitudeGroup
      .selectAll(".legendMagnitudeRect")  
      .data([1])
      .join("rect")
        .classed("legendMagnitudeRect", true)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("opacity", 0.6)
        .style("fill", "url(#legend-gradient)")

    // the min and max magnidute at each end of the colour legend 
    legendMagnitudeGroup
      .selectAll(".legendMagnitudeGroupMin-text")
      .data([1])
      .join("text")
      .classed("legendMagnitudeGroupMin-text", true)
        .attr("x", -20)
        .attr("y", 10)
        .attr("dy", "0.35em")
        .text(d3.min(data, d => d.magnitude))
    legendMagnitudeGroup
      .selectAll(".legendMagnitudeGroupMax-text")
      .data([1])
      .join("text") 
      .classed("legendMagnitudeGroupMax-text", true)
        .attr("x", legendWidth + 5)
        .attr("y", 10)
        .attr("dy", "0.35em")
        .text(d3.max(data, d => d.magnitude))
    const legendMagnitudeText = legendMagnitudeGroup
      .selectAll(".legendMagnitudeGroupExplain-text")
      .data([1])
      .join("text")
      .classed("legendMagnitudeGroupExplain-text", true)
        .text("magnitude colour scale")
        .attr("fill", legendColour)
        .attr("dx", legendWidth*1.3)
        .attr("y", 10)
        .attr("dy", "0.35em")
        //.attr("font-size", '14px')

      ///////////////////////////////////////////////////////////////
      /////////////////////////// MAP ////////////////////////////////
      ///////////////////////////////////////////////////////////////
      const mapG = d3.select(mapRef.current)

      // projection for Japan (centered at Japan)
      const projection = d3.geoMercator()
          .center([125, 47]) // GPS of location to zoom on
          .scale(800)  // This is like the zoom
          .translate([0,0])

      // append the map of Japan
      const mapJapan = mapG.selectAll(".map-japan-g").data([0]).join("g").classed("map-japan-g", true)    
      .selectAll("path")
      .data(mapData)
      .join("path")
        .attr("d", d3.geoPath().projection(projection))
        .attr("fill", "white")
        .style("stroke", "none")

      // append bubbles for the earthquakes 
      const bubblesEarthquakes = mapG.selectAll(".bubbles-earthquakes-g").data([0]).join("g").classed("bubbles-earthquakes-g", true)  
      .selectAll("circle")
      .data(data)
      .join("circle")
        .attr("class", "bubbles")
        .attr("cx", d => projection([d.longitude, d.latitude])[0])
        .attr("cy", d => projection([d.longitude, d.latitude])[1])
        .attr("fill-opacity", d => d.name == selectedEarthquake ? 1 : 0)
        //.attr("stroke", "maroon")
        //.attr("stroke-opacity", 1)
        .attr("fill", d => d.name == selectedEarthquake ? "maroon" : 'hotpink')
        .attr("r", 0)
        .transition()
          .attr("r", 6)

      /*
      bubblesEarthquakes.on("click", function(e, datum) {
          console.log(datum)
          console.log(selectedEarthquake)
        })
      */
    



  } 
  }, [data, selectedEarthquake, mapData])


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

      <div className="legend-div" ref={svgLegendRef}>
        <p>How to read this visualisation</p>
        <br></br>
        <svg className="legend-svg">
          <g ref={legendCircleRef}></g>
          <g ref={legendMagnitudeRef}></g>
        </svg>
      </div>

      <div id="chart-and-steps">
        <div id="chart-wrapper" >
          <svg width={width} height={height + margin.top} ref={svgRef}>
            <g ref={magnitudeGraphRef}>
              <g ref={magnitudesAxisRef}></g>
            </g> 
            <g ref={mapRef}></g>
            <g id="chart-wrapper-g" ref={victimsGraphRef}>
              <circle ref={victimsCircleRef}></circle>
            </g> 
          </svg>
        </div>
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
