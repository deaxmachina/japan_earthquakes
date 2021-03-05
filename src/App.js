import React, { useLayoutEffect, useState } from "react";
import "./App.css";
import CompleteMap from "./Maps/CompleteMap";
//import PinnedCircle from "./Graphs/PinnedCircle/PinnedCircle";
//import PinnedVictimsMagnitude from "./Graphs/PinnedVictimsMagnitude/PinnedVictimsMagnitude"
import ConcentricCircles from "./Graphs/ConcentricCircles/ConcentricCircles"
import Hero from "./Graphs/Hero/Hero";
import Legend from "./Graphs/ConcentricCircles/Legend";

const App = () => {

  // For responsive graphs
  function useWindowSize() {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
      function updateSize() {
        setSize([window.innerWidth, window.innerHeight]);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
  }

  // get the width and height of the window 
  const [windowWidth, windowHeight] = useWindowSize();

  return (
    <>
      <Hero />
      <Legend />
      <ConcentricCircles 
        width={windowWidth > 1000 ? 1000 : windowWidth > 600 ? 800 : 360}
        fitToScreenFactor={windowWidth > 1000 ? 1.95 : windowWidth > 600 ? 3 : 5}
        victimsBackgroundRadius={windowWidth > 1000 ? 150 : windowWidth > 600 ? 80 : 50}
        victimsRadius={windowWidth > 1000 ? 9 : windowWidth > 600 ? 4 : 2}
        mapZoom={windowWidth > 1000 ? 600 : windowWidth > 600 ? 400 : 200}
        mapXOffset={windowWidth > 1000 ? -530 : windowWidth > 600 ? -400 : -170}
      />
    </>
    
  )
}



export default App;