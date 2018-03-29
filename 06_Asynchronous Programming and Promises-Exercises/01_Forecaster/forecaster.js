function attachEvents () {
    //alert('test 1');
    let getWeatherButton = $('#submit').click(getWeather);
    let forecast = $('#forecast');

    function getWeather() {
        $.get(`https://judgetests.firebaseio.com/locations.json`).then(getForcasts).catch(displayError);
    }

    function getForcasts(response) { // The response will be an array of objects
        let locationName = $('#location');
        let code;
        for (const location of response) {
            // console.log(location.name);
            // console.log(locationName);
            if (location.name === locationName.val()) {
                code = location.code;
            }
        }
        //console.log(code);
        
        // • For current conditions
        let promiseCurrConditions = $.get(`https://judgetests.firebaseio.com/forecast/today/${code}.json`);
        // • For a 3-day forecast
        let promiseForThreeDaysForecast = $.get(`https://judgetests.firebaseio.com/forecast/upcoming/${code}.json`);
        Promise.all([promiseCurrConditions, promiseForThreeDaysForecast])
            .then(displayCurrentAndThreeDayForecastConditions)
            .catch(displayError);

        function displayCurrentAndThreeDayForecastConditions([currConditions, threeDayConditions]) {
            forecast.css('display', 'inline-block');
            let symbols = {
                Sunny:			'&#x2600;', // ☀
                'Partly sunny':	'&#x26C5;', // ⛅
                Overcast:		'&#x2601;', // ☁
                Rain:			'&#x2614;', // ☂
                Degrees:		'&#176;'    // °
            }
            // console.log(currConditions);
            // console.log(threeDayConditions);

            // Current Conditions
            let currentForecastDiv = $('#current');
            currentForecastDiv.empty();
            currentForecastDiv.append($(`<div class="label">Current conditions</div>`));

            currentForecastDiv.append($(`<span>${symbols[currConditions.forecast.condition]}</span>`).addClass('condition symbol'));
            let conditionSpan = $('<span>').addClass('condition');
            conditionSpan.append($('<span>').addClass('forecast-data').text(currConditions.name));
            conditionSpan.append($(`<span>${currConditions.forecast.low}${symbols.Degrees}/${currConditions.forecast.high}${symbols.Degrees}</span>`).addClass('forecast-data'));
            conditionSpan.append($('<span>').addClass('forecast-data').text(currConditions.forecast.condition));
            currentForecastDiv.append(conditionSpan);

            //Three-day forecast
            let upcomingForecastDiv = $('#upcoming');
            upcomingForecastDiv.empty();
            upcomingForecastDiv.append($(`<div class="label">Three-day forecast</div>`));
            
            for (const key in threeDayConditions.forecast) {
                if (threeDayConditions.forecast.hasOwnProperty(key)) {
                    const oneDayForecast = threeDayConditions.forecast[key];
                    console.log(oneDayForecast);
                    createAndAppendSpan(oneDayForecast);
                }
            }
            // after everything has been attached we can cleare the entry field
            locationName.val('');

            function createAndAppendSpan(currForecast) {
                let upcomingSpan = $('<span>').addClass('upcoming');
                upcomingSpan.append($(`<span>${symbols[currForecast.condition]}</span>`).addClass('symbol'));
                upcomingSpan.append($(`<span>${currForecast.low}${symbols.Degrees}/${currForecast.high}${symbols.Degrees}</span>`).addClass('forecast-data'));
                upcomingSpan.append($(`<span>${currForecast.condition}</span>`).addClass('forecast-data'));
                upcomingForecastDiv.append(upcomingSpan);
            }
        }
    }

    function displayError(err) {
        // If an error occurs (the server doesn’t respond or the location name cannot be found)
        // or the data is not in the correct format, display "Error" in the forecast section.
        forecast.css('display', 'inline-block');
        forecast.text('Error');
    }
}