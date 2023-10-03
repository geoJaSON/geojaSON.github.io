// THIS IS THE PULLDATA.JS FILE FOR THE REMIS ENTRY FORM V2. IT CONTROLS WHAT DATA IS PULLED FROM
// https://arcportal-ucop-corps.usace.army.mil/s0portal/home/item.html?id=79fbc5dace69404798730435ca11c5e4
// LOOKUP TABLES AND PREPOPULATES SELECTIONS ON THE FORM.

let div_dist

document.addEventListener('DOMContentLoaded', function () {

    let featureMap = new Map();

    // Get the input field associated with the datalist
    const inputField = document.getElementById('p_proj_id');

    inputField.addEventListener('input', function (e) {
        // Get the feature from the map using the input value
        const selectedFeature = featureMap.get(e.target.value);
        selectedProject = e.target.value;
        if (selectedFeature) {
            let state = selectedFeature.attributes.state;
            const state_dict = {
                "AL": "ALABAMA",
                "AK": "ALASKA",
                "AZ": "ARIZONA",
                "AR": "ARKANSAS",
                "CA": "CALIFORNIA",
                "CO": "COLORADO",
                "CT": "CONNECTICUT",
                "DE": "DELAWARE",
                "FL": "FLORIDA",
                "GA": "GEORGIA",
                "HI": "HAWAII",
                "ID": "IDAHO",
                "IL": "ILLINOIS",
                "IN": "INDIANA",
                "IA": "IOWA",
                "KS": "KANSAS",
                "KY": "KENTUCKY",
                "LA": "LOUISIANA",
                "ME": "MAINE",
                "MD": "MARYLAND",
                "MA": "MASSACHUSETTS",
                "MI": "MICHIGAN",
                "MN": "MINNESOTA",
                "MS": "MISSISSIPPI",
                "MO": "MISSOURI",
                "MT": "MONTANA",
                "NE": "NEBRASKA",
                "NV": "NEVADA",
                "NH": "NEW HAMPSHIRE",
                "NJ": "NEW JERSEY",
                "NM": "NEW MEXICO",
                "NY": "NEW YORK",
                "NC": "NORTH CAROLINA",
                "ND": "NORTH DAKOTA",
                "OH": "OHIO",
                "OK": "OKLAHOMA",
                "OR": "OREGON",
                "PA": "PENNSYLVANIA",
                "RI": "RHODE ISLAND",
                "SC": "SOUTH CAROLINA",
                "SD": "SOUTH DAKOTA",
                "TN": "TENNESSEE",
                "TX": "TEXAS",
                "UT": "UTAH",
                "VT": "VERMONT",
                "VA": "VIRGINIA",
                "WA": "WASHINGTON",
                "WV": "WEST VIRGINIA",
                "WI": "WISCONSIN",
                "WY": "WYOMING"
            }
            state = state_dict[state] || state; // Use the mapped value or the original value if not found in the map
            document.getElementById('p_prim_state').value = state;


            const county = selectedFeature.attributes.primary_county;
            document.getElementById('p_prim_county').value = county;

            selectedState = state;
            selectedCounty = county;

        }
    });

    // GET PROJECTS
    function executeEsriRequest(divDistValue) {
        require(["esri/request", "dojo/domReady!"], function (esriRequest) {
            esriRequest("https://geoportal.nwd.usace.army.mil/g0arcgis/rest/services/Hosted/REMIS_Tasks/FeatureServer/1/query", {
                responseType: "json",
                query: {
                    where: "div_dist='" + divDistValue + "'",
                    outFields: "*",
                    resultRecordCount: 20000,
                    f: "json"
                }
            }).then(function (response) {

                // Get the input fields
                const dataList = document.getElementById('projectIds');

                dataList.innerHTML = ''; // Clear existing options

                // Sort and iterate through features
                const sortedFeatures = response.data.features.sort((a, b) => {
                    if (a.attributes.proj_id < b.attributes.proj_id) return -1;
                    if (a.attributes.proj_id > b.attributes.proj_id) return 1;
                    return 0;
                });

                sortedFeatures.forEach(feature => {
                    const option = document.createElement('option');
                    option.value = feature.attributes.proj_id;
                    option.textContent = feature.attributes.proj_id + " - " + feature.attributes.proj_name;

                    // Store the feature in the map
                    featureMap.set(option.value, feature);

                    // Append the new option to the datalist
                    dataList.appendChild(option);
                });



            }).catch(function (error) {
                console.error(error);
            });
        });
    }

    // Get USER ID and get EMP ID and ORG CODE
    require(["esri/identity/IdentityManager", "esri/request", "esri/portal/Portal",
        "esri/portal/PortalQueryParams", "dojo/domReady!"
    ], function (IdentityManager, esriRequest, Portal, PortalQueryParams) {
        // Fetch the data when the document is ready
        esriRequest("https://geoportal.nwd.usace.army.mil/g0arcgis/rest/services/Hosted/REMIS_Tasks/FeatureServer/2/query", {
            responseType: "json",
            query: {
                where: "1=1",
                outFields: "*",

                f: "json"
            }

        }).then(function (response) {
            if(IdentityManager.credentials && IdentityManager.credentials[0]) {
                userid = IdentityManager.credentials[0].userId;
                console.log(userid);
            } else {
                console.log('Credentials are not available');
            }
            // Get the input fields
            const userSelect = document.getElementById('created_user');

            userSelect.innerHTML = '';

            // Sort and iterate through features
            const sortedFeatures = response.data.features.sort((a, b) => {
                if (a.attributes.em_name < b.attributes.em_name) return -1;
                if (a.attributes.em_name > b.attributes.em_name) return 1;
                return 0;
            });

            sortedFeatures.forEach(feature => {
                const option = document.createElement('option');
                option.value = feature.attributes.em_name;
                option.textContent = feature.attributes.em_name;

                // Check if this user ID matches the logged-in user ID
                if (feature.attributes.emp_user === userid) {
                    option.selected = true;

                    // Populate other fields
                    document.getElementById('p_emp_id_no').value = feature.attributes.emp_id_no;
                    selectedEmployee = feature.attributes.emp_id_no;
                    document.getElementById('p_wi_responsible_org').value = feature.attributes.org_code;
                    selectedOrg = feature.attributes.org_code;
                    div_dist = feature.attributes.div_dist;
                    document.getElementById('p_div_dist').value = div_dist;
                    if (div_dist) executeEsriRequest(div_dist);
                }

                // Store the feature in the map
                featureMap.set(option.value, feature);

                // Append the new option to the select
                userSelect.appendChild(option);
            });


            // Convert the select box into a searchable select box with Select2
            $(userSelect).select2({
                width: 'resolve' // need to override the changed width by Select2
            }).on('select2:select', function (e) {
                // Get the feature from the map using the selected value
                const selectedFeature = featureMap.get(e.target.value);

                if (selectedFeature) {
                    empID = selectedFeature.attributes.emp_id_no;
                    document.getElementById('p_emp_id_no').value = empID;

                    org_code = selectedFeature.attributes.org_code;
                    document.getElementById('p_wi_responsible_org').value = org_code;

                    div_dist = selectedFeature.attributes.div_dist;
                    document.getElementById('p_div_dist').value = div_dist;
                    executeEsriRequest(div_dist)



                }
            });
        }).catch(function (error) {
            console.error(error);
        });

    });
});
