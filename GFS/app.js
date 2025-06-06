require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/LayerList",
    "esri/widgets/Legend",
    "esri/widgets/Home",
    "esri/widgets/Popup",
    "esri/renderers/SimpleRenderer",
    "esri/renderers/UniqueValueRenderer",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/Color"
], function(Map, MapView, FeatureLayer, LayerList, Legend, Home, Popup, SimpleRenderer, UniqueValueRenderer, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, Color) {
    
    // Initialize the map
    const map = new Map({
        basemap: "topo-vector"
    });

    // Create the map view
    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-95, 30], // Center on US
        zoom: 4
    });

    // Feature service URL
    const featureServiceUrl = "https://services3.arcgis.com/Mnb1L9L8KBh57Ag4/arcgis/rest/services/HurricaneModelOutputs_view/FeatureServer";

    // Create feature layers
    const coneLayer = new FeatureLayer({
        url: featureServiceUrl + "/0",
        title: "Forecast Cone",
        visible: false,
        outFields: ["*"],
        renderer: {
            type: "simple",
            symbol: {
                type: "simple-fill",
                color: [0, 0, 0, 0.1],
                outline: {
                    color: [0, 0, 0, 0.5],
                    width: 2
                }
            }
        },
        popupTemplate: {
            title: "{name} Forecast Cone",
            content: [
                {
                    type: "fields",
                    fieldInfos: [
                        { fieldName: "total_roofs", label: "Total Residences" },
                        { fieldName: "damaged_roofs", label: "Estimated Blue Roofs" },
                        { fieldName: "total_pop", label: "Total Population" },
                        { fieldName: "ce_pop", label: "Disadvantaged Population" },
                        { fieldName: "outages_power", label: "Power Outages" },
                        { fieldName: "category", label: "Storm Category" },
                        { fieldName: "debris", label: "Estimated Debris" }
                    ]
                },
                {
                    type: "text",
                    text: "{landfall_section}"
                }
            ],
            expressionInfos: [{
                name: "landfall_section",
                title: "Landfall Information",
                expression: `
                    var location = $feature.location;
                    var forecastTime = $feature.forecast_time;
                    var windSpeed = $feature.wind_speed;
                    var gust = $feature.gust;
                    var category = $feature.storm_category;
                    
                    if (!location || !forecastTime) {
                        return "Not enough forecast data to estimate landfall";
                    }
                    
                    var landfallInfo = "Expected Landfall:\\n";
                    landfallInfo += "Location: " + location + "\\n";
                    landfallInfo += "Time: " + forecastTime + "\\n";
                    
                    if (windSpeed) {
                        landfallInfo += "Wind Speed: " + windSpeed + " mph\\n";
                    }
                    if (gust) {
                        landfallInfo += "Gusts: " + gust + " mph\\n";
                    }
                    if (category) {
                        landfallInfo += "Category: " + category;
                    }
                    
                    return landfallInfo;
                `
            }]
        }
    });

    const contourLayer = new FeatureLayer({
        url: featureServiceUrl + "/1",
        title: "Wind Contours",
        visible: true,
        renderer: {
            type: "unique-value",
            field: "category",
            defaultSymbol: {
                type: "simple-fill",
                color: [255, 255, 255, 0.5],
                outline: {
                    color: [0, 0, 0, 0.5],
                    width: 1
                }
            },
            uniqueValueInfos: [
                {
                    value: "Tropical Depression",
                    symbol: {
                        type: "simple-fill",
                        color: [0, 255, 255, 0.3],  // Cyan
                        outline: {
                            color: [0, 0, 0, 0.5],
                            width: 1
                        }
                    }
                },
                {
                    value: "Tropical Storm",
                    symbol: {
                        type: "simple-fill",
                        color: [0, 255, 0, 0.3],    // Green
                        outline: {
                            color: [0, 0, 0, 0.5],
                            width: 1
                        }
                    }
                },
                {
                    value: "Category 1",
                    symbol: {
                        type: "simple-fill",
                        color: [255, 255, 0, 0.3],  // Yellow
                        outline: {
                            color: [0, 0, 0, 0.5],
                            width: 1
                        }
                    }
                },
                {
                    value: "Category 2",
                    symbol: {
                        type: "simple-fill",
                        color: [255, 165, 0, 0.3],  // Orange
                        outline: {
                            color: [0, 0, 0, 0.5],
                            width: 1
                        }
                    }
                },
                {
                    value: "Category 3",
                    symbol: {
                        type: "simple-fill",
                        color: [255, 0, 0, 0.3],    // Red
                        outline: {
                            color: [0, 0, 0, 0.5],
                            width: 1
                        }
                    }
                },
                {
                    value: "Category 4",
                    symbol: {
                        type: "simple-fill",
                        color: [128, 0, 128, 0.3],  // Purple
                        outline: {
                            color: [0, 0, 0, 0.5],
                            width: 1
                        }
                    }
                },
                {
                    value: "Category 5",
                    symbol: {
                        type: "simple-fill",
                        color: [255, 0, 255, 0.3],  // Magenta
                        outline: {
                            color: [0, 0, 0, 0.5],
                            width: 1
                        }
                    }
                }
            ]
        },
        popupTemplate: {
            title: "Wind Speed Contour",
            content: [
                {
                    type: "fields",
                    fieldInfos: [
                        { fieldName: "contourmax", label: "Maximum Wind Speed (mph)" },
                        { fieldName: "category", label: "Storm Category" }
                    ]
                }
            ]
        }
    });

    const roofLayer = new FeatureLayer({
        url: featureServiceUrl + "/3",
        title: "Roof Damage",
        visible: false,
        popupTemplate: {
            title: "Roof Damage Estimates",
            content: [
                {
                    type: "fields",
                    fieldInfos: [
                        { fieldName: "sum_totalroofs", label: "Total Roofs" },
                        { fieldName: "sum_estroofs", label: "Estimated Damaged Roofs" },
                        { fieldName: "county_name", label: "County" },
                        { fieldName: "state_name", label: "State" }
                    ]
                }
            ]
        }
    });

    const powerLayer = new FeatureLayer({
        url: featureServiceUrl + "/2",
        title: "Power Outages",
        visible: false,
        popupTemplate: {
            title: "Power Outage Estimates",
            content: [
                {
                    type: "fields",
                    fieldInfos: [
                        { fieldName: "sum_estoutages", label: "Estimated Outages" },
                        { fieldName: "mean_totalcustomers", label: "Total Customers" },
                        { fieldName: "county_name", label: "County" },
                        { fieldName: "state_abbrv", label: "State" }
                    ]
                }
            ]
        }
    });

    const ceLayer = new FeatureLayer({
        url: featureServiceUrl + "/4",
        title: "C&E Population",
        visible: false,
        popupTemplate: {
            title: "C&E Population Impact",
            content: [
                {
                    type: "fields",
                    fieldInfos: [
                        { fieldName: "sum_totalpop", label: "Total Population" },
                        { fieldName: "sum_estpop", label: "C&E Population" },
                        { fieldName: "cf", label: "County FIPS" },
                        { fieldName: "sf", label: "State FIPS" }
                    ]
                }
            ]
        }
    });

    const debrisLayer = new FeatureLayer({
        url: featureServiceUrl + "/5",
        title: "Debris",
        visible: false,
        popupTemplate: {
            title: "Debris Estimates",
            content: [
                {
                    type: "fields",
                    fieldInfos: [
                        { fieldName: "sum_totaldebris", label: "Estimated Debris (cubic yards)" },
                        { fieldName: "qpf", label: "Precipitation (inches)" },
                        { fieldName: "veg_density_class", label: "Vegetation Density" },
                        { fieldName: "business_density_class", label: "Business Density" }
                    ]
                }
            ]
        }
    });

    const infraLayer = new FeatureLayer({
        url: featureServiceUrl + "/6",
        title: "Infrastructure",
        visible: false,
        renderer: {
            type: "unique-value",
            field: "subsector",
            defaultSymbol: {
                type: "simple-marker",
                style: "circle",
                size: 8,
                color: [128, 128, 128],
                outline: {
                    color: [0, 0, 0],
                    width: 1
                }
            },
            uniqueValueInfos: [
                {
                    value: "Cellular Tower",
                    symbol: {
                        type: "simple-marker",
                        style: "circle",
                        size: 8,
                        color: [0, 112, 255],  // Blue
                        outline: {
                            color: [0, 0, 0],
                            width: 1
                        }
                    }
                },
                {
                    value: "Fire Station",
                    symbol: {
                        type: "simple-marker",
                        style: "square",
                        size: 8,
                        color: [255, 0, 0],    // Red
                        outline: {
                            color: [0, 0, 0],
                            width: 1
                        }
                    }
                },
                {
                    value: "Treatment Plant",
                    symbol: {
                        type: "simple-marker",
                        style: "diamond",
                        size: 8,
                        color: [0, 197, 255],  // Light Blue
                        outline: {
                            color: [0, 0, 0],
                            width: 1
                        }
                    }
                },
                {
                    value: "Public School",
                    symbol: {
                        type: "simple-marker",
                        style: "triangle",
                        size: 8,
                        color: [255, 140, 0],  // Orange
                        outline: {
                            color: [0, 0, 0],
                            width: 1
                        }
                    }
                },
                {
                    value: "Hospital",
                    symbol: {
                        type: "simple-marker",
                        style: "cross",
                        size: 8,
                        color: [255, 0, 255],  // Magenta
                        outline: {
                            color: [0, 0, 0],
                            width: 1
                        }
                    }
                },
                {
                    value: "Power Station",
                    symbol: {
                        type: "simple-marker",
                        style: "x",
                        size: 8,
                        color: [255, 255, 0],  // Yellow
                        outline: {
                            color: [0, 0, 0],
                            width: 1
                        }
                    }
                },
                {
                    value: "Police Station",
                    symbol: {
                        type: "simple-marker",
                        style: "square",
                        size: 8,
                        color: [0, 0, 255],    // Blue
                        outline: {
                            color: [0, 0, 0],
                            width: 1
                        }
                    }
                },
                {
                    value: "Major Airport",
                    symbol: {
                        type: "simple-marker",
                        style: "diamond",
                        size: 8,
                        color: [128, 0, 128],  // Purple
                        outline: {
                            color: [0, 0, 0],
                            width: 1
                        }
                    }
                }
            ]
        },
        popupTemplate: {
            title: "Infrastructure Impact",
            content: [
                {
                    type: "fields",
                    fieldInfos: [
                        { fieldName: "subsector", label: "Facility Type" },
                        { fieldName: "ci_name", label: "Facility Name" },
                        { fieldName: "address1", label: "Address" },
                        { fieldName: "county_name", label: "County" },
                        { fieldName: "state", label: "State" }
                    ]
                }
            ]
        }
    });

    // Add layers to map
    map.addMany([coneLayer, contourLayer, roofLayer, powerLayer, ceLayer, debrisLayer, infraLayer]);

    // Add widgets
    const homeBtn = new Home({
        view: view
    });
    view.ui.add(homeBtn, "top-left");

    const legend = new Legend({
        view: view,
        style: {
            type: "card",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "10px"
        },
        hideLayersNotInCurrentView: true
    });
    view.ui.add(legend, "bottom-left");

    // Initialize land use chart
    let landUseChart = null;

    // Wait for view to load before adding mobile controls and initializing chart
    view.when(() => {
        // Add mobile info panel toggle
        const infoPanel = document.querySelector('.info-panel');
        const infoPanelToggle = document.createElement('button');
        infoPanelToggle.className = 'info-panel-toggle';
        document.body.appendChild(infoPanelToggle);

        infoPanelToggle.addEventListener('click', () => {
            infoPanel.classList.toggle('expanded');
        });

        // // Add share functionality
        // const shareButton = document.getElementById('shareButton');
        // shareButton.addEventListener('click', () => {
        //     const url = window.location.href;
        //     if (navigator.share) {
        //         navigator.share({
        //             title: 'Hurricane Impact Analysis',
        //             text: 'Check out this hurricane impact analysis',
        //             url: url
        //         }).catch(console.error);
        //     } else {
        //         navigator.clipboard.writeText(url).then(() => {
        //             alert('Link copied to clipboard!');
        //         }).catch(console.error);
        //     }
        // });

        // Update last updated timestamp
        // const lastUpdated = document.getElementById('lastUpdated');
        // lastUpdated.textContent = new Date().toLocaleString();

        // Initialize chart after DOM is ready
        const ctx = document.getElementById('landUseChart');
        if (ctx) {
            landUseChart = new Chart(ctx.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#e8d1d1', // Developed, Open Space
                            '#e29e8c', // Developed, Low Intensity
                            '#ff0000', // Developed, Medium Intensity
                            '#b50000', // Developed High Intensity
                            '#d2cdc0', // Barren Land
                            '#85c77e', // Deciduous Forest
                            '#85c77e', // Evergreen Forest
                            '#d4e7b0', // Mixed Forest
                            '#af963c', // Dwarf Scrub
                            '#dcca8f', // Shrub/Scrub
                            '#fde9aa', // Grassland/Herbaceous
                            '#d1d182', // Sedge/Herbaceous
                            '#fbf65d', // Pasture/Hay
                            '#ca9146', // Cultivated Crops
                            '#c8e6f8', // Woody Wetlands
                            '#64b4d6'  // Emergent Herbaceous Wetlands
                        ],
                        borderWidth: 1,
                        borderColor: '#000'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth: 15,
                                padding: 15,
                                font: {
                                    size: 11
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: ${formatNumber(value)} sq mi (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Add toggle buttons for mobile view
        const layerControls = document.querySelector('.layer-controls');
        const legendElement = document.querySelector('.esri-legend');

        if (layerControls) {
            // Create layer controls toggle button
            const layerControlsToggle = document.createElement('button');
            layerControlsToggle.className = 'layer-controls-toggle';
            layerControlsToggle.setAttribute('aria-label', 'Toggle layer controls');
            layerControls.appendChild(layerControlsToggle);

            // Add click handler for layer controls toggle
            layerControlsToggle.addEventListener('click', () => {
                layerControls.classList.toggle('expanded');
            });
        }

        if (legendElement) {
            // Create legend toggle button
            const legendToggle = document.createElement('button');
            legendToggle.className = 'legend-toggle';
            legendToggle.setAttribute('aria-label', 'Toggle legend');
            legendElement.appendChild(legendToggle);

            // Add click handler for legend toggle
            legendToggle.addEventListener('click', () => {
                legendElement.classList.toggle('expanded');
            });

            // Add collapsed class by default on mobile
            if (window.innerWidth <= 768) {
                legendElement.classList.add('collapsed');
            }
        }

        // Handle splash screen
        const splashScreen = document.getElementById('splashScreen');
        const acceptButton = document.getElementById('acceptDisclaimer');
        const dontShowAgain = document.getElementById('dontShowAgain');

        // Check if user has already accepted the disclaimer
        if (localStorage.getItem('disclaimerAccepted')) {
            splashScreen.classList.add('hidden');
        }

        acceptButton.addEventListener('click', () => {
            splashScreen.classList.add('hidden');
            if (dontShowAgain.checked) {
                localStorage.setItem('disclaimerAccepted', 'true');
            }
        });
    });

    // Layer visibility toggles
    document.getElementById("coneLayer").addEventListener("change", (e) => {
        coneLayer.visible = e.target.checked;
    });

    document.getElementById("contourLayer").addEventListener("change", (e) => {
        contourLayer.visible = e.target.checked;
    });

    document.getElementById("roofLayer").addEventListener("change", (e) => {
        roofLayer.visible = e.target.checked;
    });

    document.getElementById("powerLayer").addEventListener("change", (e) => {
        powerLayer.visible = e.target.checked;
    });

    document.getElementById("ceLayer").addEventListener("change", (e) => {
        ceLayer.visible = e.target.checked;
    });

    document.getElementById("debrisLayer").addEventListener("change", (e) => {
        debrisLayer.visible = e.target.checked;
    });

    document.getElementById("infraLayer").addEventListener("change", (e) => {
        infraLayer.visible = e.target.checked;
    });

    // Function to format numbers with commas
    function formatNumber(num) {
        if (num === undefined || num === null) return '-';
        return num.toLocaleString();
    }

    // Populate storm selector and model run selector
    coneLayer.queryFeatures({
        outFields: ["name", "modelrun", "stormnumber"],
        returnGeometry: false,
        where: "1=1"
    }).then((results) => {
        const stormSelect = document.getElementById("stormSelect");
        const modelRunSelect = document.getElementById("modelRunSelect");
        const storms = new Set();
        const modelRuns = new Set();
        
        results.features.forEach((feature) => {
            const stormName = feature.attributes.name;
            const modelRun = feature.attributes.modelrun;
            
            if (stormName && !storms.has(stormName)) {
                storms.add(stormName);
                const option = document.createElement("option");
                option.value = stormName;
                option.textContent = stormName.replace("_", " ");
                stormSelect.appendChild(option);
            }
            
            if (modelRun && !modelRuns.has(modelRun)) {
                modelRuns.add(modelRun);
            }
        });

        // Sort model runs alphabetically and add to select
        const sortedModelRuns = Array.from(modelRuns).sort();
        sortedModelRuns.forEach(modelRun => {
            const option = document.createElement("option");
            option.value = modelRun;
            option.textContent = modelRun;
            modelRunSelect.appendChild(option);
        });

        // If we have storms, select the first one
        if (storms.size > 0) {
            stormSelect.value = Array.from(storms)[0];
            stormSelect.dispatchEvent(new Event('change'));
        }

        // If we have model runs, select the last one
        if (sortedModelRuns.length > 0) {
            modelRunSelect.value = sortedModelRuns[sortedModelRuns.length - 1];
            modelRunSelect.dispatchEvent(new Event('change'));
        }
    }).catch(error => {
        console.error("Error loading storms:", error);
    });

    // Handle storm selection
    document.getElementById("stormSelect").addEventListener("change", (e) => {
        const selectedStorm = e.target.value;
        if (!selectedStorm) return;

        updateMapForSelection(selectedStorm, document.getElementById("modelRunSelect").value);
    });

    // Handle model run selection
    document.getElementById("modelRunSelect").addEventListener("change", (e) => {
        const selectedModelRun = e.target.value;
        const selectedStorm = document.getElementById("stormSelect").value;
        if (!selectedStorm) return;

        updateMapForSelection(selectedStorm, selectedModelRun);
    });

    // Function to update map and data based on selections
    function updateMapForSelection(storm, modelRun) {
        // Show loading state
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('loading');
        });

        let whereClause = `name = '${storm}'`;
        if (modelRun) {
            whereClause += ` AND modelrun = '${modelRun}'`;
        }

        // Query the cone layer for the selected storm
        coneLayer.queryFeatures({
            where: whereClause,
            outFields: ["*"],
            returnGeometry: true
        }).then((results) => {
            if (results.features.length > 0) {
                const feature = results.features[0];
                const attrs = feature.attributes;
                
                // Update summary cards with severity indicators and add click handlers
                updateCardWithSeverity("residencesCard", attrs.total_roofs, 1000);
                updateCardWithSeverity("damageCard", attrs.damaged_roofs, 100);
                updateCardWithSeverity("populationCard", attrs.total_pop, 1000);
                updateCardWithSeverity("ceCard", attrs.ce_pop, 100);
                updateCardWithSeverity("powerCard", attrs.outages_power, 100);
                updateCardWithSeverity("debrisCard", attrs.debris, 1000);

                // Add click handlers for detailed breakdowns
                addCardClickHandlers(storm, modelRun);

                // Update landfall information
                const landfallLocation = document.getElementById("landfallLocation");
                const landfallTime = document.getElementById("landfallTime");
                const landfallWind = document.getElementById("landfallWind");
                const landfallGust = document.getElementById("landfallGust");
                const landfallCategory = document.getElementById("landfallCategory");

                if (attrs.location && attrs.forecast_time) {
                    landfallLocation.textContent = attrs.location;
                    landfallTime.textContent = attrs.forecast_time;
                    landfallWind.textContent = attrs.wind_speed ? `${attrs.wind_speed} mph` : '-';
                    landfallGust.textContent = attrs.gust ? `${attrs.gust} mph` : '-';
                    landfallCategory.textContent = attrs.storm_category || '-';
                } else {
                    landfallLocation.textContent = 'Not enough forecast data';
                    landfallTime.textContent = '-';
                    landfallWind.textContent = '-';
                    landfallGust.textContent = '-';
                    landfallCategory.textContent = '-';
                }

                // Update last updated timestamp
                //document.getElementById('lastUpdated').textContent = new Date().toLocaleString();

                // Query contour layer for land use data
                contourLayer.queryFeatures({
                    where: whereClause,
                    outFields: [
                        "land_use_21_sq_miles", "land_use_22_sq_miles", "land_use_23_sq_miles", "land_use_24_sq_miles",
                        "land_use_31_sq_miles", "land_use_41_sq_miles", "land_use_42_sq_miles", "land_use_43_sq_miles",
                        "land_use_51_sq_miles", "land_use_52_sq_miles", "land_use_71_sq_miles", "land_use_72_sq_miles",
                        "land_use_81_sq_miles", "land_use_82_sq_miles", "land_use_90_sq_miles", "land_use_95_sq_miles"
                    ],
                    returnGeometry: false
                }).then((landUseResults) => {
                    updateLandUseChart(landUseResults.features);
                }).catch(error => {
                    console.error("Error querying land use data:", error);
                });

                // Zoom to the feature
                view.goTo({
                    target: feature.geometry,
                    padding: {
                        top: 50,
                        bottom: 50,
                        left: 50,
                        right: 50
                    }
                });
            }
        }).catch(error => {
            console.error("Error querying storm data:", error);
        }).finally(() => {
            // Remove loading state
            document.querySelectorAll('.card').forEach(card => {
                card.classList.remove('loading');
            });
        });

        // Update infrastructure table
        infraLayer.queryFeatures({
            where: whereClause,
            outFields: ["subsector", "name", "ci_name", "county_name", "state", "contourmax"],
            returnGeometry: false
        }).then((results) => {
            const tableBody = document.querySelector("#infrastructureTable tbody");
            tableBody.innerHTML = ''; // Clear existing rows

            // Update summary statistics
            const facilities = results.features;
            const states = new Set();
            const counties = new Set();
            const typeCounts = {};

            facilities.forEach(feature => {
                const state = feature.attributes.state;
                const county = feature.attributes.county_name;
                const type = feature.attributes.subsector;

                if (state) states.add(state);
                if (county) counties.add(county);
                if (type) {
                    typeCounts[type] = (typeCounts[type] || 0) + 1;
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${feature.attributes.subsector || '-'}</td>
                    <td>${feature.attributes.ci_name || '-'}</td>
                    <td>${feature.attributes.county_name || '-'}</td>
                    <td>${feature.attributes.state || '-'}</td>
                    <td>${feature.attributes.contourmax ? feature.attributes.contourmax + ' mph' : '-'}</td>
                `;
                tableBody.appendChild(row);
            });

            // Update summary stats
            document.getElementById("totalFacilities").textContent = facilities.length;
            document.getElementById("statesImpacted").textContent = states.size;
            document.getElementById("countiesImpacted").textContent = counties.size;

            // Update type counts
            const typeCountsContainer = document.getElementById("typeCounts");
            typeCountsContainer.innerHTML = '';
            Object.entries(typeCounts).forEach(([type, count]) => {
                const div = document.createElement('div');
                div.className = 'type-count-item';
                div.innerHTML = `${type}: <span class="count">${count}</span>`;
                typeCountsContainer.appendChild(div);
            });

            // Update state filter
            const stateFilter = document.getElementById("stateFilter");
            stateFilter.innerHTML = '<option value="">All States</option>';
            Array.from(states).sort().forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                stateFilter.appendChild(option);
            });

            // Update county filter
            const countyFilter = document.getElementById("countyFilter");
            countyFilter.innerHTML = '<option value="">All Counties</option>';
            Array.from(counties).sort().forEach(county => {
                const option = document.createElement('option');
                option.value = county;
                option.textContent = county;
                countyFilter.appendChild(option);
            });

            // Add filter event listeners
            stateFilter.addEventListener('change', filterTable);
            countyFilter.addEventListener('change', filterTable);

            function filterTable() {
                const selectedState = stateFilter.value;
                const selectedCounty = countyFilter.value;
                
                const rows = tableBody.getElementsByTagName('tr');
                Array.from(rows).forEach(row => {
                    const state = row.cells[3].textContent;
                    const county = row.cells[2].textContent;
                    
                    const stateMatch = !selectedState || state === selectedState;
                    const countyMatch = !selectedCounty || county === selectedCounty;
                    
                    row.style.display = stateMatch && countyMatch ? '' : 'none';
                });
            }
        }).catch(error => {
            console.error("Error querying infrastructure data:", error);
        });

        // Update other layers
        const layers = [contourLayer, roofLayer, powerLayer, ceLayer, debrisLayer, infraLayer];
        layers.forEach(layer => {
            layer.definitionExpression = whereClause;
        });
    }

    function updateLandUseChart(features) {
        if (!landUseChart) return;

        // Land use labels and corresponding field names
        const landUseLabels = [
            'Developed, Open Space', 'Developed, Low Intensity', 'Developed, Medium Intensity',
            'Developed High Intensity', 'Barren Land (Rock/Sand/Clay)', 'Deciduous Forest',
            'Evergreen Forest', 'Mixed Forest', 'Dwarf Scrub', 'Shrub/Scrub',
            'Grassland/Herbaceous', 'Sedge/Herbaceous', 'Pasture/Hay', 'Cultivated Crops',
            'Woody Wetlands', 'Emergent Herbaceous Wetlands'
        ];
        const landUseFields = [
            'land_use_21_sq_miles', 'land_use_22_sq_miles', 'land_use_23_sq_miles', 'land_use_24_sq_miles',
            'land_use_31_sq_miles', 'land_use_41_sq_miles', 'land_use_42_sq_miles', 'land_use_43_sq_miles',
            'land_use_51_sq_miles', 'land_use_52_sq_miles', 'land_use_71_sq_miles', 'land_use_72_sq_miles',
            'land_use_81_sq_miles', 'land_use_82_sq_miles', 'land_use_90_sq_miles', 'land_use_95_sq_miles'
        ];

        // Sum the land use areas
        const landUseSizes = landUseFields.map(field => {
            return features.reduce((sum, feature) => {
                return sum + (feature.attributes[field] || 0);
            }, 0);
        });

        // Filter out zero values
        const filteredData = landUseLabels
            .map((label, index) => ({ label, value: landUseSizes[index] }))
            .filter(item => item.value > 0);

        // Update chart data
        landUseChart.data.labels = filteredData.map(item => item.label);
        landUseChart.data.datasets[0].data = filteredData.map(item => item.value);
        landUseChart.update();
    }

    // Helper function to update cards with severity indicators
    function updateCardWithSeverity(cardId, value, threshold) {
        const card = document.getElementById(cardId);
        const valueElement = card.querySelector('p');
        valueElement.textContent = formatNumber(value);

        // Remove existing severity classes
        card.classList.remove('severe', 'moderate', 'mild');

        // Add appropriate severity class
        if (value > threshold * 2) {
            card.classList.add('severe');
        } else if (value > threshold) {
            card.classList.add('moderate');
        } else {
            card.classList.add('mild');
        }
    }

    // Function to add click handlers to summary cards
    function addCardClickHandlers(storm, modelRun) {
        const cards = {
            'residencesCard': {
                title: 'Residence Breakdown',
                query: roofLayer,
                fields: ['county_name', 'state_name', 'sum_totalroofs'],
                labels: ['County', 'State', 'Total Residences']
            },
            'damageCard': {
                title: 'Roof Damage Breakdown',
                query: roofLayer,
                fields: ['county_name', 'state_name', 'sum_estroofs'],
                labels: ['County', 'State', 'Estimated Damaged Roofs']
            },
            'populationCard': {
                title: 'Population Breakdown',
                query: ceLayer,
                fields: ['county_name', 'state_name', 'sum_totalpop'],
                labels: ['County', 'State', 'Total Population']
            },
            'ceCard': {
                title: 'Disadvantaged Population Breakdown',
                query: ceLayer,
                fields: ['county_name', 'state_name', 'sum_estpop'],
                labels: ['County', 'State', 'Disadvantaged Population']
            },
            'powerCard': {
                title: 'Power Outage Breakdown',
                query: powerLayer,
                fields: ['county_name', 'state_name', 'sum_estoutages'],
                labels: ['County', 'State', 'Estimated Outages']
            },
            'debrisCard': {
                title: 'Debris Breakdown',
                query: debrisLayer,
                fields: ['county_name', 'state_name', 'sum_totaldebris'],
                labels: ['County', 'State', 'Estimated Debris (cubic yards)']
            }
        };

        Object.entries(cards).forEach(([cardId, config]) => {
            const card = document.getElementById(cardId);
            if (card) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    showBreakdownPopup(config, storm, modelRun);
                });
            }
        });
    }

    // Function to show breakdown popup
    function showBreakdownPopup(config, storm, modelRun) {
        let whereClause = `name = '${storm}'`;
        if (modelRun) {
            whereClause += ` AND modelrun = '${modelRun}'`;
        }

        config.query.queryFeatures({
            where: whereClause,
            outFields: config.fields,
            returnGeometry: false
        }).then((results) => {
            const features = results.features;
            
            // Group data by state and county
            const groupedData = features.reduce((acc, feature) => {
                const state = feature.attributes[config.fields[1]];
                const county = feature.attributes[config.fields[0]];
                const value = Math.round(feature.attributes[config.fields[2]] || 0);

                if (!acc[state]) {
                    acc[state] = {
                        total: 0,
                        counties: {}
                    };
                }
                if (!acc[state].counties[county]) {
                    acc[state].counties[county] = 0;
                }
                acc[state].counties[county] += value;
                acc[state].total += value;
                return acc;
            }, {});

            // Sort states by total value and filter out states with zero totals
            const sortedStates = Object.entries(groupedData)
                .filter(([, stateData]) => stateData.total > 0) // Only show states with totals greater than 0
                .sort(([, a], [, b]) => b.total - a.total);

            // Create popup content
            const popup = document.createElement('div');
            popup.className = 'breakdown-popup';
            
            // Add header
            const header = document.createElement('div');
            header.className = 'breakdown-header';
            header.innerHTML = `
                <h3>${config.title}</h3>
                <button class="close-button">&times;</button>
            `;
            popup.appendChild(header);

            // Create table
            const table = document.createElement('table');
            table.className = 'breakdown-table';
            
            // Add table header
            const thead = document.createElement('thead');
            thead.innerHTML = `<tr>${config.labels.map(label => `<th>${label}</th>`).join('')}</tr>`;
            table.appendChild(thead);

            // Add table body with grouped data
            const tbody = document.createElement('tbody');
            sortedStates.forEach(([state, stateData]) => {
                // Add state row
                const stateRow = document.createElement('tr');
                stateRow.className = 'state-row';
                stateRow.innerHTML = `
                    <td colspan="2">${state}</td>
                    <td class="state-total">${formatNumber(stateData.total)}</td>
                `;
                tbody.appendChild(stateRow);

                // Add county rows
                Object.entries(stateData.counties)
                    .sort(([, a], [, b]) => b - a)
                    .filter(([, value]) => value > 0) // Only show counties with values greater than 0
                    .forEach(([county, value]) => {
                        const countyRow = document.createElement('tr');
                        countyRow.className = 'county-row';
                        countyRow.innerHTML = `
                            <td>${county}</td>
                            <td>${state}</td>
                            <td>${formatNumber(value)}</td>
                        `;
                        tbody.appendChild(countyRow);
                    });
            });
            table.appendChild(tbody);
            popup.appendChild(table);

            // Add summary statistics
            const summary = document.createElement('div');
            summary.className = 'breakdown-summary';
            
            const total = features.reduce((sum, feature) => {
                const value = feature.attributes[config.fields[2]];
                return sum + (value || 0);
            }, 0);
            
            const states = new Set(features.map(f => f.attributes[config.fields[1]]));
            const counties = new Set(features.map(f => f.attributes[config.fields[0]]));
            
            summary.innerHTML = `
                <div class="summary-item">
                    <span class="label">Total:</span>
                    <span class="value">${formatNumber(total)}</span>
                </div>
                <div class="summary-item">
                    <span class="label">States Impacted:</span>
                    <span class="value">${states.size}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Counties Impacted:</span>
                    <span class="value">${counties.size}</span>
                </div>
            `;
            popup.appendChild(summary);

            // Add to document
            document.body.appendChild(popup);

            // Add close button functionality
            const closeButton = popup.querySelector('.close-button');
            closeButton.addEventListener('click', () => {
                popup.remove();
            });

            // Close on outside click
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    popup.remove();
                }
            });
        }).catch(error => {
            console.error("Error querying breakdown data:", error);
        });
    }
}); 