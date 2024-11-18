# Air Quality Monitoring Website

This website provides real-time air quality index (AQI) data along with historical trends, allowing users to monitor environmental factors that impact air quality, such as temperature and humidity. Built using OpenWeatherMap and WAQI APIs, this project includes data visualization powered by Chart.js.

## Table of Contents
- [Features](#features)
- [Technologies and Libraries Used](#technologies-and-libraries-used)
- [Running the Application](#running-the-application)
- [Simulation Process](#simulation-process)
- [Future Improvements](#future-improvements)

## Features
- **Real-Time AQI Data**: Access live AQI data from various locations using the WAQI API.
- **Historical Data Visualization**: View past air quality data to observe trends.
- **AQI vs. Temperature/Humidity Analysis**: Compare AQI values with environmental factors such as temperature and humidity.
- **Country and City Dropdowns**: Select specific locations to view air quality data.
- **User-Friendly Interface**: An intuitive layout and navigation make it easy for users to monitor air quality data.
- **Responsive Design**: The website is designed to be fully responsive.

## Technologies and Libraries Used
- **HTML/CSS/JavaScript**: For website structure, styling, and interactivity.
- **Chart.js**: Used to create dynamic charts for AQI data visualization and trend analysis.
- **OpenWeatherMap and WAQI APIs**: APIs that provide real-time and historical air quality and weather data.
- **CountryStateCity API**: API that provide all Countries, States, Cities with ISO2, ISO3, Country Code, Phone Code, Capital, Native Language, Time zones, Latitude, Longitude, Region, Subregion, Flag Emoji, and Currency.
- **jQuery**: A JavaScript library for simplifying DOM manipulation and event handling.
- **Bootstrap**: A front-end framework for responsive web design and components.
- **FontAwesome**: A library for scalable vector icons used for enhanced UI elements.

## Running the Application
1. **Access the Website**: Open your web browser and navigate to the hosted website URL, or run the local server and open `http://localhost:3000` if running locally.
2. **Select Location**: Use the dropdown menus to choose a country and city to view specific air quality data.
3. **View Charts**: Navigate to the `AQI vs Temperature or Humidity` tab to compare AQI data with environmental conditions.

## Simulation Process
The application simulates real-time data monitoring by fetching data from external APIs at regular intervals. The main steps in the simulation process are:
1. **Fetching Data**: The site sends requests to the WAQI and OpenWeatherMap APIs to retrieve current AQI, temperature, and humidity data for the selected location.
2. **Updating Charts**: The data is processed and displayed through Chart.js to show AQI changes over time, along with comparisons to temperature or humidity values.
3. **Historical Data**: For past AQI trends, the site retrieves historical data from the APIs and visualizes it to help users analyze patterns and changes in air quality over time.

## Future Improvements
- **Expanded Location Options**: Add more countries and cities to enhance coverage.
- **Improved Visualizations**: Explore D3.js or more complex visualizations for richer data insights.
- **User Notifications**: Implement alerts for critical AQI levels.

---

Enjoy monitoring and analyzing air quality with this project!
