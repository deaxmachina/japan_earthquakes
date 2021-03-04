import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import _ from "lodash";
import * as chroma from "chroma-js";
import "./ConcentricCircles.css";
import dataLoad from "../../data/earthquakes_sample.csv"
import InfoCard from "./InfoCard";

// map 
const jsonUrlOriginal = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson'

const ConcentricCircles = () => {

  /// refs ///
  const svgRef = useRef();
  const mapRef = useRef();
  const victimsGraphRef = useRef();
  const magnitudeGraphRef = useRef();
  const magnitudesAxisRef = useRef();

  
  let steps = [
    useRef(), useRef(), useRef(), useRef(), useRef(), useRef(), 
    useRef(), useRef(), useRef(), useRef(), useRef(), useRef(), useRef()
  ]

  /// Dimensions ///
  /// Responsive dimensions ///
  const width = 1100;
  const height = 600;
  const margin = {top: 30, right: 0, bottom: 0, left: 0}
  const victimsRadius = 9; // radius for the victim circles 
  const victimsBackgroundRadius = 150; // radius of the background for the victim circles
  const fitToScreenFactor = 1.95; // helps with the custom power scale for the magnitudes - use this to fit into screens 
  const mapXOffset = -530; // how much to move map in x direction relative to width/2
  const mapYOffset = -280; // how much to move map in the y direction relative to height/2
  const mapZoom = 600; 
  const radiusEarthquakeOnMap = 10; // how big the circle of earthquake should be on map

  // colours 
  const magnitudeMinColour = chroma("#7d8597").brighten(0.5);
  const magnitudeMaxColour = chroma("#004666").brighten(0.1);
  const victimsColour = "#701A38"  //"#5C0A27" "#501A2D"
  const whiteColour = "#fffcf2";


  /// states /// 
  const [data, setData] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [magnitudes, setMagnitudes] = useState([3, 4, 5, 6, 7, 8, 9])
  const [selectedEarthquake, setSelectedEarthquake] = useState(null)

  /// Data Load ///
  useEffect(() => {
    /// For the cirlces ///
    d3.csv(dataLoad, d3.autoType).then(d => {
      d.forEach(element => {element.value = element.deaths});
      // filter only to include largest earthquakes -- now over 5000 deaths
      let filteredData = _.filter(d, function(el) { return el.value >=  5000});
      // sort by date 
      filteredData = filteredData.sort((a, b) => a.date - b.date);
      // add earthquakes name to use later more easily with ennumerated steps
      filteredData.forEach((element, i) => { element.name = `earthquake-${i}` })

      setData(filteredData)
      setSelectedEarthquake('earthquake-0')
    })

    /// For the map ///
    d3.json(jsonUrlOriginal).then(d => {
      // filter out just Japan
      const mapJapan = d.features.filter(el => el.properties.name == 'Japan')
      setMapData(mapJapan)
    })

  }, [])

  /// D3 Code ///
  useEffect(() => {

    if (data && mapData) {
        // get the data for the currently selected earthquake 
        const deathsData = _.find(data, { 'name': selectedEarthquake});
        console.log(selectedEarthquake)
        // reorder the data so that the selected earthquake is on top - this helps with the appending of elements
        let dataOrdered = [...data];
        dataOrdered = dataOrdered.filter(d => d !== deathsData)
        dataOrdered.push(deathsData)

        /// SCALES ///
        // Deaths Scale - map x number of deaths to one circle; start from 1 circle = 1000 deaths
        const deathsToCircles = numDeaths => Math.round(numDeaths/1000)
        // Magnitude Scale - use power scale because of the nature of magnitude increase
        const magnitudeScale = (rawMagnitude) => {
            const power = 2; // if 2 then each is 4 times sctronger than the previous 
            const scale = fitToScreenFactor; // so that we can fit it into the screen
            return Math.pow(power, rawMagnitude) / scale
          }
        const magnitudeScaleColour = chroma.scale([magnitudeMinColour, magnitudeMaxColour]
            .map(color => chroma(color).saturate(0)))
            .domain([6, d3.max(data, d => d.magnitude)])  

        /// Width of the max magnitude in pixes //
        // Since we defined a custom scale, we need to compute the max radius of the magnitudes 
        // circle so that we can translate the center of the graph correctly
        const maxMagnitudeScaled = d3.max(data, d => magnitudeScale(d.magnitude)) * 2

        /// SVG  define ///
        // the group for the force graph with deaths circles 
        const gVictimsGraph = d3.select(victimsGraphRef.current)  
          .attr("transform", `translate(${maxMagnitudeScaled + victimsBackgroundRadius + 10}, ${maxMagnitudeScaled/2 + margin.top})`)
        // the group for the magnitudes graph 
        const gMagnitudeGraph = d3.select(magnitudeGraphRef.current) 
          .attr("transform", `translate(${maxMagnitudeScaled}, ${maxMagnitudeScaled/2 + margin.top})`)
        // map 
        const mapG = d3.select(mapRef.current)
          .attr("transform", `translate(${width/2 + mapXOffset}, ${height/2 + mapYOffset + margin.top})`)

        /// Animation ///
        const t = d3.transition().duration(500);


        ///////////////////////////////////////////////////////////////
        //////////////////// MAGNITUDES GRAPH /////////////////////////
        ///////////////////////////////////////////////////////////////

        // concentric circles with magnitude 
        const magnitudesGraph = gMagnitudeGraph
         .selectAll(".magnitude-circle")
          .data(dataOrdered) // use the ordered data so that the current earthquake is on top 
          .join("circle")
          .classed('magnitude-circle', true)
            .attr("fill", d => magnitudeScaleColour(d.magnitude))
            .attr("fill-opacity", d => d == deathsData ? 0.95 : 0.1) // currently selected earthquake is opaque
            .attr("stroke", whiteColour)
            .attr("stroke-width", d => d == deathsData ? 3 : 0) // stroke only the currently selected earthquake
            .attr("cx", d => -magnitudeScale(d.magnitude))
            .attr("r", d => d == deathsData ? 0 : magnitudeScale(d.magnitude))
            .transition(t)
                .attr("r", d => magnitudeScale(d.magnitude))

        // axis for the graph - concentric circles with the magnitudes 
        const magnitudesGraphAxis = gMagnitudeGraph         
          .selectAll(".magnitude-circle-axis")
          .data(magnitudes)
          .join("circle")
          .classed('magnitude-circle-axis', true)
            .attr("fill", 'none')
            .attr("stroke", whiteColour)
            .attr("stroke-dasharray", '1 2')
            .attr("stroke-opacity", 0.5)
            .attr("cx", d => -magnitudeScale(d))
            .attr("r", d => magnitudeScale(d));

        // magnitude numbers on the axis 
        const magnitudesGraphAxisText = gMagnitudeGraph         
            .selectAll(".magnitude-circle-axis-text")
            .data(magnitudes.slice(2))
            .join("text")
            .classed('magnitude-circle-axis-text ', true)
            .attr("x", d => -2 * magnitudeScale(d))
            //.attr("dx", "-1.2em")
            .attr("fill", whiteColour)
            .attr("text-anchor", "middle")
            .attr("opacity", 0.5)
            .text(d => d);

        // text in the middle of magnitude circle with magnitude 
        const magnitudeText = gMagnitudeGraph         
          .selectAll(".magnitude-text")
          .data(dataOrdered)
          .join("text")
          .classed('magnitude-text', true)
            .attr("fill", whiteColour)
            .attr("x", d => -magnitudeScale(d.magnitude))
            .attr("y", d => -magnitudeScale(d.magnitude))
            .attr("font-size", '20px')
            .attr("dy", "-0.6em")
            .style("text-anchor", 'middle')
            .text(d => "M" + d.magnitude)
            .attr("opacity", d => d == deathsData ? 1 : 0) // only the currently selected one is visible


        ///////////////////////////////////////////////////////////////
        /////////////////////////// MAP ////////////////////////////////
        ///////////////////////////////////////////////////////////////

        // projection for Japan (centered at Japan)
        const projection = d3.geoMercator()
          .center([125, 47]) // GPS of location to zoom on
          .scale(mapZoom)  // This is like the zoom
          .translate([0,0])

        // append the map of Japan
        const mapJapan = mapG.selectAll(".map-japan-g").data([0]).join("g").classed("map-japan-g", true)    
          .selectAll("path")
          .data(mapData)
          .join("path")
            .attr("d", d3.geoPath().projection(projection))
            .attr("fill", whiteColour)
            .attr("fill-opacity", 0.55)
            .style("stroke", whiteColour)
            .style("stroke-width", 0)
            .style("stroke-linejoin", "round")
            .style("stroke-linecap", "round")

      // append bubbles for the earthquakes 
      const bubblesEarthquakes = mapG.selectAll(".bubbles-earthquakes-g").data([0]).join("g")
      .classed("bubbles-earthquakes-g", true)  
        .selectAll(".bubbles-earthquakes")
        .data(dataOrdered)
        .join("circle")
        .attr("class", "bubbles-earthquakes")
          .attr("cx", d => projection([d.longitude, d.latitude])[0])
          .attr("cy", d => projection([d.longitude, d.latitude])[1])
          .attr("opacity", d => d.name == selectedEarthquake ? 1 : 0) // only show the current earthquake
          .attr("fill", d => magnitudeScaleColour(d.magnitude)) // colour it w colour of the current earthquake
          .attr("stroke", whiteColour)
          .attr("stroke-width", 2)
          .attr("r", 0)
          .transition(t)
            .attr("r", radiusEarthquakeOnMap)


        ///////////////////////////////////////////////////////////////
        ////////////////////// DEATHS GRAPH //////////////////////////
        ///////////////////////////////////////////////////////////////

        // 1. Circle around the death circles, i.e. the force graph
        const circleDeaths = gVictimsGraph
         .selectAll(".deaths-surrounding-circle")
         .data([0])
         .join("circle")
         .classed('deaths-surrounding-circle', true)
            .attr("r", victimsBackgroundRadius)
            .attr("fill", victimsColour)
            .attr("fill-opacity", 0.1)
            .attr("stroke", victimsColour)
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 1)
            .attr("stroke-dasharray", '1 2')

        // text on top of the surrouding circle displaying the number of deaths
        const circleDeathsText = gVictimsGraph         
          .selectAll(".victims-text")
          .data(dataOrdered)
          .join("text")
          .classed('victims-text', true)
            .attr("fill", victimsColour)
            .attr("x", 0)
            .attr("y", -victimsBackgroundRadius)
            .attr("font-size", '20px')
            .attr("dy", "-0.6em")
            .style("text-anchor", 'middle')
            .text(d => d3.format(",.2r")(d.deaths.toString()) + " deaths")
            .attr("opacity", d => d == deathsData ? 1 : 0) // only the currently selected one is visible

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
          .selectAll(".circle-victims")
          .data(nodes, d => d)
          .join("circle")
          .attr("class", "circle-victims")
            .attr("r", 2) // give them a fixed radius to start from 
            .attr("fill", victimsColour)
            .attr("stroke", victimsColour)
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", 4)

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
    }
  }, [data, mapData, selectedEarthquake])

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
        if (i !== 0 && i !== 12){
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
        if (i == 12){
            ScrollTrigger.create({
              //trigger: `#step-${i}`,
              trigger: steps[i].current,
              start: 'bottom bottom',
              onEnter: () => setSelectedEarthquake(`earthquake-${i}`),
              onLeaveBack: () => setSelectedEarthquake(`earthquake-${i-1}`),
              markers: false,
              id: `box-${i}`
            });
          }
      });
      steps.forEach(step => {
        // just for the last card we want to treat it differently 
        if (steps.indexOf(step) == 12) {
          ScrollTrigger.create({
            trigger: step.current,
            duration: 1,
            start: 'bottom bottom',
            end: 'center top', //center top
            toggleClass: 'active',
            markers: false,
            id: 'toggle-active-class'
            });
        } else {
          ScrollTrigger.create({
            trigger: step.current,
            duration: 1,
            start: 'top center',
            end: 'center top', //center top
            toggleClass: 'active',
            markers: false,
            id: 'toggle-active-class'
            });
        }
      }); 
  }, [data])
  


  return (
      <>
      <div id="chart-and-steps-concentric">
        <div id="chart-wrapper-concentric" >
          <svg width={width} height={height} ref={svgRef}>
            <g ref={magnitudeGraphRef}></g> 
            <g ref={magnitudesAxisRef}></g>
            <g ref={mapRef}></g>
            <g ref={victimsGraphRef}></g> 
          </svg>
        </div>
        <div id="scroll-steps-concentric">
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
      </>
    )
}

export default ConcentricCircles;