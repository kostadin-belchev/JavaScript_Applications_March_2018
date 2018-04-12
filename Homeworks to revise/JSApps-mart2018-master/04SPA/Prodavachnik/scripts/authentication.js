function saveSession(data) {
    localStorage.setItem('username', data.username);
    localStorage.setItem('id', data._id);
    localStorage.setItem('authtoken', data._kmd.authtoken);

    userLoggedIn();

}

async function login() {
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
        
        loadAds();
    } catch (error) {
        handleError(error);
    }
}

async function register() {
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
        showView('ads');
    } catch (error) {
        handleError(error);
    }
}

async function logout() {
    try {
        let data = await requester.post('user', '_logout', {
            authtoken: localStorage.getItem('authtoken')
        });
        localStorage.clear();
        showInfo('Successfully logged out!');
        userLoggedOut();
        showView('home');

    } catch (err) {
        handleError(err);
    }
}