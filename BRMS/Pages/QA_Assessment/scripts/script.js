require([
    "esri/config",
    "esri/widgets/Sketch",
    "esri/Map",
    "esri/WebMap",
    "esri/layers/GraphicsLayer",
    "esri/views/MapView",
    "esri/geometry/geometryEngine",
    "esri/identity/IdentityManager",
    "esri/request",
    "esri/views/interactive/snapping/SnappingOptions",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
], (esriConfig, Sketch, Map, WebMap, GraphicsLayer, MapView, geometryEngine, IdentityManager, esriRequest, SnappingOptions, SimpleFillSymbol, SimpleLineSymbol) => {
    esriConfig.portalUrl = "https://arcportal-ucop-corps.usace.army.mil/s0portal";
    esriConfig.request.trustedServers.push("https://arcportal-ucop-corps.usace.army.mil/s0portal");
    const graphicsLayer = new GraphicsLayer({});

    const rafterGraphicsLayer = new GraphicsLayer({});

    const purchaserRequest = esriRequest("https://arcportal-ucop-corps.usace.army.mil/esf3/rest/services/TempRoofing/BRMS/FeatureServer/0/query", {
        responseType: "json",
        query: {
            where: "roeidpk='" + roe + "'",
            outFields: "OBJECTID,roeidpk,appfirstname,applastname,appaddress,appcity,appzipcode,appcounty,appprimaryphone",
            f: "json"
        }
    });

    purchaserRequest.then(
        function (response) {

            let userId = 'g3retjjj@NWD'
            //let userId = IdentityManager.credentials[0].userId;
            
            esriRequest("https://arcportal-ucop-corps.usace.army.mil/s0portal/sharing/rest/community/users/" + userId, {
                query: {
                    f: "json",
                    token: IdentityManager.credentials[0].token // use the token from the credentials
                },
                responseType: "json"
            })
                .then(function (response) {
                    username = response.data.fullName
                })
                .catch(function (error) {
                    console.error("Error fetching user details: ", error);
                });


            console.log(IdentityManager)
            let features = response.data.features;

            if (features.length > 0) {
                roeData = features[0]
                let firstGeometry = features[0].geometry;
                let x = firstGeometry.x;
                let y = firstGeometry.y;
                console.log(x, y)
                createMapAndActions(x, y);
                var footer = document.getElementById("myFooter");
                footer.textContent = 'ROE# ' + roeData.attributes['roeidpk'] + ' - '
                    + roeData.attributes['appfirstname'] + ' ' + roeData.attributes['applastname'] + ' - '
                    + roeData.attributes['appaddress'] + ', ' + roeData.attributes['appcity'] + ', '
                    + roeData.attributes['appzipcode'] + ' - ' + roeData.attributes['appprimaryphone'];
            } else {
                console.log("No features returned, cannot generate PDF");
                let x = -94.82;
                let y = 29.27
                createMapAndActions(x, y);
            }
        },
        function (error) {
            // An error occurred during the request
            console.error("Request failed with message: ", error.message);
        }
    );

    function createMapAndActions(x, y) {

        const webmap = new WebMap({
            portalItem: {
                id: "da4e92b2209b476aaba02581bcc80b93"
            }
        });

        view = new MapView({
            container: "viewDiv",
            map: webmap,
            zoom: 20,
            center: [x, y]
        });

        view.when(() => {
            const sketch = new Sketch({
                layer: graphicsLayer,
                view: view,
                creationMode: "update",
                snappingOptions: {
                    enabled: true,
                    featureSources: [{ layer: graphicsLayer, enabled: true }, { layer: rafterGraphicsLayer, enabled: true }]
                }
            });
            const sketchRafter = new Sketch({
                layer: rafterGraphicsLayer,
                view: view,
                creationMode: "update",
                snappingOptions: {
                    enabled: true,
                    featureSources: [{ layer: graphicsLayer, enabled: true }, { layer: rafterGraphicsLayer, enabled: true }]
                }
            });
            sketch.viewModel.polygonSymbol = {
                type: "simple-fill",
                color: "rgba(255, 255, 255, 0.3)",
                style: "solid",
                outline: {
                    color: "yellow",
                    width: "2px",
                    style: "solid"
                }
            };
            sketchRafter.viewModel.polylineSymbol = {
                type: "simple-line",
                color: "red",
                width: "2px",
                style: "solid"
            };
            sketchRafter.on("create", (event) => {
                if (event.state === "complete" && event.graphic.geometry.type === "polyline") {
                    let rafter = event.graphic;
                    graphicsLayer.graphics.forEach(sketch => {
                        if (geometryEngine.intersects(rafter.geometry, sketch.geometry)) {
                            handleRafterIntersect(rafter, sketch);
                            rafter.attributes = {
                                ...rafter.attributes,
                                linkedRoofId: sketch.attributes.tabId
                            };
                        }
                    });
                }
            });

            sketchRafter.visibleElements = {
                createTools: {
                    point: false,
                    rectangle: false,
                    polygon: false,
                    circle: false
                },
                selectionTools: {
                    "lasso-selection": false,
                    "rectangle-selection": false
                },
                settingsMenu: false
            }

            sketch.visibleElements = {
                createTools: {
                    point: false,
                    polyline: false,
                    rectangle: false,
                    circle: false
                },
                selectionTools: {
                    "lasso-selection": false,
                    "rectangle-selection": false
                },

                settingsMenu: false
            }
            sketch.on("create", (event) => {
                if (event.state === "complete" && event.graphic.geometry.type === "polygon") {

                    if (event.state === "complete") {
                        let geometry = event.graphic.geometry;
                        let area = geometryEngine.geodesicArea(geometry, "square-feet");
                        if (area <= 50) {
                            area = 0;
                        }
                        let tabId = createTab(area);

                        event.graphic.attributes = {
                            tabId: tabId
                        };
                    }
                }
            });





            sketch.on("update", (event) => {
                if (event.state === "complete" && event.graphics[0].geometry.type === "polygon") {
                    let geometry = event.graphics[0].geometry;
                    let area = geometryEngine.geodesicArea(geometry, "square-feet");
                    if (area <= 50) {
                        area = 0;
                    }
                    updateTabArea(event.graphics[0].attributes.tabId, area);
                }
            });
            sketch.on("delete", (event) => {
                event.graphics.forEach(graphic => {
                    let tabId = graphic.attributes.tabId;
                    let tabElement = document.getElementById(tabId);
                    if (tabElement) {
                        tabElement.remove();
                    }
                    let relatedButton = document.querySelector(`button[data-tab-id='${tabId}']`);
                    if (relatedButton) {
                        relatedButton.remove();
                    }
                    updateSummary();
                });
            });
            webmap.add(graphicsLayer);
            webmap.add(rafterGraphicsLayer);
            view.ui.add(sketch, "top-right");
            view.ui.add(sketchRafter, "top-right");
        });
    }

    function handleRafterIntersect(rafter, roof) {

        let rafterLength = geometryEngine.geodesicLength(rafter.geometry, "feet");

        if (!roof.attributes.totalRafterLength) {
            roof.attributes.totalRafterLength = 0;
        }

        roof.attributes.totalRafterLength += rafterLength;
        updateTabWithRafterInfo(roof);
        updateSummary();
    }

    function updateTabWithRafterInfo(roof) {
        let tabId = roof.attributes.tabId;
        let totalRafterLength = roof.attributes.totalRafterLength;

        let tab = document.getElementById(tabId);

        if (!tab) {
            console.error("No tab found with id: ", tabId);
            return;
        }

        let rafterInput = tab.querySelector(".rafters");

        if (!rafterInput) {
            console.error("No rafter input box found in tab: ", tabId);
            return;
        }

        rafterInput.value = totalRafterLength.toFixed(2); // Assume you want to display two decimal places
    }



    function createTab(area) {
        let tabId = "tab" + (document.querySelectorAll('.tab').length + 1);

        let btn = document.createElement("button");
        btn.innerText = "Shape " + (document.querySelectorAll('.tab-buttons button').length + 1);
        btn.setAttribute('data-tab-id', tabId); // Assign the tabId as a data attribute
        btn.onclick = () => selectTab(tabId);
        document.querySelector('.tab-buttons').appendChild(btn);

        let tab = document.createElement("div");
        tab.id = tabId;
        tab.className = "tab";

        tab.innerHTML = `
        <div class="form-group">
        <input type="text" class="form-control sqft" id="area" value="${Math.round(area)}" data-original-area="${Math.round(area)}">
        </div>

        <div class="form-group">
        <input type="text" class="form-control rafters" id="rafters" value="0" placeholder="Rafters">
        </div>

        <div class="form-group">
        <input type="text" class="form-control structurepanels" id="structurepanels" value="0" placeholder="Structure Panels">
        </div>

        <div class="form-group">
        <select class="form-control rooftype" id="rooftype">
            <option value="Asphalt">Asphalt</option>
            <option value="Metal">Metal</option>
            <option value="Slate">Slate</option>
            <option value="Wood">Wood</option>
        </select>
        </div>

        <div class="form-group">
        <select class="form-control roofpitch" id="roofpitch">
            <option value="Flat">Flat</option>
            <option value="Low">Low Pitch (1/12 to 4/12)</option>
            <option value="Medium">Medium Pitch (5/12 to 9/12)</option>
            <option value="Steep">Steep Pitch (10/12 to 14/12)</option>
        </select>
        </div>
        <div class="form-group">
        <div class="form-check form-switch" data-bs-toggle="tooltip" data-bs-placement="top" title="Small Roof Repair">
        <input type="checkbox" class="form-check-input" id="toggle-switch" role="switch" ${area < 50 ? 'checked' : ''}>
    </div>
        </div>

                        `;

        document.querySelector('.tabs-content').appendChild(tab);

        let roofPitchSelect = tab.querySelector(".roofpitch");
        let sqftInput = tab.querySelector(".sqft");

        roofPitchSelect.addEventListener("change", function () {
            let originalArea = parseFloat(sqftInput.dataset.originalArea);
            let multiplier = getMultiplierForPitch(roofPitchSelect.value);
            sqftInput.value = Math.round(originalArea * multiplier);
        });

        tab.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', updateSummary);
        });
        let toggleSwitch = tab.querySelector("#toggle-switch");

        updateInputs(toggleSwitch.checked, tab);

        toggleSwitch.addEventListener('change', function () {
            updateInputs(toggleSwitch.checked, tab);
        });
        return tabId;

    }

});
function updateInputs(isSwitchOn, tab) {
    tab.querySelectorAll('input:not(#toggle-switch), select').forEach(input => {
        input.disabled = isSwitchOn;
    });

    // If the switch is toggled on, set the value of the 'area' input to 0
    if (isSwitchOn) {
        const areaInput = tab.querySelector('#area');
        if (areaInput) {
            areaInput.value = 0;
        }
    }
}

function getMultiplierForPitch(pitch) {
    switch (pitch) {
        case 'Low': return 1.042;
        case 'Medium': return 1.158;
        case 'Steep': return 1.414;
        default: return 1;  // Flat or other
    }
}

function updateTabArea(tabId, area) {
    let tab = document.getElementById(tabId);
    if (tab) {
        tab.querySelector(".sqft").value = Math.round(area);

        // Check if the switch is off before calling updateSummary
        let isSwitchOn = tab.querySelector("#toggle-switch").checked;
        if (!isSwitchOn) {
            updateSummary();
        }
    }
}


function updateSummary() {
    console.log('update triggered')

    totals = {};
    raftersTotal = 0;
    smallRoofRepairCount = 0;
    maxPitch = null;

    document.querySelectorAll('.tab').forEach(tab => {
        let roofType = tab.querySelector("select[id='rooftype']").value;

        let sqFootage = parseFloat(tab.querySelector("input[id='area']").value);
        if (!totals[roofType]) {
            totals[roofType] = 0;
        }
        totals[roofType] += sqFootage;

        let rfts = parseFloat(tab.querySelector("input[id='rafters']").value);
        if (rfts) {
            raftersTotal += rfts;
        }

        let roofPitch = tab.querySelector("select[id='roofpitch']").value;

        if (!maxPitch) {
            maxPitch = "Flat";  // Assume "Flat" is the smallest pitch
        }

        const order = ["Flat", "Low", "Medium", "Steep"];
        if (order.indexOf(roofPitch) > order.indexOf(maxPitch)) {
            maxPitch = roofPitch;
        }

        if (tab.querySelector("input[type='checkbox']").checked) {
            smallRoofRepairCount++;
        }
    });

    let sqFootageHtml = "";
    let roofInfoHtml = "";

    for (let type in totals) {
        sqFootageHtml += `${type.charAt(0).toUpperCase() + type.slice(1)}: ${Math.round(totals[type].toFixed(2))} sq ft<br>`;
    }

    roofInfoHtml += `Rafters: ${raftersTotal}<br>`;
    roofInfoHtml += `Maximum Roof Pitch: ${maxPitch}<br>`;
    roofInfoHtml += `Small Roof Repairs: ${smallRoofRepairCount}<br>`;

    document.getElementById('sqFootageTotals').innerHTML = sqFootageHtml;
    document.getElementById('roofInfo').innerHTML = roofInfoHtml;
}

document.querySelectorAll('.status-selector input[type="radio"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
        var reasonSelector = document.getElementById('qareasonSelector');
        var statusReasonSelect = document.getElementById('qastatusReason');

        if (document.getElementById('unable').checked) {
            reasonSelector.style.display = 'block';
            statusReasonSelect.disabled = false;
        } else {
            reasonSelector.style.display = 'none';
            statusReasonSelect.disabled = true;
        }

    });
});


document.querySelectorAll('.status-selector input[type="radio"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
        var reasonSelector = document.getElementById('dqreasonSelector');
        var statusReasonSelect = document.getElementById('dqstatusReason');

        if (document.getElementById('disqualified').checked) {
            reasonSelector.style.display = 'block';
            statusReasonSelect.disabled = false;
        } else {
            reasonSelector.style.display = 'none';
            statusReasonSelect.disabled = true;
        }

    });
});
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})