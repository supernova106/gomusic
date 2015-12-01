var gomusic  = require('express')();
var http = require('http').Server(gomusic);
var io = require('socket.io')(http);
var clients = {};

gomusic.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	socket.on('new user', function (data, callback){
		if (data in clients) {
			callback(false);
		}
		else {
			callback(true);
			socket.nickName = data;
            clients[socket.nickName] = socket;
            updateNickName();
            console.log(data + ' connected');
		}
	});

    socket.on('disconnect', function(data) {
        if (!socket.nickName) {
            return;
        }
        delete clients[socket.nickName];
        updateNickName();
        console.log(socket.nickName + ' disconnected');
    });

	socket.on('chat message', function(data, callback){
        var msg = data.trim();
        if (msg.substr(0,3) === '/w ') {
            msg = msg.substr(3);
            var index = msg.indexOf(' ');
            if (index !== -1) {
                var name = msg.substring(0, index);
                var msg = msg.substring(index +1);
                if (name in clients) {
                    clients[name].emit('whisper', {msg: msg, username: socket.nickName});
                }
                else {
                    callback('Error! Enter a valid user.');
                }
            }
            else {
                callback('Error! Please enter a message for your whisper.');
            }
        }
        else {
            io.emit('chat message', {msg: msg, username: socket.nickName});
        }
	});

});

http.listen(3000, function(){
	console.log('listening on *:3000');
});

function updateNickName() {
    io.emit('usernames', Object.keys(clients));
}
