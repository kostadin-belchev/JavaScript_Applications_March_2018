handlers.create = function (ctx) {
    let chirp = {
        text: ctx.params.text,
        author: sessionStorage.getItem('username')
    };

    if (chirp.text.length === 0) {
        notify.showError('Cannot submit empty chirp');
    }
    if (chirp.text.length > 150) {
        notify.showError('Chirp cannot be longer than 150 characters');
    }

    service.postChirp(chirp)
        .then(() => {
            notify.showInfo('Chirp published');
            ctx.redirect('#/home/' + sessionStorage.getItem('username'));
        })
        .catch(() => notify.showError('Error submitting chirp'));
};

handlers.deleteChirp = function () {
    let id = this.params.id;
    service.deleteChirp(id).then(res => {
        notify.showInfo('Chirp deleted');
        this.redirect('#/home/' + sessionStorage.getItem('username'));
    }).catch(notify.handleError);
};

handlers.discover = function (ctx) {
    if (!auth.loggedIn()) {
        ctx.redirect('#');
        return;
    }
    ctx.loggedIn = auth.loggedIn();  
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

handlers.feed = function (ctx) {
    if (!auth.loggedIn()) {
        ctx.redirect('#');
        return;
    }
    ctx.loggedIn = auth.loggedIn();
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
        createForm: './templates/create/createForm.hbs',
        chirp:'./templates/feed/chirp.hbs',
        userStats:'./templates/feed/userStats.hbs'
    }).then(function () {
        ctx.partials = this.partials;
        ctx.partial('./templates/home/home.hbs');
        
        service.getChirps(ctx.filter).then((chirps) => {
             chirps.map(c => {
                c.time = calcTime(c._kmd.ect);
                c.isAuthor = c._acl.creator === sessionStorage.getItem('id');
            });
           
            ctx.render('./templates/feed/chirpList.hbs', { chirps }).then(function () {
                this.replace('#chirps');
            });
        }).catch(notify.handleError);

        service.getStats(ctx.filter || ctx.currentUser).then(stats => {
            stats = {
                chirps: stats[0],
                following: stats[1],
                followers: stats[2].length
            };
       
            ctx.render('./templates/feed/userStats.hbs', { stats }).then(function () {
                
                this.replace('#userStats');
            });
        }).catch(notify.handleError);
    });
};

handlers.follow = function (ctx) {
    let subs = JSON.parse(sessionStorage.getItem('subscriptions')) || [];    
    let target = this.params.target;
    service.subscribe(subs, target).then(res => {
        notify.showInfo('Subscribed to ' + target);
        auth.saveSession(res);
        ctx.redirect('#/home/' + target);
    }).catch(notify.handleError);
};

handlers.unfollow = function (ctx) {
    let subs = JSON.parse(sessionStorage.getItem('subscriptions')) || [];
    let target = this.params.target;
    service.unsubscribe(subs, target).then(res => {
        notify.showInfo('Unsubscribed from ' + target);
        auth.saveSession(res);
        console.log(sessionStorage.getItem('subscriptions'));
        ctx.redirect('#/home/' + target);
    }).catch(notify.handleError);
};
    