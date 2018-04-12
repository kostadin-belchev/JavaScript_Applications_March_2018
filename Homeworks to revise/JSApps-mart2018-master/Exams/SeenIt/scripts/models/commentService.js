let comments=(()=>{
    function getAllCommentsForPostId(postId){
        return requester.get('appdata',`comments?query={"postId":"${postId}"}&sort={"_kmd.ect": -1}`,'Kinvey');
    }

    function createComment(postId,content,author) { 
        let data = { postId,content,author };
        return requester.post('appdata','comments',data,'kinvey');
     }

    function deleteComment(commentId) { 
        return requester.remove('appdata',`comments/${commentId}`,'kinvey');
     }


    return{
        getAllCommentsForPostId,
        createComment,
        deleteComment
    };
})();