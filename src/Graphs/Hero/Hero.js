import React from "react";
import "./Hero.css";

const Hero = () => {

  return (
    <>
    {/* <div class="pulsating-circle"></div>  */}
    <section id="hero">
      <div>
        <h1 className="hero-heading">Earthquake Disasters in Japan</h1> 
        <h2 className="hero-subheading"> in the last 1,000 years</h2>  
      </div>
 
      <p className="hero-explanation">
          There have been many devastating earthquakes in Japanese history. 
          A multitude of factors determine the scale of the destruction and casualties claimed 
          by these calamitous phenomena, most prominently, in the case of Japan, the risk of tsunami. 
          Magnitude alone doesn't give the full picture, as we can see on the visualisation below, in which we compare 
          the magnitude and casualties of the most destructive earthquakes in Japan over the last 1,000 years.
        </p>
    </section>
    </>
  )
}

export default Hero;