function solve() {

  let url = 'https://judgetests.firebaseio.com/schedule/';
  let nextStop = 'depot';
  let stopToArriveAt = 'depot';
  let infoDisplay = $('.info');
  let departBtn = $('#depart');
  let arriveBtn = $('#arrive');

  function depart() {

    $.ajax({
      method: 'GET',
      url: url + nextStop + '.json',
      success: function (response) {
        infoDisplay.text(`Next stop ${response.name}`);
        departBtn.prop('disabled', true);
        arriveBtn.prop('disabled', false);
        stopToArriveAt = response.name;
        nextStop = response.next;
      },
      error: function (error) {
        infoDisplay.text('Error');
        departBtn.prop('disabled', true);
        arriveBtn.prop('disabled', true);
      }
    })
  }

  function arrive() {
    departBtn.prop('disabled', false);
    arriveBtn.prop('disabled', true);
    infoDisplay.text(`Arriving at ${stopToArriveAt}`);
  }
  return {
    depart,
    arrive
  };
}
let result = solve();