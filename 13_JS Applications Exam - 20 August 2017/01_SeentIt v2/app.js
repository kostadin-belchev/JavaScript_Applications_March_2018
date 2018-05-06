function startApp() {
    // at startup load home view
    loadHome();

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

    //Disable default submit for all forms
    $("form").on('submit', function(event) { event.preventDefault() });
}