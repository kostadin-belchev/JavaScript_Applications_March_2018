$(() => {
    renderCatTemplate();

    function renderCatTemplate() {
        // TODO: Render cat template and attach events
        var source   = $('#cat-template').html();
           
        var template = Handlebars.compile(source);
        var context = {cats:window.cats};
       
        $('#allCats').html("");
        $("#allCats").append( template(context));
        
        // add your JQuery event listeners
        $('.show').click(function(){ 
         $(this).parent().find('.card-status').toggle();
          let text=$(this).html();
          if(text==='Show status code'){
            $(this).html('Hide status code');
          }else{
            $(this).html('Show status code');
          }
         });
    }

});
