function saveSession(data) {
    sessionStorage.setItem('username', data.username);
    sessionStorage.setItem('id', data._id);
    sessionStorage.setItem('authtoken', data._kmd.authtoken);
    showHideMenuLinks();

}

async function loginUser() {
    let form = $('#formLogin');
    let username = form.find('input[name="username"]').val();
    let password = form.find('input[name="passwd"]').val();
    try {
        let data = await requester.post('user', 'login', {
            username,
            password
        }, 'basic');
        showInfo('Logged in!');
        saveSession(data);
        listStudents();
    } catch (error) {

        handleError(error);
    }

}

async function registerUser() {
    let form = $('#formRegister');
    let username = form.find('input[name="username"]').val();
    let password = form.find('input[name="passwd"]').val();
    try {
        let data = await requester.post('user', '', {
            username,
            password
        }, 'basic');
        showInfo('Successfully registered!');
        saveSession(data);
       listStudents();
    } catch (error) {
        handleError(error);
    }
}

async function logoutUser() {
    try {
        let data = await requester.post('user', '_logout', {
            authtoken: sessionStorage.getItem('authtoken')
        });
        sessionStorage.clear();
        showInfo('Successfully logged out!');
        showHideMenuLinks();
    } catch (err) {
        handleError(err);
    }
}

function showError(message) {
    $('#errorBox').text(message);
    $('#errorBox').show();
}

function handleError(err) {
    showError(err.responseJSON.description);
}