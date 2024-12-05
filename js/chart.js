// chart functions

let chart1 = null;
let chartInstanceLive = null;
let pm10Chart = null;
let chartInstanceHistoryPollutant = null;
let pollutantForecastChart = null;

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

function updatePollutantLiveChart(pollutantData) {
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
}

function updatepm10LineChart(data) {
    const dateLabels = data.map(item => item.day);
    const average = data.map(item => item.avg);
    
    const ctx = $('#pm10LineChart');
    if(pm10Chart) {
        pm10Chart.data.datasets[0].data = average;
        pm10Chart.data.labels = dateLabels;
        pm10Chart.update();
    } else {
        pm10Chart = new Chart(ctx, {
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

function updatePollutantTrendsChart(waqiData, pollutant) {

    const data = waqiData.data.forecast.daily[pollutant];
    const dateLabels = data.map(item => item.day);
    const average = data.map(item => item.avg);
    
    if(chartInstanceHistoryPollutant) {
        chartInstanceHistoryPollutant.data.datasets[0].data = average;
        chartInstanceHistoryPollutant.data.labels = dateLabels;
        chartInstanceHistoryPollutant.update();
    } else {
        chartInstanceHistoryPollutant = new Chart($('#pollutantTrendsChart'), {
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
                        display: false,
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
                            display: false,
                            text: 'PM10 IAQI'
                        }
                    }
                }
            }
        });
    }
}

function updatePollutantConcentrationForecastChart(owData) {
    let data = [];
    for (let i = 0; i < 6; i++) {
        data.push(owData[i*4]);
    } 
    const labels = data.map(entry => new Date(entry.dt * 1000).toLocaleTimeString());
    const components = ['co', 'no', 'no2', 'o3', 'so2', 'pm2_5', 'pm10', 'nh3'];
    const datasets = components.map(component => ({
        label: component.toUpperCase(),
        data: data.map(entry => entry.components[component])
    }));

    if(pollutantForecastChart){
        pollutantForecastChart.data.labels = labels;
        pollutantForecastChart.update();
    } else {
        pollutantForecastChart = new Chart($('#pollutantConcentrationForecastChart'), {
            type: 'bar',
            data: {
                labels: labels, // Time labels
                datasets: datasets, // Data for each pollutant
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                    legend: {
                        display: true,
                        position: 'top',
                    },
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true, // Stack X-axis
                    },
                    y: {
                        stacked: true, // Stack Y-axis
                        title: {
                            display: true,
                            text: 'Concentration (µg/m³)', // Label for Y-axis
                        },
                    },
                },
            },
        });
    }
}

export{updateSummaryPollutantChart, updatePollutantLiveChart, updatepm10LineChart, updatePollutantTrendsChart, updatePollutantConcentrationForecastChart};