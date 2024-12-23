import { setupLocationDropdowns } from "./helper.js";
import { updateForecastTab, searchButtonLive, setupTabs, updateHomeTab, updateHistoryTab, updateCityCompareTab } from "./tabs.js";


$(document).ready(function () {
    
    setupTabs();
    updateHomeTab();
    setupLocationDropdowns('live');
    setupLocationDropdowns('history');
    setupLocationDropdowns('forecast');
    setupLocationDropdowns('compare-city1');
    setupLocationDropdowns('compare-city2');
    searchButtonLive();
    updateForecastTab();
    updateHistoryTab();
    updateCityCompareTab();
});