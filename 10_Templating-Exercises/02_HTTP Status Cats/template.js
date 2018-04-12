$(() => {
    renderCatTemplate();

    function renderCatTemplate() {
        // TODO: Render cat template and attach events
        const templates = {};
        const context = {
            cats: window.cats
        };
        //console.log(context.cats);
        
        //console.log('test1');
        loadTemplate();
        async function loadTemplate() {
            const catSource = await $('#cat-template').html();
            //const listSource = await $.get('./catList.hbs');
            //console.log(catSource);
            //console.log('test2');
            //templates.cat = Handlebars.registerPartial('cat', catSource);
            //templates.list = Handlebars.compile(listSource);
            templates.list = Handlebars.compile(catSource);

            renderList();
        }
        //console.log('test3');

       function renderList() {
            $('#allCats').html(templates.list(context));
            attachEventHandlers();
       }

       function attachEventHandlers() {
           //console.log('test4');
           //console.log($('.btn').text());
           $('.btn').click( e => {
                //console.log($(e.target).parent().children('div'));
                let button = $(e.target);
                let infoDiv = button.next();
                infoDiv.toggle();
                if (button.text() === 'Show status code') {
                    button.text('Hide status code');
                } else {
                    button.text('Show status code');
                }
           });
       }
    }

})
