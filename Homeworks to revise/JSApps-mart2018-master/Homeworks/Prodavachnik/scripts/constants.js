let constants = (function () {
  const KINVEY_URL = 'https://baas.kinvey.com/';
  const APP_KEY = `kid_Sk1yTwtqf`;
  const APP_SECRET = `bf35fc245dfa410c86eb4e056bb0ca72`;
  const COLLECTION_NAME = 'prodavachnik';

  const URLS = {
    register: `${KINVEY_URL}user/${APP_KEY}/`,
    login: `${KINVEY_URL}user/${APP_KEY}/login`,
    logout: `${KINVEY_URL}user/${APP_KEY}/_logout`,
    collection: `${KINVEY_URL}appdata/${APP_KEY}/${COLLECTION_NAME}/`,
    entity: function (id) {
      return `${KINVEY_URL}appdata/${APP_KEY}/${COLLECTION_NAME}/${id}`;
    }
  };

  const AUTH_TOKEN_KEY = 'authToken';
  const USERNAME_KEY = 'username';
  const USERID_KEY = 'userId';

  const TEMPLATE_LOCATION = '../templates/';

  const HEADERS = function (auth) {
    return {
      'Authorization': 'Kinvey ' + auth
    };
  };

  const AUTH_HEADERS = {
    'Authorization': 'Basic ' + btoa(APP_KEY + ':' + APP_SECRET)
  };

  return {
    APP_KEY,
    APP_SECRET,
    AUTH_TOKEN_KEY,
    USERNAME_KEY,
    USERID_KEY,
    HEADERS,
    AUTH_HEADERS,
    TEMPLATE_LOCATION,
    URLS
  };
})();
