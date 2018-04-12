function loadCommits() {
    // AJAX call …
    let username = $("#username").val();
    let repository = $("#repo").val();
    let list = $("#commits");
    $("#commits").empty();
    let url = `https://api.github.com/repos/${username}/${repository}/commits`;

    $.ajax({
        url: url,
        method: "GET",
        success: displayCommits,
        error: displayError
    });
// with promise
//$.get(url).then(displayCommits).catch(displayError)
    function displayCommits(data) {
        for (let commit of data) {
            $('#commits').append($('<li>').text(commit.commit.author.name + ": " + commit.commit.message));

            //data.map(e=>({author:e.commit.author.name, message:e.commit.message})).map(e=>`${e.author}: ${e.message}`).forEach(e => list.append(`<li>${e}</li>`));
        }
    }

    function displayError(error) {
        list.append(`<li>Error: ${error.status} (${error.statusText})</li>`);
    }
}