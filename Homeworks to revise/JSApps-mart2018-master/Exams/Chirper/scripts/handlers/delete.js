handlers.deleteChirp = function () {
    let id = this.params.id;
    service.deleteChirp(id).then(res => {
        notify.showInfo('Chirp deleted');
        this.redirect('#/feed/' + sessionStorage.getItem('username'));
    }).catch(notify.handleError);
};