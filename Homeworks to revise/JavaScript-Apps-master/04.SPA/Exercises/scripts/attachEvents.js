function attachEvents() {

  $('#linkRegister').click(function () {
    showView('viewRegister');

  });

  $('#linkLogin').click(function () {

    showView('viewLogin');
  });

  $('#linkHome').click(function () {

    showView('viewHome');
  });

  $('#linkListAds').click(function () {
    showView('viewAds');
    listAds();
  });

  $('#linkCreateAd').click(function () {
    showView('viewCreateAd');
  });

  $('#linkLogout').click(function () {
    logoutUser();
  });

  $('#buttonRegisterUser').on('click', registerUser);
  $('#buttonLoginUser').on('click', loginUser)
  $('#buttonCreateAd').on('click', createAd)
  $('#buttonEditAd').on('click',uploadEditedAd)

  $(document).on({
    ajaxStart: function () {
      $("#loadingBox").show()
    },
    ajaxStop: function () {
      $("#loadingBox").hide()
    }
  })
}