function loadRepos() {
    $('#repos').empty();

    $.ajax({
        method:'GET',
        url: "https://api.github.com/users/" + $("#username").val() + "/repos",
        success: displayRepos,
        error: displayError
    })

    function displayRepos(repos) {
        for (let repo of repos) {

            let link = $('<a>').text(repo.full_name);
            link.attr('href', repo.html_url);
            $("#repos").append($('<li>').append(link));
        }
    };

    function displayError(repos) {
        $("#repos").append($("<li>Error</li>"));
    }

    $("#username").val('')

}