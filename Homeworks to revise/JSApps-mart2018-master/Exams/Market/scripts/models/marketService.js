let market=(()=>{
    function getAllProducts(){
        return requester.get('appdata','products?query={}&sort={"_kmd.ect": -1}','Kinvey');
    }

    function createProduct(name, description, price)  { 
        let data = { name, description, price };
        return requester.post('appdata','products',data,'kinvey');
     }
    
    function editProduct(productId,name, description, price) { 
        let data = { name, description, price };
        return requester.update('appdata',`products/${productId}`,data,'kinvey');
     }

    function deleteProduct(productId) { 
        return requester.remove('appdata',`products/${productId}`,'kinvey');
     }

    function getProductById(productId) { 
        return requester.get('appdata',`products/${productId}`,'kinvey');
     }

     function getUser() {
        let endPoint = sessionStorage.getItem('userId');
        return requester.get('user', endPoint, 'kinvey');
    }

    function updateUser(userInfo) {
        let endPoint = sessionStorage.getItem('userId');
        return requester.update('user', endPoint, userInfo, 'kinvey');
    }

    
    return{
        getAllProducts,
        createProduct,
        editProduct,
        deleteProduct,
        getProductById,
        getUser,
        updateUser
    };
})();