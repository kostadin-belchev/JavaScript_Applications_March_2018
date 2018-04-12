function attachEvents() {

  let url = 'https://messenger-a527a.firebaseio.com/messenger/.json';
  let container = $('#messages');

  $('#refresh').click(retrieveData);
  $('#submit').click(postData);

  function retrieveData() {
    container.empty();
    $.ajax({
      method: 'GET',
      url: url,
      success: function (response) {
        for (const key in response) {
          let currentPost = `${response[key].author}: ${response[key].content}\n`;
          container.append(currentPost);
        }
      },
      error: errorHandler
    })
  }

  function postData() {

    let author = $('#author');
    let message = $('#content');

    let postData = {
      author: author.val(),
      content: message.val(),
      timestamp: Date.now(),
    }

    if (author.val() !== '' && message.val() !== '') {
      $.ajax({
        method: "POST",
        url: url,
        data: JSON.stringify(postData),
        success: function () {
          let currentPost = `${postData.author}: ${postData.content}\n`
          container.append(currentPost);
        },
        error: errorHandler
      })
    }
    author.val('');
    message.val('');
  }

  function errorHandler() {
    container.text('Error');
  }
}