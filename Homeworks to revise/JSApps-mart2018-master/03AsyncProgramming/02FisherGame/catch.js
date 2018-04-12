function attachEvents() {
    //Application settings
    const baseUrl = 'https://baas.kinvey.com/appdata/kid_Sk5sEWQcM/biggestCatches';
    const username = 'guest';
    const password = 'guest';

    //DOM elements
    let catches = $('#catches');

    //Event listeners
    $('.load').click(loadCatches);
    $('.add').click(addCatch);

    function loadCatches() {
        // when list all catches add delete and update button with div containing catch id
        catches.empty();
        catches.append($('<option>Loading...</option>'));

        let req = {
            url: baseUrl,
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            },
            success: listAllCatches,
            error: handleError
        };

        $.ajax(req);

        function listAllCatches(data) {
            catches.empty();
            for (const catchElement of data) {
                // console.log(catchElement);
                displayCatch(catchElement);
            }
        }
    
        function displayCatch(data) {
            let container = $(`<div class="catch" data-id="${data._id}"> </div>`);
            container.append($('<label>Angler</label>'))
                .append($(`<input type="text" class="angler" value="${data.angler}"/>`))
                .append($('<label>Weight</label>'))
                .append($(`<input type="number" class="weight" value="${data.weight}"/>`))
                .append($('<label>Species</label>'))
                .append($(`<input type="text" class="species" value="${data.species}"/>`))
                .append($('<label>Location</label>'))
                .append($(`<input type="text" class="location" value="${data.location}"/>`))
                .append($('<label>Bait</label>'))
                .append($(`<input type="text" class="bait" value="${data.bait}"/>`))
                .append($('<label>Capture Time</label>'))
                .append($(`<input type="number" class="captureTime" value="${data.captureTime}"/>`))
                .append($('<button class="update">Update</button>').click(updateCatch))
                .append($('<button class="delete">Delete</button>').click(() => deleteCatch(data._id)));
            catches.append(container);
        }
    }

    function addCatch() {
        let inputs = $(this).parent().find('input');
        let req = {
            url: baseUrl,
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password),
                'Content-type': 'application/json'
            },
            method: "POST",
            data: JSON.stringify({
                angler: $(inputs[0]).val(),
                weight: Number($(inputs[1]).val()),
                species: $(inputs[2]).val(),
                location: $(inputs[3]).val(),
                bait: $(inputs[4]).val(),
                captureTime: Number($(inputs[5]).val())
            }),
            success: loadCatches,
            error: handleError
        };
        $.ajax(req);
        for (let input of inputs) {
            $(input).val('');
        }

    }

    function deleteCatch(id) {

        let req = {
            url: baseUrl + "/" + id,
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            },
            method: "DELETE",
            success: loadCatches,
            error: handleError
        };

        $.ajax(req);
    }

    function updateCatch() {

        let inputs = $(this).parent().find('input');
        console.log(inputs);
        
        let catchId = $(this).parent().attr('data-id');
        let req = {
            url: baseUrl + "/" + catchId,
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password),
                'Content-type': 'application/json'
            },
            method: "PUT",
            data: JSON.stringify({
                angler: $(inputs[0]).val(),
                weight: Number($(inputs[1]).val()),
                species: $(inputs[2]).val(),
                location: $(inputs[3]).val(),
                bait: $(inputs[4]).val(),
                captureTime: Number($(inputs[5]).val())
            }),
            success: loadCatches,
            error: handleError
        };

        $.ajax(req);
    }

    function handleError(err) {
        console.warn(err);

    }
}