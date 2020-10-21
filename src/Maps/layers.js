export const scatterLayer = {
  id: 'clusters',
  type: 'circle',
  //source: 'earthquakes',
  paint: {
    'circle-color': "#161a1d",
    /*
    "circle-color": [
      "case",
      [">", ["get", "mag"], 7.5], "#540b0e",
      [">", ["get", "mag"], 7], "#9e2a2b",
      [">", ["get", "mag"], 6.5], "#e09f3e",
      [">", ["get", "mag"], 6], "#fff3b0",
      "white"
  ],
  */
  "circle-radius": [
    "case",
    [">", ["get", "mag"], 7.5], 15,
    [">", ["get", "mag"], 7], 10,
    [">", ["get", "mag"], 6.5], 7,
    [">", ["get", "mag"], 6], 5,
    0
],

    'circle-stroke-width': 0.0,
    'circle-opacity': 0.5,
    'circle-stroke-color': 'white',
  }
};