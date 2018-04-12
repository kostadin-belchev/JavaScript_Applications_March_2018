let service = {
    getChirps: function (filter) {
       
        if (filter) {
            return new Promise((resolve, reject) => {
                // Resolve user ID
                requester.get('user', `?query={"username":"${filter}"}`).then((data) => {
                    if (data.length !== 1) reject('No such user in database');
                    let userId = data[0]._id;
               //  let userId='59ae425c14ee505004862409';
                    // Fetch related posts
                    requester.get('appdata', `chirps?query={"_acl.creator":"${userId}"}&sort={"_kmd.ect": -1}`)
                        .then(resolve)
                        .catch(reject);
                }).catch(reject);
            });
        } else {
            let subs = JSON.parse(sessionStorage.getItem('subscriptions')) || [];
            subs = subs.map(e => `"${e}"`);
            return requester.get('appdata', `chirps?query={"author":{"$in": [${subs}]}}&sort={"_kmd.ect": -1}`);
        }
    },

    postChirp: function (chirp) {
        return requester.post('appdata', 'chirps', chirp);
    },

    deleteChirp: function (chirpId) {
        return requester.remove('appdata', 'chirps/' + chirpId);
    },

    getUsers: function () {
        return new Promise((resolve, reject) => {
            requester.get('user', '').then(users => {
                users.map(u => u.followers = users.filter(c => c.subscriptions.includes(u.username)).length);
                users.sort((a, b) => b.followers - a.followers);
                resolve(users);
            });
        });
    },

    subscribe: function (subs, target) {
        let newSubs = subs.slice(0);
        newSubs.push(target);
        return requester.update('user', sessionStorage.getItem('id'), {subscriptions: newSubs});
    },

    unsubscribe: function (subs, target) {
        console.log(subs);
        let newSubs = subs.filter(u => u !== target);
        return requester.update('user', sessionStorage.getItem('id'), {subscriptions: newSubs});
    },

    isFollowing: function (target) {
        return JSON.parse(sessionStorage.getItem('subscriptions')).includes(target);
    },

    countChirps: function (username) {
        return new Promise((resolve, reject) => {
            requester.get('appdata', `chirps?query={"author":"${username}"}`).then(chirps => {
                resolve(chirps.length);
            }).catch(reject);
        });
    },

    countFollowing: function (username) {
        if (username === sessionStorage.getItem('username')) {
            return new Promise((resolve, reject) => {
                resolve(JSON.parse(sessionStorage.getItem('subscriptions')).length);
            });
        } else {
            return new Promise((resolve, reject) => {
                requester.get('user', `?query={"username":"${username}"}`).then(users => {
                    if (users.length !== 1) {
                        reject('No such user');
                    }
                    resolve(users[0].subscriptions.length);
                });
            });
        }
    },

    countFollowers: function (username) {
        return requester.get('user', `?query={"subscriptions":"${username}"}`);
    },

    getStats: function (username) {
        let chirps = service.countChirps(username);
        let following = service.countFollowing(username);
        let followers = service.countFollowers(username);

        return Promise.all([chirps, following, followers]);
    }

};