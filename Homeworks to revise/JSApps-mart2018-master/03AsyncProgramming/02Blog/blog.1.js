//$(()=>{}); same as document.ready


function attachEvents() {
    //Application settings
    const baseUrl = 'https://baas.kinvey.com/appdata/kid_rkbioEM9G/';
    const username = 'pesho';
    const password = 'p';

    //DOM elements
    const optionList = $('#posts');
    const postTitle = $('#post-title');
    const postBody = $('#post-body');
    const commentsList = $('#post-comments');

    loadPosts();
    optionList.change(viewPost);

    function request(endpoint) {
        return $.ajax({
            url: baseUrl + endpoint,
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            }
        });

    }

    async function loadPosts() {
        optionList.empty();
        optionList.append($('<option>Loading...</option>'));
        optionList.prop('disabled', true);
        try {
            fillSelect(await request('posts'));
        } catch (reason) {
            handleError(reason);
        } finally {
            optionList.prop('disabled', false);
        }

        // Request all posts from db and display inside select
        // request('posts')
        // .then(fillSelect)
        // .catch(handleError)
        // .always(()=> optionList.prop('disabled',false));

        function fillSelect(data) {
            optionList.empty();
            for (let post of data) {
                $('<option>')
                    .text(post.title)
                    .val(post._id)
                    .appendTo(optionList)
            }
            if (data.length !== 0) {
                viewPost();
            }
        }
    }

    async function viewPost() {
        // Request only selected post from db and all associated comments
        optionList.prop('disabled', true);
        postBody.text('Loading...');
        let postId = optionList.find('option:selected').val();
        let postP = request('posts/' + postId);
        let commentsP = request(`comments/?query={"postId":"${postId}"}`);
        try {
            let [data, comments] = await Promise.all([postP, commentsP]);
            optionList.prop('disabled', true);
            displayPostAndComments([data,comments]);
        } catch (reason) {
            handleError(reason);
        }finally{
            optionList.prop('disabled', false);
        }
    

        //Display post body and commenrs
        function displayPostAndComments([data, comments]) {
            postTitle.text(data.title);
            postBody.text(data.body);
            commentsList.empty();
            for (const com of comments) {
                commentsList.append($('<li>').text(com.text));
            }
           
        }
    }

    function handleError(reason) {
        console.warn(error)
    }
}