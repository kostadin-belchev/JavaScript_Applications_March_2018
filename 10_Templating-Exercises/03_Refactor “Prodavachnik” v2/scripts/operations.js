//import { template, compile } from "handlebars";

// constants of the application
const BASE_URL = `https://baas.kinvey.com/`;
const APP_KEY = 'kid_SJL641Giz';
const APP_SECRET = '8b67885659bc4ac5a83733484305c14b';
const AUTH_HEADERS = {
    'Authorization': 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET)
};

// Session functionality (logout, login, register, etc.)
function registerUser() {
    let username = $('#formRegister input[name=username]').val();
    let password = $('#formRegister input[name=passwd]').val();

    if (username === '' || password === '') {
        showError("Username and password cannot be empty. Please enter both.");
        return;
    }

    let userData = {
        username: username,
        password: password
    }

    let request = {
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/',
        headers: AUTH_HEADERS,
        data: userData,
        success: registerUserSuccess,
        error: handleAjaxError
    }

    $.ajax(request);

    function registerUserSuccess(userInfo) { // the response from registering a user
        // is the user itself that we just registered
        $('#errorBox').hide();
        saveAuthInSession(userInfo);
        loadHeader();
        loadHome();
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
        headers: AUTH_HEADERS,
        data: userData,
        success: loginUserSuccess,
        error: handleAjaxError
    }

    $.ajax(request);

    function loginUserSuccess(userInfo) { // the response from loggin in a user
        // is the user itself that we just logged in with
        $('#errorBox').hide();
        saveAuthInSession(userInfo);
        loadHeader();
        loadHome();
        showInfo('User log in successful.');
        // clear form for next user
        $('#formLogin input[name=username]').val('');
        $('#formLogin input[name=passwd]').val('');
    }
}

function logoutUser() {
    sessionStorage.clear();
    loadHeader();
    loadHome();
    showInfo('User log out successful.');
}


// GRUD functionality for the ads
function listAds() {
    // GET -> BASE_URL + 'appdata/' + APP_KEY + '/ads'
    $.ajax({
        url: BASE_URL + 'appdata/' + APP_KEY + '/ads',
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: loadAdsSuccess,
        error: handleAjaxError
    });

    async function loadAdsSuccess(ads) {
        showInfo('Ads loaded.');
        // // empty ads before filling them out
        // $('#ads').empty();
        // reverse the ads so new adds appear on top
        ads.reverse();
        //if (ads.length !== 0) {
            for (const ad of ads) {
                ad.isEditableAd = false;
                if (ad._acl.creator == sessionStorage.getItem('userId')) {
                    // Bind the event handler with the current ad
                    ad.isEditableAd = true;
                }
            }

            let context = {ads};
            //console.log('Before request to get partial source');
            // BE CAREFUL TO NOT HAVE AD BLOCK ON BROWSER OTHERWISE WILL GET BLOCKED BY CLIENT ERROR
            let sourceAd = await $.get('./templates/ad-template.hbs');
            Handlebars.registerPartial('ad', sourceAd);
            await sectionLoader(context, './templates/list-ads-template.hbs');

        // } else { // if ads have 0 length
        //     $('main').html('<p style="font-style: italic">No ads available</p>');
        // }
    }
}



function deleteAd(adIdToDelete) {
    // DELETE -> BASE_URL + 'appdata/' + APP_KEY + '/ads/' + ad._id
    // console.log('Starting to delete add');
    // console.log(adIdToDelete);
    $.ajax({
        method: 'DELETE',
        url: BASE_URL + 'appdata/' + APP_KEY + '/ads/' + adIdToDelete,
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


// we only get the ID so fist we get the ad by it's ID and then we fill out the form 
// with the data then we modify the add and then save again to database
// Step 1. A GET to /appdata/:appKey/:collectionName/:id lets an app retrieve 
// a previously created entity.
// Step 2. PUT -> BASE_URL + 'appdata/' + APP_KEY + '/ads/' + ad._id
function editAdvert(adIdToEdit) {
    //console.log(adIdToEdit);
    // Step 1
    $.ajax({
        url:  BASE_URL + 'appdata/' + APP_KEY + '/ads/' + adIdToEdit,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: retrieveAdToEditSuccess,
        error: handleAjaxError
    });

    async function retrieveAdToEditSuccess(ad) {
        await loadAdForEdit();
        $('#formEditAd input[name=id]').val(ad._id);
        $('#formEditAd input[name=publisher]').val(ad.publisher);
        $('#formEditAd input[name=title]').val(ad.title);
        $('#formEditAd textarea[name=description]').val(ad.description);
        $('#formEditAd input[name=datePublished]').val(ad.datePublished);
        $('#formEditAd input[name=price]').val(ad.price);
        // when we click on EDIT we have already atteched a click event to EDIT button so we will
        // be redirected to below function editAdvert()
    }
}

function uploadEditedApp() {
    // step 2
    let adData = {
        id: $('#formEditAd input[name=id]').val(),
        publisher: $('#formEditAd input[name=publisher]').val(),
        title: $('#formEditAd input[name=title]').val(),
        description: $('#formEditAd textarea[name=description]').val(),
        datePublished: $('#formEditAd input[name=datePublished]').val(),
        price: $('#formEditAd input[name=price]').val()
    };

    // if we do not have description we allow the add to be generated, but not without the other
    if (!adData.title || !adData.datePublished || !adData.price) {
        showError('An ad must have title, date and price.');
        return;
    }
    //console.log(adData.id);
    $('#errorBox').hide();
    $.ajax({
        method: 'PUT',
        url: BASE_URL + 'appdata/' + APP_KEY + '/ads/' + adData.id /*$('#formEditAd input[name=id]').val()*/,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
            //'Content-Type': 'application/json'
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
        // if we do not have description we allow the add to be generated, but not without the other
        if (!title.val() || !datePublished.val() || !price.val()) {
            showError('Cannot create ad without title, date and price.');
            return;
        }

        let advertData = {
            publisher: publisher.username,
            title: title.val(),
            description: description.val(),
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

function showInfo(message) {
    let infoBox = $('#infoBox')
    infoBox.text(message)
    infoBox.show()
    setTimeout(function () {
        $('#infoBox').fadeOut()
    }, 2000)
}

function showError(errorMsg) {
    let errorBox = $('#errorBox')
    errorBox.text("Error: " + errorMsg)
    errorBox.show()
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}