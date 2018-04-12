$(() => {
    //Define routes and other logic here. Show three options to do this.
    const app = Sammy('#main', function () {
        this.use('Handlebars','hbs');
        this.get('index.html', (ctx) => {
            ctx.loadPartials({
                header:'./templates/common/header.hbs',
                footer:'./templates/common/footer.hbs'                
            }).then(function () {
                this.partial('./templates/home.hbs');
            });
            ctx.swap('<h2>What happens?<h2>');
           
        });
        this.get('#/about', function () {
            this.loadPartials({
                header:'./templates/common/header.hbs',
                footer:'./templates/common/footer.hbs'                
            }).then(function () {
                this.partial('./templates/about.hbs');
            });
        });
        this.route('get','#/contact', function () {
            this.loadPartials({
                header:'./templates/common/header.hbs',
                footer:'./templates/common/footer.hbs'                
            }).then(function () {
                this.partial('./templates/contact.hbs');
            });
        });
        this.get('#/book/:bookId',(ctx)=>{
            let bookId=ctx.params.bookId; 
        });
        this.get('#/login',(ctx)=>{
            ctx.loadPartials({
                header:'./templates/common/header.hbs',
                footer:'./templates/common/footer.hbs'                
            }).then(function () {
                this.partial('./templates/login.hbs');
            });
        });
        this.post('#/login',(ctx)=>{
            console.log(ctx.params.user);
            console.log(ctx.params.pass);            
            ctx.redirect('#/contact');
        });
        this.get('#/hello/:name',(ctx)=>{
            ctx.title='Hello';
            ctx.name=ctx.params.name;
            ctx.loadPartials({
                header:'./templates/common/header.hbs',
                footer:'./templates/common/footer.hbs'                
            }).then(function () {
                this.partial('./templates/greetings.hbs');
            });
           
        });
    });

    //Activate
    app.run();
});