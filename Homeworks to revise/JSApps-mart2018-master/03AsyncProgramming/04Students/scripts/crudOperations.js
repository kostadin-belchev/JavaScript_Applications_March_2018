const ELEMENTS_PER_PAGE = 10;
const studentsList = $('#students');

let requester = (() => {
	//Application settings
	const baseUrl = 'https://baas.kinvey.com/';
	const appKey = 'kid_BJXTsSi-e';
	const appSecret = '447b8e7046f048039d95610c1b039390';

	function makeAuth(type) {
		if (type === 'basic') return 'Basic ' + btoa("guest:guest");
		else return 'Kinvey ' + localStorage.getItem('authtoken');
	}

	function makeRequest(method, module, url, auth) {
		return {
			url: baseUrl + module + '/' + appKey + '/' + url,
			method,
			headers: {
				'Authorization': makeAuth(auth)
			}
		};
	}

	function get(module, url, auth) {
		return $.ajax(makeRequest('GET', module, url, auth));
	}

	function post(module, url, data, auth) {
		let req = makeRequest('POST', module, url, auth);
		req.data = JSON.stringify(data);
		req.headers['Content-Type'] = 'application/json';
		return $.ajax(req);
	}

	function update(module, url, data, auth) {
		let req = makeRequest('PUT', module, url, auth);
		req.data = JSON.stringify(data);
		req.headers['Content-Type'] = 'application/json';
		return $.ajax(req);
	}

	function remove(module, url, auth) {
		return $.ajax(makeRequest('DELETE', module, url, auth));

	}

	return {
		get,
		post,
		update,
		remove
	};
})();

async function listStudents() {
	try {
		let data = await requester.get('appdata', 'students', 'basic');
		$('#students > table').empty();
		showInfo('Student list is loading');

		if (data.length === 0) {
			$('#students').append('<p>No students info to display!</p>');
			return;
		}


		$('#students > table').append($('<tr><th>Id</th><th>First Name</th><th>Last Name</th><th>Faculty Number</th><th>Grade</th><th>Actions</th></tr>'));
		data = data.sort((a, b) => a.ID - b.ID);
		console.log(data);
		
		/* this code is when do not use pagination: */
		// for (let student of data) {
		// 	let html = $('<tr>');
		// 	html.addClass('student-box');
		// 	let id = $('<td>').html(`${student.ID}`);
		// 	let firstName = $(`<td>${student.FirstName}</td>`);
		// 	let lastName = $(`<td>${student.LastName}</td>`);
		// 	let facultyNumber = $(`<td>${student.FacultyNumber}</td>`);
		// 	let grade = $(`<td>${student.Grade}</td>`);
		// 	html.append(id)
		// 		.append(firstName)
		// 		.append(lastName)
		// 		.append(facultyNumber)
		// 		.append(grade);

		// 	if (student._acl.creator === sessionStorage.getItem('id')) {
		// 		let actionTD = $('<td>');
		// 		let deleteBtn = $('<button>&#10006;</button>').click(() => deleteStudent(student._id));
		// 		deleteBtn.addClass('student-control');
		// 		deleteBtn.appendTo(actionTD);
		// 		let editBtn = $('<button>&#9998;</button>').click(() => loadStudentForEdit(student));
		// 		editBtn.addClass('student-control');
		// 		editBtn.appendTo(actionTD);
		// 		html.append(actionTD);
		// 	}

		// 	$('#students').append(html);

		//}
		showView('viewStudents');
		displayPaginationAndElements(data);
		
	} catch (error) {
		handleError(error);
	}


}

async function createStudent() {
	let form = $('#formCreateStudent');
	let id = form.find('#id');
	let firstName = form.find('#firstName');
	let lastName = form.find('#lastName');
	let facultyNumber = form.find('#facultyNumber');
	let grade = form.find('#grade');
	let data = {
		ID: Number(id.val()),
		FirstName: firstName.val(),
		LastName: lastName.val(),
		FacultyNumber: facultyNumber.val(),
		Grade: Number(grade.val())
	};
	
	try {
		await requester.post('appdata', 'students', data, 'basic');
		showInfo('Student created!');
		listStudents();
	} catch (error) {
		handleError(error);
	}


}

async function editStudent(id) {
	let form = $('#formEditStudent');
	let idSt = form.find('#newId');
	let firstName = form.find('#newfirstName');
	let lastName = form.find('#newlastName');
	let facultyNumber = form.find('#newfacultyNumber');
	let grade = form.find('#newGrade');
	let data = {
		ID: Number(idSt.val()),
		FirstName: firstName.val(),
		LastName: lastName.val(),
		FacultyNumber: facultyNumber.val(),
		Grade: Number(grade.val())
	};

	try {
		await requester.update('appdata', 'students/' + id, data, 'basic');
		showInfo('Student edited!');
		listStudents();
	} catch (error) {
		handleError(error);
	}

}

async function deleteStudent(id) {
	try {

		await requester.remove('appdata', 'students/' + id, 'basic');
		showInfo('Student deleted');
		listStudents();

	} catch (error) {
		handleError(error);
	}
}

function loadStudentForEdit(student) {
	let form = $('#formEditStudent');
	form.find('#newId').val(student.ID);
	form.find('#newfirstName').val(student.FirstName);
	form.find('#newlastName').val(student.LastName);
	form.find('#newfacultyNumber').val(student.FacultyNumber);
	form.find('#newGrade').val(student.Grade);

	form.find('input[type="submit"]').click(() => {
		editStudent(student._id);
	});
	showView('viewEditStudent');
}

function displayPaginationAndElements(elements) {
	// TO DO
	let pagination = $('#pagination-demo');
	if (pagination.data("twbs-pagination")) {
		pagination.twbsPagination('destroy');
	}
	pagination.twbsPagination({
		totalPages: Math.ceil(elements.length / ELEMENTS_PER_PAGE),
		visiblePages: 5,
		next: 'Next',
		prev: 'Prev',
		onPageClick: function (event, page) {
			let table = $('#students > table');
			showInfo('Students list is loading');

			table.find('tr').each((index, el) => {
				if (index > 0) {
					$(el).remove();
				}
			});
			
			let startElement = (page - 1) * ELEMENTS_PER_PAGE;
			let endElement = Math.min(startElement + ELEMENTS_PER_PAGE, elements.length);
		
			//$(`a:contains(${page})`).addClass('active');

			for (let i = startElement; i < endElement; i++) {
				let tr = $(`<tr>`);
				table.append(
					$(tr).append($(`<td>${elements[i].ID}</td>`))
					.append($(`<td>${elements[i].FirstName}</td>`))
					.append($(`<td>${elements[i].LastName}</td>`))
					.append($(`<td>${elements[i].FacultyNumber}</td>`))
					.append($(`<td>${elements[i].Grade}</td>`))
				);				

				if (elements[i]._acl.creator === sessionStorage.getItem('id')) {
					$(tr).append(
						$(`<td>`).append(
							$(`<a href="#">[Edit]</a>`).on('click', function () {
								loadStudentForEdit(elements[i]);
							})
						).append(
							$(`<a href="#">[Delete]</a>`).on('click', function () {
								deleteStudent(elements[i]._id);
							})
						)
					);
				}

			}
		}
	});
}