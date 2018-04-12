function attachEvents() {

    const baseUrl = "https://phonebook-nakov.firebaseio.com/phonebook";
    const list = $("#phonebook");
    $('#btnCreate').on('click', create);
    $('#btnLoad').on('click', loadContacts);


    function loadContacts() {
        let req = {
            url: baseUrl + ".json",
            success: displayContacts
        }
        $.ajax(req);
    }

    function displayContacts(data) {
        list.empty();
        for (let contact in data) {
            let html = $(`<li><span>${data[contact].person}: ${data[contact].phone} </span></li>`);
            html.append($(`<button>[Delete]</button>`).click(() => deleteContact(contact)));
            list.append(html);
        }
        $('#person').val('');
        $('#phone').val('');

    }

    function create() {

        let person = $('#person').val();
        let phone = $('#phone').val();

        if (person.length == 0) {
            notify("person can not be empty string!", 'error');
            return;
        }

        if (phone.length == 0) {
            notify("Phone can not be empty string!", 'error');
            return;
        }

        $('#btnCreate').prop('disabled', true);

        let contact = {
            person: person,
            phone: phone
        }

        let req = {
            url: baseUrl + ".json",
            method: "POST",
            contentType: 'application/json',
            data: JSON.stringify(contact),
            success: loadContacts,
            error: displayError,
            complete: () => $('#btnCreate').prop('disabled', false)
        }

        $.ajax(req);
    }

    function deleteContact(id) {
        let req = {
            url: `${baseUrl}/${id}.json`,
            method: "DELETE",
            success: loadContacts,
            error: displayError
        }
        $.ajax(req);

    }

    function displayError(err) {
        notify(`Error: ${err.statusText}`);
    }

    function notify(message, type) {
        let toast = $('<div id="notification"></div>');
        toast.text(message);
        toast.css('display', "block");
        switch (type) {
            case "error":
                toast.css('background', '#991111');
                break;
            case "info":
                toast.css('background', '#111199');
                break;
            case "success":
                toast.css('background', '#119911');
                break;
                break;

            default:
                break;
        }
        toast.appendTo(list);
        setTimeout(() =>   toast.css('display', "none"), 2000);
    }

}