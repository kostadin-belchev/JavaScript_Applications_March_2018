function login () {
  let username = $('#formLogin input[name=username]').val();
  let password = $('#formLogin input[name=passwd]').val();

  $.ajax({
    method: 'POST',
    url: constants.URLS.login,
    headers: constants.AUTH_HEADERS,
    data: { username, password }
  }).then((res) => signin(res, 'Successfully logged in!'))
    .catch(ajaxError);

}

function register () {
  let username = $('#formRegister input[name=username]').val();
  let password = $('#formRegister input[name=passwd]').val();

  $.ajax({
    method: 'POST',
    url: constants.URLS.register,
    headers: constants.AUTH_HEADERS,
    data: { username, password }
  }).then((res) => signin(res, 'Successfully registered!'))
    .catch(ajaxError);
}

function signin (response, text) {
  sessionStorage.setItem(constants.AUTH_TOKEN_KEY, response._kmd.authtoken);
  sessionStorage.setItem(constants.USERNAME_KEY, response.username);
  sessionStorage.setItem(constants.USERID_KEY, response._id);
  toggleHeader();
  renderSection(sectionsInfo.viewHome);
  info(text);
}

function logout () {
  $.ajax({
    method: 'POST',
    headers: constants.HEADERS(sessionStorage.getItem(constants.AUTH_TOKEN_KEY)),
    url: constants.URLS.logout
  }).then(() => {
    sessionStorage.removeItem(constants.AUTH_TOKEN_KEY);
    sessionStorage.removeItem(constants.USERNAME_KEY);
    sessionStorage.removeItem(constants.USERID_KEY);
    toggleHeader();
    renderSection(sectionsInfo.viewHome);
    info('Successfuly logged out!');
  }).catch(ajaxError);
}

function ajaxError (res) {
  (new ErrorToast(JSON.parse(res.responseText).description)).render();
}

function info (text) {
  (new InfoToast(text)).render();
}
