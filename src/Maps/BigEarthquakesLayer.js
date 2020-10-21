/************ LAYER COMPONENT FOR BIG CLICKABLE EARTHQUAKES WITH MARKERS ************/

import React, {useState} from "react";
import{Marker, Popup} from "react-map-gl";
import PopupInfo from "./BigEarthquakePopup";

// choose and construct the popup style 


const BigEarthquakesLayer = ({bigEarthquakes}) => {


  const [popupInfo, setPopupInfo] = useState(null)

  const onClickMarker = eq => {
    setPopupInfo({
      name: eq.name,
      date: eq.date,
      magnitude: eq.magnitude,
      deaths: eq.deaths,
      longitude: eq.longitude,
      latitude: eq.latitude
    });
  };
  const renderPopup = () => {
    return (
      popupInfo && (
        <Popup
          tipSize={5}
          anchor="top"
          longitude={+popupInfo.longitude}
          latitude={+popupInfo.latitude}
          closeOnClick={true}
          closeOnMove={true}
          onClose={() => setPopupInfo(null)}
          >
            <PopupInfo 
              info={popupInfo}
            />
        </Popup>
      )
    )
  }
  return (
    <>
      {
        bigEarthquakes
        ?
        bigEarthquakes.map(earthquake => (
          <Marker 
            key={earthquake.name} 
            latitude={+earthquake.latitude} 
            longitude={+earthquake.longitude}
          >
          <div 
            className="marker-btn"
            onClick={() => onClickMarker(earthquake)}
          > 
          </div>
          </Marker>  
          ))
        :null
      }
      {renderPopup()}
    </>
  )
};

export default BigEarthquakesLayer;
