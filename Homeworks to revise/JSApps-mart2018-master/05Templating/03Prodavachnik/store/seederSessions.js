(function () {
    class Session {
        constructor(id, text) {
            this.id = id;
            this.text = text;

        }
    }

    let sessions = [
        new Session('Login', 'Please login'),
        new Session('Register', 'Please register here'),

    ];

    window.sessions = {
        sessions
    };
})();