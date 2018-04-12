async function loadHeader() {
    let context = {
        user: {
            isAuthenticated: sessionStorage.getItem('authToken') !== null,
            username: sessionStorage.getItem('username')
        }
    };

    let source = await $.get('./templates/header-template.hbs');
    let compiled = Handlebars.compile(source);
    let template = compiled(context);
    $('header').html(template);
}

async function sectionLoader (context, templateURL) {
    let source = await $.get(templateURL);
    let compiled = Handlebars.compile(source);
    let template = compiled(context);
    //console.log(template);
    $('main').html(template);
}

async function loadHome() {
    let context = undefined;
    await sectionLoader(context, './templates/home-template.hbs');
}

async function loadLogin() {
    let context = {
        sectionType: 'viewLogin',
        formId: 'formLogin',
        sectionText: 'Please login here',
        buttonType: 'buttonLoginUser',
        buttonText: 'Login',
        buttonFunctionToExec: 'loginUser()'
    }
    await sectionLoader(context, './templates/login-register-template.hbs');
}

async function loadRegister() {
    let context = {
        sectionType: 'viewRegister',
        formId: 'formRegister',
        sectionText: 'Please register here',
        buttonType: 'buttonRegisterUser',
        buttonText: 'Register',
        buttonFunctionToExec: 'registerUser()'
    }
    await sectionLoader(context, './templates/login-register-template.hbs');
}

async function loadCreateAdd() {
    let context = {
        sectionType: 'viewCreateAd',
        formId: 'formCreateAd',
        sectionText: 'Create new Advertisement',
        buttonType: 'buttonCreateAd',
        buttonText: 'Create',
        buttonFunctionToExec: 'createAdvert()'
    }
    await sectionLoader(context, './templates/create-edit-ad-template.hbs');
}

async function loadAdForEdit() {
    let context = {
        sectionType: 'viewEditAd',
        formId: 'formEditAd',
        sectionText: 'Edit existing advertisement',
        buttonType: 'buttonEditAd',
        buttonText: 'Edit',
        buttonFunctionToExec: 'editAdvert()'
    }
    await sectionLoader(context, './templates/create-edit-ad-template.hbs');
}

// To make it prettier
// Bind the info / error boxes: hide on click
$("#infoBox, #errorBox").on('click', function () {
    $(this).fadeOut()
});

// Attach AJAX "loading" event listener
$(document).on({
    ajaxStart: function () {
        $("#loadingBox").show()
    },
    ajaxStop: function () {
        $("#loadingBox").hide()
    }
});