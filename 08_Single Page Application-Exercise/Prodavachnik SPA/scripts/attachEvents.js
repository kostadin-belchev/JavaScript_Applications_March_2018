function attachAllEvents(params) {
    // Bind the navigation menu links
    $('#linkHome').on('click', showHomeView);
    $('#linkLogin').on('click', showLoginView);
    $('#linkRegister').on('click', showRegisterView);
    $('#linkListAds').on('click', listAds);
    $('#linkCreateAd').on('click', showCreateAdView);
    $('#linkLogout').on('click', logoutUser);

    // Bind the form submit buttons
    $("#buttonLoginUser").on('click', loginUser);
    $("#buttonRegisterUser").on('click', registerUser);
    $("#buttonCreateAd").on('click', createAdvert);
    $("#buttonEditAd").on('click', editAdvert);

    // //Disable default click event for all forms
    // $("form").on('click', function(event) { event.preventDefault() });

    // To make it prettier
    // Bind the info / error boxes: hide on click
    $("#infoBox, #errorBox").on('click', function() {
        $(this).fadeOut()
    });

    // Attach AJAX "loading" event listener
    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }
    });
}