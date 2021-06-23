import React, {useState, useEffect} from 'react';

const LocationForm = ({addLocation, map}) => {
   
    const [currentLoc, setCurrentLoc] = useState({
        'lon': 0,
        'lat': 0,
        'desc': "UserLocation",
        'buttonLabel': 'N/A'
    });
    useEffect(()=>{
        if (!map.current) return;
        map.current.on('click', (e) =>{
          setCurrentLoc({
              'lon': e.lngLat.lng,
              'lat': e.lngLat.lat,
              'desc': `User ${e.lngLat.lng.toFixed(4)},${e.lngLat.lat.toFixed(4)}`,
              'buttonLabel': `Add a store @${e.lngLat.lng.toFixed(4)},${e.lngLat.lat.toFixed(4)}`
            })
        });
    });
    const handleAdd = (e) => {
        addLocation(currentLoc);
    };
    return (
        <div>
            <hr></hr>
            <p> Click on a map where <br/>you want to add a grocery store</p>
            <button onClick={handleAdd}>{currentLoc.buttonLabel}</button>
        </div>
    );
};

export default LocationForm;