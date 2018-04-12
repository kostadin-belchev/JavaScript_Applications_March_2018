class Link {
  constructor (id, text) {
    this.id = id;
    this.text = text;
  }
}

const unauthorizedTopNavigation = (function () {
  return [
    new Link('linkHome', 'Home'),
    new Link('linkLogin', 'Login'),
    new Link('linkRegister', 'Register'),
  ];
})();

const authorizedTopNavigation = (function () {
  return [
    new Link('linkHome', 'Home'),
    new Link('linkListAds', 'List Advertisements'),
    new Link('linkCreateAd', 'Create Advertisement'),
    new Link('linkLogout', 'Logout')
  ];
})();
