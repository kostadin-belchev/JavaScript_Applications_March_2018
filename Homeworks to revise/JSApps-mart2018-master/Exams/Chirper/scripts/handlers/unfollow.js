handlers.unfollow = function (ctx) {
    let subs = JSON.parse(sessionStorage.getItem('subscriptions')) || [];
    let target = this.params.target;
    service.unsubscribe(subs, target).then(res => {
        notify.showInfo('Unsubscribed from ' + target);
        auth.saveSession(res);
        ctx.redirect('#/feed/' + target);
    }).catch(notify.handleError);
};