// Assuming your submit button has an ID of 'submitBtn'
document.getElementById('dataForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // if status select is complete
    var isCompleteSelected = document.getElementById('complete').checked;
    var isUserSure = confirm('Are you sure you want to submit?');

    if (!isUserSure) {
        alert('Submission cancelled.');
        return;
    }
    if (isCompleteSelected) {
    view.takeScreenshot({ format: "png" }).then(function(screenshot) {
        openScreenshotWindow(screenshot);
        console.log(totals)
    });
}
});

function openScreenshotWindow(screenshot) {
        //Remove everything from username after last space
        let usernameArray = username.split(' ');
        // Keep everything except last element
        usernameArray.pop();
        // Join the array back into a string
        let usernameNoSpace = usernameArray.join(' ');

        let w = window.open("", "_blank"); // Open new window/tab

        // Create an HTML string
        let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Temporary Roofing Work Order</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                h1, h2, h3 {
                    margin: 5px 0;
                }
                table {
                    width: 100%;
                    margin-bottom: 20px;
                    border-collapse: collapse;
                }
                td {
                    padding: 8px;
                    border: 1px solid #ddd;
                }
                .center-table {
                    width: 960px;
                    margin: 0 auto;
                    margin-left: auto;
                    margin-right: auto;
                }
                .center-table td:nth-child(2) {
                    width: 480px; /* Set the width of the second column */
                }
                .center-table td:nth-child(3) {
                    width: 480px; /* Set the width of the third column */
                }
                .center-table2 {
                    width: 960px;
                    margin: 0 auto;
                    margin-left: auto;
                    margin-right: auto;
                }
                .drawing-math-section {
                    text-align: center;
                    margin-top: 20px;
                }
                img {
                    max-width: 100%;
                    height: auto;
                }
                @media print {
                    body {
                        color: black;
                    }
                }
            </style>
        </head>
        <body>
            <header>
                <h1>CORPS OF ENGINEERS</h1>
                <h2>TEMPORARY ROOFING WORK ORDER</h2>
            </header>
            <table class="center-table">
            <tr>
                <td>Applicant Name:</td>
                <td>${roeData.attributes['appfirstname']} ${roeData.attributes['applastname']}</td>
                <td>ROE Number:</td>
                <td>${roeData.attributes['roeidpk']}</td>
            </tr>
            <tr>
                <td>Address:</td>
                <td>${roeData.attributes['roeidappaddresspk']}</td>
                <td>QA Name:</td>
                <td>${usernameNoSpace}</td>
            </tr>
            <tr>
                <td>County/City/Zip:</td>
                <td>${roeData.attributes['appcity']} / ${roeData.attributes['appzipcode']} / ${roeData.attributes['appcounty']}</td>
                <td>Date Assessed:</td>
                <td>${new Date().toLocaleDateString()}</td>
                
            </tr>
            <tr>
                <td>Phone:</td>
                <td>${roeData.attributes['appprimaryphone']}</td>
                <td>Comment:</td>
                <td>${roeData.attributes['approecomments'] || ''}</td>
            </tr>
            <tr>
                <td>GPS Latitude:</td>
                <td>${roeData.geometry['y']}</td>
                <td>GPS Longitude:</td>
                <td>${roeData.geometry['x']}</td>
            </tr>
        </table>
        
            <h3 style="text-align: center;">QUANTITIES</h3>
            <table class="center-table2">
                <tr>
                    <td>Asphalt Shingle Roof - Plastic Sheeting</td>
                    <td>${totals['Asphalt']}</td>
                    <td>Square Ft</td>
                </tr>
                <tr>
                    <td>Metal Roof - Plastic Sheeting</td>
                    <td>${totals['Metal']}</td>
                    <td>Square Ft</td>
                </tr>
                <tr>
                    <td>Rafter Repair</td>
                    <td>${raftersTotal}</td>
                    <td>Linear Ft</td>
                </tr>
                <tr>
                    <td>Structural Panel</td>
                    <td></td>
                    <td>Square Ft</td>
                </tr>
                <tr>
                    <td>Small Roof Repair</td>
                    <td>${smallRoofRepairCount}</td>
                    <td>Each</td>
                </tr>
                <tr>
                    <td>Debris Clearance</td>
                    <td></td>
                    
                </tr> 
            </table>
            <div class="drawing-math-section">
                <img src="${screenshot.dataUrl}" alt="Screenshot Image">
            </div>
            
        </body>
        </html>
        
                `;

        // Write HTML string to new window's document
        w.document.write(html);
        w.document.close();
    }