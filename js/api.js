// API call functions

// WAQI API call function with places
async function fetchWAQIData(place) {
    const apiKey = '51d3e7ebfc2c3ad6ba7bc300bb7940c20ddd905c';
    const AQIapiUrl = `https://api.waqi.info/feed/${place}/?token=${apiKey}`;

    try {
        const response = await fetch(AQIapiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error("Error fetching AQI data:", error);
    }
}


// WAQI API call function with lat and lon
async function fetchWAQIDataLatLon(lat, lon) {
    const apiKey = '51d3e7ebfc2c3ad6ba7bc300bb7940c20ddd905c';
    const AQIapiUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiKey}`;

    try {
        const response = await fetch(AQIapiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error("Error fetching AQI data:", error);
    }
}


// Open Weather Current AQI API call function
async function fetchOpenWeatherAQIData(lat, lon, dataName) {
    const apiKey = `13bbaefcefef424a8a72452075e5e234`
    const apiUrl = `https://api.openweathermap.org/data/2.5/${dataName}?lat=${lat}&lon=${lon}&appid=${apiKey}`

    try {
        const response = await fetch(apiUrl);
        if(!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonData = await response.json();

        return jsonData;

    } catch(error) {
        console.error("Error fetching AQI data:", error);
    }
}

export{fetchWAQIData, fetchWAQIDataLatLon, fetchOpenWeatherAQIData};