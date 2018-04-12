const sectionDiv = '#active-section';

const sectionsInfo = {
  'viewAds': 'viewAds',
  'viewCreateAd': 'viewAdEntry',
  'viewDetailsAd': 'viewDetailsAd',
  'viewEditAd': 'viewAdEntry',
  'viewHome': 'viewHome',
  'viewLogin': 'viewSignInEntry',
  'viewRegister': 'viewSignInEntry'
};

class Section {
  constructor (name) {
    this.name = name;
    this.templateLocation = constants.TEMPLATE_LOCATION + name + '.hbs';
    this.prom = this.setTemplate(this.templateLocation);
  }

  async setTemplate (location) {
    this.template = Handlebars.compile(await $.get(this.templateLocation));
  }

  async html (data) {
    await this.prom;
    let compiled = this.template(data);
    return compiled;
  }

  async render (data) {
    let html = await this.html(data);
    $(sectionDiv).html(html);
  }
}
