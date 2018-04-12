const BASE_URL = 'https://baas.kinvey.com/'
const APP_KEY = 'kid_r1X5BZ-oG'
const APP_SECRET = '4a918cb9d509437498da3acf97e961ee'
const AUTH_HEADERS = {
  'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)
}

function registerUser() {

  let username = $('#formRegister div:nth-child(2) input').val();
  let password = $('#formRegister div:nth-child(4) input').val();
  if (username === '' || password === '') {
    errorBoxLoader('Username or password can not be empty');
    return;
  }

  $.ajax({
    method: 'POST',
    url: BASE_URL + 'user/' + APP_KEY + '/',
    headers: AUTH_HEADERS,
    data: {
      username,
      password
    }
  }).then(function (response) {

    signInUser(response);
    infoBoxLoader('Registration Success');
    loadHeader();
    $('#formRegister').trigger('reset');
    listAds();


  }).catch(function (response) {
    handleAjaxError(response);
  })

}

function loginUser() {

  let username = $('#formLogin div:nth-child(2) input').val();
  let password = $('#formLogin div:nth-child(4) input').val();

  if (username === '' || password === '') {
    errorBoxLoader('Username or password can not be empty');
    return;
  }
  $.ajax({
    method: 'POST',
    url: BASE_URL + 'user/' + APP_KEY + '/login',
    headers: AUTH_HEADERS,
    data: {
      username,
      password
    }
  }).then(function (response) {

    signInUser(response);
    infoBoxLoader('Login Success');
    $('#formLogin').trigger('reset');
    loadHeader();
    listAds();

  }).catch(function (response) {
    handleAjaxError(response);
  })

}

function signInUser(response) {

  sessionStorage.setItem('username', response.username);
  sessionStorage.setItem('authToken', response._kmd.authtoken);
  sessionStorage.setItem('userId', response._id);

}

function logoutUser() {
  sessionStorage.clear();
  infoBoxLoader('Logout Success')
  loadHeader();
  loadHome();
}

function createAd() {
  let title = $('#formCreateAd div:nth-child(2) input').val();
  let description = $('#formCreateAd textarea').val();
  let date = $('#formCreateAd div:nth-child(6) input').val();
  let price = $('#formCreateAd div:nth-child(8) input').val();
  if (title == '' || description == '' || date == '' || price == '') {
    errorBoxLoader('Insufficient data to send ajax query');
  } else {
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'appdata/' + APP_KEY + '/ads',
        headers: {
          'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        data: {
          title: title,
          description: description,
          date,
          'price': Number(price),
          'publisher': sessionStorage.getItem('username')
        }
      }).then(function (response) {

        infoBoxLoader('Ad crearted');
        $('#formCreateAd').trigger('reset')
        listAds();

      })
      .catch(function (response) {
        handleAjaxError(response)
      })
  }

}

function listAds() {

  $.ajax({
    method: 'GET',
    url: BASE_URL + 'appdata/' + APP_KEY + '/ads',
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    }
  }).then(async function (response) {
    
    if (response.length !== 0) {
      infoBoxLoader("Ads listed")

      for (let i = 0; i < response.length; i++) {

        response[i].isAuthorized = false;
        if (response[i]._acl.creator === sessionStorage.getItem('userId')) {
          response[i].isAuthorized = true;
        }

      }

      let context = {
        data: response.reverse(),
      }

      await sectionLoader(context, './templates/list-items-template.hbs');

    } else {
      
      $('main').html('<p>No advertisments available</p>');
    }

  }).catch(function (response) {
    handleAjaxError(response);
  })
}

function editAd(id) {
  $.ajax({
    method: 'GET',
    url: BASE_URL + 'appdata/' + APP_KEY + '/ads/' + id,
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    },
  }).then(async function(response){
    
    await loadEditAd();
    $('#title').val(`${response.title}`);
    $('#description').val(`${response.description}`);
    $('#date').val(`${response.date}`);
    $('#price').val(`${response.price}`);
    $('#id').val(`${id}`)
  }).catch(function (response) {
    handleAjaxError(response);
  });
}

function uploadEditdAd() {

  let publisher = sessionStorage.getItem('username');
  let title = $('#title').val();
  let description = $('#description').val();
  let date = $('#date').val();
  let price = $('#price').val();
  let id = $('#id').val();

  $.ajax({
      method: 'PUT',
      url: BASE_URL + 'appdata/' + APP_KEY + '/ads/' + id,
      headers: {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
      },
      data: {
        title,
        description,
        date,
        'price': Number(price),
        publisher
      }
    }).then(function (response) {

      $('#formEditAd').trigger('reset');
      listAds();
      infoBoxLoader('Edit successful');

    })
    .catch(function (response) {
      handleAjaxError(response);
    })
}

function deleteAdd(id) {

  $.ajax({
    method: 'DELETE',
    url: BASE_URL + 'appdata/' + APP_KEY + '/ads/' + id,
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    }
  }).then(function (response) {
    infoBoxLoader('Delete successful');
    listAds();
  }).catch(function (response) {
    handleAjaxError(response);
  })
}

function infoBoxLoader(message) {
  let infobox = $('#infoBox')
  infobox.text(message);
  infobox.css('display', 'block');
  setTimeout(function () {
    infobox.css('display', 'none')
  }, 1500)
}

function errorBoxLoader(message) {
  let errorbox = $('#errorBox')
  errorbox.text(message);
  errorbox.css('display', 'block')
  errorbox.click(function () {
    errorbox.css('display', 'none')
  })
}

function handleAjaxError(response) {

  let errorMsg = JSON.stringify(response)
  if (response.readyState === 0)
    errorMsg = "Cannot connect due to network error."
  if (response.responseJSON && response.responseJSON.description)
    errorMsg = response.responseJSON.description

  errorBoxLoader(errorMsg);

}