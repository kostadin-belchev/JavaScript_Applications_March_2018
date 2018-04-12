handlers.create = function (ctx) {
    let chirp = {
        text: this.params.text,
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
            ctx.redirect('#/feed/' + sessionStorage.getItem('username'));
        })
        .catch(() => notify.showError('Error submitting chirp'));
};
