$(document).ready(function() {
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
    });

    // Call the API function within the document ready function
    updateHomeTab();

    // Function to enable city-select based on country-select
    $('#country-select').change(function() {
        // Check if a valid country is selected (not the first default option)
        if ($(this).prop('selectedIndex') > 0) {
            $('#city-select').prop('disabled', false); // Enable the city dropdown
        } else {
            $('#city-select').prop('disabled', true); // Disable the city dropdown
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

function updateSummaryPollutantChart(components) {
    let data = Object.values(components).map(p => p.v);

    chartInstance = new Chart($('#summaryPollutantChart'), {
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

function updatepm10LineChart(data) {
    const dateLabels = data.map(item => item.day);
    const average = data.map(item => item.avg);
    
    const ctx = $('#pm10LineChart');
    const chart = new Chart(ctx, {
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

// Update the live AQI tab

$('#live-search').on('click', async function() {
    const cityName = 'Busan';
    waqiData = await fetchWAQIData(cityName)
    owData = await fetchOpenWeatherAQIData(35, 129)

    const UiClass = getAQIClass(waqiData.data.aqi);
    $('#live-aqi-colour').parent().parent().addClass("bg" + UiClass.aqiClass);
    $('#live-aqi-colour').text(waqiData.data.aqi);
    $('#live-aqi-colour').next("span").text(UiClass.aqiTitle);

    // Create Bar Chart
    pollutantData = Object.values(owData.list[0].components)
    chartInstance = new Chart($('#pollutantLiveChart'), {
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
            indexAxis: 'y',
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

})

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


// Open Weather Current AQI API call function
async function fetchOpenWeatherAQIData(lat, lon) {
    const apiKey = `13bbaefcefef424a8a72452075e5e234`
    const apiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`

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

