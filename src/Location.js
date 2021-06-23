import React from 'react';

const Location = ({location, handleToggle}) => {

    const handleClick = (e) => {
        e.preventDefault()
        handleToggle(e.currentTarget.id)
    }

    return (
        <div 
            id={location.id} 
            key={location.id}
            name="location"
            value={location.id}
            onClick={handleClick}
            className={location.display ? "location" : "strike location" }>
            {location.id} {location.desc}
        </div>
    )
};

export default Location;