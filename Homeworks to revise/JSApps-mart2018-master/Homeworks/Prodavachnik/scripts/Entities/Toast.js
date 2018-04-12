const ERROR = 'error';
const INFO = 'info';

const template = Handlebars.compile('<section id="{{type}}Box" class="{{type}}Box">{{text}}</section>');

class Toast {
  constructor (type, text) {
    this.type = type;
    this.text = text;
  }

  get html () {
    return template(
      {
        type: this.type,
        text: this.text
      }
    );
  }

  render (duration = 3000) {
    $('main').prepend(this.html);
    setTimeout(() => $('#' + this.type + 'Box').remove(), duration);
  }
}

class InfoToast extends Toast {
  constructor (text) {
    super(INFO, text);
  }
}

class ErrorToast extends Toast {
  constructor (text) {
    super(ERROR, text);
  }
}
