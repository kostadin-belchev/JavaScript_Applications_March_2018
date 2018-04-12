function attachEvents() {
    //Application settings
    const baseUrl = 'https://judgetests.firebaseio.com/locations.json';

    // DOM elements
    const locationName = $('#location');
    const forecast = $('#forecast'); //change display none =>block
    const current = $('#current');
    const upcoming = $('#upcoming');
    const weatherSymbols = {
        "Sunny": "&#x2600;", // ☀
        "Partly sunny": "&#x26C5;", // ⛅
        "Overcast": "&#x2601;", // ☁
        "Rain": "&#x2614;", // ☂
        "Degrees": "&#176;"

    };


    $('#submit').on('click', getWeatherInfo);

    function getWeatherInfo() {
        let req = {
            url: baseUrl,
            method: "GET",
            success: displayLocationInfo,
            error: displayError
        };

        $.ajax(req);
    }

    function displayLocationInfo(data) {
        forecast.show();
        let code = data
            .filter(e => e.name === locationName.val())
            .map(loc=>loc['code'])[0];
        if(!code){
            displayError();
            return;
        }
       

        let req = {
            url: `https://judgetests.firebaseio.com/forecast/today/${code}.json`,
            success: displayToday,
            error: displayError
        };

        let req2 = {
            url: `https://judgetests.firebaseio.com/forecast/upcoming/${code}.json`,
            success: displayUpcoming,
            error: displayError
        };

        $.ajax(req);
        $.ajax(req2);

        function displayToday(data) {
            current.empty();
            let container = $('<div class="label">Current conditions</div>');
            container.appendTo(current);
            let symbol = data.forecast.condition;
            $('<span>').addClass('condition symbol').html(weatherSymbols[symbol]).appendTo(current);
            let spanInfo = $('<span>').addClass('condition');
            $('<span>').addClass('forecast-data').text(data.name).appendTo(spanInfo);
            $('<span>').addClass('forecast-data').html(`${data.forecast.low}&deg;/${data.forecast.high}&deg;`).appendTo(spanInfo);
            $('<span>').addClass('forecast-data').text(data.forecast.condition).appendTo(spanInfo);
            spanInfo.appendTo(current);

        }

        function displayUpcoming(data) {
            upcoming.empty();
            $('<div class="label">Three-day forecast</div>').appendTo(upcoming);
            for (const day of data.forecast) {
                showDayInfo(day);
            }

            function showDayInfo(day) {
                let container = $('<span>').addClass('upcoming');
                let symbol = day.condition;
                $('<span>').addClass('symbol').html(weatherSymbols[symbol]).appendTo(container);

                $('<span>').addClass('forecast-data').html(`${day.low}&deg;/${day.high}&deg;`).appendTo(container);
                $('<span>').addClass('forecast-data').text(day.condition).appendTo(container);
                container.appendTo(upcoming);
            }

        }


    }

    function displayError(err) {
        forecast.show();
        forecast.append($('<p>Error<p>'));
    }
}