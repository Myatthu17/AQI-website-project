import { updateSummaryPollutantChart, updatepm10LineChart } from "./chart.js";
import { fetchWAQIData } from "./api.js";
import { getAQIClass } from "./helper.js";

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

// For Home Tabs

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

export {setupTabs, updateHomeTab};