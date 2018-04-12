define(['jquery', 'crudOperations', 'displayElements'], function ($, crud, display) {
    return function () {
        $("#linkHome").click(display.showHomeView);
        $("#linkLogin").click(display.showLoginView);
        $("#linkRegister").click(display.showRegisterView);
        $("#linkListAds").click(crud.listAds);
        $("#linkCreateAd").click(display.showCreateAdView);
        $('#linkLogout').click(crud.logout);

        $('#buttonRegisterUser').click(crud.register);
        $('#buttonLoginUser').click(crud.login);
        $('#buttonCreateAd').click(crud.createAd);
        $('#buttonEditAd').click(crud.editAd);

        $("form").on('submit', function(event) { event.preventDefault() });

        $("#infoBox, #errorBox").on('click', function() {
            $(this).fadeOut();
        });

        $(document).on({
            ajaxStart: function() { $("#loadingBox").show() },
            ajaxStop: function() { $("#loadingBox").hide() }
        })
    } 
});