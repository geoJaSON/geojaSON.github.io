let temperature = hourlyForecastData['temperature']['values'].map(item => {
    let date = new Date(item.validTime.split("/")[0]); // Parsing the date
    return [date.getTime(), item.value];
});
let maxtemperature = hourlyForecastData['maxTemperature']['values'].map(item => {
    let date = new Date(item.validTime.split("/")[0]); // Parsing the date
    return [date.getTime(), item.value];
});
let skyCover = hourlyForecastData['skyCover']['values'].map(item => {
    let date = new Date(item.validTime.split("/")[0]); // Parsing the date
    return [date.getTime(), item.value];
});
let windSpeed = hourlyForecastData['windSpeed']['values'].map(item => {
    let date = new Date(item.validTime.split("/")[0]); // Parsing the date
    return [date.getTime(), item.value];
});
let windGust = hourlyForecastData['windGust']['values'].map(item => {
    let date = new Date(item.validTime.split("/")[0]); // Parsing the date
    return [date.getTime(), item.value];
});
let probabilityOfPrecipitation = hourlyForecastData['probabilityOfPrecipitation']['values'].map(item => {
    let date = new Date(item.validTime.split("/")[0]); // Parsing the date
    return [date.getTime(), item.value];
});
let quantitativePrecipitation = hourlyForecastData['quantitativePrecipitation']['values'].map(item => {
    let date = new Date(item.validTime.split("/")[0]); // Parsing the date
    return [date.getTime(), item.value];
});
let iceAccumulation = hourlyForecastData['iceAccumulation']['values'].map(item => {
    let date = new Date(item.validTime.split("/")[0]); // Parsing the date
    return [date.getTime(), item.value];
});
let snowfallAmount = hourlyForecastData['snowfallAmount']['values'].map(item => {
    let date = new Date(item.validTime.split("/")[0]); // Parsing the date
    return [date.getTime(), item.value];
});
let ceilingHeight = hourlyForecastData['ceilingHeight']['values'].map(item => {
    let date = new Date(item.validTime.split("/")[0]); // Parsing the date
    return [date.getTime(), item.value];
});
let visibility = hourlyForecastData['visibility']['values'].map(item => {
    let date = new Date(item.validTime.split("/")[0]); // Parsing the date
    return [date.getTime(), item.value];
});
let grasslandFireDangerIndex = hourlyForecastData['grasslandFireDangerIndex']['values'].map(item => {
    let date = new Date(item.validTime.split("/")[0]); // Parsing the date
    return [date.getTime(), item.value];
});

Highcharts.chart('hourlyDiv', {
    chart: {
        type: 'line',
        zoomType: 'xy',
        backgroundColor: '#f9f8f800',
        width: null,
        height: null

    },
    title: {
        text: null
    },
    xAxis: {
        type: 'datetime',
        title: {
            text: 'Time'
        }
    },
    yAxis: {
        title: {
            text: 'Temp'
        }
    },
    series: [{
        name: 'Temperature',
        data: temperature,
        color: {
            linearGradient: {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: 1
            },
            stops: [
                [0, 'red'], // start with red at the top
                [1, 'blue'] // end with blue at the bottom
            ]
        },
    }]
});