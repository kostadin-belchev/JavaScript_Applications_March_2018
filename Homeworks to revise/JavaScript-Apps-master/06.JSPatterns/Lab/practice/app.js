$(() => {

  const app = Sammy('#main', function () {
    this.get('/index.html', (ctx) => {
      ctx.swap('<h1>Hello from Sammy.js</h1>')
    });

    this.get('#/about.html', (ctx) => {
      ctx.swap('<h1>About Page</h1>');
    });

    this.get('#/contact.html', (ctx) => {
      ctx.swap('<h1>Contact Page</h1>')
    });

    this.get('#/book/:bookId', (ctx) => {
      let bookId = ctx.params.bookId;
      console.log(bookId);
    });

  });

  app.run();
})