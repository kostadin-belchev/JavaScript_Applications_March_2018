function startApp() {
    const appKey = 'kid_B1XurRMof';
    const appSecret = 'e1054ebc27fa42d880bd9fa79e3fadb9';
    const baseURL = 'https://baas.kinvey.com';
    const authHeaders = {
        Authorization: 'Basic ' + btoa(appKey + ':' + appSecret)
    };
    showHideLinks();

    function showHideLinks() {
        $('#linkHome').show();
        if (sessionStorage.getItem('authtoken') === null) {
            $('#linkLogin').show();
            $('#linkRegister').show();
            $('#linkListAds').hide();
            $('#linkLogout').hide();
            $('#linkCreateAd').hide();
        } else {
            $('#linkLogin').hide();
            $('#linkRegister').hide();
            $('#linkListAds').show();
            $('#linkLogout').show();
            $('#linkCreateAd').show();
        }
    };

    function viewSection(sectionSelector) {
        $('main > section').hide();
        $('#view' + sectionSelector).show();
    };

    attachEvents();

    function attachEvents() {
        $('#buttonLoginUser').on('click', () => handleAuthRequest('Login'));
        $('#buttonRegisterUser').on('click', () => handleAuthRequest('Register'));
        $('#buttonCreateAd').on('click', () => handleAdRequest('CreateAd'));
        $('#buttonEditAd').on('click', () => handleAdRequest('EditAd'));
        $('#linkHome').on('click', () => viewSection('Home'));
        $('#linkLogin').on('click', () => viewSection('Login'));
        $('#linkRegister').on('click', () => viewSection('Register'));
        $('#linkListAds').on('click', () => {
            viewSection('Ads');
            loadAds();
        });
        $('#linkCreateAd').on('click', () => viewSection('CreateAd'));
        $('#linkLogout').on('click', () => {
            sessionStorage.clear();
            showHideLinks();
            viewSection('Home');
        });
    };

    async function handleAuthRequest(type) {
        let targetForm = $("#form" + type);
        let username = targetForm.find('input[name=username]').val();
        let password = targetForm.find('input[name=passwd]').val();
        let userData = {
            username,
            password
        };
        try {
            let user = await sendRequest("POST", type, null, userData);
            targetForm.trigger('reset');
            sessionStorage.setItem("username", user.username);
            sessionStorage.setItem("id", user._id);
            sessionStorage.setItem("authtoken", user._kmd.authtoken);
            showInfo('Successfully logged in!');
            showHideLinks();
            viewSection('Home');
        } catch (error) {
            console.log(error.message);
            showError(error.responseJSON.description);
        }
        ;
    };

    async function handleAdRequest(type) {
        let targetForm = $("#form" + type);
        let title = targetForm.find('input[name=title]').val();
        let description = targetForm.find('textarea[name=description]').val();
        let datePublished = targetForm.find('input[name=datePublished]').val();
        let price = targetForm.find('input[name=price]').val();

        let method = "POST";
        let param = null;
        let adData = {
            title,
            description,
            datePublished,
            price
        };

        if (type == 'EditAd') {
            method = 'PUT';
            param = '/' + targetForm.find('input[name=id]').val();
            console.log(param);
        }
        let headers = {
            Authorization: 'Kinvey ' + sessionStorage.getItem('authtoken')
        };

        try {
            let ad = await sendRequest(method, type, headers, adData, param);
            targetForm.trigger('reset');
            viewSection('Ads');
            loadAds();
            console.log(ad);
            showInfo('Added an ad successfully!')
        } catch (error) {
            console.log(error);
            showError(error.message);
        }
        ;
    };

    function sendRequest(method, action, headers, data, params) {
        headers = headers == null ? authHeaders : headers;
        let url = params == null ? actions[action] : actions[action] + params;
        return $.ajax({
            method,
            url: url,
            headers,
            data
        });
    };

    function showInfo(message) {
        showPopup(message, true);
    };

    function showError(message) {
        showPopup(message, false);
    };

    function showPopup(message, isInfo) {
        let selector = isInfo ? '#info' : '#error';
        let targetPopup = $(selector + 'Box');
        targetPopup.text(message);
        targetPopup.on('click', () => targetPopup.fadeOut());
        if (isInfo) {
            setTimeout(() => targetPopup.hide(), 3000);
            targetPopup.show();
        }
        targetPopup.show();
    };

    function fillTable(ads) {
        let table = $('#ads > table');
        let headerRow = table.find('tr')[0];
        table.empty();
        table.append($(headerRow));
        for (const ad of ads) {
            let rowTemplate = $(`<tr>`)
                .append($(`<td>`).text(ad.title))
                .append($(`<td>`).text(ad._acl.creator))
                .append($(`<td>`).text(ad.description))
                .append($(`<td>`).text(ad.price))
                .append($(`<td>`).text(ad.datePublished));
            let actionTd = $('<td>');
            if (ad._acl.creator == sessionStorage.getItem('id')) {
                actionTd.append($(`<a>`).text('Delete').attr('href', '#').on('click', () => {
                    deleteAd(ad._id);
                    console.log(ad._id);
                }))
                    .append(' ')
                    .append($(`<a>`).text('Edit').attr('href', '#').on('click', () => {
                        loadEditAd(ad);
                    }));
            }
            rowTemplate.append(actionTd);
            table.append(rowTemplate);
        }
    }

    async function loadAds() {
        showHideLinks();
        let headers = {
            Authorization: 'Kinvey ' + sessionStorage.getItem('authtoken')
        };
        try {
            let allAds = await sendRequest("GET", 'ListAds', headers);
            viewSection('Ads');
            console.log(allAds);
            fillTable(allAds);
        } catch (error) {
            console.log(error);
            showError(error.message);
        }
    }

    function loadEditAd(ad) {
        console.log(ad);
        let targetForm = $("#formEditAd");
        targetForm.find('input[name=id]').val(ad._id);
        targetForm.find('input[name=publisher]').val(ad._acl.creator);
        targetForm.find('input[name=title]').val(ad.title);
        targetForm.find('textarea[name=description]').val(ad.description);
        targetForm.find('input[name=datePublished]').val(ad.datePublished);
        targetForm.find('input[name=price]').val(ad.price);
        viewSection('EditAd');
    }

    function deleteAd(id) {
        let headers = {
            Authorization: 'Kinvey ' + sessionStorage.getItem('authtoken')
        };
        return $.ajax({
            method: "DELETE",
            url: baseURL + "/appdata/" + appKey + "/ads/" + id,
            headers,
            success: deleteAdSuccess
        });

        function deleteAdSuccess() {
            viewSection('Ads');
            loadAds();
            showInfo('Ad deleted.');
        }
    }

    const actions = {
        Login: baseURL + '/user/' + appKey + '/login',
        Register: baseURL + '/user/' + appKey,
        CreateAd: baseURL + '/appdata/' + appKey + '/ads',
        ListAds: baseURL + '/appdata/' + appKey + '/ads',
        EditAd: baseURL + '/appdata/' + appKey + '/ads'
    };
};