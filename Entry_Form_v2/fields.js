// THIS IS THE FIELDS.JS FILE FOR THE REMIS ENTRY FORM V2. IT CONTROLS WHAT FIELDS ARE SHOWN ON THE FORM
// BASED ON THE SELECTED PROCESS AND ACTIVITY. IT ALSO CONTAINS FUNCTIONS TO VALIDATE THE WORK ITEM CODE


function toggleOldNumberInput(value) {
    var oldNumberLabel = document.getElementById('p_dac_no_old');
    if (value === 'RENEWAL') {
        oldNumberLabel.style.display = 'block';
    } else {
        oldNumberLabel.style.display = 'none';
    }

}

function toggleSubmit(value) {
    var oldNumberLabel = document.getElementById('submit');
    if (value === 'RENEWAL') {
        oldNumberLabel.style.display = 'block';
    } else {
        oldNumberLabel.style.display = 'none';
    }

}

function validateWIInput() {
    let inputField = document.getElementById('p_p2_wi_code');
    let errorMessage = document.getElementById('error-message');
    
    // Regular expression for alphanumeric and uppercase characters
    let regex = /^[A-Z0-9]{6}$/;
  
    // Convert input to uppercase
    inputField.value = inputField.value.toUpperCase();
  
    // Validate the input against the regular expression
    if (!regex.test(inputField.value)) {
        errorMessage.innerText = "Please enter a valid work item code.";
        inputField.classList.add('invalid');
    } else {
        errorMessage.innerText = "";
        inputField.classList.remove('invalid');
    }
  }
  
document.addEventListener('DOMContentLoaded', function () {
    const filterRadios = document.querySelectorAll('input[type="radio"][name="process"]');
    const activityRadios = document.querySelectorAll('input[type="radio"][name="activities"]');

    const activityVisibilityMap = {
        'acquisition': ['landowner-negotiation-acquisition', 'landowner-negotiation-condemnation','executed-offer-to-sell','executed-deed','declaration-of-taking'],
        'acquire-right-of-entry': ['right-of-entry-executed'],
        'acquire-license-and-permits': ['license-or-permit-executed'],
        'withdrawal-transfer-donation': ['executed-deed-or-letter-of-transfer','signed_document_for_acquisition_or_relinquishment_of_withdrawn_lands'],
        'appraisal': ['completed-valuation-product','completed-government-review'],
        'title-record-search': ['title-and-record-search','developed-scope-of-work','cor-review','certification-of-real-estate-availability'],
        'project-development-support': ['project-development-support-activity','real-estate-planning-document-review','district-quality-control-review','alternative-team-review'],
        'gis-mapping': ['land-field-survey-data-review','legal-description','validation-of-geospatial-data','map-product','project-maps-and-data-archived'],
        'non-fed-sponsor-oversight': ['letter-to-the-non-federal-sponsor','reviewed-approved-nfs-agreement','certificate-of-real-estate-availability']
    };

    filterRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            toggleActivities(radio.id);
        });
    });

    activityRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            toggleFields(radio.id);
        });
    });

    function toggleActivities(selectedFilterId) {
        // Disable and hide all activity radios and uncheck them
        activityRadios.forEach(activity => {
            activity.disabled = true;
            activity.checked = false;
            activity.closest('.form-check').classList.add('d-none'); // Hide the radio button's parent div by adding .d-none
        });
    
        // Hide all fields when changing the filter
        document.querySelectorAll('.form-group:not(.d-none)').forEach(field => {
            if (!field.querySelector('input[type="radio"]')) field.classList.add('d-none');
        });
    
        // Enable and show the relevant activity radios based on the selected filter
        const visibleActivities = activityVisibilityMap[selectedFilterId] || [];
        visibleActivities.forEach(activityId => {
            const activityElement = document.getElementById(activityId);
            activityElement.disabled = false;
            activityElement.closest('.form-check').classList.remove('d-none'); // Show the radio button's parent div by removing .d-none
        });
    }
    
    function toggleFields(selectedActivityId) {
        // Hide all fields first
        document.querySelectorAll('.form-group:not(.d-none)').forEach(field => {
            if (!field.querySelector('input[type="radio"]')) field.classList.add('d-none');
        });
        
        if (selectedActivityId === 'landowner-negotiation-acquisition') {
            active_code = 'Acquisition'
            process_code = 'Landowner Negotiation - Acquisition'
            document.getElementById('negotiation_description').classList.remove('d-none');
            document.getElementById('tract_no').classList.remove('d-none');
        }
        if (selectedActivityId === 'landowner-negotiation-condemnation') {
            active_code = 'Condemnation'
            process_code = 'Landowner Negotiation - Condemnation'
            document.getElementById('negotiation_description').classList.remove('d-none');
            document.getElementById('tract_no').classList.remove('d-none');

        }
        if (selectedActivityId === 'executed-offer-to-sell') {
            active_code = 'Acquisition'
            process_code = 'Executed Offer to Sell'
            document.getElementById('acquire_description').classList.remove('d-none');
            document.getElementById('acquire_type').classList.remove('d-none');
        }
        if (selectedActivityId === 'executed-deed') {
            active_code = 'Acquisition'
            process_code = 'Executed Deed'
            document.getElementById('acquire_description').classList.remove('d-none');
            document.getElementById('acquire_type').classList.remove('d-none');
        }
        if (selectedActivityId === 'declaration-of-taking') {
            active_code = 'Condemnation'
            process_code = 'Declaration of Taking'
            document.getElementById('condemn_description').classList.remove('d-none');
            document.getElementById('condemn_type').classList.remove('d-none');
            document.getElementById('recommendation_cat').classList.remove('d-none');
            document.getElementById('tract_no').classList.remove('d-none');
            document.getElementById('us_acq_estate_cat').classList.remove('d-none');
        }
        if (selectedActivityId === 'right-of-entry-executed') {
            active_code = 'Acquire Right of Entry'
            process_code = 'Right of Entry Executed'
            document.getElementById('permit_description').classList.remove('d-none');
            document.getElementById('parcel_no').classList.remove('d-none');
            document.getElementById('dac_no').classList.remove('d-none');
            document.getElementById('dac_no_old').classList.remove('d-none');

        }
        if (selectedActivityId === 'license-or-permit-executed') {
            active_code = 'Acquire License or Permit'
            process_code = 'Acquire License or Permit'
            document.getElementById('permit_description').classList.remove('d-none');
            document.getElementById('parcel_no').classList.remove('d-none');
            document.getElementById('dac_no').classList.remove('d-none');
            document.getElementById('dac_no_old').classList.remove('d-none');
        }
        if (selectedActivityId === 'executed-deed-or-letter-of-transfer') {
            active_code = 'Withdrawal/ Transfer/ Donation'
            process_code = 'Executed Deed or Letter of Transfer'
            document.getElementById('acquire_description').classList.remove('d-none');
            document.getElementById('acquire_type').classList.remove('d-none');
        }
        if (selectedActivityId === 'signed-document-for-acquisition-or-relinquishment-of-withdrawn-lands') {
            active_code = 'Acquire License or Permit'
            process_code = 'Signed Document for Acquisition or Relinquishment of Withdrawn Lands'
            document.getElementById('acquire_description').classList.remove('d-none');
            document.getElementById('acquire_type').classList.remove('d-none');
        }
        if (selectedActivityId === 'completed-valuation-product') {
            active_code = 'Appraisal'
            process_code = 'Completed Valuation Product'
            document.getElementById('appraisal_description').classList.remove('d-none');
            document.getElementById('appraisal_id').classList.remove('d-none');
        }
        if (selectedActivityId === 'completed-government-review') {
            active_code = 'Appraisal'
            process_code = 'Completed Government Review'
            document.getElementById('appraisal_description').classList.remove('d-none');
            document.getElementById('appraisal_id').classList.remove('d-none');
        }
        if (selectedActivityId === 'title-and-record-search') {
            active_code = 'Title and record Search'
            process_code = 'Title and Record Search'
            document.getElementById('tract_no').classList.remove('d-none');
            document.getElementById('titev_description').classList.remove('d-none');
            document.getElementById('title_evid_type').classList.remove('d-none');
        }
        if (selectedActivityId === 'developed-scope-of-work') {
            active_code = 'Title and record Search'
            process_code = 'Developed Scope of Work'
            document.getElementById('tract_no').classList.remove('d-none');
            document.getElementById('titev_description').classList.remove('d-none');
            document.getElementById('title_evid_type').classList.remove('d-none');
        }
        if (selectedActivityId === 'cor-review') {
            active_code = 'Title and record Search'
            process_code = 'COR Review'
            document.getElementById('tract_no').classList.remove('d-none');
            document.getElementById('titev_description').classList.remove('d-none');
            document.getElementById('title_evid_type').classList.remove('d-none');
        }
        if (selectedActivityId === 'certification-of-real-estate-availability') {
            active_code = 'Title and record Search'
            process_code = 'Certification of Real Estate Availability'
            document.getElementById('tract_no').classList.remove('d-none');
            document.getElementById('titev_description').classList.remove('d-none');
            document.getElementById('title_evid_type').classList.remove('d-none');
        }
        if (selectedActivityId === 'project-development-support-activity') {
            active_code = 'Project Development Spt'
            process_code = 'Project Development Support Activity'
            document.getElementById('meeting_desc').classList.remove('d-none');
        }
        if (selectedActivityId === 'real-estate-planning-document-review') {
            active_code = 'Project Development Spt'
            process_code = 'Real Estate Planning Document Review'
            document.getElementById('propplan_description').classList.remove('d-none');
            document.getElementById('title').classList.remove('d-none');
        }
        if (selectedActivityId === 'district-quality-control-review') {
            active_code = 'Project Development Spt'
            process_code = 'District Quality Control Review'
        }
        if (selectedActivityId === 'alternative-team-review') {
            active_code = 'Project Development Spt'
            process_code = 'Alternative Team Review'
        }
        if (selectedActivityId === 'land-field-survey-data-review') {
            active_code = 'Mapping and Survey'
            process_code = 'Land Field Survey Data Review'
            document.getElementById('survey_description').classList.remove('d-none');
        }
        if (selectedActivityId === 'legal-description') {
            active_code = 'Mapping and Survey'
            process_code = 'Legal Description'
            document.getElementById('legal_description').classList.remove('d-none');
        }
        if (selectedActivityId === 'validation-of-geospatial-data') {
            active_code = 'Mapping and Survey'
            process_code = 'Validation of Geospatial Data'
            document.getElementById('map_description').classList.remove('d-none');
            document.getElementById('prim_county').classList.remove('d-none');
            document.getElementById('prim_state').classList.remove('d-none');
        }
        if (selectedActivityId === 'map-product') {
            active_code = 'Mapping and Survey'
            process_code = 'Map Product'
            document.getElementById('map_description').classList.remove('d-none');
            document.getElementById('prim_county').classList.remove('d-none');
            document.getElementById('prim_state').classList.remove('d-none');
        }
        if (selectedActivityId === 'project-maps-and-data-archived') {
            active_code = 'Mapping and Survey'
            process_code = 'Project Maps and Data Archived'
            document.getElementById('map_description').classList.remove('d-none');
            document.getElementById('prim_county').classList.remove('d-none');
            document.getElementById('prim_state').classList.remove('d-none');
        }
        if (selectedActivityId === 'letter-to-the-non-federal-sponsor') {
            active_code = 'Non-Federal Sponsor Oversight'
            process_code = 'Letter to the Non-Federal Sponsor'
        }
        if (selectedActivityId === 'reviewed-approved-nfs-agreement') {
            active_code = 'Non-Federal Sponsor Oversight'
            process_code = 'Reviewed/Approved NFS Agreement'
        }
        if (selectedActivityId === 'certificate-of-real-estate-availability') {
            active_code = 'Non-Federal Sponsor'
            process_code = 'Certificate of Real Estate Availability'
        }

    }
});
