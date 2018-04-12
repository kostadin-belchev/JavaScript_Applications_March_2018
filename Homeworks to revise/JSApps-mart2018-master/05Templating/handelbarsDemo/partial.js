$(() => {
    const main = $('#main');

    let context = {
        contacts: [
            {
                firstName: "Ivan",
                lastName: "Ivanov",
                phone: "0888 123 456",
                email: "i.ivanov@gmail.com"
            },
            {
                firstName: "Maria",
                lastName: "Petrova",
                phone: "0899 987 654",
                email: "mar4eto@abv.bg"
            },
            {
                firstName: "<i>Jordan</i>",
                lastName: "Kirov",
                phone: "0988 456 789",
                email: "jordk@gmail.com"
            }
        ]
    };

    loadTemplates();

    async function loadTemplates() {
        const [contactSource, listSource] = await Promise.all([$.get('contact.html'), $.get('contactsList.html')]);

        console.log(contactSource);
        console.log('================');
        console.log(listSource);
        
        Handlebars.registerPartial('contact', contactSource);
        let listTemplate = Handlebars.compile(listSource);
        let contactTemplate=Handlebars.compile(contactSource);

        main.html(listTemplate(context));

        $('#other').html(contactTemplate(context.contacts[1]));
    }

});