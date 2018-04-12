(function () {
    class Header {
        constructor(id, text,dataTarget) {
            this.id = id;
            this.text=text;
            this.dataTarget=dataTarget;
        }
    }
           
    let authHeaders = [
        new Header('linkHome','Home','viewHome'),
        new Header('linkListAds','List Advertisements','viewAds'),
        new Header('linkCreateAd','Create Advertisement','viewCreateAd'),
        new Header('linkLogout','Logout',''),
        
       
    ];

    let unauthHeaders = [
        new Header('linkHome','Home','viewHome'),
        new Header('linkLogin','Login','viewLogin'),
        new Header('linkRegister','Register','viewRegister'),
       
    ];

    window.headers = {
        authHeaders,
        unauthHeaders
    };
})();