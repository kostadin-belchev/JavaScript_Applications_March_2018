function attachEvents() {
    const url = ' https://baas.kinvey.com/appdata/kid_Bkw57f2cG';
    const username = 'test';
    const password = 'test';
    const base64 = btoa(username + ':' + password);
    const auth = {
        'Authorization': 'Basic ' + base64,
        'Content-type': 'application/json'
    };

    let request = function (method, endpoint, data) {
        return $.ajax({
            method: method,
            url: url + endpoint,
            headers: auth,
            data: JSON.stringify(data)
        })
    }

    $('.load').click(loadCatches);
    $('.add').click(addCatches);

    function loadCatches() {
        request("GET", "/biggestCatches")
            .then(displayCatches)
            .catch(errorHandler);
    }

    function displayCatches(response) {
        $('#catches').empty();
        for (const obj of response) {
            let catchData = $(`<div class="catch" data-id="${obj._id}">
        <label>Angler</label>
        <input type="text" class="angler" value="${obj.angler}"/>
        <label>Weight</label>
        <input type="number" class="weight" value="${obj.weight}"/>
        <label>Species</label>
        <input type="text" class="species" value="${obj.species}"/>
        <label>Location</label>
        <input type="text" class="location" value="${obj.location}"/>
        <label>Bait</label>
        <input type="text" class="bait" value="${obj.bait}"/>
        <label>Capture Time</label>
        <input type="number" class="captureTime" value="${obj.captureTime}"/>
    </div>`)

            catchData.append($('<button class="update">Update</button>').click(updateCatch));
            catchData.append($('<button class="delete">Delete</button>').click(deleteCatch));
            $('#catches').append(catchData)
        }

    }

    function addCatches() {

        let obj = createObj($(this).parent());
        request('POST', "/biggestCatches", obj)
            .then(loadCatches)
            .catch(errorHandler)
    }

    function updateCatch() {

        let id = $(this).parent().attr('data-id');
        let obj = createObj($(this).parent());
        request('PUT', `/biggestCatches/${id}`, obj)
            .then(loadCatches)
            .catch(errorHandler)
    }

    function deleteCatch() {
        let id = $(this).parent().attr('data-id');
        request('DELETE', `/biggestCatches/${id}`)
            .then(loadCatches)
            .catch(errorHandler)
    }

    function createObj(element) {


        let angler = element.find('.angler').val();
        let weight = Number(element.find('.weight').val());
        let species = element.find('.species').val();
        let location = element.find('.location').val();
        let bait = element.find('.bait').val();
        let captureTime = Number(element.find('.captureTime').val());

        return {
            "angler": angler,
            "weight": weight,
            "species": species,
            "location": location,
            "bait": bait,
            "captureTime": captureTime
        }


    }



    function errorHandler() {
        console.log('Error');
    }


}