function attachEvents() {
    let source = $('#towns-template').html();
    let townList = $('#root');

    let btnLoadTowns = $('#btnLoadTowns');

    let template = Handlebars.compile(source);

    btnLoadTowns.click(renderList);

    function renderList() {

        let towns = [];
        let input = $('#towns').val();
        if (input.length === 0) {
            townList.html('<i>(No towns to display)</i>');
            return;
        }
        input.split(', ').map(e => towns.push({
            name: e
        }));

        let context = {
            towns: towns
        };
        townList.html(template(context));
        $('#towns').val('');
    }
}