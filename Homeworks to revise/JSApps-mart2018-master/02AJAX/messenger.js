function attachEvents() {

    let url = 'https://messenger-ab482.firebaseio.com/messenger.json';
    let textArea = $("#messages");

    $("#submit").click(createMessage);
    $("#refresh").click(loadMessages);
    loadMessages();

    function loadMessages() {
        let req = {
            url: url,
            success: displayMessages
        }
        $.ajax(req);
    }

    function displayMessages(messages) {
        $('#messages').empty();
        let orderedMessages = {};
        messages = Object.keys(messages).sort((a, b) => a.timestamp - b.timestamp).forEach(k => orderedMessages[k] = messages[k]);
        for (let message of Object.keys(orderedMessages)) {
            let author = orderedMessages[message]['author'];
            let content = orderedMessages[message]['content'];
            $('#messages').append(`${author}: ${content}\n`);
        }
    }


    function createMessage() {
        let name = $("#author").val();
        let message = $("#content").val();
        if (name == '' || message == '') return;
        let newMessage = {
            author: name,
            content: message,
            timestamp: Date.now()
        };

        let req = {
            url: url,
            method: "POST",
            data: JSON.stringify(newMessage),
            success: loadMessages,
            error: displayError
        }

        $.ajax(req);
       $("#author").val('');
       $("#content").val('');
    }

    function displayError(err) {
        $('#messages').append(`Error: ${err.statusText}`);
    }


}
