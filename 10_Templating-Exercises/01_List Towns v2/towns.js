function attachEvents() {
    let input = $('#towns');
    let templates = {};
    
    let rootDiv = $('#root');

    loadTemplate();

    function loadTemplate() { // no need for this function to be async since 
        // the template is already loaded on the page becuase attachEvents is executed once page is loaded
        let source = $('#towns-template').html();
        templates.instance = Handlebars.compile(source);
    }

    let loadButton = $('#btnLoadTowns').click(loadTowns);

    function loadTowns() {
        // cleating it here so it does not rember old values when load clicked again
        let context = {
            towns: []
        }
        let townsArray = input.val().split(', ').filter(e => e !== '');
        for (const town of townsArray) {
            context.towns.push({townName: town});
        }
        console.log(context.towns);
        
        let template = templates.instance(context);
        
        rootDiv.html(template);
        // if we wish we could clear form
        // input.val('');
    }
}