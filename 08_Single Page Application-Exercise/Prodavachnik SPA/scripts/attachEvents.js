function attachAllEvents(params) {
    // Bind the navigation menu links
    $('#linkHome').on('click', showHomeView);
    $('#linkLogin').on('click', showLoginView);
    $('#linkRegister').on('click', showRegisterView);
    $('#linkListAds').on('click', listAds);
    $('#linkCreateAd').on('click', showCreateAdView);
    $('#linkLogout').on('click', logoutUser);

    // Bind the form submit buttons
    $("#formLogin").on('submit', loginUser);
    console.log('point before register user is called');
    $("#formRegister").on('submit', registerUser);
    $("#formCreateAd").on('submit', createAdvert);
    $("#formEditAd").on('submit', editAdvert);

    //Disable default submit for all forms
    $("form").on('submit', function(event) { event.preventDefault() });

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