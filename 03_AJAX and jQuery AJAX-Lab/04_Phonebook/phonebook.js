$(function () {
    const baseURL = `https://phonebook-part1.firebaseio.com/phonebook`;
    //const url = 'https://phonebook-nakov.firebaseio.com/phonebook';
    let loadButton = $('#btnLoad').click(loadContacts);
    let createButton = $('#btnCreate').click(addContact);
    let phonebook = $('#phonebook');

    // load contacts
    function loadContacts() {
        let url = baseURL + '.json';
        let request = { // if not specified default method is GET
            url, 
            success: displayContacts,
            error: displayError
        }
        $.ajax(request);
    }
    function displayContacts(data) {
        //console.log(data);
        // clear data on screen before priting it again
        phonebook.empty();
        for (let contact in data) {
            //console.log(contact);
            generateAndAppendLi(data[contact].person, data[contact].phone, contact);
        }
    }
    function generateAndAppendLi(name, phone, contact) {
        let li = $('<li>');
        li.text(`${name}: ${phone} `);
        //let deleteButton = $(`<a href="#">[Delete]</a>`);
        // delete contact
        let deleteButton = $(`<button>`).text('Delete').click(function () {
            let url = baseURL + '/' + contact + '.json';
            let request = { 
                method: "DELETE",
                url,
                success: function () {
                    $('li').remove();
                },
                error: displayError
            }
            $.ajax(request);
        });
        
        li.append(deleteButton);
        phonebook.append(li);
    }
    
    function displayError(err) {
        console.log(err);
    }

    // add contact
    function addContact() {
        let nameToAdd = $('#person').val();
        let phoneValToAdd = $('#phone').val();
        let dataToPost = JSON.stringify({'person': nameToAdd, 'phone': phoneValToAdd})
        $.ajax({
            method: "POST",
            url: baseURL + '.json',
            data: dataToPost,
            success: appendElement,
            error: displayError
        });

        function appendElement(req) {
            generateAndAppendLi(nameToAdd, phoneValToAdd, req.person);
            loadContacts();
        }
    }
});
