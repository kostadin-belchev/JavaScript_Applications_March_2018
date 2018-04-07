let startApp = (function () {

    // HTML Elements that are constantly in the DOM (not part of templates)
    let errorBox = $('#errorBox'),
        infoBox = $('#infoBox'),
        loadingBox = $('#loadingBox'),
        menuContainer = $('#menu'),
        viewContainer = $('#view');


// ----------------------- Session handler -------------------------------------------------------------------------
//    has methods that wrap session build-in browser functionality (localStorage)

    let sessionHandler = (function () {
        function getAuthToken() {
            return localStorage.getItem('authToken');
        }

        function getUsername() {
            return localStorage.username;
        }

        function getUserId() {
            return localStorage.getItem('userId');
        }

        function isAuthenticated() {
            return getAuthToken() !== null;
        }


        function saveSessionForUser(authToken, userId, username) {
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userId', userId);
            localStorage.setItem('username', username);
        }

        function destroySessionForUser() {
            localStorage.clear();
        }

        return {
            getAuthToken,
            saveSessionForUser,
            destroySessionForUser,
            getUsername,
            getUserId,
            isAuthenticated
        }
    })();
// ----------------------- END Session handler ---------------------------------------------------------------------

// --------------------- Requester ---------------------------------------------------------------------------------
//    has constants in itself
//    has methods that wrap the ajax requests and return promise

    let requester = (function () {
        let constants = {
            baseUrl: 'https://baas.kinvey.com/',
            appKey: 'kid_HJri46ePW',
            appSecret: '79df43971e664ee9bdfd820042b06c22',
            templatesPath: './templates/',
            templateExtension: '.hbs'
        };

        function getAuth(type) {
            if (type == 'basic') {
                return "Basic " + btoa(constants.appKey + ":" + constants.appSecret)
            }
            return "Kinvey " + sessionHandler.getAuthToken();
        }

        function get(module, endpoint, authType) {
            return $.ajax({
                method: "GET",
                url: constants.baseUrl + module + "/" + constants.appKey + "/" + endpoint,
                headers: {
                    'Authorization': getAuth(authType),
                }
            })
        }

        function post(module, endpoint, data, authType) {
            return $.ajax({
                method: "POST",
                url: constants.baseUrl + module + "/" + constants.appKey + "/" + endpoint,
                headers: {
                    'Authorization': getAuth(authType),
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(data)
            })
        }

        function update(module, endpoint, data, authType) {
            return $.ajax({
                method: "PUT",
                url: constants.baseUrl + module + "/" + constants.appKey + "/" + endpoint,
                headers: {
                    'Authorization': getAuth(authType),
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(data)
            })
        }

        function del(module, endpoint, authType) {
            return $.ajax({
                method: "DELETE",
                url: constants.baseUrl + module + "/" + constants.appKey + "/" + endpoint,
                headers: {
                    'Authorization': getAuth(authType),
                    'Content-Type': 'application/json'
                }
            })
        }

        function getTemplate(templateName, subfolderPath="") {
            subfolderPath = subfolderPath.length>0 ? subfolderPath+"/" : subfolderPath;
            return $.get(constants.templatesPath + subfolderPath + templateName + constants.templateExtension);
        }

        return {
            get,
            post,
            update,
            del,
            getTemplate
        }
    })();
// --------------------- END Requester -----------------------------------------------------------------------------


// ------------------------- Authenticator -------------------------------------------------------------------------
//     has methods for login, logout and register (they depend on the requester)

    let authenticator = (function () {
        function login(data) {
            return requester.post('user', 'login', data, 'basic')
        }

        function logout() {
            return requester.post('user', '_logout')
        }

        function register(data) {
            return requester.post('user', '', data, 'basic');
        }

        return {
            login,
            logout,
            register
        }
    })();

// ------------------------- END Authenticator ---------------------------------------------------------------------


// -------------------- Notification handler -----------------------------------------------------------------------
//  has method for showing error
// and for showing information in the DOM

    let notificationHandler = (function () {
        // attach listener for ajax calls to the document
        $(document).on({
            ajaxStart: ()=>loadingBox.show(),
            ajaxStop: ()=>loadingBox.fadeOut()
        });

        function showError(message) {
            errorBox.find('span.notification-text').text(message);
            errorBox.find('span.close-symbol').on('click', function (e) {
                $(e.target).parent().fadeOut();
            });
            errorBox.show();
        }

        function showInfo(message) {
            infoBox.text(message);
            infoBox.show();
            setTimeout(function () {
                infoBox.fadeOut();
            }, 3000)
        }


        return {
            showError,
            showInfo
        }
    })();
// -------------------- END Notification handler -------------------------------------------------------------------

// function that handles errors that are result of unsuccessful promise --------------------------------------------
    function handleError(err) {
        notificationHandler.showError(err.responseJSON.description);
    }

// ---------------------- Form transformer -------------------------------------------------------------------------
//     has method for transforming serialized form into JSON
//    and method for populating data in a form

    let formTransformer = (function () {
        function convertSerializedArrayToJSON(formObj) {
            let arrToConvert = formObj.serializeArray();
            let jsonObj = {};
            arrToConvert.forEach(function (e) {
                jsonObj[e.name] = e.value;
            });
            return jsonObj;
        }

        // https://stackoverflow.com/questions/9807426/use-jquery-to-re-populate-form-with-json-data
        // https://stackoverflow.com/questions/7298364/using-jquery-and-json-to-populate-forms
        function populateDataInForm(dataObj, formSelector) {
            for (let key in dataObj) {
                let formElement = $('[name=' + key + ']', formSelector);
                if (formElement.length > 0) {
                    if (formElement.is('select')) {
                        $('option', formElement).each(function () {
                            if ($(this).val() == dataObj[key]) {
                                this.selected = true;
                            }
                        });
                    }
                    else {
                        switch (formElement.attr('type')) {
                            case "text":
                            case "number":
                            case "textarea":
                            case "hidden":
                                formElement.val(dataObj[key]);
                                break;
                        }
                    }
                }
            }
        }

        return {
            convertSerializedArrayToJSON,
            populateDataInForm
        }
    })();
// ---------------------- END Form transformer ---------------------------------------------------------------------



// ------------------ App functionality ----------------------------------------------------------------------------

    function startApp() {
// after initial loading, need to display the menu which is a template
        manageMenu();
        showView('home', 'main');


// --------------------- functions that manage the login/logout process --------------------------------------------

        function handleLogin() {
            let dataForLogin = formTransformer.convertSerializedArrayToJSON($('#formLogin'));

            // some validation
            if (dataForLogin.username == '') {
                notificationHandler.showError("Please enter valid username");
                return;
            }
            if (dataForLogin.password == '') {
                notificationHandler.showError("Please enter your password");
                return;
            }

            authenticator.login(dataForLogin)
                .then(successLogin)
                .catch(handleError);
        }

        function handleLogout() {
            authenticator.logout();
            sessionHandler.destroySessionForUser();
            notificationHandler.showInfo("You successfully logged out!");
            manageMenu();
            showView('login', 'main');
        }

        function handleRegister() {
            // get the data form the form as JSON object
            let dataForRegister = formTransformer.convertSerializedArrayToJSON($('#formRegister'));

            // some validation
            if (dataForRegister.username == '') {
                notificationHandler.showError("Username must be at least 3 alphanumeric symbols");
                return;
            }
            if (dataForRegister.password == '') {
                notificationHandler.showError("Password must be at least 3 symbols long");
                return;
            }
            if (dataForRegister.password !== dataForRegister.repeatPassword) {
                notificationHandler.showError("The passwords you entered don't match");
                return;
            }

            // delete unnecessary property that should not be in the database
            delete dataForRegister.repeatPassword;

            // the authenticator module handles the register process
            authenticator.register(dataForRegister)
                .then(successLogin)
                .catch(handleError);
        }

        function successLogin(data) {
            sessionHandler.saveSessionForUser(data._kmd.authtoken, data._id, data.username);
            notificationHandler.showInfo("Hello " + sessionHandler.getUsername());
            manageMenu();

            handleDisplayingAllAd();
        }

// ------------------------------------ END ------------------------------------------------------------------------


// --------------------- functions that manage te ad publishing process --------------------------------------------
        function handlePublishing() {
            let dataAd = formTransformer.convertSerializedArrayToJSON($('#formCreateAd'));

            if (dataAd.title == '') {
                notificationHandler.showError("You need to enter a title!");
                return;
            }
            if (dataAd.description == '') {
                notificationHandler.showError("You need to enter a description!");
                return;
            }
            if (dataAd.price == '' || isNaN(Number(dataAd.price)) || Number(dataAd.price < 0.01)) {
                notificationHandler.showError("You need to enter a valid price!");
                return;
            }

            dataAd.createdAt = new Date().toISOString().substring(0, 10);
            dataAd.publisher = sessionHandler.getUsername();

            requester.post('appdata', 'adposts', dataAd)
                .then(successPublishing)
                .catch(handleError);

            function successPublishing(data) {
                notificationHandler.showInfo('You successfully posted an ad.');
                handleDisplayingAllAd();
            }

        }
// ------------------------------------ END ------------------------------------------------------------------------

// ----------------------- functions that manage the rendering of all ads ------------------------------------------
        function handleDisplayingAllAd() {
            requester.get('appdata', 'adposts')
                .then(renderAllAds)
                .catch(handleError);

            function renderAllAds(data) {
                let context = {
                    products: data,
                    username: sessionHandler
                        .getUsername()
                };
                requester.getTemplate('adPreview', 'products').then(function (data) {
                    let template = Handlebars.compile(data);
                    viewContainer.empty().append(template(context));
                    $('.edit-btn').on('click', function (e) {
                        let id = $(e.target).closest('.edit-btn').attr('data-id');
                        populateFormToEditAd(id);
                    });
                    $('.delete-btn').on('click', function (e) {
                        let id = $(e.target).closest('.delete-btn').attr('data-id');
                        let name = $(e.target).closest('.delete-btn').attr('data-name');
                        handleDeleteId(id, name);
                    });
                    $('.link-product-page').on('click', function (e) {
                        let id = $(e.target).closest('.link-product-page').attr('data-id');
                        handleShowAllInfoForAd(id);
                    });
                });
            }
        }
// ------------------------------------ END ------------------------------------------------------------------------


// ----------------- function that populates the edit-product-form with the product data ---------------------------
        function populateFormToEditAd(adId) {
            requester.get('appdata', 'adposts/' + adId)
                .then(fillInData)
                .catch(handleError);

            function fillInData(data) {
                requester.getTemplate('editProductForm', 'products')
                    .then(function (temp) {
                        let template = Handlebars.compile(temp);
                        viewContainer.empty().append(template({product : data}));
                        $('#buttonEditAd').on('click', handleEditAd)
                    });
            }
        }
// ------------------------------------ END ------------------------------------------------------------------------

// ---------- functions that handle the editing and deletion of a product ------------------------------------------
        function handleEditAd() {
            let dataAd = formTransformer.convertSerializedArrayToJSON($('#formEditAd'));
            requester.update('appdata', 'adposts/' + dataAd._id, dataAd)
                .then(function (data) {
                    notificationHandler.showInfo("You successfully edited " + data.title);
                    handleShowAllInfoForAd(dataAd._id);
                })
                .catch(handleError)
        }

        function handleDeleteId(adId, name) {
            requester.del('appdata', 'adposts/' + adId)
                .then(function (data) {
                    notificationHandler.showInfo("You successfully deleted " + name);
                    handleDisplayingAllAd();
                })
                .catch(handleError)
        }

// ------------------------------------ END ------------------------------------------------------------------------

// ------- function that handles the displaying of all information for a product when selected ---------------------
        function handleShowAllInfoForAd(adId) {
            requester.get('appdata', 'adposts/' + adId)
                .then(renderInfoForAd)
                .catch(handleError);

            function renderInfoForAd(data) {
                requester.getTemplate('adAllInfo', 'products')
                    .then(function (templ) {
                        let template = Handlebars.compile(templ);
                        let context = {
                            product : data,
                            username : sessionHandler.getUsername()
                        };
                        viewContainer.empty().append(template(context));

                        $('.edit-btn').on('click', function (e) {
                            let id = $(e.target).closest('.edit-btn').attr('data-id');
                            populateFormToEditAd(id);
                        });
                        $('.delete-btn').on('click', function (e) {
                            let id = $(e.target).closest('.delete-btn').attr('data-id');
                            let name = $(e.target).closest('.delete-btn').attr('data-name');
                            handleDeleteId(id, name);
                        });
                    });
            }
        }
// ------------------------------------ END ------------------------------------------------------------------------

// ----------- functions that manage the views showing in the DOM --------------------------------------------------
        function showView(templateName, subfolderPath="", context=null) {
            requester.getTemplate(templateName, subfolderPath)
                .then(function (data) {
                    let template = Handlebars.compile(data);
                    viewContainer.empty().append(template(context));


                    $('#buttonLoginUser').on('click', handleLogin);
                    $('#buttonRegisterUser').on('click', handleRegister);
                    $('#buttonCreateAd').on('click', handlePublishing);
                    $('#buttonEditAd').on('click', handleEditAd);
                });
        }

        function showViewOnClick(event) {
            let viewName = $(event.target).attr('id').slice(4).toLowerCase();
            let folderPath = $(event.target).attr('data-type');

            showView(viewName, folderPath);
        }

        function manageMenu() {
            // to the context that will be passed to the template we add property isAuthenticated
            // so that we can define what links to show in the menu
            let context = {
                user: {
                    isAuthenticated: sessionHandler.isAuthenticated(),
                    username: sessionHandler.getUsername()
                }
            };

            requester.getTemplate('headerMenu', 'main')
                .then(function (template) {
                    // Use Handlebars to load the templates
                    let templatePartial = Handlebars.compile(template);
                    menuContainer.empty().append(templatePartial(context));

                    // after loading the templates, attach listeners to the links since they are already in the DOM
                    $('#linkHome').on('click', showViewOnClick);
                    $('#linkLogin').on('click', showViewOnClick);
                    $('#linkRegister').on('click', showViewOnClick);
                    $('#linkListAds').on('click', handleDisplayingAllAd);
                    $('#linkCreateAd').on('click', showViewOnClick);
                    $('#linkLogout').on('click', handleLogout);

                })
                .catch(handleError);
        }
    }

// ------------------------------------ END ------------------------------------------------------------------------

    return startApp;
})();