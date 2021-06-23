import React from 'react';
import Location from './Location';

const LocationList = ({locationList, handleToggle}) => {
    return (
        <div>
            {locationList.map((location, idx) => {
                return (
                    <Location key={idx} location={location} handleToggle={handleToggle}/>
                )
            })}
        </div>
    )
};

export default LocationList;