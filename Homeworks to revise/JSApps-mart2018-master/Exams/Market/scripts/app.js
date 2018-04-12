$(() => {
    const app = Sammy('#app', function () {
        this.use('Handlebars', 'hbs');

        $(document).on({
            ajaxStart: function () {
                $("#loadingBox").show();
            },
            ajaxStop: function () {
                $("#loadingBox").hide();
            }
        });

        this.get('#/home', getWelcomePage);
        this.get('index.html', getWelcomePage);

        function getWelcomePage(ctx) {

            ctx.isAuth = auth.isAuth();
            ctx.username=sessionStorage.getItem('username');
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
            }).then(function () {
                this.partial('./templates/welcome.hbs');
            });

        }

        this.get('#/register', (ctx) => {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/forms/registerForm.hbs');
            });

        });

        this.post('#/register', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.password;
            let name = ctx.params.name;

            auth.register(username, password, name)
                .then((userData) => {
                    auth.saveSession(userData);
                    notify.showInfo('User registration successful');
                    ctx.redirect('#/home');
                }).catch(auth.handleError);


        });

        this.get('#/login', (ctx) => {
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs'
            }).then(function () {
                this.partial('./templates/forms/loginForm.hbs');
            });

        });

        this.post('#/login', (ctx) => {
            let username = ctx.params.username;
            let password = ctx.params.password;

            if (username === '' || password === '') {
                notify.handleError('All fields should be non empty');
            } else {
                auth.login(username, password)
                    .then((userData) => {
                        auth.saveSession(userData);
                        ctx.username=sessionStorage.getItem('username');
                        notify.showInfo('Login successful');
                        ctx.redirect('#/home');
                    })
                    .catch(auth.handleError);
            }
        });

        this.get('#/logout', (ctx) => {
            auth.logout()
                .then(() => {
                    sessionStorage.clear();
                    ctx.redirect('#/home');
                }).catch(auth.handleError);
        });

        this.get('#/shop', (ctx) => {
            if (!auth.isAuth()) {
                ctx.redirect('#/home');
                return;
            }

            market.getAllProducts()
                .then((products) => {
                    for (let p of products) {
                        p['price'] = Number(p['price']).toFixed(2);
                        p['this'] = p;
                    }

                    ctx.isAuth = auth.isAuth();
                    ctx.username = sessionStorage.getItem('username');
                    ctx.products = products;

                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        shopProduct: './templates/shop/shopProduct.hbs'
                    }).then(function () {
                        this.partial('./templates/shop/shopTable.hbs')
                            .then(function () {
                                $('button').click(function () {
                                    let productId = $(this).attr('data-id');
                                    purchaseProduct(productId);
                                });
                            });
                    });
                }).catch(auth.handleError);



            function purchaseProduct(productId) {

                market.getProductById(productId)
                    .then(function (product) {
                        market.getUser()
                            .then(function (userInfo) {
                                let cart;
                                if (userInfo['cart'] === undefined) {
                                    cart = {};
                                } else {
                                    cart = userInfo['cart'];
                                }
                                
                                // HAS ALREADY PURCHASED THAT PRODUCT -> INCREASE QUANTITY
                                if (cart.hasOwnProperty(productId)) {
                                    cart[productId] = {
                                        quantity: Number(cart[productId]['quantity']) + 1,
                                        product: {
                                            name: product['name'],
                                            description: product['description'],
                                            price: product['price']
                                        }
                                    };
                                } else {
                                    cart[productId] = {
                                        quantity: 1,
                                        product: {
                                            name: product['name'],
                                            description: product['description'],
                                            price: product['price']
                                        }
                                    };
                                }

                                userInfo.cart = cart;
                                market.updateUser(userInfo)
                                    .then(function (userInfo) {
                                        auth.showInfo('Product has been purchased');
                                    });

                            });

                    }).catch(auth.handleError);
            }
        });

        this.get('#/cart', displayCart);

        function displayCart(ctx) {

            ctx.isAnonymous = sessionStorage.getItem('username') === null;
            ctx.username = sessionStorage.getItem('username');
            ctx.isAuth = auth.isAuth();

            market.getUser()
                .then(function (userInfo) {
                    let cart = userInfo.cart||{};

                    let products = [];
                    let keys = Object.keys(cart);
                    for (let id of keys) {
                        let product = {
                            _id: id,
                            name: cart[id]['product']['name'],
                            description: cart[id]['product']['description'],
                            quantity: cart[id]['quantity'],
                            totalPrice: Number(cart[id]['quantity']) * Number(cart[id]['product']['price'])
                        };

                        products.push(product);
                    }

                    ctx.products = products;
                    ctx.isAuth = auth.isAuth();
                    ctx.username = sessionStorage.getItem('username');

                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        cartProduct: './templates/cart/cartProduct.hbs'
                    }).then(function () {
                        this.partial('./templates/cart/cartTable.hbs')
                            .then(function () {
                                $('button').click(function () {
                                    let productId = $(this).attr('data-id');
                                    discardProduct(productId);
                                });
                            });
                    });

                }).catch(auth.handleError);

            function discardProduct(productId) {

                market.getUser()
                    .then(function (userData) {
                        let cart = userData.cart;

                        let quantity = Number(cart[productId]['quantity']) - 1;
                        if (quantity === 0) {
                            delete cart[productId];
                        } else {
                            cart[productId]['quantity'] = quantity;
                        }

                        userData['cart'] = cart;

                        market.updateUser(userData)
                            .then(function (userInfo) {
                                auth.showInfo('Product discard');
                                displayCart(ctx);
                            });
                    });
            }
        }

    });

    app.run();

});