// Todo: Implement Websocket server & client

var express = require('express');
var WebSocketServer = require('websocket').server;
var WebSocketClient = require('websocket').client;
var http = require('http');
var app = express();
var history = [];
var clients = [];
var players = [];
var passage = "Miss Spink and Miss Forcible lived in the flat below Coraline's, on the ground floor. They were both old and round, and they lived in their flat with a number of ageing highland terriers who had names like Hamish and Andrew and Jock. Once upon a time Miss Spink and Miss Forcible had been actresses, as Miss Spink told Coraline the first time she met her.";
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});


// Websocket Server


wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function(request) {


    var connection = request.accept('chat-protocol', request.origin);
    var index = clients.push(connection) - 1;
    console.log((new Date()) + ' Connection accepted.');

    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
    }

    if (players.length > 0) {
        connection.sendUTF(JSON.stringify(players));
    }

    connection.on('message', function(message) {

        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);

            var obj = JSON.parse(message.utf8Data);
            console.log(obj);
            switch (obj.type) {
                case 'player':
                    players.push({
                        type: obj.type,
                        playerName: obj.playerName,
                        playerIndex: index,
                        progress: obj.progress
                    });
                    break;
                case 'progress':
                    console.log(obj.progress);
                    players[index - 1].progress = obj.progress;
                    break;
                case 'message':
                    history.push(obj);
                    break;
                case 'passage':
                    passage = obj.passage
            }
            console.log(players);
            history = history.slice(-100);

            var json = JSON.stringify(obj);
            for (var i = 0; i < clients.length; i++) {
                clients[i].sendUTF(json);
                clients[i].sendUTF(JSON.stringify(players));
                clients[i].sendUTF(JSON.stringify({
                    type: 'passage',
                    passage: passage
                }));
            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});


// WebSocket Client


var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('chat-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message + "'");
        }
    });

    function sendNumber() {
        if (connection.connected) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            connection.sendUTF(number.toString());
            setTimeout(sendNumber, 1000);
        }
    }

});

client.connect('ws://localhost:8080/', 'chat-protocol');