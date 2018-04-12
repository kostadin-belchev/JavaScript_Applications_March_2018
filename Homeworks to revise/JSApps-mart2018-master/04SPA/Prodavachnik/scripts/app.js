function startApp() {
	showHideMenuLinks();
	showView('home');
	attachAllEvents();
}

function attachAllEvents() {
	// Bind the navigation menu links

	$('#linkHome').click(() => showView('home'));
	$('#linkLogin').click(() => showView('login'));
	$('#linkRegister').click(() => showView('register'));
	$('#linkListAds').click(loadAds);
	$('#linkCreateAd').click(() => showView('create'));
	$('#linkLogout').click(logout);
    
	$('#buttonLoginUser').click(login);
	$('#buttonRegisterUser').click(register);
	$('#buttonCreateAd').click(createAd);

	//Notifications
	$(document).on({
		ajaxStart: () => $('#loadingBox').show(),
		ajaxStop: () => $('#loadingBox').fadeOut()
	});

	$('#infoBox').click((e) => $(e.target).hide());
	$('#errorBox').click((e) => $(e.target).hide());
}
