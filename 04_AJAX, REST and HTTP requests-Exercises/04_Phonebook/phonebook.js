function attachEvents() {
    let loadButton = $('#btnLoad').click(loadContacts);
    let createButton = $('#btnCreate').click(createContact);
    let baseURL = 'https://phonebook-nakov.firebaseio.com/phonebook';
    //let baseURL = 'https://phonebook-part2.firebaseio.com/phonebook';
    let phonebook = $('#phonebook');

    function loadContacts() {
        //alert('load works');
        
        let request = {
            method: 'GET',
            url: baseURL + '.json',
            success: function (response) {
                //console.log(response);
                //empty the list before loading
                phonebook.empty();
                for (const key in response) {
                    if (response.hasOwnProperty(key)) {
                        const contact = response[key];
                        if (contact !== null) {
                            generateAndAppendLi(contact, key);
                        }
                    }
                } 
            },
            error: function (err) {
                console.log(err);
            }
        }
        $.ajax(request);
    }

    function generateAndAppendLi(contact, key) {
        let li = $(`<li>${contact.person}: ${contact.phone}</li>`);
        let deleteButton = $('<button>').text('Delete').click(function () {
            let request = {
                method: 'DELETE',
                url: baseURL + `/${key}.json`,
                success: function () {
                    console.log("li removed from database");
                    loadContacts();
                },
                error: function (err) {
                    console.log(err);
                }
            }
            $.ajax(request);
        });
        li.append(deleteButton);
        phonebook.append(li);
    }

    function createContact() {
        // When the [Create] button is clicked a new POST request should be made 
        // to the server with the information from the Person and Phone textboxes, 
        
        let personField = $('#person');
        let phoneField = $('#phone');
        let dataToPost = JSON.stringify({
            person: personField.val(),
            phone: phoneField.val()
            });

        let request = {
            method: "POST",
            url: baseURL + '.json',
            data: dataToPost,
            success: function (response) {
                console.log(`Posted ${personField.val()}: ${phoneField.val()} to database`);
                // the Person and Phone textboxes should be cleared
                personField.val('');
                phoneField.val('');
                // and the Phonebook should be automatically reloaded (like if the [Load] button was pressed).
                loadContacts();
            },
            error: function (err) {
                console.log(err);
            }
        };
        $.ajax(request);
    }
}
 