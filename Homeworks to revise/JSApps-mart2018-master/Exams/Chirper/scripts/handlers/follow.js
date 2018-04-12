handlers.follow = function (ctx) {
    let subs = JSON.parse(sessionStorage.getItem('subscriptions')) || [];
    let target = this.params.target;
    service.subscribe(subs, target).then(res => {
        notify.showInfo('Subscribed to ' + target);
        auth.saveSession(res);
        ctx.redirect('#/feed/' + target);
    }).catch(notify.handleError);
};