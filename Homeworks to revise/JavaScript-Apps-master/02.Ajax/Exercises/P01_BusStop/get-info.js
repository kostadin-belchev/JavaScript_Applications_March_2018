function getInfo() {
  const url = 'https://judgetests.firebaseio.com/businfo/';

  let input = $('#stopId');
  
  $.ajax({
    method: 'GET',
    url: url + input.val() + '.json',
    success: function (response) {
      let station = $('#stopName');
      station.empty();
      station.text(response.name);

      for (const bus in response.buses) {
        
        let busNumber = bus;
        let arrivalTime = (response.buses[bus]);
        $('#buses').append($('<li>').text(`Bus ${busNumber} arrives in ${arrivalTime} minutes`));
      }
    },
    error: function (error) {
      $('#buses').empty();
      $('#stopName').text('Error')
    }
  })

  input.val('');
}