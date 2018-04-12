$(() => {

    async function load() {

        let sourceContacts = await $.get('./contacts-template.hbs');
        let sourceDetails = await $.get('./details-template.hbs');
        let data = await $.get('./data.json');
        
        let dataObj = {
            contacts: data
        }

        let templateContacts = Handlebars.compile(sourceContacts);
        let templateDetails = Handlebars.compile(sourceDetails);
        let instanceOfTemplateContacts = templateContacts(dataObj);
        $('#list').append($(instanceOfTemplateContacts).click(function () {
            
            let clickedPerson = data[($(this).attr('data-id'))];
            let instanceOfTemplateDetails = templateDetails(clickedPerson);
            $('.content').empty();
            $('.content').append(instanceOfTemplateDetails)

        }));
    };

    load();

});