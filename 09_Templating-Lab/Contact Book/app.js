$(() => {
    const templates = {};

    const context = {
        contacts: []
    };

    loadData();

    async function loadData() {
        context.contacts = await $.get('./data.json');
    }

    async function loadTemplates() {
        const [contactSource, listSource] = 
        await Promise.all([$.get('./templates/contact.html'), $.get('./templates/contactsList.html')]);
        Handlebars.registerPartial('contact', contactSource);
        templates.listTemplate = Handlebars.compile(listSource);

        renderList();
    }

    function renderList() {
        templates.listTemplate(context);
    }
});