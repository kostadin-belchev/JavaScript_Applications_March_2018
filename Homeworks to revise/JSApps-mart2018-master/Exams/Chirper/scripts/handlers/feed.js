handlers.feed = function (ctx) {
    if (!auth.isAuthed()) {
        ctx.redirect('#');
        return;
    }
    ctx.currentUser = sessionStorage.getItem('username');
    ctx.filter = ctx.params.filter;
    if (ctx.filter) {
        if (ctx.filter === ctx.currentUser) {
            ctx.isMe = true;
        } else {
            ctx.isFollowing = service.isFollowing(ctx.filter);
        }
    } else {
        ctx.isMe = true;
    }
    ctx.loadPartials({
        header: './templates/common/header.hbs',
        footer: './templates/common/footer.hbs',
        chirp: './templates/create/createForm.hbs'
    }).then(function () {
        ctx.partials = this.partials;
        ctx.partial('./templates/home/home.hbs');

        service.getChirps(ctx.filter).then((chirps) => {
            chirps.map(c => {
                c.time = calcTime(c._kmd.ect);
                c.isAuthor = c._acl.creator === sessionStorage.getItem('id');
            });
            ctx.render('./templates/feed/chirpList.hbs', {chirps}).then(function () {
                this.replace('#chirps');
            });
        }).catch(notify.handleError);

        service.getStats(ctx.filter || ctx.currentUser).then(stats => {
            stats = {
                chirps: stats[0],
                following: stats[1],
                followers: stats[2].length
            };

            ctx.render('./templates/feed/userStats.hbs', {stats}).then(function () {
                this.replace('#userStats');
            });
        }).catch(notify.handleError);
    });
};
