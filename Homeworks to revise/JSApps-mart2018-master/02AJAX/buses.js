function getInfo() {
    let stopId = $('#stopId').val();
    let list = $('#buses');
    list.empty();
    let url = `https://judgetests.firebaseio.com/businfo/${stopId}.json `;
    let req = {
        url: url,
        method: "GET",
        success: printInfo,
        error: displayError,
        complete:$('#stopId').val("")
    }

    $.ajax(req);

    function printInfo(data) {
        $('#stopName').text(`${data.name}`);
        console.log(data);
        let buses=data.buses;
        for (const busId in buses) {
            let time = buses[busId];
            let item = $(`<li>Bus ${busId} arrives in ${time} minutes</li>`)
            list.append(item);
        }

    }

    function displayError(err) {
        $('#stopName').text('Error');

    }

}