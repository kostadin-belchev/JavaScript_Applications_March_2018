const url = 'https://phonebook-e7426.firebaseio.com/phonebook';

$('#btnLoad').click(loadData);
$('#btnCreate').click(createData);
let container = $('#phonebook');

function loadData() {

  $.ajax({
      method: "GET",
      url: url + ".json",
      success: function (response) {
        container.empty();
        for (const record in response) {
          generateListItem(response[record].name,response[record].phone,record)
        }
    },
    error: errorHandler
  })

}

function createData() {

  let inputs = $('input');
  let name = $(inputs.toArray()[0]).val();
  let phone = $(inputs.toArray()[1]).val();

  if (name !== '' && phone !== '') {

    let record = {
      "name": name,
      "phone": phone
    }

    $.ajax({
      method: "POST",
      url: url + '/.json',
      data: JSON.stringify(record),
      success: function (response) {
        generateListItem(record.name,record.phone,response.name);
      },
      error: errorHandler
    })
  }

  inputs.val('');

}

function generateListItem(name,phone,ID) {

  container.append($('<li>').text(`${name}: ${phone} `)
    .append($('<a href ="#">').text('[Delete]').click((e) => {
      $.ajax({
        method: "DELETE",
        url: url + `/${ID}.json`,
        success: function () {
          e.target.parentElement.remove();
        },
        error: errorHandler
      })
    })));
}

function errorHandler(error) {
  container.append($('<li>').text("Error"))
}

