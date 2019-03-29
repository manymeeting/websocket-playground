"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

const webSocketServerPort = 6868;

// websocket and http servers
const webSocketServer = require("websocket").server;
const http = require("http");	


// Global variables
// latest 100 messages
let history = [ ];
// list of currently connected clients (users)
const clients = [ ];


/**
	Helper function to escape special characters
*/
function escapeHTMLSpecial(str) {
	return str.replace(/&/g, '&amp;').replace(/</g, "&lt;")
		.replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}


// Array with some colors
const colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// Sort Colors to random order
colors.sort(function(a, b) {
	return Math.random() > 0.5;
});


/**
 * HTTP server
 */

const server = http.createServer(function(req, res) {
	// Leave empty
});


server.listen(webSocketServerPort, function() {
	console.log((new Date()) + " Server is listening on port " + webSocketServerPort);
})


/**
 * WebSocket server
 */

const wsServer = new webSocketServer({
  // WebSocket server is tied to a HTTP server. WebSocket
  // request is just an enhanced HTTP request. For more info 
  // http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server
});


// Add event listeners to the Websocket server (handling new connection)
wsServer.on("request", function(req) {
	console.log((new Date()) + ' Connection from origin '
      + req.origin + '.');

	// Accept connection
	let connection = req.accept(null, req.origin);
	// Add to clents set and keep an index
	let userIdx = clients.push(connection) - 1;
	let userName = false;
	let userColor = false;

	console.log((new Date()) + ' Connection accepted.');
	// Send last 100 history msgs
	if(history.length > 0) {
		connection.sendUTF(JSON.stringify({
			type: "history",
			data: history
		}));
	}

	// Add event listeners to the accpeted connection (handling following request data)

	// Msg handler 
	connection.on("message", function(message) {
		if(!message.type === "utf8") return; // Only handle UTF data
		if(!userName) {
			// First msg (initialize) will be the user's name
			userName = escapeHTMLSpecial(message.utf8Data);
			// Get random color and send it back to the user
			userColor = colors.shift();
			connection.sendUTF(JSON.stringify({
				type: "color",
				data: userColor
			}));
		}
		else {
			// Log and broadcast the message
			console.log((new Date()) + ' Received Message from '
                    + userName + ': ' + message.utf8Data);

			// Add msg to history
			let newMsg =  {
				time: (new Date()).getTime(),
				text: escapeHTMLSpecial(message.utf8Data),
				author: userName,
				color: userColor
			};

			history.push(newMsg);
			history = history.slice(-100); // 从数组尾部开始算起100个

			// Broadcast message to all connected clients
			let broadcastMsg = JSON.stringify({
				type: "message",
				data: newMsg
			});
			for( let i = 0; i < clients.length; i++) {
				clients[i].sendUTF(broadcastMsg);
			}
		}
	});

	// User disconnected
	connection.on("close", function(connection) {
		if(userName && userColor) {
			console.log((new Date()) + " Peer "
          + connection.remoteAddress + " disconnected.");
		}

		// Remove user from client list
		clients.splice(userIdx, 1);
		// Push back assgined color
		colors.push(userColor);
	})

 })

