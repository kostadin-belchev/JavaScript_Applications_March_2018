class Advertisement {
  constructor (id = '', title = '', description = '', publisherId = '', publisherName = '', date = '', price = 0, link = '', viewCount = 0) {
    this.id = id;
    this.title = title;
    this.publisherId = publisherId;
    this.publisherName = publisherName;
    this.description = description;
    this.date = date;
    this.price = price;
    this.link = link;
    this.viewCount = viewCount;
  }

  get price () {
    return this._price;
  }

  set price (val) {
    val = Number(val);
    if (!isNaN(val)) {
      this._price = val;
    }
  }

  get date () {
    return this._date.toLocaleDateString('en-US');
  }

  get dateForm () {
    let dateParts = this.date.split('/').reverse();
    dateParts[0] = padWithZeroes(dateParts[0], 4);
    dateParts[1] = padWithZeroes(dateParts[1], 2);
    dateParts[2] = padWithZeroes(dateParts[2], 2);
    return dateParts.join('-');
  }

  set date (val) {
    if (val !== '') {
      let parts = val.split('-').map(Number);
      this._date = new Date(parts[0], --parts[1], parts[2]);
    } else {
      this._date = new Date(); // Defaults to today
    }
  }
}
