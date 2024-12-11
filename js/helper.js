//Helper Function

// Function to get the AQI status and return the corresponding Bootstrap class and text
function getAQIClass(aqi) {
    let aqiClass = "";
    let aqiText = "";
    let aqiTitle = "";

    if (aqi < 51) {
        aqiClass = "-success";
        aqiText = "Air quality is considered satisfactory, and air pollution poses little or no risk.";
        aqiTitle = "Air quality is Good";
    } else if (aqi < 101) {
        aqiClass = "-warning";
        aqiText = `Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very 
                    small number of people who are unusually sensitive to air pollution.`;
        aqiTitle = "Air quality is Moderate";
    } else if (aqi < 151) {
        aqiClass = "-orange";
        aqiText = `Members of sensitive groups may experience health effects. The general public is not likely to be affected.`;
        aqiTitle = "Air quality is Unhealthy for Sensitive Groups";
    } else if (aqi < 201) {
        aqiClass = "-danger";
        aqiText = `Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects`;
        aqiTitle = "Air quality is Unhealthy";
    } else if (aqi < 301) {
        aqiClass = "-purple";
        aqiText = `Health warnings of emergency conditions. The entire population is more likely to be affected.`;
        aqiTitle = "Air quality is Very Unhealthy";
    } else {
        aqiClass = "-darkred";
        aqiText = `Health alert: everyone may experience more serious health effects.`;
        aqiTitle = "Air quality is Hazardous";
    }

    return { aqiClass, aqiText, aqiTitle };
}

async function setupLocationDropdowns(tabName) {
    // Helper function to populate dropdown list
    function populateSelect(datas, $selectElement, name, includeLatLon = false) {
        $selectElement.empty().append(`<option selected>Select a ${name}</option>`);

        datas.forEach(data => {
            const attributes = {
                value: data.iso2 || data.name,
                text: data.name
            };

            if (includeLatLon) {
                attributes['data-lat'] = data.latitude;
                attributes['data-lon'] = data.longitude;
            }

            const $option = $('<option>', attributes);
            $selectElement.append($option);
        });

        $selectElement.prop('disabled', false);
    }

    // Fetch country data
    async function fetchCountryData() {
        const headers = new Headers();
        headers.append("X-CSCAPI-KEY", "OEptamRnRVc3S3JuSktJamdOZHRsOG42YW5BV2NnRU9xWlM4N0xiNA==");

        const requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };

        try {
            const response = await fetch("https://api.countrystatecity.in/v1/countries", requestOptions);
            const countries = await response.json();
            const result = countries.map(country => ({
                name: country.name,
                iso2: country.iso2
            }));
            populateSelect(result, $(`#country-select-${tabName}`), 'Country', false);
        } catch (error) {
            console.error('error', error);
        }
    }

    // Fetch state data
    async function fetchStateData(countryCode) {
        const headers = new Headers();
        headers.append("X-CSCAPI-KEY", "OEptamRnRVc3S3JuSktJamdOZHRsOG42YW5BV2NnRU9xWlM4N0xiNA==");

        const requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };

        try {
            const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}/states`, requestOptions);
            const states = await response.json();
            populateSelect(states, $(`#state-select-${tabName}`), 'State', false);
        } catch (error) {
            console.error('error', error);
        }
    }

    // Fetch city data
    async function fetchCityData(countryCode, stateCode) {
        const headers = new Headers();
        headers.append("X-CSCAPI-KEY", "OEptamRnRVc3S3JuSktJamdOZHRsOG42YW5BV2NnRU9xWlM4N0xiNA==");

        const requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };

        try {
            const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`, requestOptions);
            const cities = await response.json();
            populateSelect(cities, $(`#city-select-${tabName}`), 'City', true);
        } catch (error) {
            console.error('error', error);
        }
    }

    // Event handler for country select
    $(`#country-select-${tabName}`).change(function () {
        const countryCode = $(this).val();
        if ($(this).prop('selectedIndex') > 0) {
            fetchStateData(countryCode);
            $(`#state-select-${tabName}`).prop('disabled', false); // Enable state dropdown
        } else {
            $(`#state-select-${tabName}`).prop('disabled', true).empty().append('<option selected>Select a state</option>');
        }

        $(`#city-select-${tabName}`).prop('disabled', true).empty().append('<option selected>Select a city</option>');
    });

    // Event handler for state select
    $(`#state-select-${tabName}`).change(function () {
        const countryCode = $(`#country-select-${tabName}`).val();
        const stateCode = $(this).val();

        if ($(this).prop('selectedIndex') > 0) {
            fetchCityData(countryCode, stateCode);
            $(`#search-${tabName}`).prop('disabled', false);
        } else {
            $(`#city-select-${tabName}`).prop('disabled', true).empty().append('<option selected>Select a city</option>');
            $(`#search-${tabName}`).prop('disabled', true);
        }
    });

    // Initialize by fetching country data
    fetchCountryData();
}

// Function to add one day to a date
function addOneDay(date) {
    const newDate = new Date(date); // Copy the original date
    newDate.setUTCDate(newDate.getUTCDate() + 1); // Add one day in UTC
    return newDate;
}

function aggregateToDailyData(hourlyData) {
    const dailyData = {};
    let overallMin = Infinity; 
    let overallMax = -Infinity; 
    
    // Loop through hourly data and aggregate by day
    hourlyData.forEach(entry => {
        const date = new Date(entry.dt * 1000); // Convert UNIX timestamp to JS Date object
        
        // Add one day to the current date
        const nextDay = addOneDay(date);

        // Get the new date in YYYY-MM-DD format after adding one day
        const day = nextDay.toISOString().split('T')[0];

        if (!dailyData[day]) {
            dailyData[day] = { sum: 0, count: 0 };
        }
        
        const aqi = entry.main.aqi;
        dailyData[day].sum += aqi; // Add AQI to the sum for this day
        dailyData[day].count += 1; // Increment count for this day

        // Update overall min and max values
        if (aqi < overallMin) overallMin = aqi;
        if (aqi > overallMax) overallMax = aqi;
    });

    // Convert daily data into a format for the chart (average AQI for each day)
    const dailyChartData = Object.keys(dailyData).map(day => {
        const avgAqi = dailyData[day].sum / dailyData[day].count;
        return { date: day, aqi: avgAqi };
    });

    return {
        dailyChartData: dailyChartData,
        overallMin: overallMin,
        overallMax: overallMax
    };
}

// Extract AQI and components data for each city
const getComponentsAndAQI = (data) => {
    const components = data.list[0].components;
    return {
        aqi: data.list[0].main.aqi, // AQI value
        pm10: components.pm10,
        pm2_5: components.pm2_5,
        no2: components.no2,
        o3: components.o3,
        so2: components.so2
    };
};


export{getAQIClass, setupLocationDropdowns, aggregateToDailyData, getComponentsAndAQI};