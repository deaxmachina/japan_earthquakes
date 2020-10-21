import React from "react";
import {Source, Layer} from "react-map-gl";
import { scatterLayer } from "./layers";


const EarthquakeScatterLayer = ({data}) => {

  return (
    <>
        {data && (
            <Source type="geojson" data={data}>
              <Layer {...scatterLayer} />            
            </Source>
        )}
    </>
  )

}

export default EarthquakeScatterLayer;