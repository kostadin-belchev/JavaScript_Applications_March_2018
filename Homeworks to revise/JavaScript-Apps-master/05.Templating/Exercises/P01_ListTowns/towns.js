function attachEvents() {

  $('#btnLoadTowns').click(function () {
    $("#root").empty();
    let towns = $('#towns').val().split(', ').filter(town=>town!=='').map(town => {
      let context = {
        town
      }
      return context;
    });

    if (towns.length!==0){

      (async function () {
        let source = await $.get('template.hbs');
        let template = Handlebars.compile(source);
        
        let context = {
          towns
        }
  
        let instanceOfTemplate = template(context);
        
        $('#root').append(instanceOfTemplate);
        $("#towns").val('');
      })();
    
    }
  })
}