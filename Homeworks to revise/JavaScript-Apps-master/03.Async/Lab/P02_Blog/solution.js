function attachEvents() {
  const url = 'https://baas.kinvey.com/appdata/kid_HJVXrT89G/';
  const username = 'test';
  const password = 'test';
  const base64 = btoa(username + ':' + password);
  const auth = {
    'Authorization': 'Basic ' + base64
  };

  let postBin = new Map();

  $('#btnLoadPosts').click(loadPosts);
  $('#btnViewPost').click(loadComments);
  let selectField = $('#posts');
  let postDisplay = $('#post-body');
  let commentsDisplay = $('#post-comments');

  function loadPosts() {
    $.ajax({
      method: 'GET',
      url: url + 'posts',
      headers: auth,
      success: function (response) {
        selectField.empty();
        for (const post of response) {

          postBin.set(post._id, post.body)

          selectField.append(
            $(`<option value="${post._id}">${post.title}</option>`))
        }
      },
      error: function (error) {
        console.log('Error');
      }
    })
  }

  function loadComments() {
    let postKey = selectField.find(":selected").prop('value');
    $.ajax({
      method: 'GET',
      url: url + `comments/?query={"post_id":"${postKey}"}`,
      headers: auth,
      success: function (response) {
        commentsDisplay.empty();

        for (const comment of response) {
          commentsDisplay.append($('<li>').text(comment.text))
        }
        postDisplay.empty();
        postDisplay.append($('<li>').text(postBin.get(postKey)));
      },
      error: function (error) {
        console.log('Error');
      }
    })
  }

}