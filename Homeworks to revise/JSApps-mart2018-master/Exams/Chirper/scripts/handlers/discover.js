handlers.discover = function (ctx) {
    if (!auth.isAuthed()) {
        ctx.redirect('#');
        return;
    }
    ctx.currentUser = sessionStorage.getItem('username');
    ctx.loadPartials({
        header: './templates/common/header.hbs',
        footer: './templates/common/footer.hbs',
        userbox: './templates/common/userbox.hbs'
    }).then(function () {
        ctx.partials = this.partials;
        service.getUsers().then((users) => {
            ctx.users = users.filter(u => u.username !== ctx.currentUser);
            ctx.partial('./templates/discover/discoverPage.hbs');
        }).catch(notify.handleError);
    });
};