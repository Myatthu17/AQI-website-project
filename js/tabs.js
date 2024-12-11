import { updateSummaryPollutantChart, updatepm10LineChart, updatePollutantLiveChart, updatePollutantTrendsChart, updatePollutantConcentrationForecastChart, updateAreaHistoryChart, updateRadarCitiesChart, updateAQIComparisonChart } from "./chart.js";
import { fetchWAQIData, fetchOpenWeatherAQIData, fetchWAQIDataLatLon } from "./api.js";
import { aggregateToDailyData, getAQIClass, getComponentsAndAQI } from "./helper.js";

// Handle Tab switching
let lastHomeTabUpdate = new Date().getTime();

function setupTabs() {
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
}

// For Home Tab

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

// For Live Tab
function searchButtonLive() {
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
}

// For Forecast Tab
function updateForecastTab() {
    let waqiData;
    let owData;
    $('#search-forecast').on('click', async function() {
        let selectedElement;

        // Determine the selected element
        if ($('#city-select-forecast').prop('selectedIndex') > 0) {
            // If a city is selected
            selectedElement = $('#city-select-forecast').find(':selected');
        } else {
            // Fallback to state if no city is selected
            selectedElement = $('#state-select-forecast').find(':selected');
        }

        // Retrieve lat and lon from the selected element
        const lat = selectedElement.data('lat');
        const lon = selectedElement.data('lon');

        if (!lat || !lon) {
            alert("Latitude and longitude not available for the selected location.");
            return;
        }

        const pollutant = $('#pollutant-select-forecast').find(':selected').val();
        const interval = $('#hour-interval-select-forecast').find(':selected').val();

        // Fetch and update data
        waqiData = await fetchWAQIDataLatLon(lat, lon);
        // Pollutant concentration chart
        owData = await fetchOpenWeatherAQIData(lat, lon, "air_pollution/forecast");
        
        updatePollutantTrendsChart(waqiData, pollutant);

        updatePollutantConcentrationForecastChart(owData.list.slice(0,49), interval);
    })

    $('#pollutant-select-forecast').on('change', function() {
        let selectedpollutant = $(this).val();
        updatePollutantTrendsChart(waqiData, selectedpollutant);
    });

    $('#hour-interval-select-forecast').on('change', function() {
        let selectedinterval = $(this).val();
        updatePollutantConcentrationForecastChart(owData.list.slice(0, 49), selectedinterval);
    });
}

// For history tab
function updateHistoryTab() {
    let owData, startUnixTime, endUnixTime;


    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    // Initialize Flatpickr with range mode
    $("#date-range").flatpickr({
        mode: "range",           // Enables date range selection
        dateFormat: "Y-m-d",     // Sets the date format
        minDate: "2015-01-01",   // Minimum selectable date
        maxDate: formattedToday,   // Maximum selectable date
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length === 2) {
                startUnixTime = Math.floor(selectedDates[0].getTime() / 1000);
                endUnixTime = Math.floor(selectedDates[1].getTime() / 1000);
            } else if (selectedDates.length === 1) {
                startUnixTime = Math.floor(selectedDates[0].getTime() / 1000);
                endUnixTime = startUnixTime;
            }
        }
    });

    $('#search-history').on('click', async function() {
        let selectedElement;

        // Determine the selected element
        if ($('#city-select-history').prop('selectedIndex') > 0) {
            // If a city is selected
            selectedElement = $('#city-select-history').find(':selected');
        } else {
            // Fallback to state if no city is selected
            selectedElement = $('#state-select-history').find(':selected');
        }

        // Retrieve lat and lon from the selected element
        const lat = selectedElement.data('lat');
        let lon = selectedElement.data('lon');
        let date = `&start=${startUnixTime}&end=${endUnixTime}`;

        if (!lat || !lon) {
            alert("Latitude and longitude not available for the selected location.");
            return;
        }

        lon+=date;

        owData = await fetchOpenWeatherAQIData(lat, lon, "air_pollution/history");
        const dailyData = aggregateToDailyData(owData.list);
        updateAreaHistoryChart(dailyData);
    })
}

// For city comparison tab
function updateCityCompareTab() {
    let cityData1, cityData2;
    let cityDataExtracted1 = {
        aqi: 0,
        pm10: 0,
        pm2_5: 0,
        no2: 0,
        o3: 0,
        so2: 0
    };
    let cityDataExtracted2 = {
        aqi: 0,
        pm10: 0,
        pm2_5: 0,
        no2: 0,
        o3: 0,
        so2: 0
    };
    let cityName1 = 'City1';
    let cityName2 = 'City2';
    $('#search-compare-city1').on('click', async function() {
        let selectedElement;

        // Determine the selected element
        if ($('#city-select-compare-city1').prop('selectedIndex') > 0) {
            // If a city is selected
            selectedElement = $('#city-select-compare-city1').find(':selected');
        } else {
            // Fallback to state if no city is selected
            selectedElement = $('#state-select-compare-city1').find(':selected');
        }

        // Retrieve lat and lon from the selected element
        const lat = selectedElement.data('lat');
        const lon = selectedElement.data('lon');
        cityName1 = selectedElement.text();

        if (!lat || !lon) {
            alert("Latitude and longitude not available for the selected location.");
            return;
        }

        cityData1 = await fetchOpenWeatherAQIData(lat, lon, "air_pollution");
        cityDataExtracted1 = getComponentsAndAQI(cityData1);
        updateRadarCitiesChart(cityDataExtracted1, cityDataExtracted2, cityName1, cityName2);
        updateAQIComparisonChart(cityDataExtracted1.aqi, cityDataExtracted2.aqi, cityName1, cityName2);
    })

    $('#search-compare-city2').on('click', async function() {
        let selectedElement;

        // Determine the selected element
        if ($('#city-select-compare-city2').prop('selectedIndex') > 0) {
            // If a city is selected
            selectedElement = $('#city-select-compare-city2').find(':selected');
        } else {
            // Fallback to state if no city is selected
            selectedElement = $('#state-select-compare-city2').find(':selected');
        }

        // Retrieve lat and lon from the selected element
        const lat = selectedElement.data('lat');
        const lon = selectedElement.data('lon');
        cityName2 = selectedElement.text();

        if (!lat || !lon) {
            alert("Latitude and longitude not available for the selected location.");
            return;
        }

        cityData2 = await fetchOpenWeatherAQIData(lat, lon, "air_pollution");
        cityDataExtracted2 = getComponentsAndAQI(cityData2);
        updateRadarCitiesChart(cityDataExtracted1, cityDataExtracted2, cityName1, cityName2);
        updateAQIComparisonChart(cityDataExtracted1.aqi, cityDataExtracted2.aqi, cityName1, cityName2);
    })
}

export {setupTabs, updateHomeTab, searchButtonLive, updateForecastTab, updateHistoryTab, updateCityCompareTab};