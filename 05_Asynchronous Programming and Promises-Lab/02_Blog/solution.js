function attachEvents() {
    $('#btnLoadPosts').click(loadPosts);
    $('#btnViewPost').click(viewPost);
    let select = $('#posts');
    let postTitle = $('#post-title');
    let postBody = $('#post-body');
    let postComments = $('#post-comments');

    let username = 'pesho';
    let password = 'p';

    let baseURL = `https://baas.kinvey.com/appdata/kid_HJ_Jab99M/`;

    function loadPosts() {
        //alert('load posts button works');
        // The button with ID "btnLoadPosts" should make a GET request to "/posts". 
        // Create an <option> for each post using its _id as value and title as text inside the node with ID "posts".
        $.ajax({
            url: baseURL + 'posts',
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            },
        }).then(fillDropDownMenu).catch(handleError);

        function fillDropDownMenu(response) {
            //console.log(response);
            for (const post of response) {
                let option = $('<option>').val(post._id).text(post.title);
                select.append(option);
            }
        }
    }

    function viewPost() {
        //alert('view post button works');
        // When the button with ID "btnViewPost" is clicked should make a GET request to "/posts/{postId}" to obtain
        // just the selected post (from the dropdown menu with ID "posts") 
        // and another request to "/comments/?query={"post_id":"{postId}"}" to obtain
        // all comments (replace highlighted parts with the relevant value). 
        let postId = select.find(':selected').val();
        //console.log(postId);
        $.ajax({
            url: baseURL + `posts/${postId}`,
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            },
            success: displaySelectedPost,
            error: handleError
        });
        function displaySelectedPost(response) {
            //console.log(response);
            // Display the post title inside "#post-title" and the post content inside "#post-body".
            postTitle.text(response.title);
            postBody.text(response.body);
            // console.log(`postID = ${postID}`);
            // console.log(`postId = ${postId}`);
            // Display each comment as a <li> inside "#post-comments"
            // and don’t forget to clear its contents beforehand.
            postComments.empty();
            $.ajax({
                url: baseURL + `comments/?query={"post_id":"${postId}"}`,
                headers: {
                    'Authorization': 'Basic ' + btoa(username + ':' + password)
                },
                success: displayComments,
                error: handleError
            });

            function displayComments(data) {
                //console.log(data);
                // console.log(`postID = ${postID}`);
                // console.log(`postID = ${postID}`);
                for (const comment of data) {
                    let li = $('<li>').text(comment.text);
                    postComments.append(li);
                }
            }
        }
    }

    function handleError(err) {
        console.log(err);
    }
}