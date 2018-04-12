let posts=(()=>{
    function getAllPosts(){
        return requester.get('appdata','posts?query={}&sort={"_kmd.ect": -1}','Kinvey');
    }

    function createPost(author,title,description,url,imageUrl) { 
        let data = { author, title, description, url, imageUrl };
        return requester.post('appdata','posts',data,'kinvey');
     }

    function editPost(postId,author,title,description,url,imageUrl) { 
        let data = { author, title, description, url, imageUrl };
        return requester.update('appdata',`posts/${postId}`,data,'kinvey');
     }

    function deletePost(postId) { 
        return requester.remove('appdata',`posts/${postId}`,'kinvey');
     }

    function getMyPosts(username) {  
        return requester.get('appdata',`posts?query={"author":"${username}"}&sort={"_kmd.ect": -1}`,'kinvey');
    }

    function getPostById(postId) { 
        return requester.get('appdata',`posts/${postId}`,'kinvey');
     }
    
    return{
        getAllPosts,
        createPost,
        editPost,
        deletePost,
        getMyPosts,
        getPostById
    };
})();