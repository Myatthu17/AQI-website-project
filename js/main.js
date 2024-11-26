import { fetchWAQIData, fetchWAQIDataLatLon, fetchOpenWeatherAQIData } from "./api.js";
import { updatePollutantLiveChart, updateSummaryPollutantChart, updatepm10LineChart } from "./chart.js";


$(document).ready(function () {
    let lastHomeTabUpdate = new Date().getTime();
    // Handle tab switching
    $('.menu-item').on('click', function (event) {
        event.preventDefault(); // Prevent the default link behavior

        // Remove 'active' class from all items and add to the clicked one
        $('.menu-item').removeClass('active');
        $(this).addClass('active');

        // Hide all content sections
        $('.content-section').addClass('d-none');

        // Show the target content section
        const targetId = $(this).data('target');
        $(targetId).removeClass('d-none');

        // Call updateHomeTab if Home tab is clicked and more than 15 minutes have passed
        if (targetId === '#home-content') {
            const currentTime = new Date().getTime();
            if ((currentTime - lastHomeTabUpdate) > 1000 * 60 * 10) {
                updateHomeTab();
                lastHomeTabUpdate = currentTime; // Update the last update time
            }
        }

    });

    // Call the API function within the document ready function
    updateHomeTab();

    setupLocationDropdowns('live')
    setupLocationDropdowns('history')
    setupLocationDropdowns('forecast')
    setupLocationDropdowns('compare-weather')
    setupLocationDropdowns('compare-city1')
    setupLocationDropdowns('compare-city2')
    // Update the live AQI tab
    $('#search-live').on('click', async function () {
        let selectedElement;

        // Determine the selected element
        if ($('#city-select-live').prop('selectedIndex') > 0) {
            // If a city is selected
            selectedElement = $('#city-select-live').find(':selected');
        } else {
            // Fallback to state if no city is selected
            selectedElement = $('#state-select-live').find(':selected');
        }

        // Retrieve lat and lon from the selected element
        const lat = selectedElement.data('lat');
        const lon = selectedElement.data('lon');

        if (!lat || !lon) {
            alert("Latitude and longitude not available for the selected location.");
            return;
        }

        // Fetch and update data using lat/lon
        const waqiData = await fetchWAQIDataLatLon(lat, lon);
        const owData = await fetchOpenWeatherAQIData(lat, lon, 'air_pollution');
        const weatherData = await fetchOpenWeatherAQIData(lat, lon, 'weather');

        const UiClass = getAQIClass(waqiData.data.aqi);

        // Update UI and charts
        const $liveAQIContainer = $('#live-aqi-colour').parent().parent();
        $liveAQIContainer.removeClass(function (index, className) {
            return (className.match(/(^|\s)bg\S+/g) || []).join(' ');
        });
        $liveAQIContainer.addClass("bg" + UiClass.aqiClass);

        $('#live-aqi-colour').text(waqiData.data.aqi);
        $('#live-aqi-colour').next("span").text(UiClass.aqiTitle);

        // update temp, humidity, windspeed
        const tempC = weatherData.main.temp - 273.15;
        $('#live-temperature').text(tempC.toFixed(2) + "  °C");
        $('#live-humidity').text(weatherData.main.humidity + "  %");
        $('#live-windspeed').text(weatherData.wind.speed + "  m/s");

        // update chart

        const pollutantData = Object.values(owData.list[0].components);
        updatePollutantLiveChart(pollutantData);
    });
});



// Update the home tab with AQI data
async function updateHomeTab() {
    const jsonData = await fetchWAQIData('here'); // Await the async function

    // Check if jsonData was successfully retrieved before updating the UI
    if (jsonData && jsonData.data) {
        // Handle the data from the API
        updateAQIDisplay(jsonData.data);
        updateSummaryPollutantChart(jsonData.data.iaqi);
        updatepm10LineChart(jsonData.data.forecast.daily.pm10);
    } else {
        console.error("No data available to update the home tab.");
    }
}

function updateAQIDisplay(data) {
    let result = getAQIClass(data.aqi);

    $('span.current-city').text(data.city.name);
    $('.AQI-color').addClass("text" + result.aqiClass);
    $('.AQI-color').text(result.aqiTitle);
    $('.AQI-color').next("span").text(result.aqiText);
}


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