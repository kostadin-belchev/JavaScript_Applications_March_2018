function showInfo(message) {
	$('#infoBox').text(message);
	$('#infoBox').show();
	setTimeout(() => $('#infoBox').fadeOut(), 3000);
}

function showError(message) {
	$('#errorBox').text(message);
	$('#errorBox').show();
}

function handleError(err) {
	showError(err.responseJSON.description);
}

//TO DO paginator
function displayPaginationAndAds(ads) {
	let pagination = $('#pagination-demo');
	if(pagination.data("twbs-pagination")){
		pagination.twbsPagination('destroy');
	}
	pagination.twbsPagination({
		totalPages: Math.ceil(ads.length / ADS_PER_PAGE),
		visiblePages: 5,
		next: 'Next',
		prev: 'Prev',
		onPageClick: function (event, page) {
			let table = $('#ads > table');
			table.find('tr').each((index, el) => {
				if(index > 0) {
					$(el).remove();
				}
			});
			let startAd = (page - 1) * ADS_PER_PAGE;
			let endAd = Math.min(startAd + ADS_PER_PAGE, ads.length);
			$(`a:contains(${page})`).addClass('active');
			for (let i = startAd; i < endAd; i++) {
				let tr = $(`<tr>`);
				table.append(
					$(tr).append($(`<td>${ads[i].title}</td>`))
						.append($(`<td>${ads[i].author}</td>`))
						.append($(`<td>${ads[i].description}</td>`))
				);
				if(ads[i]._acl.creator === sessionStorage.getItem('userId')) {
					$(tr).append(
						$(`<td>`).append(
							$(`<a href="#">[Edit]</a>`).on('click', function () {
								loadBookForEdit(ads[i]);
							})
						).append(
							$(`<a href="#">[Delete]</a>`).on('click', function () {
								deleteBook(ads[i]);
							})
						)
					);
				}
			}
		}
	});
}
