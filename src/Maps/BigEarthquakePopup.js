import React from "react";
import * as d3 from "d3";

const PopupInfo = ({ info }) => {

  return (
    <>
      <h3 className="popup-header">{info.name}</h3>
      <h3 className="popup-subhead">{info.nameJapanese}</h3>
      {info.img ? <img className="popup-info-img" src={info.img}></img> : null}
      <p className="popup-info-link"><a href={info.url} target="_blank">wikipedia</a></p>
      <hr></hr>
      <p className="popup-info-date">{info.date}</p>
      <p className="popup-info-magnitude"><span>magnitude:</span> <span className="popup-number">{info.magnitude}</span></p>
      <p className="popup-info-deaths"><span>deaths: </span><span className="popup-number">{d3.format(",.2r")(info.deaths)}</span></p>
    </>
  )
}

export default PopupInfo;