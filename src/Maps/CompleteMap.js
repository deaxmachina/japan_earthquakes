import React, { useState, useEffect } from "react";
import ReactMapGL, { Popup } from "react-map-gl";
import { json, csv } from "d3";
//import ControlPanel from "./ControlPanel";
import ControlPanelMaterial from "./ControlPanelMaterial";
import * as earthquake_data from "../data/earthquakes_min6_top1000.geojson";
import big_earthquakes from "../data/earthquakes_sample.csv";

import BigEarthquakesLayer from "./BigEarthquakesLayer";
import EarthquakeScatterLayer from "./EarthquakesScatterLayer"
import BigEarthquakePopup from "./BigEarthquakePopup";

import "./Maps.css"

// Add explanation about maps here 

/* VARIABLES */
const mapLoadLatitude = 36.2048;
const mapLoadLongitude = 138.2529;
const mapWidth = '100%';
const mapHeight = '100vh';
const mapLoadZoom =4.7;
const mapStyle = "mapbox://styles/deaxmachina/ckeu39j8b06xb19r7hfionx3y/draft"

/********** HEPLER FUNCTIONS **********/

// get the min datetime from the data 
const getMinMaxDatetime = (features) => {
  const times = [];
  features.forEach(feature => times.push(feature.properties.time));
  return ({
    "minTime": Math.min(...times),
    "maxTime": Math.max(...times)
  })
}

/********** FILTERING DATA BY DATETIME **********/

function filterFeaturesByDatetimeLimit(featureCollection, datetime) {
  // convert datetime that was passed to standard JS datetime format
  const date = new Date(datetime);
  // filter out the datetimes from dataset which match the datetime passed
  const features = featureCollection.features.filter(feature => {
    const featureDate = new Date(feature.properties.time);
    return (
      featureDate <= date
    );
  });
  return {type: "FeatureCollection", features};
};


const CompleteMap = () => {

  const [viewport, setViewport] = useState({
    latitude: mapLoadLatitude,
    longitude: mapLoadLongitude,
    width: mapWidth,
    height: mapHeight,
    zoom: mapLoadZoom
  });

  const current = new Date().getTime();

  // for all the earthquakes 
  const [data, setData] = useState(earthquake_data);
  const [allTime, setallTime] = useState(true);
  const [startTime, setStartTime] = useState(current);
  const [endTime, setEndTime] = useState(current);
  const [selectedTime, setSelectedTime] = useState(current)
  const [earthquakes, setEarthquakes] = useState(null);

  // set data for the big earthquakes
  const [bigEarthquakes, setBigEarthquakes] = useState(null);
  const [bigEarthquakesData, setBigEarthquakesData] = useState(null);
  const [selectMajorEarthquakes, setSelectMajorEarthquakes] = useState(true)
  

  // read in data for big earthquakes 
  useEffect(() => {
    csv(big_earthquakes).then(d => {
      setBigEarthquakes(d)
      setBigEarthquakesData(d)
    })
  }, [])

  // read in data for all the earthquakes 
  useEffect(() => {
    json(
      data
      ).then(function(response) {
        const features = response.features;
        const minMaxTime = getMinMaxDatetime(features)
        const dataEndTime = minMaxTime.maxTime;
        const dataStartTime = minMaxTime.minTime;
        setEarthquakes(response);
        //setData(response)
        setStartTime(dataStartTime);
        setEndTime(dataEndTime)
    });
  }, [])


  // filter the data by a specified time 
  const handleChangeDay = datetime => {
    setSelectedTime(datetime)
    if (earthquakes) {
      setData(filterFeaturesByDatetimeLimit(earthquakes, selectedTime))
    }
  };

  // filter data by all time 
  const handleChangeallTime = allTime => {
    setallTime(allTime);
      allTime 
      ? setData(earthquakes)
      : setData(filterFeaturesByDatetimeLimit(earthquakes, selectedTime))
  }

  // select the major earthquakes 
  const handleMajorEarthquakes = (selected) => {
    setSelectMajorEarthquakes(selected)
    if (selected){
      setBigEarthquakes(bigEarthquakesData)
      if (!allTime && !selectedTime){
        setData(null)
      }
    } else {
      setBigEarthquakes(null)
    }

  }

  /// manage the zoom options /// 
  const [settings, setsettings] = useState({
    dragPan: false,
    dragRotate: false,
    scrollZoom: false,
    touchZoom: true,
    touchRotate: true,
    keyboard: true,
    doubleClickZoom: true,
    doubleClickZoomOut: true
    });


  return (
    <div className="map-container">
      <ReactMapGL 
        {...viewport} 
        {...settings} 
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        //mapboxApiAccessToken={REACT_APP_MAPBOX_TOKEN}
        mapStyle={mapStyle}
        onViewportChange={viewport => {
          setViewport(viewport)
        }}
      >
        <EarthquakeScatterLayer 
          data={data}
        />
        <BigEarthquakesLayer 
          bigEarthquakes={bigEarthquakes}
        />

      </ReactMapGL>
      <ControlPanelMaterial
          startTime={startTime}
          endTime={endTime}
          selectedTime={selectedTime}
          allTime={allTime}
          onChangeDay={handleChangeDay}
          onChangeallTime={handleChangeallTime}
          handleMajorEarthquakes={handleMajorEarthquakes}
          selectMajorEarthquakes={selectMajorEarthquakes}
        />
    </div>
  )
}

export default CompleteMap;