function attachEvents() {
    //alert('test1');
    //List All Books upon loading page
    let secondColumn = $('#second-column');
    let bookShelf = $('#books');
    let username = 'kosta';
    let password = 'k';
    let BASE_URL = `https://baas.kinvey.com/appdata/kid_S1Hliji5f/books`;
    let submitButton = $('#btnSubmit');
    loadBooks();

    // attache event handlers
    $('#btnCreate').click(createBook);

    function loadBooks() {
        $.ajax({
            method: 'GET',
            url: BASE_URL,
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            }
        }).then(displayBooks).catch(handleError);
        console.log('loading finished');
    }
    function displayBooks(response) { // returns JSON with all books
        // empty shelf and hide edit field
        bookShelf.empty();
        console.log('loading started');
        secondColumn.css('display', 'none');
        //console.log(response);
        for (const key in response) {
            if (response.hasOwnProperty(key)) {
                const bookToAdd = response[key];
                generateAndAppendBook(bookToAdd);
            }
        }
        console.log('loading books stage 1 finished');
    }

    function generateAndAppendBook(book) {
        //console.log(book);
        let bookId = book._id;
        let li = $(`<li>Title: ${book.title} Author: ${book.author} </li>`);
        let editButton = $('<button>').text('Edit').click(editBook);
        li.append(editButton);
        let deleteButton = $('<button>').text('Delete').click(deleteBook);
        li.append(deleteButton);
        li.append(`<br>ISBN: ${book.isbn}`);
        li.attr('id', bookId);
        bookShelf.append(li);
    }

    //edit a book
    function editBook(e) {
        let bookToEdit = $(e.target).parent();
        //console.log(bookToEdit);
        secondColumn.css('display', 'block');
        let editBookFieldset = $('#editBook');
        
        let editedTitle = $('#titleToEdit');
        let editedAuthor = $('#authorToEdit');
        let editedIsbn = $('#isbnToEdit');

        submitButton.click(updateBook);
        
        function updateBook() {
            //console.log(bookToEdit);
            //console.log(bookToEdit[0].id);
            let editedData = {
                title: editedTitle.val(),
                author: editedAuthor.val(),
                isbn: editedIsbn.val()
            }
            $.ajax({
                method: 'PUT',
                url: BASE_URL + `/${bookToEdit[0].id}`,
                headers: {
                    'Authorization': 'Basic ' + btoa(username + ':' + password),
                    'Content-Type':'application/json'
                },
                data: JSON.stringify(editedData)               
            }).then(() => {
                console.log('Edited book in database');
                // clear form after correct execution
                editedTitle.val('');
                editedAuthor.val('');
                editedIsbn.val('');
                // hide the edit field
                submitButton.parent().parent().css('display', 'none');
                loadBooks();
            }).catch(handleError);
        }
    }

     // delete book
     function deleteBook(e) {
        let bookToDelete = $(e.target).parent();
        $.ajax({
            method: 'DELETE',
            url: BASE_URL + `/${bookToDelete[0].id}`,
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password),
                'Content-Type':'application/json'
            },
        }).then(() => {
            console.log('Deleted book from database');
            loadBooks();
        }).catch(handleError);
    }

    // Create a Book
    function createBook() {
        let title = $('#title');
        let author = $('#author');
        let isbn = $('#isbn');

        let bookToCreate = {
            title:title.val(),
            author:author.val(),
            isbn:isbn.val()
        }

        $.ajax({
            method: 'POST',
            url: BASE_URL,
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password),
                'Content-Type':'application/json'
            },
            data: JSON.stringify(bookToCreate)               
        }).then(() => {
            console.log('Added book to database');
            // clear form after correct execution
            title.val('');
            author.val('');
            isbn.val('');
            loadBooks();
        }).catch(handleError);
    }

    function handleError(err) {
        console.log(err);
        
    }
}