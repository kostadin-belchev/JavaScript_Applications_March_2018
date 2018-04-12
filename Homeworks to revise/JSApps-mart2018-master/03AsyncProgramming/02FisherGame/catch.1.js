function attachEvents() {
    //Application settings
    const baseUrl = 'https://baas.kinvey.com/appdata/kid_Sk5sEWQcM/biggestCatches';
    const username = 'guest';
    const password = 'guest';
    const base64Auth = btoa(username + ':' + password);
    const authHeader = {
        'Authorization': 'Basic ' + base64Auth,
        'Content-type': 'application/json'
    };

    //DOM elements
    let catches = $('#catches');

    //Event listeners
    $('.load').click(loadCatches);
    $('.add').click(createCatch);

    function request(method, endpoint, data) {
        return $.ajax({
            method: method,
            url: baseUrl + endpoint,
            headers: authHeader,
            data: JSON.stringify(data)
        })
    }


    function loadCatches() {
        // when list all catches add delete and update button with div containing catch id
        catches.empty();
        catches.append($('<option>Loading...</option>'));

        request('GET', '')
            .then(listAllCatches)
            .catch(handleError);

        function listAllCatches(data) {
            catches.empty();
            for (const el of data) {

                let container = $(`<div class="catch" data-id="${el._id}"> </div>`);
                container.append($('<label>Angler</label>'))
                    .append($(`<input type="text" class="angler" value="${el.angler}"/>`))
                    .append($('<label>Weight</label>'))
                    .append($(`<input type="number" class="weight" value="${el.weight}"/>`))
                    .append($('<label>Species</label>'))
                    .append($(`<input type="text" class="species" value="${el.species}"/>`))
                    .append($('<label>Location</label>'))
                    .append($(`<input type="text" class="location" value="${el.location}"/>`))
                    .append($('<label>Bait</label>'))
                    .append($(`<input type="text" class="bait" value="${el.bait}"/>`))
                    .append($('<label>Capture Time</label>'))
                    .append($(`<input type="number" class="captureTime" value="${el.captureTime}"/>`))
                    .append($('<button class="update">Update</button>').click(updateCatch))
                    .append($('<button class="delete">Delete</button>').click(deleteCatch));
                catches.append(container);
            }
        }
    }

    function createCatch() {
        let catchEl = $('#addForm');
        let dataObj = createDataJson(catchEl);

        request('POST','',dataObj)
            .then(loadCatches)
            .catch(handleError);

        for (let input of inputs) {
            $(input).val('');
        }

    }

    function createDataJson(catchEl) {
        return {
            angler: catchEl.find('.angler').val(),
            weight: Number(catchEl.find('.weight').val()),
            species: catchEl.find('.species').val(),
            location: catchEl.find('.location').val(),
            bait: catchEl.find('.bait').val(),
            captureTime: Number(catchEl.find('.captureTime').val())
        }
    }

    function deleteCatch() {

        let catchId = $(this).parent().attr('data-id');
        request('DELETE',`/${catchId}`)
            .then(loadCatches)
            .catch(handleError);
    }

    function updateCatch() {
        let catchId = $(this).parent().attr('data-id');
        let catchEl = $(this).parent();
        let dataObj = createDataJson(catchEl);

        request('PUT',`/${catchId}`,dataObj)
            .then(loadCatches)
            .catch(handleError)
    }

    function handleError(err) {
        console.warn(err);

    }
}