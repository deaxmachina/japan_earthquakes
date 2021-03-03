import React from "react";
import * as d3 from "d3";
import "./ConcentricCircles.css";

const InfoCard = (props) => {
  return (
    <>
      <div className="info-year">{props.d.date.split(",")[1]}</div>
      <div className="info-card">
        <p className="earthquake-name">{props.d.nameEnglish.slice(props.d.nameEnglish.indexOf(' ') + 1)}</p>
        <p className="earthquake-name-ja">{props.d.nameJapanese}</p>
        <hr></hr>
        <p className="earthquake-date">{props.d.date}</p>
        <p className="magnitude"><span>magnitude:</span> <span className="number">{props.d.magnitude}</span></p>
        <p className="deaths"><span>deaths: </span><span className="number">{d3.format(",.2r")(props.d.deaths)}</span></p>
      </div>
    </>
  )
};

export default InfoCard