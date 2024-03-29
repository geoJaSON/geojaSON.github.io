import { lowProdData } from './lowprod.js';
import { highProdData } from './highprod.js';
import { annotationdata } from './annotation.js';
let missionAssignmentStartDate
let maxEndDate

// Line chart data source and configuration
let cumulativeData = {
    created_date: [],
    dateqacomplete: [],
    datesenttocontractor: [],
    datecontractorcomplete: []
};

Highcharts.setOptions({
    time: {
        timezoneOffset: 5 * 60
    }
});
const dateFormat = Highcharts.dateFormat,
    defined = Highcharts.defined,
    isObject = Highcharts.isObject;
Highcharts.dateFormats = {
    W: function (timestamp) {
        var date = new Date(timestamp);
        console.log(date); // Place console.log statement after a statement
        var day = date.getUTCDay(),
            diff = date.getDate() - day + (day === 0 ? 0 : 0), // adjust when day is not Sunday
            startDate = new Date(date.setDate(diff)),
            endDate = new Date(date.setDate(diff + 6)),
            startDateStr = Highcharts.dateFormat('%b %e', startDate),
            endDateStr = Highcharts.dateFormat('%b %e', endDate);
        return startDateStr + '-' + endDateStr;
    }
};
require([
    "esri/request",
    "dojo/domReady!"
], function (esriRequest) {
    $(document).ready(function () {

        function fetchTasks() {
            return new Promise((resolve, reject) => {
                const url = 'https://arcportal-ucop-corps.usace.army.mil/esf3/rest/services/TempRoofing/RoofingSyncMatrix/FeatureServer/1/query';
                esriRequest(url, {
                    responseType: "json",
                    query: {
                        where: "1=1",
                        returnGeometry: false,
                        outFields: "*",
                        f: "json"
                    }
                }).then(function (response) {
                    const fetchedTasks = response.data.features.map(function (feature) {
                        return {
                            id: feature.attributes.task_id,
                            name: feature.attributes.task_name,
                            owner: feature.attributes.owner,
                            start: feature.attributes.start_date,
                            end: feature.attributes.end_date,
                            milestone: feature.attributes.milestone,
                            description: feature.attributes.description,
                            dependency: feature.attributes.dependency,
                            colors: {
                                completed: '#ff000',
                                remaining: '#f7a35c'
                            },
                            parent: feature.attributes.parent_id,
                            y: feature.attributes.y_position,
                            completed: {
                                amount: feature.attributes.completed
                            }
                        };
                    }).sort((a, b) => a.start - b.start);
                    resolve(fetchedTasks);
                }).catch(reject);
            });
        }
        function processData(data) {
            // Process data here and push to cumulativeData
            // Please replace with your actual data processing logic
            data.features.forEach(function (feature) {
                var attr = feature.attributes;
                var dates = [
                    attr.created_date,
                    attr.dateqacomplete,
                    attr.datesenttocontractor,
                    attr.datecontractorcomplete
                ];
                dates.forEach(function (date, index) {
                    if (date) {
                        var dateObj = new Date(date);
                        var key = Object.keys(cumulativeData)[index];

                        // Round down to the nearest 6 hours
                        var hours = Math.floor(dateObj.getHours() / 24) * 1;
                        dateObj.setHours(hours);
                        dateObj.setMinutes(0);
                        dateObj.setSeconds(0);
                        dateObj.setMilliseconds(0);

                        // Find if this timestamp already exists in the array
                        var existingEntry = cumulativeData[key].find(entry => entry[0] === dateObj.getTime());

                        if (existingEntry) {
                            // If it exists, increase the count
                            existingEntry[1]++;
                        } else {
                            // If it doesn't exist, create a new entry
                            cumulativeData[key].push([dateObj.getTime(), 1]);
                        }
                    }
                });
            });

            Object.keys(cumulativeData).forEach(function (key) {
                cumulativeData[key].sort(function (a, b) {
                    return a[0] - b[0];
                });

                for (var i = 1; i < cumulativeData[key].length; i++) {
                    cumulativeData[key][i][1] += cumulativeData[key][i - 1][1];
                }
            });

            var min = cumulativeData.datecontractorcomplete[0][0];
            data = cumulativeData.datecontractorcomplete.map(function (point) {
                return [(point[0] - min) / (24 * 60 * 60 * 1000), point[1]];
            });

            // fit the data to a polynomial of degree 2 (you can adjust the degree)
            var result = regression.polynomial(data, {
                order: 2
            });

            // estimate data out 10 days
            var forecast = [];
            for (var i = 1; i <= 10; i++) {
                var futureDate = (data[data.length - 1][0] + i) * 24 * 60 * 60 * 1000 + min; // convert back to original scale and add min
                var futureValue = result.predict(data.length + i)[1]; // get y value from prediction
                forecast.push([futureDate, Math.round(futureValue)]);
            }
            // adjust forecast so it does not decrease
            for (var i = 1; i < forecast.length; i++) {
                if (forecast[i][1] < forecast[i - 1][1]) {
                    forecast[i][1] = forecast[i - 1][1];
                }
            }

            cumulativeData.forecast = forecast;

            createSecondChart();
        }

        function requestData() {
            const url = "https://arcportal-ucop-corps.usace.army.mil/esf3/rest/services/TempRoofing/BRMS/FeatureServer/0/query";
            esriRequest(url, {
                responseType: "json",
                query: {
                    f: 'json',
                    where: "workstate='Valid'",
                    outFields: 'created_date,dateqacomplete,datesenttocontractor,datecontractorcomplete',
                    returnGeometry: false
                }
            }).then(function (response) {
                processData(response.data);
            }).catch(function (error) {
                alert("Error: " + error.message);
            });
        }

        function createFirstChart() {
            let tasks; // Define tasks variable outside the promise

            function createChart() {
                missionAssignmentStartDate = tasks.find(task => task.id === 'mission_assignment').start;
                maxEndDate = tasks.reduce((max, task) => Math.max(max, task.end), 0);


                Highcharts.ganttChart('container', {
                    chart: {
                        zoomType: 'x'
                    },
                    title: {
                        text: 'Operation Blue Roof Sync Matrix'
                    },
                    exporting: {
                        enabled: false
                    },
                    credits: {
                        enabled: false
                    },
                    yAxis: {
                        type: 'category',
                        categories: ['Mission', 'Call Center', 'Assessments', 'Installations', 'Close-Out'],
                        gridLineWidth: 1,
                        gridLineColor: '#e0e0e0'
                    },

                    xAxis: [{
                        type: 'datetime',
                        gridLineWidth: 0,
                        currentDateIndicator: true,
                        min: missionAssignmentStartDate - (7 * 24 * 3600 * 1000),
                        labels: {
                            formatter: function () {
                                const days = Math.floor((this.value - missionAssignmentStartDate + (1 * 24 * 3600 * 1000)) / (24 * 3600 * 1000));
                                return days;
                            },
                            dateTimeLabelFormats: {
                                day: '%e',
                                //week: '%W'
                            }
                        }
                    }, {
                        dateTimeLabelFormats: {
                            week: '%W'
                        },
                        startOfWeek: 0
                    }],

                    tooltip: {
                        pointFormatter: function () {
                            var point = this,
                                format = '%e. %b',
                                options = point.options,
                                completed = options.completed,
                                amount = isObject(completed) ? completed.amount : completed,
                                status = ((amount || 0) * 100) + '%',
                                lines;
                            lines = [{
                                value: point.name,
                                style: 'font-weight: bold;'
                            }, {
                                title: 'Start',
                                value: dateFormat(format, point.start)
                            }, {
                                visible: !options.milestone,
                                title: 'End',
                                value: dateFormat(format, point.end)
                            }, {
                                title: 'Completed',
                                value: status
                            }, {
                                title: 'POC',
                                value: options.owner || 'unassigned'
                            }];
                            return lines.reduce(function (str, line) {
                                var s = '',
                                    style = (defined(line.style) ? line.style : 'font-size: 0.8em;');
                                if (line.visible !== false) {
                                    s = ('<span style="' + style + '">' + (defined(line.title) ? line.title + ': ' : '') + (defined(line.value) ? line.value : '') + '</span><br/>');
                                }
                                return str + s;
                            }, '');
                        }
                    },

                    accessibility: {
                        keyboardNavigation: {
                            seriesNavigation: {
                                mode: 'serialize'
                            }
                        },

                        point: {
                            descriptionFormatter: function (point) {
                                var completedValue = point.completed ? point.completed.amount || point.completed : null,
                                    completed = completedValue ? ' Task ' + Math.round(completedValue * 1000) / 10 + '% completed.' : '',
                                    dependency = point.dependency && point.series.chart.get(point.dependency).name,
                                    dependsOn = dependency ? ' Depends on ' + dependency + '.' : '';
                                return Highcharts.format(point.milestone ? '{point.yCategory}. Milestone at {point.x:%Y-%m-%d}. Owner: {point.owner}.{dependsOn}' : '{point.yCategory}.{completed} Start {point.x:%Y-%m-%d}, end {point.x2:%Y-%m-%d}. Owner: {point.owner}.{dependsOn}', {
                                    point,
                                    completed,
                                    dependsOn
                                });
                            }
                        }
                    },
                    series: [{
                        name: 'Tasks',
                        colorByPoint: true,
                        keys: ['id', 'name', 'start', 'end', 'completed', 'owner', 'dependency', 'colors', 'milestone', 'description', 'parent', 'y'],
                        data: tasks,
                        startOfWeek: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.description}',
                            color: 'black',
                            style: {
                                textOutline: false
                            }
                        }
                    }],
                    exporting: {
                        enabled: false
                    }
                });
            }

            fetchTasks()
                .then(fetchedTasks => {
                    console.log('Getting tasks...');
                    tasks = fetchedTasks; // Assign the fetched tasks to the outside variable
                    createChart(); // Call the function that relies on `tasks`
                })
                .catch(error => {
                    console.error('An error occurred while fetching tasks:', error);
                });
        }

        function createSecondChart() {
            const series1Data = lowProdData(missionAssignmentStartDate);
            const series2Data = highProdData(missionAssignmentStartDate);

            Highcharts.chart('line-chart-container', {
                chart: {
                    type: 'spline',
                    zoomType: 'x'
                },
                title: {
                    enabled: false,
                    text: null
                },
                exporting: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    type: 'datetime', // Match the xAxis type with the gantt chart
                    min: missionAssignmentStartDate - (10 * 24 * 3600 * 1000), // Match the xAxis min value with the gantt chart
                    max: maxEndDate + (1 * 24 * 3600 * 1000), // Set the max value to the maxEndDate of the gantt chart

                    tickInterval: 24 * 3600 * 1000, // Show one tick per day
                    dateTimeLabelFormats: {
                        day: '%b %e' // Format the date labels
                    }
                },
                yAxis: {
                    title: {
                        text: 'Cumulative Total'
                    },

                },
                series: [{
                    name: 'Valid',
                    type: 'areaspline',
                    data: cumulativeData.created_date,

                    color: 'rgba(0, 120, 200, 1)', // Add this line to set the stroke color of the 'Valid' series
                    fillColor: { // Add this object to set the fill gradient of the 'Valid' series
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, 'rgba(0, 120, 200, 0.5)'],
                            [1, 'rgba(0, 120, 200, 0)']
                        ]
                    }
                }, {
                    name: 'Assessed',
                    data: cumulativeData.dateqacomplete,
                    type: 'areaspline',
                    color: 'rgba(250, 250, 0, 1)', // Add this line to set the stroke color of the 'Valid' series
                    fillColor: { // Add this object to set the fill gradient of the 'Valid' series
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, 'rgba(250, 250, 0, 0.5)'],
                            [1, 'rgba(250, 250, 0, 0)']
                        ]
                    }
                }, {
                    name: 'Sent to Contractor',
                    data: cumulativeData.datesenttocontractor
                }, {
                    name: 'Installed',
                    type: 'areaspline',
                    data: cumulativeData.datecontractorcomplete,
                    color: 'green',
                    fillColor: { // Add this object to set the fill gradient of the 'Valid' series
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, 'rgba(0, 120, 0, 0.5)'],
                            [1, 'rgba(0, 120, 0, 0)']
                        ]
                    }
                }, {
                    name: 'Forecast Installs',
                    data: cumulativeData.forecast
                }, {
                    name: 'Ramp Up Low Production',

                    data: series1Data,
                    color: 'black',
                    dashStyle: 'Dash',
                    marker: {
                        enabled: false
                    }

                }, {
                    name: 'Ramp Up High Production',

                    data: series2Data,
                    color: 'gray',
                    dashStyle: 'Dash',
                    marker: {
                        enabled: false
                    }

                }],
                annotations: annotationdata,

            });
        };

        createFirstChart()
        requestData();

    });
});
