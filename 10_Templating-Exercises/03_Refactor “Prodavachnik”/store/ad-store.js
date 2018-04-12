(function () {
    class Ad {
        constructor(id, title, publisher, description, price, datePublished) {
            this.id = id;
            this.title = title;
            this.publisher = publisher;
            this.description = description;
            this.price = price;
            this.datePublished = datePublished;
        }
    }

    let ads = [
        new Ad('linkHome', 'Home'),
        new Ad('linkListAds', 'List Advertisements'),
        new Ad('linkCreateAd', 'Create Advertisement'),
        new Ad('linkLogout', 'Logout'),
    ];

    window.headers = ads;
})()