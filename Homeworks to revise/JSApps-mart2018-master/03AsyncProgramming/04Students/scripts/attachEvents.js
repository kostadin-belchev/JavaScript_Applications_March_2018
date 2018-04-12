function attachAllEvents() {
	// Bind the navigation menu links
	$("#linkHome").on('click', showHomeView);
	$("#linkLogin").on('click', showLoginView);
	$("#linkRegister").on('click', showRegisterView);
	$("#linkListStudents").on('click', listStudents);
	$("#linkCreateStudent").on('click', showCreateStudentView);
	$("#linkLogout").on('click', logoutUser);

	// Bind the form submit buttons
	$("#formLogin").on('submit', loginUser);
	$("#formRegister").on('submit', registerUser);
	$("#formCreateStudent").on('submit', createStudent);
	$("#formEditStudent").on('submit', editStudent);
	$("form").on('submit', function(event) { event.preventDefault(); });

	// Bind the info / error boxes
	$("#infoBox, #errorBox").on('click', function() {
		$(this).fadeOut();
	});

	// Attach AJAX "loading" event listener
	$(document).on({
		ajaxStart: function() { $("#loadingBox").show(); },
		ajaxStop: function() { $("#loadingBox").hide(); }
	});
}