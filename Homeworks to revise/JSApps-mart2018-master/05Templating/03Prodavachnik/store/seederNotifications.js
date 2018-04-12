(function () {
    class Notification {
        constructor(id, text) {
            this.id = id;
            this.text=text;
           
        }
    }

    
    let notifications = [
        new Notification('loadingBox','Loading &hellip;'),
        new Notification('infoBox','Info'),
        new Notification('errorBox','Error'),
    ];

    

    window.notifications = {
        notifications
    };
})();