import { fetchWAQIDataLatLon, fetchOpenWeatherAQIData } from "./api.js";
import { updatePollutantLiveChart} from "./chart.js";
import { getAQIClass, setupLocationDropdowns } from "./helper.js";
import { setupTabs, updateHomeTab } from "./tabs.js";


$(document).ready(function () {
    
    setupTabs();
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