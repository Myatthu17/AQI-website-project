import { setupLocationDropdowns } from "./helper.js";
import { updateForecastTab, searchButtonLive, setupTabs, updateHomeTab } from "./tabs.js";


$(document).ready(function () {
    
    setupTabs();
    updateHomeTab();
    setupLocationDropdowns('live');
    setupLocationDropdowns('history');
    setupLocationDropdowns('forecast');
    setupLocationDropdowns('compare-weather');
    setupLocationDropdowns('compare-city1');
    setupLocationDropdowns('compare-city2');
    searchButtonLive();
    updateForecastTab();
});