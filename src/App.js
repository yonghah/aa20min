import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

import data from "./data.json";
import LocationList from "./LocationList";
import LocationForm from "./LocationForm";

mapboxgl.accessToken = 'pk.eyJ1IjoieW9uZ2hhaCIsImEiOiJjaW52MTNlbnQxM2FtdWttM2loYnljeXNvIn0.chjRTLaOQ6oIaPa0r0Ggnw';


export default function App(){
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-83.73);
  const [lat, setLat] = useState(42.28);
  const [zoom, setZoom] = useState(12);
  // const [pickMode, setPickMode] = useState(false);
  const [locationList, setLocationList] = useState(data);
  
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });
  });

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });
  });
  
  useEffect(() => {
    map.current.on('load', () =>{
      locationList.map((location) => addIsoLayer(location));
    });
  });

  useEffect(() => {
    locationList.map(loc => {
      try { 
        map.current.setLayoutProperty(
          `isoLayer_${loc.id}`,
          'visibility',
          loc.display? 'visible' : 'none'
        );
        if (loc.display) {
          map.current.setPaintProperty(
            `pointLayer_${loc.id}`,
            'text-opacity', 0.9);
        } else {
          map.current.setPaintProperty(
            `pointLayer_${loc.id}`,
            'text-opacity', 0.1);
        }
      } catch (err) {}
    });
  });

  // useEffect(()=>{
  //   map.current.on('click', (e) =>{
  //     // if (pickMode) {
  //       console.log(e.lngLat);
  //       let newLoc = {
  //         'lon': e.lngLat.lng,
  //         'lat': e.lngLat.lat,
  //         'desc': "UserLocation"
  //       };
  //       console.log(newLoc);
  //       console.log(locationList.length);
  //       addLocation(newLoc);
  //     // }
  //   });//
  // });

  const handleToggle = (id) => {
    let mapped = locationList.map(loc => {
      return loc.id === Number(id) ? {...loc, display: !loc.display} : {...loc};
    });
    setLocationList(mapped);
  }

  const addIsoLayer = (location) => {
    map.current.addSource(`iso_${location.id}`,{
      type: 'geojson',
      data: {
        'type': 'FeatureCollection',
        'features': []
      }
    });
    map.current.addLayer({
      'id': `isoLayer_${location.id}`,
      'type': 'fill',
      'source': `iso_${location.id}`,
      'paint': {
        'fill-color': '#6a3fe0',
        'fill-opacity': 0.25
      }
    }, 'poi-label');

    getIso(location, `iso_${location.id}`);
    
    map.current.addSource(`point_${location.id}`,{
      type: 'geojson',
      data: {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [location.lon, location.lat]
          },
          'properties': {
            'id': location.id,
            'desc': location.desc
          }
        }]
      }
    });
    
    map.current.addLayer({
      'id': `pointLayer_${location.id}`,
      'type': 'symbol',
      'source': `point_${location.id}`,
      'layout': {
        'text-field': ['get', 'id'],
        'text-size': 13,
        'text-allow-overlap': true
      },
      'paint': {
        'text-opacity': 0.9
      }
    });
  }

  const getIso = (lngLat, layer) => {
    var urlBase = 'https://api.mapbox.com/isochrone/v1/mapbox/';
    var profile = 'walking';
    var minutes = 20;
    
    var query =
      urlBase +
      profile +
      '/' +
      lngLat['lon'] +
      ',' +
      lngLat['lat'] +
      '?contours_minutes=' +
      minutes +
      '&polygons=true&access_token=' +
      mapboxgl.accessToken;

    fetch(query)
    .then(function(response) {
        return response.json();
    })
    .then(r => {
        map.current.getSource(layer).setData(r);
    });
  }

  const addLocation = (loc) => {
    let newLocation = {
      'id': locationList.length,
      'display': true,
      "lon": loc.lon, "lat": loc.lat,
      "desc": loc.desc 
    };
    addIsoLayer(newLocation);
    let copy = [...locationList];
    copy = [...copy, newLocation];
    setLocationList(copy);
  };
  
  // const handleClick = (e) => {
  //   let p = !pickMode;
  //   setPickMode(p);
  // }


  return (
    <div>
      <div className="sidebar">
        <h3 > Ann Arbor areas <br/> 
            within 20-minute <br/>
            walking distance <br/>
            to grocerie stores</h3>
        <LocationList locationList={locationList} handleToggle={handleToggle}/>
        {/* <button onClick={handleClick}>{pickMode ? 'Pick a location' : 'Click to pick'}</button> */}
        <LocationForm addLocation={addLocation} map={map}/>
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );

};
