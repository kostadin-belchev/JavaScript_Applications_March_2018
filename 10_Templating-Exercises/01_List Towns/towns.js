function attachEvents() {
    const templates = {};

    const context = {
        towns: []
    };

    const root = $('#root');

    loadTemplates();

    async function loadTemplates() {
        const listTownsSource = $('#towns-template').html();
        //console.log(listTownsSource);
        const townSource = await $.get('./templates/town.html');
        Handlebars.registerPartial('town', townSource);
        templates.list = Handlebars.compile(listTownsSource);

    }

    // Attach event handlers
    let buttonLoadTowns = $('#btnLoadTowns').click(loadTowns);

    function loadTowns(event) {
        let townsListString = $('#towns').val();
        //read data
        let towns = townsListString.split(', ');
        for (const town of towns) {
            context.towns.push({townName: town});
        }
        //console.log(townsListString);
        //console.log(context.towns);
        //load data
        root.html(templates.list(context));
    }
}