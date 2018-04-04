const BASE_URL = 'https://baas.kinvey.com/'
const APP_KEY = 'kid_BkLw8DA5z';
const APP_SECRET = '035af9093541498dbf479d9670f6a821';
const AUTH_HEADERS = {'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)}
const BOOKS_PER_PAGE = 10

// SESSION MANIPULATION PART 1
function loginUser() {
    // POST -> BASE_URL + 'user/' + APP_KEY + '/login'
    // signInUser(res, 'Login successful.')
    let userData = {
        username: $('#formLogin input[name=username]').val(),
        password: $('#formLogin input[name=passwd]').val()
    }
    let request = {
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/login',
        headers: {
            'Authorization': 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET)
        },
        data: userData, // JSON.stringify(userData)
        success: loginSuccess,
        error: handleAjaxError
    };

    $.ajax(request);

    function loginSuccess(userInfo) { // the response from loggin in a user
        // is the user itself that we just logged in with
        saveAuthInSession(userInfo);
        showHideMenuLinks();
        listBooks();
        showInfo('User log in successful.');
    }
}

function registerUser() {
    // TODO
    // POST -> BASE_URL + 'user/' + APP_KEY + '/'
    // signInUser(res, 'Registration successful.')
    let userData = {
        username: $('#formRegister input[name=username]').val(),
        password: $('#formRegister input[name=passwd]').val()
    }
    let request = {
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/',
        headers: {
            'Authorization': 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET)
        },
        data: userData, // JSON.stringify(userData)
        success: registerSuccess,
        error: handleAjaxError
    };

    $.ajax(request);

    function registerSuccess(userInfo) { // the response from registering a user
        // is the user itself that we just registered
        saveAuthInSession(userInfo);
        showHideMenuLinks();
        listBooks();
        showInfo('User registered successfully.');
    }
}

// BOOK MANIPULATIONS
function listBooks() {
    // GET -> BASE_URL + 'appdata/' + APP_KEY + '/books'
    // displayPaginationAndBooks(res.reverse())
    $('#viewBooks').find('#books').empty();
    showView('viewBooks');
    
    $.ajax({
        method: 'GET',
        url: BASE_URL + 'appdata/' + APP_KEY + '/books',
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: loadBooksSuccess,
        error: handleAjaxError
    });

    function loadBooksSuccess(books) {
        showInfo('Books loaded.')
        if (books.length === 0) {
            $('#books').text('No books in the library.');
        } else {
            let bookTable = $('<table>');
            let trHeader = $('<tr>');
            trHeader.append($('<th>Title</th>'));
            trHeader.append($('<th>Author</th>>'));
            trHeader.append($('<th>Description</th>'));
            trHeader.append($('<th>Actions</th>'));
            bookTable.append(trHeader);
            for (const book of books) {
                appendBookRow(book, bookTable);
            }
            $('#books').append(bookTable);
        }
        // CHECK: Not sure if appendBookRow(book, bookTable) should all go in here
    }
}

function appendBookRow(book, bookTable) {
    let tr = $('<tr>');
    tr.append(`<td>${book.title}</td>`);
    tr.append(`<td>${book.author}</td>`);
    tr.append(`<td>${book.description}</td>`);
    let td = $('<td>');
    let buttons = [];
    // add the edit and delte buttons only for the current user's books
    if (book._acl.creator == sessionStorage.getItem('userId')) {
        // Bind the event handler with the current book
        let buttonDelete = $('<button>Delete</button>').click(deleteBook.bind(this, book));
        let buttonEdit = $('<button>Edit</button>').click(loadBookForEdit.bind(this, book));
        buttons = [buttonDelete, ' ', buttonEdit];
    }
    td.append(buttons);
    tr.append(td);
    bookTable.append(tr);
}

function createBook() {
    // POST -> BASE_URL + 'appdata/' + APP_KEY + '/books'
    // showInfo('Book created.');
    let bookToAdd = {
        title: $('#formCreateBook input[name=title]').val(),
        author: $('#formCreateBook input[name=author]').val(),
        description: $('#formCreateBook textarea[name=description]').val()
    };

    $.ajax({
        method: 'POST',
        url: BASE_URL + 'appdata/' + APP_KEY + '/books',
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        data: bookToAdd,
        success: createBookSuccess,
        error: handleAjaxError
    });

    function createBookSuccess(data) {
        listBooks();
        showInfo('Book created.');
    }
}

function deleteBook(book) {
    // DELETE -> BASE_URL + 'appdata/' + APP_KEY + '/books/' + book._id

    $.ajax({
        method: 'DELETE',
        url: BASE_URL + 'appdata/' + APP_KEY + '/books/' + book._id,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        success: deleteBookSuccess,
        error: handleAjaxError
    });

    function deleteBookSuccess(response) {
        listBooks();
        showInfo('Book deleted.');
    }
}

function loadBookForEdit(book) {
    showView('viewEditBook');
    $('#formEditBook input[name=id]').val(book._id);
    $('#formEditBook input[name=title]').val(book.title);
    $('#formEditBook input[name=author]').val(book.author);
    $('#formEditBook textarea[name=description]').val(book.description);
    // when we click on submit we have already atteched a submit event to EDIT button so we will
    // be redirected to below function editBook()
}

function editBook() {
    // PUT -> BASE_URL + 'appdata/' + APP_KEY + '/books/' + book._id
    let bookData = {
        title: $('#formEditBook input[name=title]').val(),
        author: $('#formEditBook input[name=author]').val(),
        description: 
          $('#formEditBook textarea[name=description]').val()
      };
    
    $.ajax({
        method: 'PUT',
        url: BASE_URL + 'appdata/' + APP_KEY + '/books/' + $('#formEditBook input[name=id]').val(),
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        data: bookData,
        success: editBookSuccess,
        error: handleAjaxError
    });

    function editBookSuccess(response) {
        listBooks();
        showInfo('Book edited.')
    }
}

// SESSION MANIPULATION PART 2
function saveAuthInSession(userInfo) {
    // saves authtoken, user id and username to sessionStorage
    sessionStorage.setItem('username', userInfo.username);
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('userId', userInfo._id);
    $('loggedInUser').text(`Welcome ${sessionStorage.getItem('username')}!`);
}

function logoutUser() {
    sessionStorage.clear();
    showHomeView();
    showHideMenuLinks();
    showInfo('User log out successful.');
}

// function signInUser(res, message) {
//     // TODO
// }

// function displayPaginationAndBooks(books) {
//     let pagination = $('#pagination-demo')
//     if(pagination.data("twbs-pagination")){
//         pagination.twbsPagination('destroy')
//     }
//     pagination.twbsPagination({
//         totalPages: Math.ceil(books.length / BOOKS_PER_PAGE),
//         visiblePages: 5,
//         next: 'Next',
//         prev: 'Prev',
//         onPageClick: function (event, page) {
//             // TODO remove old page books
//             let startBook = (page - 1) * BOOKS_PER_PAGE
//             let endBook = Math.min(startBook + BOOKS_PER_PAGE, books.length)
//             $(`a:contains(${page})`).addClass('active')
//             for (let i = startBook; i < endBook; i++) {
//                 // TODO add new page books
//             }
//         }
//     })
// }

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}