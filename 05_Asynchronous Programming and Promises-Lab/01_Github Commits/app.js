function loadCommits() {
    //alert('load works');
    // AJAX call
    let username = $('#username').val();
    let repository = $('#repo').val();
    let listOfCommits = $('#commits');

    $.get(`https://api.github.com/repos/${username}/${repository}/commits`).then(displayCommits).catch(displayError);

    function displayCommits(response) {
        listOfCommits.empty();
        for (const key in response) {
            if (response.hasOwnProperty(key)) {
                const commitElement = response[key];
                //console.log(commitElement);
                listOfCommits.append($('<li>').text(`${commitElement.commit.author.name}: ${commitElement.commit.message}`));
            }
        }
    }
    function displayError(error) {
        listOfCommits.empty();
        listOfCommits.append($('<li>').text(`Error: ${error.status} (${error.statusText})`));
    }
}