function attachEvents() {
    let submitButton = $('#submit').click(send);
    let refreshButton = $('#refresh').click(refresh);
    let baseURL = `https://messenger-e4396.firebaseio.com/messenger`;
    let textArea = $('#messages');
    let nameField = $('#author');
    let messageField = $('#content');
    

    function send() {
        // post a message to the database from our input fields
        let dataToPostJSON = JSON.stringify({
            author: nameField.val(),
            content: messageField.val(),
            timestamp: Date.now()
        });

        let request = {
            method: 'POST',
            url: baseURL + '.json', // not sure about the /
            data: dataToPostJSON,
            success: function (response) {
                //console.log('Added' + response);
                // when successfull refresh so we can see our response
                refresh();
                // and also cleare the message field so we can add a new comment easily
                messageField.val('');
            },
            error: function (err) {
                console.log(err);
            }
        }
        $.ajax(request);
    }

    function refresh() {
        // refreshes the database of messages
        // and sorts them by timestamp in ascending order
        let request = {
            method: 'GET',
            url: `${baseURL}/.json`,
            success: function (response) {
                //console.log(response);
                let messages = [];
                for (const key in response) {
                    if (response.hasOwnProperty(key)) {
                        const message = response[key];
                        //console.log(message);
                        messages.push(message);
                    }
                }
                sortAndDisplayMessages(messages);
            },
            error: function (err) {
                console.log(err);
            }
        }
        $.ajax(request);
    }

    function sortAndDisplayMessages(messages) {
        messages.sort(sortMessages);
        let messagesArray = [];
        for (const message of messages) {
            messagesArray.push(`${message.author}: ${message.content}`);
        }
        textArea.text(messagesArray.join('\n'));
    }

    function sortMessages(a, b) {
        return a.timestamp - b.timestamp;
    }
}