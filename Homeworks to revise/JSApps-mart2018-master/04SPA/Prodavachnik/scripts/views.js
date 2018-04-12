function showView(view) {
	$('section').hide();
	switch (view) {
	case 'home':
		$('#viewHome').show();
		break;
	case 'login':
		$('#viewLogin').show();
		$('#formLogin').trigger('reset');
		break;
	case 'register':
		$('#formRegister').trigger('reset');
		$('#viewRegister').show();
		break;
	case 'ads':
		$('#viewAds').show();
		break;
	case 'create':
		$('#formCreateAd').trigger('reset');
		$('#viewCreateAd').show();
		break;
	case 'details':
		$('#viewDetailsAd').show();
		break;
	case 'edit':
		$('#viewEditAd').show();
		break;

	}
}

function showHideMenuLinks() {
	$('#linkHome').show();
	if (localStorage.getItem('authToken') === null) { // No logged in user
		userLoggedOut();
	} else { // We have logged in user
		userLoggedIn();
	}

}

function userLoggedIn() {
	$('#loggedInUser').text(`Welcome, ${localStorage.getItem('username')}!`);
	$('#loggedInUser').show();
	$('#linkLogin').hide();
	$('#linkRegister').hide();
	$('#linkLogout').show();
	$('#linkListAds').show();
	$('#linkCreateAd').show();

}

function userLoggedOut() {
	$('#loggedInUser').text(``);
	$('#loggedInUser').hide();
	$('#linkLogin').show();
	$('#linkRegister').show();
	$('#linkLogout').hide();
	$('#linkListAds').hide();
	$('#linkCreateAd').hide();

}