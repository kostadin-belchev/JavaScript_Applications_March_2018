function attachEvents() {
    const url = 'https://judgetests.firebaseio.com/';
    const forecastSection = $('#forecast');
    const currentDiv = $('#current');
    const upcomingDiv = $('#upcoming');
    const location = $('#location');
    const weatherSymbols = {
        'Sunny': '&#x2600', // ☀
        'Partly sunny': '&#x26C5', // ⛅
        'Overcast': '&#x2601', // ☁
        'Rain': '&#x2614', // ☂
        'Degrees': '&#176' // °
    }
    
    $('#submit').click(getWeather);

    function getWeather() {

        $.ajax({
            method: 'GET',
            url: url + `locations.json`,
            success: function (response) {

                $('span').remove();

                let locationCode = response.filter(e => e['name'] === location.val())[0];
                if (locationCode !== undefined) {

                    locationCode = locationCode.code;

                    //CURRENT CONDITIONS
                    $.ajax({
                        method: 'GET',
                        url: url + `/forecast/today/${locationCode}.json `,
                        success: function (response) {

                            forecastSection.css('display', 'block');

                            let symbolSpan = $(`<span class="condition symbol">${weatherSymbols[response.forecast.condition]}</span>`);

                            let containerSpan = $('<span class="condition">')
                                .append($(`<span class="forecast-data">${response.name}</span>`))
                                .append($(`<span class="forecast-data">${response.forecast.low}${weatherSymbols['Degrees']}/${response.forecast.high}${weatherSymbols['Degrees']}</span>`))
                                .append($(`<span class="forecast-data">${response.forecast.condition}</span>`));

                            currentDiv.append(symbolSpan);
                            currentDiv.append(containerSpan);
                        },
                        error: errorHandler
                    });

                    //UPCOMING CONDITIONS 
                    $.ajax({
                        method: 'GET',
                        url: url + `/forecast/upcoming/${locationCode}.json `,
                        success: function (response) {

                            for (let i = 0; i < response.forecast.length; i++) {
                                generateSpan(i);
                            }

                            function generateSpan(index) {
                                let upcomingSpan = $('<span class = "upcoming">')
                                    .append($(`<span class = "symbol">${weatherSymbols[response.forecast[index].condition]}</span>`))
                                    .append($(`<span class = "forecast-data">${response.forecast[index].low}${weatherSymbols['Degrees']}/${response.forecast[index].high}${weatherSymbols['Degrees']}</span>`))
                                    .append($(`<span class = "forecast-data">${response.forecast[index].condition}</span>`))
                                    .appendTo(upcomingDiv);
                            }

                        },
                        error: errorHandler

                    })

                } else {
                    errorHandler();
                }

            },
            error: errorHandler
        })
    }

    function errorHandler(error) {
        forecastSection.css('display', 'block');
        currentDiv.append($('<span class="error">ERROR</span>'));
    }

}