const BASE_URL = 'https://baas.kinvey.com/'
const APP_KEY = 'kid_HyUrC2kof'
const APP_SECRET = '459495a5e30242909b98b46aebd57924'
const AUTH_HEADERS = {
    'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)
}
const BOOKS_PER_PAGE = 10

function loginUser() {
    let username = $('#formLogin div:nth-child(2) input').val();
    let password = $('#formLogin div:nth-child(4) input').val();

    $.ajax({
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/login',
        headers: AUTH_HEADERS,
        data: {
            username,
            password
        }
    }).then(function (response) {
        signInUser(response, 'Login successful.')

    }).catch(function (response) {
        handleAjaxError(response)
    })

}

function registerUser() {

    let username = $('#formRegister div:nth-child(2) input').val();
    let password = $('#formRegister div:nth-child(4) input').val();

    $.ajax({
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/',
        headers: AUTH_HEADERS,
        data: {
            username,
            password
        }
    }).then(function (response) {
        signInUser(response, 'Registration successful.')

    }).catch(function (response) {
        handleAjaxError(response)
    })

}

function listBooks() {
    $.ajax({
        method: 'GET',
        url: BASE_URL + 'appdata/' + APP_KEY + '/books',
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        }
    }).then(function (response) {
        showView('viewBooks')
        displayPaginationAndBooks(response.reverse());
    }).catch(handleAjaxError)

}


function createBook() {
    let title = $('#formCreateBook div:nth-child(2) input').val();
    let author = $('#formCreateBook div:nth-child(4) input').val();
    let description = $('#formCreateBook div:nth-child(6) textarea').val();

    $.ajax({
        method: 'POST',
        url: BASE_URL + 'appdata/' + APP_KEY + '/books',
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        data: {
            title,
            author,
            description
        }
    }).then(function(response){
        listBooks();
        showInfo('Book created.');
    }).catch(function (response) {
        handleAjaxError(response);
      })
    
}

function deleteBook(book) {
    
    $.ajax({
        method:'DELETE',
        url: BASE_URL + 'appdata/' + APP_KEY + '/books/' + book._id,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        }
    }).then(function(response){
        listBooks();
        showInfo('Book deleted.')
    }).catch(function (response) {
        handleAjaxError(response);
      })
    
}

function loadBookForEdit(book) {
    showView('viewEditBook');
    $('#formEditBook input[name=title]').val(book.title);
    $('#formEditBook input[name=author]').val(book.author);
    $('#formEditBook input[name=id]').val(book._id);
    $('#formEditBook textarea[name=description]').val(book.description);
}

function editBook() {
    let title=$('#formEditBook input[name=title]').val();
    let author=$('#formEditBook input[name=author]').val();
    let id =$('#formEditBook input[name=id]').val();
   let description= $('#formEditBook textarea[name=description]').val();
$.ajax({
    method:'PUT',
    url:BASE_URL + 'appdata/' + APP_KEY + '/books/' + id,
    headers: {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    },
    data:{
       title,author,description
    }
}).then(function(response){
    
    listBooks();
    showInfo('Book edited.')
})
.catch(function (response) {
    handleAjaxError(response);
  })
 
}

function logoutUser() {
    sessionStorage.clear();
    showHomeView();
    showHideMenuLinks();
    showInfo('Logout successful.')
}

function signInUser(response, message) {

    sessionStorage.setItem('username', response.username);
    sessionStorage.setItem('authToken', response._kmd.authtoken);
    sessionStorage.setItem('userId', response._id);
    showHomeView();
    showHideMenuLinks();
    showInfo(message);
}

function displayPaginationAndBooks(books) {

    let pagination = $('#pagination-demo')
    if (pagination.data("twbs-pagination")) {
        pagination.twbsPagination('destroy')
    }
    pagination.twbsPagination({
        totalPages: Math.ceil(books.length / BOOKS_PER_PAGE),
        visiblePages: 5,
        next: 'Next',
        prev: 'Prev',
        onPageClick: function (event, page) {
            let table = $('#books table')
            table.find('tr').each((index, el) => {
                if (index > 0) {
                    $(el).remove();
                }
            })

            let startBook = (page - 1) * BOOKS_PER_PAGE
            let endBook = Math.min(startBook + BOOKS_PER_PAGE, books.length)
            $(`a:contains(${page})`).addClass('active')
            for (let i = startBook; i < endBook; i++) {
                let tr = $('<tr>');
                table.append($(tr)
                    .append($(`<td>${books[i].title}</td>`))
                    .append($(`<td>${books[i].author}</td>`))
                    .append($(`<td>${books[i].description}</td>`))
                )
                if (books[i]._acl.creator === sessionStorage.getItem('userId')) {
                    tr.append($('<td>')
                        .append($('<a href="#">').text('[Delete]').click(function () {
                            deleteBook(books[i]);
                        }))
                        .append($('<a href="#">').text('[Edit]').click(function () {
                           loadBookForEdit(books[i]);
                        })))
                }
            }
        }
    })
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}