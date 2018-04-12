class Book {
    constructor(title, author, isbn) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
    }
}

function attachEvents() {

    const url = ' https://baas.kinvey.com/appdata/kid_SyowdAh5M';
    const username = 'test';
    const password = 'test';
    const base64 = btoa(username + ':' + password);
    const auth = {
        'Authorization': 'Basic ' + base64,
        'Content-type': 'application/json'
    };

    let request = function (method, endpoint, data) {
        return $.ajax({
            method: method,
            url: url + endpoint,
            headers: auth,
            data: JSON.stringify(data)
        })
    }
    $('.load').click(loadBooks);
    $('.add').click(addBook);

    function loadBooks() {
        request('GET', '/books')
            .then(displayBooks)
            .catch(errorHandler)
    }

    function displayBooks(response) {
        $('#books').empty();

        for (const obj of response) {

            let bookData = $(`<div class="book" data-id="${obj._id}">
        
        <div class="main-title">${obj.title}</div>
        
        <div class="hidden" style="display:none">
        <label>Title</label>
        <input type="text" class="title" value="${obj.title}" />
        <label>Author</label>
        <input type="text" class="author" value="${obj.author}" />
        <label>ISBN</label>
        <input type="text" class="isbn" value="${obj.isbn}" />
        </div>
        
    </div>`)

            bookData.append($('<button class="update" style="display:none" >Edit</button>').click(updateBook));
            bookData.append($('<button class="delete" style="display:none">Delete</button>').click(deleteBook));
            bookData.append($('<button class="show-more" style="display:block">Show More</button>').click(showMore));

            $('#books').append(bookData)
        }
    }

    function addBook() {
        let parentElement = $(this).parent();
        let book = createBook(parentElement);

        request('POST', '/books', book)
            .then(loadBooks)
            .catch(errorHandler)
    }

    function createBook(parentElement) {

        let title = parentElement.find('.title').val();
        let author = parentElement.find('.author').val();
        let isbn = parentElement.find('.isbn').val();
        let book = new Book(title, author, isbn);

        return book;

    }

    function updateBook() {
        let id = $(this).parent().attr('data-id');
        let book = createBook($(this).parent());
        request('PUT', `/books/${id}`, book)
            .then(loadBooks)
            .catch(errorHandler)
    }

    function deleteBook() {
        let id = $(this).parent().attr('data-id');
        request('DELETE', `/books/${id}`)
            .then(loadBooks)
            .catch(errorHandler)
    }

    function showMore() {

        if ($(this).parent().find('.hidden').css('display') === 'none') {
            
            $(this).parent().find('.hidden').css('display', 'block');
            $(this).parent().find('.delete').css('display', 'inline-block');
            $(this).parent().find('.update').css('display', 'inline-block');
            $(this).text('Show Less');
        }

        else{
            $(this).parent().find('.hidden').css('display', 'none');
            $(this).parent().find('.delete').css('display', 'none');
            $(this).parent().find('.update').css('display', 'none');
            $(this).text('Show More');
        }
    }

    function errorHandler() {
        console.log('Error');
    }

}