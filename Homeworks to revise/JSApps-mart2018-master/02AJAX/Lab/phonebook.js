$(() => {
    const baseUrl = "https://phonebook-1eced.firebaseio.com/phonebook";
    const list = $("#phonebook");
    $('#btnCreate').on('click', create);
    loadContacts();

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
            let html = $(`<li><span>${data[contact].name}: ${data[contact].phone} </span></li>`);
            html.append($(`<button>Delete</button>`).click(() => deleteContact(contact)));
            list.append(html);
        }
        $('#name').val('');
        $('#phone').val('');

    }

    function create() {
        
        let name = $('#name').val();
        let phone = $('#phone').val();

        if (name.length == 0) {
            notify("Name can not be empty string!", 'error');
            return;
        }

        if (phone.length == 0) {
            notify("Phone can not be empty string!", 'error');
            return;
        }

        $('#btnCreate').prop('disabled', true);
        
        let contact = {
            name: name,
            phone: phone
        }

        let req = {
            url: baseUrl + ".json",
            method: "POST",
            contentType: 'application/json',
            data: JSON.stringify(contact),
            success: () => {
                notify("Created", "success");
                loadContacts();
            },
            error: displayError,
            complete: () => $('#btnCreate').prop('disabled', false)
        }

        $.ajax(req);
    }

    function deleteContact(id) {
        let req = {
            url: `${baseUrl}/${id}.json`,
            method: "DELETE",
            success: () => {
                notify("Deleted", "info");
                loadContacts();
            },
            error: displayError
        }
        $.ajax(req);

    }

    function displayError(err) {
        notify(`Error: ${err.statusText}`, "error");
    }

    function notify(message, type) {
        let toast = document.getElementById('notification');
        toast.textContent = message;
        toast.style.display = "block";
        switch (type) {
            case "error":
                toast.style.background = '#991111';
                break;
            case "info":
                toast.style.background = '#111199';
                break;
            case "success":
                toast.style.background = '#119911';
                break;
                break;

            default:
                break;
        }

        setTimeout(() => toast.style.display = "none", 2000);
    }
});