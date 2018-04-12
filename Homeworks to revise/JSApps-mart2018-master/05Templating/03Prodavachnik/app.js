function startApp() {

    //Navigation and headers
    //=======TEMPLATES=====
    const templates = {};

    loadTemplates();

    async function loadTemplates() {

        const [adsCatalogTemplate, adBoxTemplate, headersTemplate, sessionsTemplate,userBoxTemplate] = await Promise.all([
            $.get('./templates/ads_catalog.html'),
            $.get('./templates/ad_box_partial.html'),
            $.get('./templates/header-templates.html'),
            $.get('./templates/session-template.html'),
            $.get('./templates/session-partial.html')
        ]);

        templates['catalog'] = Handlebars.compile(adsCatalogTemplate);
        templates['ad'] = Handlebars.registerPartial('adBox', adBoxTemplate);
        templates['headers'] = Handlebars.compile(headersTemplate);
        templates['sessions'] = Handlebars.compile(sessionsTemplate);
        templates['user']=Handlebars.registerPartial('userBox',userBoxTemplate);

    }

    showHideLinks();
    async function showHideLinks() {
        let headers = window.headers.unauthHeaders;

        if (localStorage.getItem('authtoken')) {
            headers = window.headers.authHeaders;
        }
        let source = await $.get('./templates/header-templates.html');
        let compiled = Handlebars.compile(source);
        //let template = await compiled({ headers });

        //sometimes do not work
        let template = await templates.headers({ headers });
             
        let menu = $('#menu');
        if (menu.length) {
            menu.html(template);
        } else {
            $('#app').append(template);
        }
        $('header').find('a').show();

        if (localStorage.getItem('authtoken')) {
            $('#loggedInUser').text(`Welcome, ${localStorage.getItem('username')}!`);
        }

       
        attachEventLinks();
    }

    function attachEventLinks() {
        //Attach event listener
        $('#linkHome').click(() => showView('home'));
        $('#linkLogin').click(() => showView('login'));
        $('#linkRegister').click(() => showView('register'));
        $('#linkListAds').click(() => showView('ads'));
        $('#linkCreateAd').click(() => showView('create'));
        $('#linkLogout').click(logout);
 
        $('#buttonCreateAd').click(createAd);

        //Notifications
        $(document).on({
            ajaxStart: () => $('#loadingBox').show(),
            ajaxStop: () => $('#loadingBox').fadeOut()
        });

        $('#infoBox').click((e) => $(e.target).hide());
        $('#errorBox').click((e) => $(e.target).hide());
    }

   
    renderSessionSections();
    showView('home');

    function showView(view) {
        $('section').hide();

        switch (view) {
            case 'home':
                $('#viewHome').show();
                break;
            case 'login':
                $('#viewLogin').show();
                break;
            case 'register':
                $('#viewRegister').show();
                break;
            case 'ads':
                $('#viewAds').show();
                loadAds();
                break;
            case 'create':
                $('#formCreateAd').trigger('reset');
                $('#viewCreateAd').show();
                break;
            case 'details':
                $('#viewDetailsAd').show();
                countViews(ad);
                break;
            case 'edit':
                $('#viewEditAd').show();
                break;

        }
    }

    async function renderSessionSections() {
        let sessions=window.sessions;
console.log(sessions);

        let source = await $.get('./templates/session-template.html');
        let compiled = Handlebars.compile(source);
        let template = await compiled({ sessions });

        //sometimes do not work
        // let template = await templates.sessions({sessions});
        console.log('in render section'+ template);
          
        
        $('#users').html(template);
        $('#buttonLoginUser').click(login);
        $('#buttonRegisterUser').click(register);
    }

    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(() => $('#infoBox').fadeOut(), 3000);
    }

    function showError(message) {
        $('#errorBox').text(message);
        $('#errorBox').show();
    }

    function handleError(err) {
        showError(err.responseJSON.description);
    }

    //Session
    let requester = (() => {
        //Application settings
        const baseUrl = 'https://baas.kinvey.com/';
        const appKey = 'kid_HkeayCIqf';
        const appSecret = 'a499470dbfdf471d805a3abd80455038';

        function makeAuth(type) {
            if (type === 'basic') return 'Basic ' + btoa(appKey + ":" + appSecret);
            else return 'Kinvey ' + localStorage.getItem('authtoken');
        }

        function makeRequest(method, module, url, auth) {
            return {
                url: baseUrl + module + '/' + appKey + '/' + url,
                method,
                headers: {
                    'Authorization': makeAuth(auth)
                }
            };
        }

        function get(module, url, auth) {
            return $.ajax(makeRequest('GET', module, url, auth));
        }

        function post(module, url, data, auth) {
            let req = makeRequest('POST', module, url, auth);
            req.data = JSON.stringify(data);
            req.headers['Content-Type'] = 'application/json';
            return $.ajax(req);
        }

        function update(module, url, data, auth) {
            let req = makeRequest('PUT', module, url, auth);
            req.data = JSON.stringify(data);
            req.headers['Content-Type'] = 'application/json';
            return $.ajax(req);
        }

        function remove(module, url, data, auth) {
            return $.ajax(makeRequest('DELETE', module, url, auth));

        }

        return {
            get,
            post,
            update,
            remove
        };
    })();

    function saveSession(data) {
        localStorage.setItem('username', data.username);
        localStorage.setItem('id', data._id);
        localStorage.setItem('authtoken', data._kmd.authtoken);
        // userLoggedIn();

    }

    async function login() {
        let form = $('#formLogin');
        let username = form.find('input[name="username"]').val();
        let password = form.find('input[name="passwd"]').val();
        try {
            let data = await requester.post('user', 'login', {
                username,
                password
            }, 'basic');
            showInfo('Logged in!');
            saveSession(data);
            showHideLinks();
            showView('ads');
        } catch (error) {
            handleError(error);
        }



    }

    async function register() {
        let form = $('#formRegister');
        let username = form.find('input[name="username"]').val();
        let password = form.find('input[name="passwd"]').val();
        try {
            let data = await requester.post('user', '', {
                username,
                password
            }, 'basic');
            showInfo('Successfully registered!');
            saveSession(data);
            showView('ads');
        } catch (error) {
            handleError(error);
        }
    }

    async function logout() {
        try {
            let data = await requester.post('user', '_logout', {
                authtoken: localStorage.getItem('authtoken')
            });
            localStorage.clear();
            showInfo('Successfully logged out!');
            // userLoggedOut();
            showHideLinks();
            showView('home');

        } catch (err) {
            handleError(err);
        }
    }

    async function loadAds() {
        let content = $('#viewAds');
        content.empty();
        let ads = await requester.get('appdata', 'adverts');
        ads.forEach(a => {
            if (a._acl.creator === localStorage.getItem('id')) {
                a.isAuthor = true;
            }
        });

        let context = { ads };
        let html = templates['catalog'](context);
        content.html(html);

        let editButtons = $(content).find('.ad-box').find('.edit');
        let deleteButtons = $(content).find('.ad-box').find('.delete');
        let readButtons = $(content).find('.ad-box').find('.read');

        $('.edit').click(openEditAd);
        $('.delete').click(deleteAd);
        $('.read').click(openDetailsAd);

    }

    async function openDetailsAd() {
        let id = $(this).siblings('[data-id]').attr('data-id');

        let ad = await requester.get('appdata', `adverts/${id}`, 'kinvey');
        let detailDiv = $('#details');
        detailDiv.empty();
        let html = $('<div>');
        html.addClass('details-box');
        let title = $(`<div class="ad-title">${ad.title}</div>`);
        if (ad._acl.creator === localStorage.getItem('id')) {
            let deleteBtn = $('<button>&#10006;</button>').click(() => deleteAd(ad._id));
            deleteBtn.addClass('ad-control');
            deleteBtn.appendTo(title);
            let editBtn = $('<button>&#9998;</button>').click(() => openEditAd(ad));
            editBtn.addClass('ad-control');
            editBtn.appendTo(title);

        }
        html.append(title);
        html.append(`<div><img src="${ad.imageUrl}"></div>`);
        html.append(`<div><p>Description:</p><p>${ad.description}" </p></div>`);
        html.append(`<div>By ${ad.publisher} | Price: ${ad.price.toFixed(2)}</div>`);
        html.append(`<div>Published date ${ad.date}</div>`);
        html.append($(`<p>Views:</p>`));
        let back = $('<a href="#">[Back to List]</a>').click(() => showView('ads'));
        html.append(back);
        detailDiv.append(html);
        console.log(ad);
        showView('details');

    }

    async function countViews(ad) {
        let editedAd = {
            title: ad.title,
            description: ad.description,
            price: Number(ad.price),
            imageUrl: ad.imageUrl,
            date: ad.date,
            publisher: ad.publisher,
            views: ++ad.views
        }

        try {
            // await requester.update('appdata', 'adverts/' + ad._id, editedAd);
            showInfo('View counted!');
            showView('ads');
        } catch (error) {
            handleError(error);
        }
    }

    async function openEditAd() {
        let id = $(this).parent().attr('data-id');
        let ad = await requester.get('appdata', `adverts/${id}`, 'kinvey');

        let form = $('#formEditAd');
        form.find('input[name="title"]').val(ad.title);
        form.find('textarea[name="description"]').val(ad.description);
        form.find('input[name="price"]').val(ad.price);
        form.find('input[name="image"]').val(ad.imageUrl);

        let date = ad.date;
        let publisher = ad.publisher;
        let views = ad.views;

        form.find('#buttonEditAd').click(() => {
            editAd(id, date, publisher, views);
        });
        showView('edit');
    }

    async function editAd(id, date, publisher, views) {
        let form = $('#formEditAd');
        let title = form.find('input[name="title"]').val();
        let description = form.find('textarea[name="description"]').val();
        let price = form.find('input[name="price"]').val();
        let imageUrl = form.find('input[name="image"]').val();

        if (title.length === 0) {
            showError('Title cannot be empty');
            return;
        }

        if (description.length === 0) {
            showError('Description cannot be empty');
            return;
        }

        if (price.length === 0) {
            showError('Price cannot be empty');
            return;
        }

        let editedAd = {
            title,
            description,
            price: Number(price),
            imageUrl,
            date,
            publisher,
            views
        }

        try {
            await requester.update('appdata', 'adverts/' + id, editedAd);
            showInfo('Ad edited!');
            showView('ads');
        } catch (error) {
            handleError(error);
        }
    }

    async function deleteAd() {
        let id = $(this).parent().attr('data-id');
        await requester.remove('appdata', 'adverts/' + id);
        showInfo('Ad deleted');
        showView('ads');
    }

    async function createAd() {
        let form = $('#formCreateAd');
        let title = form.find('input[name="title"]').val();
        let description = form.find('textarea[name="description"]').val();
        let price = form.find('input[name="price"]').val();
        let imageUrl = form.find('input[name="image"]').val();
        let date = (new Date()).toString('yyyy-MM-dd');
        let publisher = localStorage.getItem('username');

        if (title.length === 0) {
            showError('Title cannot be empty');
            return;
        }

        if (description.length === 0) {
            showError('Description cannot be empty');
            return;
        }

        if (price.length === 0) {
            showError('Price cannot be empty');
            return;
        }

        let newAd = {
            title,
            description,
            price: Number(price),
            imageUrl,
            date,
            publisher,
            views: 0
        }

        try {
            await requester.post('appdata', 'adverts', newAd);
            showInfo('Ad created!');
            showView('ads');
        } catch (error) {
            handleError(error);
        }

    }

}