function solve() {
    let baseURL = `https://judgetests.firebaseio.com/schedule/`;
    let currentId = 'depot';
    let infoBox = $('.info');
    let departButton = $('#depart');
    let arriveButton = $('#arrive');
    let arrivingStation = 'depot';

    function depart() {
        //alert('Departed');
        let request = {
            method: 'GET',
            url: baseURL + currentId + '.json',
            success: function (response) {
                // Update the info box with information from the response,
                infoBox.text(`Next stop ${response.name}`);
                // disable the “Depart” button
                departButton.prop('disabled', true);
                // and enable the “Arrive” button.
                arriveButton.prop('disabled', false);
                // get current stop name to be used later
                arrivingStation = response.name;
                // update next stop to become the current stop
                currentId = response.next;
            },
            error: function (err) {
                // If invalid data is received, show "Error" inside the info box
                // and disable both buttons.
                infoBox.text('Error');
                departButton.prop('disabled', true);
                arriveButton.prop('disabled', true);
            }
        };
        $.ajax(request);
    }

    function arrive() {
        //alert('Arrived');
        // When the "Arrive" button is clicked update the text,
        infoBox.text(`Arriving at ${arrivingStation}`);
        // disable the “Arrive” button
        arriveButton.prop('disabled', true);
        // and enable the “Depart” button. 
        departButton.prop('disabled', false);
    }

    return {
      depart,
      arrive
    };
}
let result = solve();