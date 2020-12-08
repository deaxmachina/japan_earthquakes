import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import _ from "lodash";
import "./PinnedCircle.css";
import dataLoad from "../../data/earthquakes_sample.csv"
import InfoCard from "./InfoCard";


const PinnedCircle = () => {
  /// refs ///
  const svgRef = useRef();
  const gRef = useRef();

  /// Dimensions ///
  const width = 800;
  const height = width;
  const outerRadius = 380;
  const margin = {top: 10, bottom: 10, right: 10, left: 10}
  // for the colours of the magnitude colour scale
  const lowMagColour = "#127475"//  good blue - "#127475", good red - "#c71f37"
  const highMagColour = "#370617"
  const whiteColour = "#fffcf2";
  // if you want to set the max deaths for the graph manually 
  const maxDeaths = 25000

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
          element.value = element.deaths / 1.2
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
    gsap.registerPlugin(ScrollTrigger);

    /// SCALES ///
    // Y Scale - for the cirlces 
    const y = d3.scaleSqrt() //d3.scaleLinear()
      // filter out the Kanto earthquake and max is the second largest one 
      //.domain([0, d3.max(_.filter(data, d => d.nameEnglish !== kanto), d => d.value)]) // use this if you don't want the scale to jump when data changes 
      .domain([0, d3.max(data, d => d.value)]) // use this if you don't want the scale to jump when data changes       
      //.domain([0, maxDeaths])
      .range([0, outerRadius])

    // For the earthquake magnitude 
    const magnitudeScale =  d3.scaleLinear() 
        .domain(d3.extent(data, d => d.magnitude)) // or change to have a smallest value 
        .range([0, 1])
    const interpolator = d3.interpolateRgb(lowMagColour, highMagColour);
    // add  the colour as part of the data - this makes it easier for the gradients later 
    data.forEach(d => {
      d.colour =interpolator(magnitudeScale(d.magnitude)) 
    })

    /// SVG  define ///
    const svg = d3.select(gRef.current) // note that overflow prop is set in the css 
      .style("font", "10px sans-serif")

    /// LEGEND ///
    // Legend for the magnitudes (colour)
    const legendWidth = 300;
    const minMag = d3.min(data, d => d.magnitude)
    const maxMag = d3.max(data, d => d.magnitude)
    const legend = svg.append("g")
      .attr("transform", `translate(${width / 2 - legendWidth/2}, ${height + 20})`)
    // the title of the legend 
    legend.append("text")
      .attr("x", legendWidth/2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "14px")
      .attr("fill", whiteColour)
      .text("magnitude")
    // the actual coloured legend
    legend.append("rect")  
      .attr("width", legendWidth)
      .attr("height", 20)
      .style("fill", "url(#legend-gradient)");
    // the min and max magnidute at each end of the colour legend 
    legend.append("text")
      .attr("x", -28)
      .attr("y", 10)
      .attr("dy", "0.35em")
      .attr("font-size", "14px")
      .attr("fill", whiteColour)
      .text(minMag)
    legend.append("text")
      .attr("x", legendWidth + 10)
      .attr("y", 10)
      .attr("dy", "0.35em")
      .attr("font-size", "14px")
      .attr("fill", whiteColour)
      .text(maxMag)

    /// GRAPH ///
       
    /// GRADIENTS AND PATTERNS ///
    //Append a defs (for definition) element to SVG
    var defs = svg.append("defs");
    // radial gradient for the circle 
    function getRadialGradient(startColor, endColor, id){
      const radialGradient = defs.append("radialGradient")
          .attr("id", id)
      //Set the color for the start (0%)
      radialGradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", startColor); 
      //Set the color for the end (100%)
      radialGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", endColor); 
      return radialGradient
    }
    // need a different gradient depending on the colour of the element 
    const radialGradients = []
    data.forEach((d, i) => {
      radialGradients.push(getRadialGradient(d.colour, "black", `radial-gradient-${d.name}`))
    })

    // striped pattern //
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

    // linear gradient for the magnitude legend // 
    function getLinearGradient(startColor, endColor, id){
      const linearGradient = defs.append("linearGradient")
        .attr("id", id)
      //Set the color for the start (0%)
      linearGradient.append("stop") //why is this a stop and not a start? 
        .attr("offset", "0%")
        .attr("stop-color", startColor); 
      //Set the color for the end (100%)
      linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", endColor); 
      return linearGradient
    }
    const legendGradient = getLinearGradient(
      interpolator(magnitudeScale(d3.min(data, d => d.magnitude))),
      interpolator(magnitudeScale(d3.max(data, d => d.magnitude))),
      "legend-gradient"
     )

    // Draw the graph // 
    // animation for transitioning the radial bars 
    const t = d3.transition().duration(1000);
    // cirlce graph 
    const graphDraw = svg.select(".graph")
      .selectAll("circle")
      .data([_.find(data, { 'name': selectedEarthquake})])
      .join("circle")
      .attr("cx", width/2)
      .attr("cy", height/2)
      //.style("fill", d => d.colour)
      .style("fill", d => `url(#radial-gradient-${d.name})`)
      .attr("opacity", 1)
      .transition(t)
      .attr("r", d => y(d.value))

    // max circle or make this the margin of error later // 
    const maxCircle = svg.select(".maxes")
      .selectAll("circle")
      //.data([d3.max(_.filter(data, d => d.nameEnglish !== kanto), d => d.value)])
      .data([d3.max(data, d => d.value)])
      //.data([maxDeaths]) // think about what this should be 
      .join("circle")
      .attr("cx", width/2)
      .attr("cy", height/2)
      .attr('fill', "url('#striped-pattern')")
      .attr("opacity", 0.1)
      .attr("r", d => y(d))

    /// AXES ///
    const yAxis = g => g
      .attr("text-anchor", "middle")
      .call(g => g.append("text")
        .attr("y", "20px")
        .attr("x", "400px")
        .attr("dy", "-1em")
        .attr("font-size", "14px")
        .attr("fill", whiteColour)
        .text("number of deaths"))
      .call(g => g.selectAll("g")
        .data(y.ticks(5).slice(1))
        .join("g")
        .attr("transform", `translate(${width/2}, ${height/2})`)
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
          .attr("stroke-width", 0)
          .attr("font-size", "12px")
          .text(y.tickFormat(5, "s"))
          .clone(true)
          .attr("fill", whiteColour)
          .attr("stroke", "none")))

    // call the axis 
    svg.append("g").call(yAxis);

    /// ANIMATION ///
    // PINNING THE CHART //
    //This pins the SVG chart wrapper when it hits the center of the viewport
    //and releases the pin when the final textbox meets the bottom of the chart
    //we use a function to define the end point to line up the bottom of the
    //text box with the bottom of the chart
    ScrollTrigger.create({
      trigger: '#chart-wrapper',
      endTrigger: `#step-${data.length - 1}`, // id of the last text box 
      start: 'center center',
      end: 'center top',
      pin: true,
      pinSpacing: false,
      id: 'chart-pin'
    });

    // animation for each of the boxes triggering a change in the graph 
    data.forEach( (d, i) => {
      if (i !== 0){
        ScrollTrigger.create({
          trigger: `#step-${i}`,
          start: 'top center',
          onEnter: () => setSelectedEarthquake(`earthquake-${i}`),
          onLeaveBack: () => setSelectedEarthquake(`earthquake-${i-1}`),
          markers: false,
          id: `box-${i}`
        });
      }
      else if(i === 0) {
        ScrollTrigger.create({
          trigger: `#step-0`,
          start: 'top center',
          onEnter: () => setSelectedEarthquake(`earthquake-0`),
          markers: false,
          id: `box-0`
        });
      } 
    });

    //sets up the class toggle on each scrolling text box
    //so that it becomes opaque when in view and transparent when exiting
    gsap.utils.toArray('.step').forEach(step => {
      ScrollTrigger.create({
        trigger: step,
        duration: 3,
        start: 'top center',
        end: 'center top',
        toggleClass: 'active',
        markers: false,
        id: 'toggle-active-class'
      });
    });
  } else {
    console.log("missing data")
  }
  }, [data, selectedEarthquake])


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
          <g id="chart-wrapper-g" ref={gRef}>
            <g className="maxes"></g>
            <g className="graph"></g>         
            <g className="y-axis"></g>
            <g className="legend"></g>
          </g>
        </svg>
        <div id="scroll-steps">
          { data 
            ? data.map((d, i) => (
              <section className="step" id={`step-${i}`}>
                <InfoCard 
                  d={d}
                />
              </section>
            ))
            : null
          }    
        </div>
      </div>
      {
        d3.range(1).map(i => (
          <h1>.</h1>
        ))
      }
    </div>
  )
};

export default PinnedCircle;