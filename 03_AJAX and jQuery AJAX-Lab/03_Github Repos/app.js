function loadRepos() {
    // AJAX call
    let repos = $('#repos');
    repos.empty();
    let input = $('#username');
    let url = `https://api.github.com/users/${input.val()}/repos`;
    $.ajax({ url,
        success: displayRepos,
        error: displayError
    });
    function displayRepos(reposData) {
        for (let repo of reposData) {
            $('<li>').append($(`<a href="${repo.html_url}" target="blank">${repo.full_name}</a>`)).appendTo(repos);
        }
    }
    function displayError(err) {
        $('<li>').text('Error').appendTo(repos);
    }
}