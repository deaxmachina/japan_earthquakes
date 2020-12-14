import React from "react";
import "./App.css";
import CompleteMap from "./Maps/CompleteMap";
import PinnedCircle from "./Graphs/PinnedCircle/PinnedCircle";
//import PinnedVictimsMagnitude from "./Graphs/PinnedVictimsMagnitude/PinnedVictimsMagnitude"

const App = () => {
  return (
    <>
      <CompleteMap />
      <PinnedCircle />
    </>
    
  )
}

export default App;