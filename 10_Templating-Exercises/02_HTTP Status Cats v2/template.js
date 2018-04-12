$(() => {
    renderCatTemplate();

    function renderCatTemplate() {
        // TODO: Render cat template and attach events
        let context = {
            cats: window.cats
        }

        let templates = {
        }

        loadTemplate();

        function loadTemplate() { // no need for this function to be async since 
            // the template is already loaded on the page becuase
            // template.js is executed once page is loaded
            let source = $('#cat-template').html();
            let instance = Handlebars.compile(source);
            templates.catsTemplate = instance(context);
        }
        $('#allCats').html(templates.catsTemplate);

        //attach events
        let allButtons = $('.btn').click(hideShow);
        //console.log(allButtons);
        
        function hideShow(e) {
            //console.log($(e.target));
            let button = $(e.target);
            let div = button.next();
            div.toggle();
            if (button.text() === 'Show status code') {
                button.text('Hide status code');
            } else {
                button.text('Show status code');
            }
        }
    }
})
