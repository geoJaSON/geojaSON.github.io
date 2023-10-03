// THIS IS THE SUBMIT.JS FILE FOR THE REMIS ENTRY FORM V2. IT CONTROLS WHAT DATA IS SUBMITTED BACK TO
// https://arcportal-ucop-corps.usace.army.mil/s0portal/home/item.html?id=79fbc5dace69404798730435ca11c5e4#data
// WHEN THE SUBMIT BUTTON IS PRESSED.

document.addEventListener('DOMContentLoaded', function () {
  // select all radio buttons with name='activities'
  const radioButtons = document.querySelectorAll('input[type="radio"][name="activities"]');
  const submitBtn = document.querySelector('.submit-btn input[type="submit"]');

  // add event listener to each radio button
  radioButtons.forEach(radio => {
    radio.addEventListener('change', function () {
      if (this.checked) {
        submitBtn.style.display = 'block'; // show the submit button when a radio button is selected
      }
    });
  });
});

const todaydate = new Date().toISOString().slice(0, 10);

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('dataForm');

  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevents the form from submitting the traditional way

    const elements = form.querySelectorAll('input, select'); // Modified to target both input and select elements
    let attributes = {};
    elements.forEach(element => {
      const id = element.id; // Get the ID of the element
      const value = element.value.trim();
      const parent = element.parentNode;

      if (id.startsWith('p_') && value !== '' && !parent.classList.contains('d-none')) {
        // Check if the ID starts with 'p_', the element is not empty, and the parent does not have class 'd-none'
        attributes[id] = value; // Adds the element as a property to the object
      }
    });
    attributes['p_date'] = todaydate;
    attributes['process'] = process_code
    attributes['p_active_code'] = active_code
    attributes['p_wi_received_by_org'] = document.getElementById('p_wi_responsible_org').value
    attributes['p_resp_org'] = document.getElementById('p_wi_responsible_org').value
    attributes['p_resp_emp_id_no'] = document.getElementById('p_emp_id_no').value

    const features = [{ "attributes": attributes }];
    const messageContainer = document.getElementById('submitMessage');

    require(["esri/identity/IdentityManager", "esri/request"],
      function (IdentityManager, esriRequest) {
        const formData = new URLSearchParams();
        formData.append('f', 'json');
        formData.append('features', JSON.stringify(features));
        console.log(features);
        // Send a POST request to your REST endpoint
        esriRequest("https://geoportal.nwd.usace.army.mil/g0arcgis/rest/services/Hosted/REMIS_Tasks/FeatureServer/0/addFeatures", {
          method: "post",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData.toString()
        }).then(function (response) {
          console.log(response.data);
          const success = response.data.addResults[0].success;
          if (success) {
            messageContainer.innerHTML = '<span class="text-success animate__animated animate__fadeIn animate__faster">SUCCESS!</span>';
          } else {
            messageContainer.innerHTML = '<span class="text-warning animate__animated animate__fadeIn animate__faster">Request was not successful!</span>';
          }

          setTimeout(() => {
            messageContainer.innerHTML = ''; // clear the message after 3 seconds
          }, 3000);
        });

      })

















  });
});


