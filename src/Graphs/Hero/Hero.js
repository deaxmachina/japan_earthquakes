import React from "react";
import "./Hero.css";

const Hero = () => {

  return (
    <>
    <section id="hero">
      <h1 className="hero-heading">Earthaquke Disasters in Japan</h1> 
      <h2 className="hero-subheading"> in the last 1000 years</h2>  
      <div class="pulsating-circle"></div> 
      <p className="hero-explanation">
          There have been many devstating earthquakes in Japanese history. 
          How does the damage done and number of casualties compare over time? 
          Were the largest earthquakes the most destructive, or are there other factors at play? 
          Are the improved building stardards helping reduce the amount of destruction done 
          by large earthquakes? We examine below the earthquakes over the last 1000 years with 
          recorded victims over 5000 people. 
        </p>
        <p className="hero-disclaimer">best viewed on a desktop-sized screen, Chrome browser</p>
    </section>
    </>
  )
}

export default Hero;