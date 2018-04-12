define(['jquery', 'displayElements'], function ($, display) {
    const APP_KEY = 'kid_BkQKe_65M';
    const APP_SECRET = '88d395200a2645099914cff6b239fcb5';
    const BASE_URL ='https://baas.kinvey.com/';

    function login() {
        let loginForm = $('#formLogin');
        let username = loginForm.find('input[name="username"]').val();
        let password = loginForm.find('input[name="passwd"]').val();

        $.ajax({
            url: BASE_URL + 'user/' + APP_KEY + '/login',
            method: 'POST',
            headers: {
                'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET),
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                'username': username,
                'password': password
            }),
            success: (res) => {
                signInUser(res, 'Login successful.')
            },
            error: handleAjaxError
        });
    }
    
    function register() {
        let registerForm = $('#formRegister');
        let username = registerForm.find('input[name="username"]').val();
        let password = registerForm.find('input[name="passwd"]').val();

        $.ajax({
            url: BASE_URL + 'user/' + APP_KEY,
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET),
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                username: username,
                password: password
            }),
            success: (res) => {
                signInUser(res, 'Registration successful.')
            },
            error: handleAjaxError
        })
    }
    
    function logout() {
        $.ajax({
            url: BASE_URL + 'user/' + APP_KEY + '/_logout',
            method: 'POST',
            headers: {
                'Authorization': "Kinvey " + sessionStorage.getItem('authToken')
            },
            success: () => {
                sessionStorage.clear();
                display.showHideMenuLinks();
                display.showHomeView();
                display.showInfo('Logout successful.');
            },
            error: handleAjaxError
        });
    }

    function createAd() {
        let adForm = $('#formCreateAd');
        let title = adForm.find('input[name="title"]').val();
        let description = adForm.find('textarea').val();
        let date = adForm.find('input[name="datePublished"]').val();
        let price = Number(adForm.find('input[name="price"]').val());
        let image = adForm.find('input[name="image"]').val();

        $.ajax({
            url: BASE_URL + 'appdata/' + APP_KEY + '/advertisements',
            method: 'POST',
            headers: {
                'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                publisher: sessionStorage.getItem('username'),
                title: title,
                description: description,
                date: date,
                price: price,
                image: image
            }),
            success: () => {
                display.showHomeView();
                display.showInfo('Ad created.');
                adForm.trigger('reset');
            },
            error: handleAjaxError
        });
    }

    function deleteAd(ad, row) {
        $.ajax({
            url: BASE_URL + 'appdata/' + APP_KEY + '/advertisements/' + ad._id,
            method: 'DELETE',
            headers: {
                'Authorization': "Kinvey " + sessionStorage.getItem('authToken')
            },
            success: () => {
                display.showInfo('Ad deleted.');
                row.remove();
            },
            error: handleAjaxError
        });
    }

    function editAd() {
        let editForm = $('#formEditAd');
        let title = editForm.find('input[name="title"]').val();
        let price = editForm.find('input[name="price"]').val();
        let date = editForm.find('input[name="datePublished"]').val();
        let description = editForm.find('textarea').val();
        let id = editForm.find('input[name="id"]').val();
        let publisher = editForm.find('input[name="publisher"]').val();
        let image = adForm.find('input[name="image"]').val();

        $.ajax({
            url:  BASE_URL + 'appdata/' + APP_KEY + '/advertisements/' + id,
            method: 'PUT',
            headers: {
                'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                title: title,
                description: description,
                price: price,
                date: date,
                publisher: publisher,
                image: image
            }),
            success: () => {
                display.showInfo('Ad edited.');
                listAds();
            },
            error: handleAjaxError
        });
    }

    function listAds() {
        $.ajax({
            url: BASE_URL + 'appdata/' + APP_KEY + '/advertisements',
            method: 'GET',
            headers: {
                'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
            },
            success: (res) => {
                display.showView('viewAds');
                displayAds(res.reverse());
            },
            error: handleAjaxError
        });
    }

    function displayAds(ads) {
        let adsDiv = $('#ads');
        adsDiv.empty();

        if (ads.length === 0) {
            adsDiv.append('<h3 style="text-align: center">No advertisements to display</h3>');
        } else {
            let adsTable = $('<table>');
            adsTable.append(
                `<tr>
                    <th>Title</th>
                    <th>Publisher</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Date Published</th>
                    <th>Actions</th>
                </tr>`);

            for (let ad of ads.sort((a, b) => b.views - a.views)) {
                let row = $('<tr>');

                row.append(`<td>${ad.title}</td><td>${ad.description}</td><td>${ad.publisher}</td>
                            <td>${ad.date}</td><td>${ad.price}</td>`);
                let td = $('<td>');

                td.append($('<a href="#">[Read More]</a>').click(() => {

                    $.ajax({
                        url: BASE_URL + 'rpc/' + APP_KEY + '/custom/view',
                        method: 'POST',
                        headers: {
                            'Authorization': "Kinvey " + sessionStorage.getItem('authToken'),
                            'Content-Type': 'application/json'
                        },
                        data: JSON.stringify({
                            id: ad._id
                        }),
                        success: (res) => {
                            let div = $('#singleAd');
                            div.empty();
                            div.append(`
                                <br/>
                                <img src="${ad.image}" alt="Image"><br/>
                                <div>Title:</div>
                                <h1>${ad.title}</h1>
                                <div>Description:</div>
                                <p>${ad.description}</p>
                                <div>Publisher:</div>
                                <div>${ad.publisher}</div>
                                <div>Date:</div>
                                <div>${ad.date}</div>
                                <div>Price:</div>
                                <div>${ad.price}</div>
                                <div>Views:</div>
                                <div>${res.views}</div>
                            `);
                            display.showView('viewSingleAd');
                        },
                        error: handleAjaxError
                    });
                }));

                if (ad._acl.creator === sessionStorage.getItem('userId')) {
                    td.append($('<a href="#">[Edit]</a>').click(() => {
                        display.showView('viewEditAd');
                        let editForm = $('#formEditAd');
                        editForm.find('input[name="title"]').val(ad.title);
                        editForm.find('input[name="price"]').val(ad.price);
                        editForm.find('input[name="datePublished"]').val(ad.date);
                        editForm.find('textarea').val(ad.description);
                        editForm.find('input[name="id"]').val(ad._id);
                        editForm.find('input[name="publisher"]').val(ad.publisher);
                        editForm.find('input[name="image"]').val(ad.image);
                    }))
                        .append($('<a href="#">[Delete]</a>').click(() => {
                            deleteAd(ad, row);
                        }));
                }

                row.append(td);
                adsTable.append(row);
            }

            adsDiv.append(adsTable)
        }
    }

    function signInUser(res, message) {
        saveAuthInSession(res);
        display.showHomeView();
        display.showHideMenuLinks();
        display.showInfo(message);
    }

    function saveAuthInSession(userInfo) {
        sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
        sessionStorage.setItem('username', userInfo.username);
        sessionStorage.setItem('userId', userInfo._id);
    }

    function handleAjaxError(response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0)
            errorMsg = "Cannot connect due to network error.";
        if (response.responseJSON && response.responseJSON.description)
            errorMsg = response.responseJSON.description;
        display.showError(errorMsg)
    }
    
    return {
        login,
        register,
        logout,
        createAd,
        listAds,
        editAd
    }
});