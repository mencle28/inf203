

document.addEventListener('DOMContentLoaded', function() {
    loadChat();
    setInterval(function() {
        loadChat();
    }, 1000);
});

function loadChat() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            displayChat(xhr.responseText);
        }
    };
    xhr.open("GET", "chatlog.txt", true);
    xhr.send();
}

function displayChat(chatContent) {
    var paragraphs = chatContent.split('\n');
    
    var index = Math.min(0,paragraphs.length - 10);

    paragraphs = paragraphs.filter(function(paragraph) {
        return paragraph.trim() !== '';
    });

    var lastmessages= paragraphs.reverse();
    var i=0;
    var chatHTML = lastmessages.map(function(lastmessages) {
        i=i+1;
        if (i<=10) {
            return '<p id="p'+i+'">' + lastmessages + '</p>';
        }
        
    }).join('');

    document.getElementById('tarea').innerHTML = chatHTML;
}

function sendMessage() {
    var newSentence = document.getElementById('textedit').value;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "chat.php?phrase="+newSentence, true);
    xhr.send();
}
