let customData = {
  contacts: [{
      name: 'Ivan Ivanov',
      email: 'i.ivanov@gmail.com',
      phone: '0888121212'
    },
    {
      name: 'Maria Petrova',
      email: 'mar4eto@abv.bg',
      phone: '0888127812'
    },
    {
      name: 'Jordan Kirov',
      email: 'jordk@gmail.com',
      phone: '0888124512'
    }
  ],
  title: "Students",
  group: "JavaScript",
};

test(customData);

async function test(dataObj) {
  let partial = await $.get('./partial.hbs');
  Handlebars.registerPartial('partial', partial);
  
  let source = await $.get('./template.hbs');
  let template = Handlebars.compile(source);
  let instanceOfTemplate = template(dataObj);
  $('body').append(instanceOfTemplate);
};