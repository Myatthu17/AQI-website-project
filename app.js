$(document).ready(function() {
    let lastHomeTabUpdate = new Date().getTime();
    // Handle tab switching
    $('.menu-item').on('click', function(event) {
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
            if ((currentTime - lastHomeTabUpdate) > 1000*60*10) {
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
    let chartInstanceLive = null;
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
        $liveAQIContainer.removeClass(function(index, className) {
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
        if (chartInstanceLive) {
            // Update the existing chart if it exists
            chartInstanceLive.data.datasets[0].data = pollutantData;
            chartInstanceLive.update();
        } else {
            chartInstanceLive = new Chart($('#pollutantLiveChart'), {
                type: 'bar',
                data: {
                    labels: ['CO', 'NO', 'NO₂', 'O₃', 'SO₂', 'PM₂.₅', 'PM₁₀', 'NH₃'],
                    datasets: [{
                        label: "Concentration (µg/m³)",
                        data: pollutantData,
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'x',
                    plugins: {
                        title: {
                            display: true,
                            text: "Pollutants Concentration"
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
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

let chart1 = null;
function updateSummaryPollutantChart(components) {
    let data = Object.values(components).map(p => p.v);

    if(chart1) {
        chart1.data.datasets[0].data = data;
        chart1.update();
    } else {
        chart1 = new Chart($('#summaryPollutantChart'), {
            type: 'bar',
            data: {
                labels: ['CO', 'NO₂', 'O₃', 'PM₁₀', 'PM₂.₅', 'SO₂'],
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',  // CO
                        'rgba(54, 162, 235, 0.5)',  // NO2
                        'rgba(75, 192, 192, 0.5)',  // O3
                        'rgba(153, 102, 255, 0.5)', // PM10
                        'rgba(255, 159, 64, 0.5)',  // PM2.5
                        'rgba(255, 206, 86, 0.5)'   // SO2
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: "Pollutant Individual AQI"
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "IAQI"
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Pollutants'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

let chart = null;
function updatepm10LineChart(data) {
    const dateLabels = data.map(item => item.day);
    const average = data.map(item => item.avg);
    
    const ctx = $('#pm10LineChart');
    if(chart) {
        chart.data.datasets[0].data = average;
        chart.data.labels = dateLabels;
        chart.update();
    } else {
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dateLabels,
                datasets: [{
                    label: 'PM10 IAQI',
                    data: average,
                    borderColor: 'rgba(255, 99, 132, 1)',  // Line color
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',  // Fill under the line
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',  // Point color
                    pointRadius: 4,
                    tension: 0.4  // Curve the line slightly for smoother visuals
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: "PM10 IAQI"
                    },
                    legend: {
                        display: false,
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'PM10 IAQI'
                        }
                    }
                }
            }
        });
    }
}



// API call functions

// WAQI API call function
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

    return {aqiClass, aqiText, aqiTitle};
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
    $(`#country-select-${tabName}`).change(function() {
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
    $(`#state-select-${tabName}`).change(function() {
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







