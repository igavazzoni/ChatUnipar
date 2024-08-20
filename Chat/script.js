var stompClient = null;
var username = null;

document.getElementById("welcome-form").style.display = "block";

function enterChatRoom() {

    username = document.getElementById("username").value.trim();

    if(username){
        document.getElementById("welcome-form").style.display = "none";
        document.getElementById("chat-room").style.display = "block";
        connect();
    }else{
        alert("Por favor, inserir um nickname");
    }
}

    function connect() {

        var socket = new SockJS('https://75a5d5e89ffe.ngrok.app/chat-websocket', {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame){
            console.log('conectando...'+ frame);

            stompClient.subscribe('/topic/public', function(messageOutput) {
                showMessage(JSON.parse(messageOutput.body));
            });

            stompClient.send("/app/addUser", {}, JSON.stringify({
                sender: username,
                type :'JOIN'
            }));
        });
    }

    function sendMessage(){
        var messageContent = document.getElementById("messageInput").value.trim();

        if(messageContent && stompClient) {
            var chatMessage = {
                sender : username,
                content : messageContent,
                type : 'CHAT'
            };
            stompClient.send("/app/sendMessage", {}, JSON.stringify(chatMessage));
            document.getElementById("messageInput").value = '';
        }
    }

    function leaveChat(){

        if(stompClient){
            var chatMessage = {
                sender : username,
                type : 'LEAVE'
            };

            stompClient.send("/app/leaveUser", {}, JSON.stringify(chatMessage));
            stompClient.disconnect(() => {
                console.log("Disconnected");
                document.getElementById("chat-room").style.display = "none";
                document.getElementById("welcome-form").style.display = "block";
            } );

        }

    }

    function showMessage(message){
        var messageElement = document.createElement('div');

        if(message.type === 'JOIN'){
            messageElement.innerText = message.sender + " entrou na sala ";
        }else if(message.type === 'LEAVE') {
            messageElement.innerText = message.sender + " saiu da sala ";
        }else {
            messageElement.innerText = message.sender + " disse: " + message.content;
        }    
     
     document.getElementById('messages').appendChild(messageElement);
    }
