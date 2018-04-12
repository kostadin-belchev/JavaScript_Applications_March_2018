function getFormData(formName) {
  let form = $(formName);
  form.validate();
  let data = {
    title: form.find('input[name="title"]').val(),
    description: form.find('textarea[name="description"]').val(),
    publisher: sessionStorage.getItem(constants.USERNAME_KEY),
    publisherId: sessionStorage.getItem(constants.USERID_KEY),
    date: form.find('input[name="datePublished"]').val(),
    price: Number(form.find('input[name="price"]').val()),
    link: form.find('input[name="link"]').val()
  };
  return data;
}

function createAdvert() {
  let data = getFormData('#formCreateAd');
  $.ajax({
    method: 'POST',
    headers: constants.HEADERS(sessionStorage.getItem(constants.AUTH_TOKEN_KEY)),
    url: constants.URLS.collection,
    data
  }).then(function (res) {
    getAllAdverts();
    info('Successfuly published ad ' + data.title + '!');
  })
    .catch(ajaxError);
}

function getAllAdverts() {
  $.ajax({
    method: 'GET',
    headers: constants.HEADERS(sessionStorage.getItem(constants.AUTH_TOKEN_KEY)),
    url: constants.URLS.collection
  })
    .then(function (res) {
      let ads = [];
      let currentUserId = sessionStorage.getItem(constants.USERID_KEY);
      for (let currAd of res) {
        ads.push(getAdvertFromResponse(currAd));
      }
      renderSection(sectionsInfo.viewAds, { ads });
    })
    .catch(ajaxError);
}

function getAdvertFromResponse(res) {
  return new Advertisement(res._id, res.title, res.description, res.publisherId, res.publisher, res.date, Number(res.price), res.link, res.viewCount);
}

function getAdvertisementId(caller) {
  // Format is ad-{id}
  return $(caller).parent().parent().attr('id').split('-')[1];
}

function deleteAdvert() {
  let id = getAdvertisementId(this);
  $(this).parent().parent().remove();
  $.ajax({
    method: 'DELETE',
    headers: constants.HEADERS(sessionStorage.getItem(constants.AUTH_TOKEN_KEY)),
    url: constants.URLS.entity(id)
  }).then(function (result) {
    info('Successfully deleted advert!');
  }).catch(ajaxError);
}

function setupEditView() {
  let id = getAdvertisementId(this);
  $.ajax({
    method: 'GET',
    url: constants.URLS.entity(id),
    headers: constants.HEADERS(sessionStorage.getItem(constants.AUTH_TOKEN_KEY))
  }).then(function (res) {
    let ad = getAdvertFromResponse(res);
    ad.action = 'Edit';
    renderSection(sectionsInfo.viewEditAd, ad);
  });
}

function padWithZeroes(str, count) {
  return ('0'.repeat(count) + str).slice(-count);
}

function getAdvert() {
  let id = getAdvertisementId(this);
  $.ajax({
    method: 'GET',
    headers: constants.HEADERS(sessionStorage.getItem(constants.AUTH_TOKEN_KEY)),
    url: constants.URLS.entity(id)
  }).then(function (result) {
    let ad = getAdvertFromResponse(result);
    renderSection(sectionsInfo.viewDetailsAd, ad);
  }).catch(ajaxError);
}

function editAdvert() {
  let data = getFormData('#formEditAd');
  let form = $('#formEditAd');
  let id = form.find('input[name="id"]').val();
  data.publisherId = form.find('input[name="publisherId"]').val();
  data.publisher = form.find('input[name="publisher"]').val();
  $.ajax({
    method: 'PUT',
    headers: constants.HEADERS(sessionStorage.getItem(constants.AUTH_TOKEN_KEY)),
    url: constants.URLS.entity(id),
    data
  }).then(function (res) {
    getAllAdverts();
    info('Successfully updated advert!');
  }).catch(ajaxError);
}