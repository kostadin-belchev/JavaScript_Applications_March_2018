function attachEvents () {
    //alert('test1');
    // attach handlers to the [Load] and [Update] buttons
    $('.load').click(loadCatches);
    $('.add').click(addCatch);
    let catchesDiv = $('#catches');

    let username = 'kosta';
    let password = 'k';
    const BASE_URL = 'https://baas.kinvey.com/appdata/kid_rJSkB8i5z/biggestCatches';

    function loadCatches() {
        
        catchesDiv.empty();
        //console.log('cleared once');
        
        $.ajax({
            method: 'GET',
            url: BASE_URL,
            headers: { 
                'Authorization': 'Basic ' + btoa(username + ':' + password),
            }
        }).then(displayCatches).catch(handleError);

        //console.log('loading finished stage 2');
    }

    function displayCatches(response) {

        //console.log(response); // returns all catches from database as a JSON
        for (const key in response) {
            if (response.hasOwnProperty(key)) {
                const catchToAdd = response[key];
                createAndAppendCatch(catchToAdd);
            }
        }
    }

    function createAndAppendCatch(c) {
        //console.log(c);
        let catchDiv = $('<div>').addClass("catch").attr('data-id', c._id);
        
        catchDiv.append(`<label>Angler</label>
                <input type="text" class="angler" value="${c.angler}"/>
                <label>Weight</label>
                <input type="number" class="weight" value="${c.weight}"/>
                <label>Species</label>
                <input type="text" class="species" value="${c.species}"/>
                <label>Location</label>
                <input type="text" class="location" value="${c.location}"/>
                <label>Bait</label>
                <input type="text" class="bait" value="${c.bait}"/>
                <label>Capture Time</label>
                <input type="number" class="captureTime" value="${c.captureTime}"/>`);
                // attach handlers to the [Delete] and [Update] buttons
        catchDiv.append($('<button>').addClass('update').text('Update').click(updateCatch));
        catchDiv.append($('<button>').addClass('delete').text('Delete').click(deleteCatch));
        catchesDiv.append(catchDiv);
        //console.log('loading finished stage 1');
        
    }

    function updateCatch(e) {
        //console.log($(e.target).parent()[0].getAttribute('data-id'));
        let catchToUpdate =  $(e.target).parent();
        //console.log(catchToUpdate);
        let catchId = catchToUpdate[0].getAttribute('data-id');
        let dataToUpdate = {
            "angler": catchToUpdate.find('.angler').val(),
            "weight": Number(catchToUpdate.find('.weight').val()),
            "species": catchToUpdate.find('.species').val(),
            "location": catchToUpdate.find('.location').val(),
            "bait": catchToUpdate.find('.bait').val(),
            "captureTime": Number(catchToUpdate.find('.captureTime').val())
        };

        $.ajax({
            method: 'PUT',
            url: BASE_URL + `/${catchId}`,
            headers: { 
                'Authorization': 'Basic ' + btoa(username + ':' + password),
                'Content-Type':'application/json'
            },
            data: JSON.stringify(dataToUpdate)
        }).then(() => {
            // notify user update was successful
            console.log('update successful');
            
        }).catch(handleError);
        
    }

    function deleteCatch(e) {
        let catchToDelete =  $(e.target).parent();
        //console.log(catchToDelete);
        let catchId = catchToDelete[0].getAttribute('data-id');
        //console.log(catchId);
        $.ajax({
            method: 'DELETE',
            url: BASE_URL + `/${catchId}`,
            headers: { 
                'Authorization': 'Basic ' + btoa(username + ':' + password),
                'Content-Type':'application/json'
            }
        }).then(() => {
            // delete it from the  since it has already been deleted from the database at this point
            catchToDelete.remove();
            // load contacts anew
            ///loadCatches();
        }).catch(handleError);
        
    }

    function addCatch() {
        let add = $('#addForm');
        let dataToPost = {
            "angler": add.find('.angler').val(),
            "weight": Number(add.find('.weight').val()),
            "species": add.find('.species').val(),
            "location": add.find('.location').val(),
            "bait": add.find('.bait').val(),
            "captureTime": Number(add.find('.captureTime').val())
        };

        $.ajax({
            method: 'POST',
            url: BASE_URL,
            headers: { 
                'Authorization': 'Basic ' + btoa(username + ':' + password),
                'Content-Type':'application/json'
            },
            data: JSON.stringify(dataToPost)
        }).then(() => {
            add.find('.angler').val('');
            add.find('.weight').val('');
            add.find('.species').val('');
            add.find('.location').val('');
            add.find('.bait').val('');
            add.find('.captureTime').val('');
            loadCatches();
        }).catch(handleError);
    }

    function handleError(err) {
        console.log(err);
    }
    
}