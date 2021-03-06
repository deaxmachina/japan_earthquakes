import React from "react";
import "./Footer.css";

const wikiLink = "https://en.wikipedia.org/wiki/List_of_earthquakes_in_Japan"

const Footer = () => {

  return (
    <>
      <div className="footer">
        <p className="data-source">
          <span>Data source: </span>
          <a href={wikiLink} target="_blank">Wikipedia</a>
        </p>
        <p>
          <span>Future directions: </span>
          This project was completed mainly as visualisation practice, but having seen the visual representation of the 
          comparison between earthquake magnitude and number of casualties raised interesting questions for me. Unfortunately, 
          I am hardly an earthquake expert, and thus I refrained from turning this into a more in-depth exploration of the 
          other factors at play. Some topics of interest for further exploration would be: depth and location of the earthquake,
          comparing the number of deaths caused by tsunami, versus fires versus the pure earthquake effects; improvements in infrastructure 
          and building standards over time in Japan; public preparedness (which has especially increased since the 2011 Tohoku disaster).
          I wish I could give these topics more attention, or as an academic would say, these are areas for future research. 
        </p>
        <p className="author"><span>Dea Bankova</span> ©2021</p>
      </div>
    </>
  )
};

export default Footer;