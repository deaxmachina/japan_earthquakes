import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import * as chroma from "chroma-js";


const Legend = () => {

  /// refs ///
  const svgMagnitudesRef = useRef();
  const svgVictimsRef = useRef();
  const gMagnituesRef = useRef();
  const gVictimsRef = useRef();
  const gtest = useRef();

  /// states ///
  const [magnitudes, setMagnitudes] = useState([3, 4, 5, 6, 7, 8, 9])

  /// dimensions ///
  const width = 150;
  const height = 150;

  // colours 
  const magnitudeMinColour = chroma("#7d8597").brighten(0.5);
  const magnitudeMaxColour = chroma("#004666").brighten(0.1);
  const victimsColour = "#701A38"  //"#5C0A27" "#501A2D"
  const whiteColour = "#fffcf2";

  /// D3 Code ///
  useEffect(() => {

    /// Select Containers ///
    const magnitudesG = d3.select(gMagnituesRef.current)
      .attr("transform", `translate(${140}, ${70})`)
    const victimsG = d3.select(gVictimsRef.current)
      .attr("transform", `translate(${width/2}, ${height/2})`)

    ///////////////////////////////
    ////// Magnitude Circles /////
    /////////////////////////////

    // Magnitude Scale - use power scale because of the nature of magnitude increase
    const magnitudeScale = (rawMagnitude) => {
      const power = 2; // if 2 then each is 4 times sctronger than the previous 
      const scale = 8; // so that we can fit it into the screen
      return Math.pow(power, rawMagnitude) / scale
    }

    const magnitudesGraphAxis = magnitudesG         
      .selectAll(".legend-magnitude-circle-axis")
      .data(magnitudes)
      .join("circle")
      .classed('legend-magnitude-circle-axis', true)
        .attr("fill", 'none')
        .attr("stroke", whiteColour)
        .attr("stroke-dasharray", '1 1')
        .attr("stroke-opacity", 0.5)
        .attr("cx", d => -magnitudeScale(d))
        .attr("r", d => magnitudeScale(d));

    // magnitude numbers on the axis 
    const magnitudesGraphAxisText = magnitudesG         
      .selectAll(".legend-magnitude-circle-axis-text")
      .data(magnitudes.slice(4))
      .join("text")
      .classed('legend-magnitude-circle-axis-text ', true)
        .attr("x", d => -2 * magnitudeScale(d))
        .attr("font-size", '10px')
        .attr("fill", whiteColour)
        .attr("text-anchor", "middle")
        .attr("opacity", 0.5)
        .text(d => d);


    ///////////////////////////////
    //////// Victims Circle //////
    /////////////////////////////
    const victimsCircle = victimsG
    .selectAll(".victims-circle")
    .data([0])
    .join("circle")
    .classed('victims-circle', true)
      .attr("r", 20)
      .attr("fill", victimsColour)
      .attr("stroke", victimsColour)
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 10)



  }, [magnitudes])

  return (
    <>
      <section id="legend">

        <div className="legend-grid-magnitudes">
          <div className="legend-graph-wrapper-magnitudes">
            <svg ref={svgMagnitudesRef} width={width} height={height}><g ref={gMagnituesRef}></g></svg>
          </div>
          <div className="legend-explanation-magnitudes">
            <p className="legend-explanation-title-magnitudes">magnitude circles - exponentially bigger</p>
            <p className="legend-explanation-p-magnitudes">
              The Richter magnitude scale is logarithmic, meaning that each consequitive magnitude 
              represents the release of energy many times greater than the previous one (about 32 times greater). 
              For example, a magnitude 9.0 earthquake releases over a million times as much energy as a 
              magnitude 5.0 earthquake. We represeted this exponential icrease by making the radius of each 
              magnitude circle twice bigger than the preceeding one.             
            </p>
          </div>
        </div>

        <div className="legend-grid-victims">
          <div className="legend-graph-wrapper-victims">
            <svg ref={svgVictimsRef} width={width} height={height}><g ref={gVictimsRef}></g></svg>
          </div>
          <div className="legend-explanation-victims">
            <p className="legend-explanation-title-victims">one circle represents 1000 deaths </p>
            <p className="legend-explanation-p-victims">
              Numbers are approximate as they vary by source. We therefore chose a representation that shows the scale of each disaster rather than exact numbers.  
            </p>
          </div>
        </div>

      </section>
    </>
  )
};

export default Legend;