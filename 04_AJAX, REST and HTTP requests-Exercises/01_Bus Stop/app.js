function getInfo() {
    //alert('test1');
    let baseURL = `https://judgetests.firebaseio.com/businfo/`;
    let stopId = $('#stopId').val();
    let stopNameDiv = $('#stopName');
    let list = $('#buses');

    let request = {
        url: baseURL + stopId + '.json',
        success: displayStop,
        error: displayError
    }
    // The list should be cleared before every request is sent.
    stopNameDiv.text('');
    list.empty();
    // sending request
    $.ajax(request);

    function displayStop(data) {
        //console.log(data);
        generateAndAppendLis(data.name, data.buses);
    }
    function generateAndAppendLis(stopName, busesData) {
        stopNameDiv.text(stopName);
        for (const busID in busesData) {
            if (busesData.hasOwnProperty(busID)) {
                let li = $(`<li>Bus ${busID} arrives in ${busesData[busID]} minutes</li>`);
                li.appendTo(list);
            }
        }
    }
    function displayError(err) {
        stopNameDiv.text('Error');
    }
}