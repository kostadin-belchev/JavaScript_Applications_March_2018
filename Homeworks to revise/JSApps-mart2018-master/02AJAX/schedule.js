  function solve() {
      let currentId = undefined;
      let next = 'depot';
      let url = '';


      function depart() {
          url = `https://judgetests.firebaseio.com/schedule/${next}.json`;
          let req = {
              url: url,
              method: 'GET',
              success: updateInfoDepart,
              error: showError
          }
          $.ajax(req);
       
          $('#depart').prop('disabled', true);
          $('#arrive').prop('disabled', false);

      }

      function showError(err) {
          $('.info').text('Error');
          $('#depart').prop('disabled', true);
          $('#arrive').prop('disabled', true);
      }

      function arrive() {
        url = `https://judgetests.firebaseio.com/schedule/${currentId}.json`;
          let req = {
              url: url,
              method: 'GET',
              success: updateInfoArrive,
              error: showError
          }
          $.ajax(req);
         
          $('#depart').prop('disabled', false);
          $('#arrive').prop('disabled', true);
      }

      function updateInfoArrive(data) {
          updateInfoBox(data, "arrive");
      }

      function updateInfoDepart(data) {
          updateInfoBox(data, "depart");
      }

      function updateInfoBox(data, type) {
          let name = data.name;
          currentId=next;
          next = data.next;
         
          let infoTxt = '';
          switch (type) {
              case 'arrive':
                  infoTxt = `Next stop ${name}`;
                  break;
              case 'depart':
                  infoTxt = `Arriving at ${name}`;
                  break;
          }
          $('.info').text(infoTxt);
          console.log(data);

          console.log(infoTxt);

      }
      return {
          depart,
          arrive
      };
  }