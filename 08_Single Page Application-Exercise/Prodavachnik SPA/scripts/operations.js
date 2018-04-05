// constants of the application
const BASE_URL = `https://baas.kinvey.com/`;
const APP_KEY = 'kid_SJL641Giz';
const APP_SECRET = '8b67885659bc4ac5a83733484305c14b';

// Session functionality (logout, login, register, etc.)
function registerUser() {
    let userData = {
        username: $('#formRegister input[name=username]').val(),
        password: $('#formRegister input[name=passwd]').val()
    }

    let request = {
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/',
        headers: {
            'Authorization': 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET)
        },
        data: userData,
        success: registerUserSuccess,
        error: handleAjaxError
    }

    $.ajax(request);

    function registerUserSuccess(userInfo) { // the response from registering a user
        // is the user itself that we just registered
        saveAuthInSession(userInfo);
        showHideMenuLinks();
        showHomeView();
        showInfo('User registered successfully.');
        // clear form for next user
        $('#formRegister input[name=username]').val('');
        $('#formRegister input[name=passwd]').val('');
    }
}

function loginUser() {
    let userData = {
        username: $('#formLogin input[name=username]').val(),
        password: $('#formLogin input[name=passwd]').val()
    }

    let request = {
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/login',
        headers: {
            'Authorization': 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET)
        },
        data: userData,
        success: loginUserSuccess,
        error: handleAjaxError
    }

    $.ajax(request);

    function loginUserSuccess(userInfo) { // the response from loggin in a user
        // is the user itself that we just logged in with
        saveAuthInSession(userInfo);
        showHideMenuLinks();
        showHomeView();
        showInfo('User log in successful.');
        // clear form for next user
        $('#formLogin input[name=username]').val('');
        $('#formLogin input[name=passwd]').val('');
    }
}

function logoutUser() {
    sessionStorage.clear();
    showHideMenuLinks();
    showHomeView();
    showInfo('User log out successful.');
}


// GRUD functionality for the ads
function listAds() {
    // GET -> BASE_URL + 'appdata/' + APP_KEY + '/ads'
    showView('viewAds');
    $.ajax({
        url: BASE_URL + 'appdata/' + APP_KEY + '/ads',
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: loadAdsSuccess,
        error: handleAjaxError
    });

    function loadAdsSuccess(ads) {
        showInfo('Ads loaded.');
        // empty ads before filling them out
        //console.log(ads);
        $('#ads').empty();
        if (ads.length === 0) {
            $('#ads').text('No ads available.');
        } else {
            let adTable = $('<table>');
            let trHeader = $('<tr>');
            trHeader.append($('<th>Title</th>'));
            trHeader.append($('<th>Publisher</th>>'));
            trHeader.append($('<th>Description</th>'));
            trHeader.append($('<th>Price</th>'));
            trHeader.append($('<th>Date Published</th>'));
            adTable.append(trHeader);
            for (const ad of ads) {  // append all ad to the table
                appendAdRow(ad, adTable);
            }
            // after we have added all the ads in the table we append the table
            $('#ads').append(adTable);
        }
    }
}
// part of listAds()
function appendAdRow(ad, adTable) {
    let tr = $('<tr>');
    tr.append(`<td>${ad.title}</td>`);
    tr.append(`<td>${ad.publisher}</td>`);
    tr.append(`<td>${ad.description}</td>`);
    tr.append(`<td>${ad.price}</td>`);
    tr.append(`<td>${ad.datePublished}</td>`);
    let td = $('<td>');
    let buttons = [];
    // add the edit and delte buttons only for the current user's ads
    if (ad._acl.creator == sessionStorage.getItem('userId')) {
        // Bind the event handler with the current ad
        let buttonDelete = $('<button>Delete</button>').click(deleteAd.bind(this, ad));
        let buttonEdit = $('<button>Edit</button>').click(loadAdForEdit.bind(this, ad));
        buttons = [buttonDelete, ' ', buttonEdit]; // the space in the middle is just for looks
    }
    // append works with arrays
    td.append(buttons);
    tr.append(td);
    adTable.append(tr);
}

function deleteAd(ad) {
    // DELETE -> BASE_URL + 'appdata/' + APP_KEY + '/ads/' + ad._id
    $.ajax({
        method: 'DELETE',
        url: BASE_URL + 'appdata/' + APP_KEY + '/ads/' + ad._id,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: deleteAdSuccess,
        error: handleAjaxError
    });

    function deleteAdSuccess(response) {
        listAds();
        showInfo('Ad deleted.');
    }
}

function loadAdForEdit(ad) {
    showView('viewEditAd');
    $('#formEditAd input[name=id]').val(ad._id);
    $('#formEditAd input[name=publisher]').val(ad.publisher);
    $('#formEditAd input[name=title]').val(ad.title);
    $('#formEditAd textarea[name=description]').val(ad.description);
    $('#formEditAd input[name=datePublished]').val(ad.datePublished);
    $('#formEditAd input[name=price]').val(ad.price);
    // when we click on EDIT we have already atteched a click event to EDIT button so we will
    // be redirected to below function editAdvert()
}

function editAdvert() {
     // PUT -> BASE_URL + 'appdata/' + APP_KEY + '/ads/' + ad._id
     let adData = {
        publisher: $('#formEditAd input[name=publisher]').val(),
        title: $('#formEditAd input[name=title]').val(),
        description: $('#formEditAd textarea[name=description]').val(), // NOT SURE IF THIS SHOULD BE val() OR text()
        datePublished: $('#formEditAd input[name=datePublished]').val(),
        price: $('#formEditAd input[name=price]').val()
      };
    
    $.ajax({
        method: 'PUT',
        url: BASE_URL + 'appdata/' + APP_KEY + '/ads/' + $('#formEditAd input[name=id]').val(),
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        data: adData,
        success: editAdSuccess,
        error: handleAjaxError
    });

    function editAdSuccess(response) {
        listAds();
        showInfo('Ad edited.')
    }
}

function createAdvert() {
    const kinveyUserUrl = `${BASE_URL}user/${APP_KEY}/${sessionStorage.getItem('userId')}`;
    // When create an advertisement the current logged user should be it’s publisher. 
    // We can do it by making one request to the database (by user’s “_id” property)
    // and retrieve the whole user information
    $.ajax({
        url: kinveyUserUrl,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: afterPublisherRequest,
        error: handleAjaxError
    });

    function afterPublisherRequest(publisher) {
        // parsing the information from the form and sending another request
        // – this time to save our advert in database. (below)
        let title = $('#formCreateAd input[name=title]');
        let description = $('#formCreateAd textarea[name=description]');
        let datePublished = $('#formCreateAd input[name=datePublished]');
        let price = $('#formCreateAd input[name=price]');
        

        let advertData = {
            publisher: publisher.username,
            title: title.val(),
            description: description.val(), // NOT SURE IF THIS SHOULD BE val() OR text()
            datePublished: datePublished.val(),
            price: price.val()
        }
        // save advert in database
        // POST -> BASE_URL + 'appdata/' + APP_KEY + '/ads'
        $.ajax({
            method: 'POST',
            url: BASE_URL + 'appdata/' + APP_KEY + '/ads',
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
            },
            data: advertData,
            success: createAdSuccess,
            error: handleAjaxError
        });

        function createAdSuccess(response) {
            listAds(); //or leave it commented so user can add yet another ad
            showInfo('Ad created.');
        }
    }
}

// auxiliary functions
function saveAuthInSession(userInfo) {
    // saves authtoken, user id and username to sessionStorage
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('userId', userInfo._id);
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}