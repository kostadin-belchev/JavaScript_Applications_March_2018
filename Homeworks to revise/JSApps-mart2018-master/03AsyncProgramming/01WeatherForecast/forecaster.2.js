// with async and await - judge do not like it
function attachEvents() {
    //Application settings
    const baseUrl = 'https://judgetests.firebaseio.com';

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

    function request(endpoint) {
        return $.ajax({
            url: baseUrl + endpoint,
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            }
        });
    }

    async function getWeatherInfo() {
        try {
            let dataInf = await request('/locations.json');
            displayLocationInfo(dataInf);
        } catch (err) {
            displayError();
        }
    }

    async function displayLocationInfo(data) {
        forecast.show();
        let code = data
            .filter(e => e.name === locationName.val())
            .map(loc => loc['code'])[0];

        if (!code) {
            displayError();
            return;
        }

        try {
            let todayForecast = await request(`/forecast/today/${code}.json`);
            let upcomingForecast = await request(`forecast/upcoming/${code}.json`);
            displayAllForecastInfo([todayForecast, upcomingForecast]);
        } catch (err) {
            displayError();
        }


        function displayAllForecastInfo([today, upcoming]) {
            current.empty();
            let container = $('<div class="label">Current conditions</div>');
            container.appendTo(current);
            let symbol = today.forecast.condition;
            $('<span>').addClass('condition symbol').html(weatherSymbols[symbol]).appendTo(current);
            let spanInfo = $('<span>').addClass('condition');
            $('<span>').addClass('forecast-data').text(today.name).appendTo(spanInfo);
            $('<span>').addClass('forecast-data').html(`${today.forecast.low}&deg;/${data.forecast.high}&deg;`).appendTo(spanInfo);
            $('<span>').addClass('forecast-data').text(today.forecast.condition).appendTo(spanInfo);
            spanInfo.appendTo(current);

            upcoming.empty();
            $('<div class="label">Three-day forecast</div>').appendTo(upcoming);
            for (const day of upcoming.forecast) {
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