$(() => {
    const templates = {};

    const context = {
        contacts: []
    };

    let listContent = $('#list').find('.content');
    let detailsContent = $('#details').find('.content');

    loadData();
    loadTemplates();

    async function loadData() {
        context.contacts = await $.get('./data.json');
    }

    async function loadTemplates() {
        const [contactSource, listSource, detailsSource] = 
        await Promise.all([
            $.get('./templates/contact.html'),
            $.get('./templates/contactsList.html'),
            $.get('./templates/details.html')
        ]);
        Handlebars.registerPartial('contact', contactSource);
        templates.list = Handlebars.compile(listSource);
        templates.details = Handlebars.compile(detailsSource);

        renderList();
    }

    function renderList() {
        listContent.html(templates.list(context));
        attachEventHandlers();
    }
    // Attach event handlers
    function attachEventHandlers() {
        $('.contact').click( e => {
            //console.log($(e.target).closest('.contact'));
            let index = $(e.target).closest('.contact').attr('data-id');
            renderDetails(index)
        });
    }

    function renderDetails(index) {
        detailsContent.html(templates.details(context.contacts[index]));
    }
});