const ADS_PER_PAGE = 10;
const BASE_URL = 'https://baas.kinvey.com/';
const APP_KEY = 'kid_HkeayCIqf';
const APP_SECRET = 'a499470dbfdf471d805a3abd80455038';


let requester = (() => {
	
	function makeAuth(type) {
		if (type === 'basic') return 'Basic ' + btoa(APP_KEY + ":" + APP_SECRET);
		else return 'Kinvey ' + localStorage.getItem('authtoken');
	}

	function makeRequest(method, module, url, auth) {
		return {
			url: BASE_URL + module + '/' + APP_KEY + '/' + url,
			method,
			headers: {
				'Authorization': makeAuth(auth)
			}
		};
	}

	function get(module, url, auth) {
		return $.ajax(makeRequest('GET', module, url, auth));
	}

	function post(module, url, data, auth) {
		let req = makeRequest('POST', module, url, auth);
		req.data = JSON.stringify(data);
		req.headers['Content-Type'] = 'application/json';
		return $.ajax(req);
	}

	function update(module, url, data, auth) {
		let req = makeRequest('PUT', module, url, auth);
		req.data = JSON.stringify(data);
		req.headers['Content-Type'] = 'application/json';
		return $.ajax(req);
	}

	function remove(module, url, data, auth) {
		return $.ajax(makeRequest('DELETE', module, url, auth));

	}

	return {
		get,
		post,
		update,
		remove
	};
})();
// GET: Ads/List
async function loadAds() {
    let adsDiv = $('#ads');
   
    let data = await requester.get('appdata', 'adverts');
    adsDiv.empty();
   
    if (data.length === 0) {
        adsDiv.append($('<p>No ads to display!</p>'));
        return;
    }
    // data = data.sort((a, b) => b.views - a.views);

    for (let ad of data) {
        let html = $('<div>');
        html.addClass('ad-box');
        let title = $(`<div class="ad-title">${ad.title}</div>`);
        if (ad._acl.creator === localStorage.getItem('id')) {
            let deleteBtn = $('<button>&#10006;</button>').click(() => deleteAd(ad._id));
            deleteBtn.addClass('ad-control');
            deleteBtn.appendTo(title);
            let editBtn = $('<button>&#9998;</button>').click(() => openEditAd(ad));
            editBtn.addClass('ad-control');
            editBtn.appendTo(title);

        }
        let detailsBtn = $('<button>&#10172; Read More</button>').click(() => openDetailsAd(ad));


        html.append(title);
        html.append(`<div><img src="${ad.imageUrl}"></div>`);
        html.append(`<div>By ${ad.publisher} | Price: ${ad.price.toFixed(2)}</div>`);
        html.append(detailsBtn);

        adsDiv.append(html);

    }
    showView('ads');

}

// GET: Ad/Detail
function openDetailsAd(ad) {
    let detailDiv = $('#details');
    detailDiv.empty();
    let html = $('<div>');
    html.addClass('details-box');
    let title = $(`<div class="ad-title">${ad.title}</div>`);

    if (ad._acl.creator === localStorage.getItem('id')) {
        let deleteBtn = $('<button>&#10006;</button>').click(() => deleteAd(ad._id));
        deleteBtn.addClass('ad-control');
        deleteBtn.appendTo(title);
        let editBtn = $('<button>&#9998;</button>').click(() => openEditAd(ad));
        editBtn.addClass('ad-control');
        editBtn.appendTo(title);

    }

    html.append(title);
    html.append(`<div><img src="${ad.imageUrl}"></div>`);
    html.append(`<div><p>Description:</p><p>${ad.description}</p></div>`);
    html.append(`<div>By ${ad.publisher} | Price: ${ad.price.toFixed(2)}</div>`);
    html.append(`<div>Published date ${ad.date}</div>`);
    html.append($(`<p>Views:</p>`));
    let back = $('<a href="#">[Back to List]</a>').click(() => loadAds());
    html.append(back);

    detailDiv.append(html);

    showView('details');
}

//to do GET with hook in Kinvey
async function countViews(ad) {
    let editedAd = {
        title: ad.title,
        description: ad.description,
        price: Number(ad.price),
        imageUrl: ad.imageUrl,
        date: ad.date,
        publisher: ad.publisher,
        views: ++ad.views
    }

    try {
        // await requester.update('appdata', 'adverts/' + ad._id, editedAd);
        showInfo('View counted!');
        showView('ads');
    } catch (error) {
        handleError(error);
    }
}

// GET: Ad/Edit
function openEditAd(ad) {
    let form = $('#formEditAd');
    form.find('input[name="title"]').val(ad.title);
    form.find('textarea[name="description"]').val(ad.description);
    form.find('input[name="price"]').val(ad.price);
    form.find('input[name="image"]').val(ad.imageUrl);

    let date = ad.date;
    let publisher = ad.publisher;
    let id = ad._id;
    let views = ad.views;

    form.find('#buttonEditAd').click(() => {
        editAd(id, date, publisher, views);
    });
    showView('edit');
}

// PUT: Ad/Edit
async function editAd(id, date, publisher, views) {
    let form = $('#formEditAd');
    let title = form.find('input[name="title"]').val();
    let description = form.find('textarea[name="description"]').val();
    let price = form.find('input[name="price"]').val();
    let imageUrl = form.find('input[name="image"]').val();

    if (title.length === 0) {
        showError('Title cannot be empty');
        return;
    }

    if (description.length === 0) {
        showError('Description cannot be empty');
        return;
    }

    if (price.length === 0) {
        showError('Price cannot be empty');
        return;
    }

    let editedAd = {
        title,
        description,
        price:Number(price),
        imageUrl,
        date,
        publisher,
        views
    }

    try {
        await requester.update('appdata', 'adverts/' + id, editedAd);
        showInfo('Ad edited!');
       loadAds();
    } catch (error) {
        handleError(error);
    }
}

// DELETE: Ad/Delete
async function deleteAd(id) {
    await requester.remove('appdata', 'adverts/' + id);
    showInfo('Ad deleted');
    showView('ads');
}

// POST: Ad/Create
async function createAd() {
    let form = $('#formCreateAd');
    let title = form.find('input[name="title"]').val();
    let description = form.find('textarea[name="description"]').val();
    let price = form.find('input[name="price"]').val();
    let imageUrl = form.find('input[name="image"]').val();
    let date = (new Date()).toString('yyyy-MM-dd');
    let publisher = localStorage.getItem('username');

    if (title.length === 0) {
        showError('Title cannot be empty');
        return;
    }

    if (description.length === 0) {
        showError('Description cannot be empty');
        return;
    }

    if (price.length === 0) {
        showError('Price cannot be empty');
        return;
    }

    let newAd = {
        title,
        description,
        price:Number(price),
        imageUrl,
        date,
        publisher,
        views: 0
    }
   
    try {
        await requester.post('appdata', 'adverts', newAd);
        showInfo('Ad created!');
        loadAds();
    } catch (error) {
        handleError(error);
    }

}