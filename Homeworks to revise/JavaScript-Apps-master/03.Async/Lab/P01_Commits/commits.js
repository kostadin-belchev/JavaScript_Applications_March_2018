function loadCommits() {

  let userName = $('#username');
  let repo = $('#repo')
  let container = $('#commits');
  container.empty();

  $.ajax({
    method: 'GET',
    url: `https://api.github.com/repos/${userName.val()}/${repo.val()}/commits`,
    success: function (response) {
      
      for (const obj of response) {
        container.append(
          $(`<li>${obj.commit.author.name}: ${obj.commit.message}</li>`)
        )
      }

    },
    error: function (error) {
      container.append(
        $(`<li>Error: ${error.status} (${error.statusText})</li>`)
      )
    }
  });

}