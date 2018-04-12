
async function renderSection(sectionName, data) {
  if (!($('#' + sectionName).length)) {
    let section = new Section(sectionName);
    section.render(data).then(function () {
      attachEventsToSectionLinks();
    });
    return true;
  }
  return false;
}

function toggleHeader() {
  let links = unauthorizedTopNavigation;
  let name = '';
  if (sessionStorage.getItem(constants.AUTH_TOKEN_KEY)) {
    links = authorizedTopNavigation;
    name = sessionStorage.getItem(constants.USERNAME_KEY);
  }

  let section = new Section('headers');
  section.html({
    link: links
  }).then(function (result) {
    $('#header-section').html(result);
    $('#loggedInUser').text(name);
    attachEventsToNavigationLinks();
  });
}

function attachEventsToNavigationLinks() {
  $('#linkHome').on('click', () => {
    renderSection(sectionsInfo.viewHome)
  });

  $('#linkLogin').on('click', () => {
    renderSection(sectionsInfo.viewLogin, { form: 'Login' });
  });

  $('#linkRegister').on('click', () => {
    renderSection(sectionsInfo.viewRegister, { form: 'Register' });
  });
  $('#linkListAds').on('click', () => {
    getAllAdverts();
  });
  $('#linkCreateAd').on('click', () => {
    let data = new Advertisement();
    data.action = 'Create';
    renderSection(sectionsInfo.viewCreateAd, data);
  });
  $('#linkLogout').on('click', function () {
    logout();
    renderSection(sectionsInfo.viewHome);
  });
}

function attachEventsToSectionLinks() {
  $('#buttonLoginUser').on('click', login);
  $('#buttonRegisterUser').on('click', register);
  $('#buttonCreateAd').on('click', createAdvert);
  $('#buttonEditAd').on('click', editAdvert);

  $('.ad-actions').children().hide();
  let userId = sessionStorage.getItem(constants.USERID_KEY);
  $('.publisher-' + userId).children().show();
  $('.read-button').show();
  $('.read-button').on('click', getAdvert);
  $('.delete-button').on('click', deleteAdvert);
  $('.edit-button').on('click', setupEditView);
}
