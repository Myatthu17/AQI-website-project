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
    fetchAQIData();

});

// Function to get the AQI status and return the corresponding Bootstrap class and text
function getAQIClass(aqi) {
    let aqiClass = "";
    let aqiText = "";

    switch (aqi) {
        case 1:
            aqiClass = "text-success"; // Green (Good)
            aqiTitle = "Air quality is Good";
            aqiText = "Air quality is considered satisfactory, and air pollution poses little or no risk.";
            break;
        case 2:
            aqiClass = "text-info"; // Yellow (Fair)
            aqiTitle = "Air quality is Fair";
            aqiText = `Air quality is acceptable; however, there may be a 
                       moderate health concern for a very small number of people who are unusually sensitive to air pollution.`
            break;
        case 3:
            aqiClass = "text-warning"; // Light blue (Moderate)
            aqiTitle = "Air quality is Moderate";
            aqiText = `Air quality is acceptable; however, some pollutants may 
                       pose a moderate health risk for some people, particularly those who are sensitive to air pollution.`
            break;
        case 4:
            aqiClass = "text-danger"; // Red (Poor)
            aqiTitle = "Air quality is Poor";
            aqiText = `Air quality is unhealthy for sensitive groups, including
                     people with respiratory or heart conditions. Members of sensitive groups may experience health effects.`
            break;
        case 5:
            aqiClass = "text-darkred"; // Dark (Very Poor)
            aqiTitle = "Air quality is Very Poor";
            aqiText = `Air quality is hazardous. Everyone may begin to experience 
                        health effects, and members of sensitive groups may experience more serious health effects.`
            break;
        default:
            aqiClass = "text-secondary"; // Grey for invalid or undefined AQI
            aqiTitle = "Invalid AQI value";
            break;
    }

    return { aqiClass, aqiTitle, aqiText };
}

// API call function
function fetchAQIData() {

    const lat = 35;
    const lon = 129;
    const ApiKey = '13bbaefcefef424a8a72452075e5e234';
    const AQIapiUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${ApiKey}`;

    fetch(AQIapiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse JSON response
        })
        .then(data => {
            // Handle the data from the API
            updateAQIDisplay(data.list[0].main.aqi);
            updateSummaryPollutantChart(data.list[0].components);
        })
        .catch(error => {
            console.error("Error fetching AQI data:", error);
        });
}

// Function to update the UI with the API data
function updateAQIDisplay(aqi) {
    let result = getAQIClass(aqi);

    $('.AQI-color').addClass(result.aqiClass);
    $('.AQI-color').text(result.aqiTitle);
    $('.AQI-color').next("span").text(result.aqiText);
}

let chartInstance = null;  // Declare chartInstance globally

function updateSummaryPollutantChart(components) {
    let data = Object.values(components);
    // Destroy the previous chart instance if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create a new chart
    chartInstance = new Chart($('#summaryPollutantChart'), {
        type: 'bar',
        data: {
            labels: ['CO', 'NO', 'NO₂', 'O₃', 'SO₂', 'PM₂.₅', 'PM₁₀', 'NH₃'],
            datasets: [{
                label: "Concentration (µg/m³)",
                data: data,
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
}
