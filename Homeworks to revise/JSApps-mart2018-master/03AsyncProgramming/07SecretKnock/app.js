let appId = 'kid_BJXTsSi-e';
let apppSecret = '447b8e7046f048039d95610c1b039390';
let baseUrl = 'https://baas.kinvey.com/appdata/kid_BJXTsSi-e/knock';

let token = 'Basic ' + btoa('guest:guest');

let requestUrl = baseUrl + '?query=Knock Knock.';

console.log('Knock Knock');

$.ajax({
    method: 'GET',
    url: requestUrl,
    headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
    },
    success: function (success) {
        console.log(success.answer);
        console.log(success.message);
        requestUrl = baseUrl + '?query=' + success.message;
        $.get({
            method: 'GET',
            url: requestUrl,
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            success: function (success2) {
                console.log(success2.answer);
                console.log(success2.message);
                requestUrl = baseUrl + '?query=' + success2.message;
                $.get({
                    method: 'GET',
                    url: requestUrl,
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    },
                    success: function (success3) {
                        console.log(success3.answer);
                   

                    },
                    error: function (error3) {
                        console.log(error3);

                    }
                });
            },
            error: function (error2) {
                console.log(error2);

            }
        });
    },
    error: function (error) {
        console.log(error);
    }
});

function successKnock () {
    
}
