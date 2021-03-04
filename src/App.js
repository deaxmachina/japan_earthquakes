import React from "react";
import "./App.css";
import CompleteMap from "./Maps/CompleteMap";
//import PinnedCircle from "./Graphs/PinnedCircle/PinnedCircle";
//import PinnedVictimsMagnitude from "./Graphs/PinnedVictimsMagnitude/PinnedVictimsMagnitude"
import ConcentricCircles from "./Graphs/ConcentricCircles/ConcentricCircles"
import Hero from "./Graphs/Hero/Hero";
import Legend from "./Graphs/ConcentricCircles/Legend";

const App = () => {
  return (
    <>
      <Hero />
      <Legend />
      <ConcentricCircles />
    </>
    
  )
}

export default App;