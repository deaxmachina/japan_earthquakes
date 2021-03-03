import React from "react";
import "./App.css";
import CompleteMap from "./Maps/CompleteMap";
//import PinnedCircle from "./Graphs/PinnedCircle/PinnedCircle";
//import PinnedVictimsMagnitude from "./Graphs/PinnedVictimsMagnitude/PinnedVictimsMagnitude"
import ConcentricCircles from "./Graphs/ConcentricCircles/ConcentricCircles"
import Hero from "./Graphs/Hero/Hero"

const App = () => {
  return (
    <>
      <Hero />
      <ConcentricCircles />
    </>
    
  )
}

export default App;