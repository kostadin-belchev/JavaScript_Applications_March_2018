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
    $('#formRegister div:nth-child(2) input').val('');
    $('#formRegister div:nth-child(4) input').val('');


  }).catch(function (response) {
    handleAjaxError(response)
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


  }).catch(function (response) {
    handleAjaxError(response);
  })

}

function signInUser(response) {

  sessionStorage.setItem('username', response.username);
  sessionStorage.setItem('authToken', response._kmd.authtoken);
  sessionStorage.setItem('userId', response._id);
  showHideMenuLinks();
  showView('viewHome');
}

function logoutUser() {
  sessionStorage.clear();
  showView('viewHome');
  showHideMenuLinks();
  infoBoxLoader('Logout Success')
}

function createAd() {
  let title = $('#formCreateAd div:nth-child(2) input').val();
  let description = $('#formCreateAd textarea').val();
  let date = $('#formCreateAd div:nth-child(6) input').val();
  let price = $('#formCreateAd div:nth-child(8) input').val();
  if (title == '' || description == '' || date == '' || price == '') {
    errorBoxLoader('Insufficient data to send ajax query')
  } else {
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'appdata/' + APP_KEY + '/ads',
        headers: {
          'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        data: {
          title: escape(title),
          description: escape(description),
          date,
          'price': Number(price),
          'publisher': sessionStorage.getItem('username')
        }
      }).then(function (response) {

        infoBoxLoader('Ad crearted');
        $('#formCreateAd').trigger('reset')

      })
      .catch(function (response) {
        handleAjaxError(response)
      })
  }


}

function listAds() {
  let table = $('#ads table').empty();
  $.ajax({
    method: 'GET',
    url: BASE_URL + 'appdata/' + APP_KEY + '/ads',
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    }
  }).then(function (response) {
    if (response.length !== 0) {
      infoBoxLoader("Ads listed")
      response.reverse();
      let tableHeader = $(`<tr>
    <th>Title</th>
    <th>Publisher</th>
    <th>Description</th>
    <th>Price</th>
    <th>Date Published</th>
    <th>Actions</th>
</tr>`)
      table.append(tableHeader);

      for (let i = 0; i < response.length; i++) {
        let tableRow = $(`  <tr>
      <td>${response[i].title}</td>
      <td>${response[i].publisher}</td>
      <td>${response[i].description}</td>
      <td>${response[i].price}</td>
      <td>${response[i].date}</td>
    </tr>`)

        let action = ($('<td>')
          .append($('<a href="#">').text('[Delete]').click(function () {
            deleteAdd(response[i]);
          }))
          .append($('<a href="#">').text('[Edit]').click(function () {
            editAdd(response[i]);

          })));
        if (response[i]._acl.creator !== sessionStorage.getItem('userId')) {

          action = ($('<td>')
              .append($('<a href="#">').text('[Delete]').attr('disabled')))
            .append($('<a href="#">').text('[Edit]').attr('disabled'));


        }
        tableRow.append(action)
        table.append(tableRow);
      }
    } else {
      let adsDiv = $('#ads').append('<p>No advertisments available</p>')
    }

  }).catch(function (response) {
    handleAjaxError(response);
  })
}

function editAdd(add) {
  showView('viewEditAd');
  $('#formEditAd div:nth-child(1) input').val(`${add._id}`);
  $('#formEditAd div:nth-child(2) input').val(`${add.publisher}`);
  $('#formEditAd div:nth-child(4) input').val(`${add.title}`);
  $('#formEditAd textarea').val(`${add.description}`);
  $('#formEditAd div:nth-child(8) input').val(`${add.date}`);
  $('#formEditAd div:nth-child(10) input').val(`${add.price}`);

}

function uploadEditedAd() {
  let id = $('#formEditAd div:nth-child(1) input').val();
  let publisher = $('#formEditAd div:nth-child(2) input').val();
  let title = $('#formEditAd div:nth-child(4) input').val();
  let description = $('#formEditAd textarea').val();
  let date = $('#formEditAd div:nth-child(8) input').val();
  let price = $('#formEditAd div:nth-child(10) input').val();

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
      showView('viewAds');
      infoBoxLoader('Edit successful');

    })
    .catch(function (response) {
      handleAjaxError(response);
    })
}

function deleteAdd(add) {
  $.ajax({
    method: 'DELETE',
    url: BASE_URL + 'appdata/' + APP_KEY + '/ads/' + add._id,
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