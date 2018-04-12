$(() => {
    //localStorage.clear();
    setGreeting();

    //Application settings
    const appKey = 'kid_HJwZlXBqM';
    const appSecret = '0c44fa2bed8d42d99360262850c8e604';
    const baseUrl = 'https://baas.kinvey.com/';

    //DOM elements


    //Event listeners
    $('#linkHome').click(() => showView('home'));
    $('#linkLogin').click(() => showView('login'));
    $('#linkRegister').click(() => showView('register'));
    $('#linkBooks').click(() => showView('books'));
    $('#linkCreate').click(() => showView('create'));
    $('#linkLogout').click(logout);

    $('#formLogin').submit(login);
    $('#formRegister').submit(register);
    $('#formCreateBook').submit(createBook);

    $(document).on({
        ajaxStart: () => $('#loadingBox').show(),
        ajaxStop: () => $('#loadingBox').hide()
    });

    $('#infoBox').click((e) => $(e.target).hide());
    $('#errorBox').click((e) => $(e.target).hide());


    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(() => $('#infoBox').hide(), 3000);
    }

    function showError(message) {
        $('#errorBox').text(message);
        $('#errorBox').show();
    }

    function handleError(err) {
        showError(err.responseJSON.description);
    }
    //Navigation and header
    function showView(view) {
        $('section').hide();
        switch (view) {
            case 'home':
                $('#viewHome').show();
                break;
            case 'login':
                $('#viewLogin').show();
                break;
            case 'register':
                $('#viewRegister').show();
                break;
            case 'books':
                getBooks();
                $('#viewBooks').show();
                break;
            case 'create':
                $('#viewCreateBook').show();
                break;
            case 'edit':
                $('#viewEditBook').show();
                break;
            case 'logout':
                $('#viewLogout').show();
                break;
        }
    }

    function makeHeader(type) {
        if (type === 'basic') {
            return {
                'Authorization': 'Basic ' + btoa(appKey + ':' + appSecret),
                'Content-type': 'application/json'
            };
        } else {
            return {
                'Authorization': 'Kinvey ' + localStorage.getItem('authtoken'),
                'Content-type': 'application/json'
            };
        }
    }

    //User session
    function setGreeting() {
        let username = localStorage.getItem('username');
        if (username !== null) {
            $('#loggedInUser').text(`Welcome, ${username}!`);
            $('#linkLogin').hide();
            $('#linkRegister').hide();
            $('#linkBooks').show();
            $('#linkCreate').show();
            $('#linkLogout').show();
        } else {
            $('#loggedInUser').text('');
            $('#linkLogin').show();
            $('#linkRegister').show();
            $('#linkBooks').hide();
            $('#linkCreate').hide();
            $('#linkLogout').hide();
        }
    }

    function setStorage(data) {
        localStorage.setItem('authtoken', data._kmd.authtoken);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userId', data._id);
        setGreeting();
        showView('books');
    }

    function login(e) {
        e.preventDefault();
        console.log('Attempting login');

        let username = $('#inputUsername').val();
        let password = $('#inputPassword').val();

        let req = {
            url: baseUrl + 'user/' + appKey + '/login',
            method: 'POST',
            headers: makeHeader('basic'),
            data: JSON.stringify({
                username: username,
                password: password
            }),
            success: (data) => {
                showInfo('Login successful');
                setStorage(data);
            },
            error: handleError
        };

        $.ajax(req);

    }

    function register(e) {
        e.preventDefault();
        console.log('Attempting register');

        let username = $('#inputNewUsername').val();
        let password = $('#inputNewPassword').val();
        let repeat = $('#inputRepeatPassword').val();

        if (username.length === 0) {
            showError("Username cannot be empty!");
            return;
        }

        if (password.length === 0) {
            showError("Password cannot be empty!");
            return;
        }

        if (repeat.length === 0) {
            showError("Password can't be empty!");
            return;
        }

        if (password !== repeat) {
            showError("Passwords don't match!");
            return;
        }

        let req = {
            url: baseUrl + 'user/' + appKey,
            method: 'POST',
            headers: makeHeader('basic'),
            data: JSON.stringify({
                username: username,
                password: password
            }),
            success: (data) => {
                showInfo('Registration successful');
                setStorage(data);
            },
            error: handleError
        };

        $.ajax(req);

        function registerSuccess(data) {
            localStorage.setItem('authtoken', data._kmd.authtoken);
            localStorage.setItem('username', data.username);
            showView('books');
        }

    }

    function logout() {

        let req = {
            url: baseUrl + 'user/' + appKey + '/_logout',
            method: 'POST',
            headers: makeHeader('kinvey'),
            success: logoutSuccess,
            error: handleError
        };

        $.ajax(req);

        function logoutSuccess(data) {
            localStorage.clear();
            setGreeting();
            showView('home');
        }

    }

    //Catalog
    function getBooks() {
        let tbody = $('#viewBooks').find('table').find('tbody');
        tbody.empty();

        let req = {
            url: baseUrl + 'appdata/' + appKey + '/books',
            headers: makeHeader('kinvey'),
            success: displayBooks,
            error: handleError
        };

        $.ajax(req);

        function displayBooks(data) {
            for (let book of data) {
                let actions = [];
                if (book._acl.creator === localStorage.getItem('userId')) {
                    actions.push($('<button>&#9998;</button>').click(() => editBook(book)));
                    actions.push($('<button>&#10006;</button>').click(() => deleteBook(book._id)));
                }
                let row = $('<tr>');
                row.append(`<td>${book.title}</td>`)
                    .append(`<td>${book.author}</td>`)
                    .append(`<td>${book.description}</td>`)
                    .append($(`<td>`).append(actions));
                row.appendTo(tbody);
            }
        }
    }

    function createBook() {
        let title = $('#inputNewTitle').val();
        let author = $('#inputNewAuthor').val();
        let description = $('#inputNewDescription').val();

        if (title.length === 0) {
            showError("Title cannot be empty!");
            return;
        }

        if (author.length === 0) {
            showError("Author cannot be empty!");
            return;
        }

        let book = {
            title,
            author,
            description
        };

        let req = {
            url: baseUrl + 'appdata/' + appKey + '/books',
            method: 'POST',
            headers: makeHeader('kinvey'),
            data: JSON.stringify(book),
            success: createSuccess,
            error: handleError
        };

        $.ajax(req);

        function createSuccess(data) {
            $('#formCreateBook').trigger('reset');
            showView('books');
        }
    }

    function deleteBook(id) {
        let req = {
            url: baseUrl + 'appdata/' + appKey + '/books/' + id,
            method: 'DELETE',
            headers: makeHeader('kinvey'),
            success: deleteSuccess,
            error: handleError
        };

        $.ajax(req);

        function deleteSuccess(data) {
            showInfo(`Book deleted`);
            showView('books');
        }
    }

    function editBook(book) {
        showView('edit');
        $('#inputTitle').val(book.title);
        $('#inputAuthor').val(book.author);
        $('#inputDescription').val(book.description);

        $('#formEditBook').submit(edit);

        function edit() {
            let title = $('#inputTitle').val();
            let author = $('#inputAuthor').val();
            let description = $('#inputDescription').val();

            if (title.length === 0) {
                showError("Title cannot be empty!");
                return;
            }

            if (author.length === 0) {
                showError("Author cannot be empty!");
                return;
            }

            let newBook = {
                title,
                author,
                description
            };

            let req = {
                url: baseUrl + 'appdata/' + appKey + '/books/'+book._id,
                method: 'PUT',
                headers: makeHeader('kinvey'),
                data: JSON.stringify(newBook),
                success: editSuccess,
                error: handleError
            };
    
            $.ajax(req);

            function editSuccess(data) {
                showInfo('Book edited');
                showView('books');
            }
        }
      

        
    }
});