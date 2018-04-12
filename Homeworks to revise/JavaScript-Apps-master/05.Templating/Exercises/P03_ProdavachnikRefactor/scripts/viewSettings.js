// function showHideMenuLinks() {
//   $("#linkHome").show()
//   if (sessionStorage.getItem('authToken') === null) { // No logged in user
//       $("#linkLogin").show()
//       $("#linkRegister").show()
//       $("#linkListAds").hide()
//       $("#linkCreateAd").hide()
//       $("#linkLogout").hide()
//       $('#loggedInUser').text("");
//   } else { // We have logged in user
//       $("#linkLogin").hide()
//       $("#linkRegister").hide()
//       $("#linkListAds").show()
//       $("#linkCreateAd").show()
//       $("#linkLogout").show()
//       $('#loggedInUser').text("Welcome, " + sessionStorage.getItem('username') + "!").show();
//   }
// }

// function showView(viewName) {
//   $('main > section').hide() // Hide all views
//   $('#' + viewName).show() // Show the selected view only
// }