import React from "react";
import "./Hero.css";

const Hero = () => {

  return (
    <>
    <section id="hero">
      <h1 className="hero-heading">Earthaquke Disasters in Japan</h1> 
      <h2 className="hero-subheading"> in the last 1,000 years</h2>  
      <div class="pulsating-circle"></div> 
      <p className="hero-explanation">
          There have been many devstating earthquakes in Japanese history. 
          There are a multitude of factors at play that determine the scale of the destruction and casualties claimed 
          by these calamitous phenomena, most promimently, in the case of Japan, the risk of tsunami. 
          Magnitude alone doesn't give the full picture, as we can see on the visualisation below, in which we compare 
          the magnitude and casualities of the most destructive earthquakes in Japan over the last 1,000 years.
        </p>
    </section>
    </>
  )
}

export default Hero;