# websocket-playground
Personal testing environment of `websocket`  and related modules.
Currently, this repo contains a simple multi-user chatroom application using Web Socket.
## Features

 - The client sends open connection request to the server, block input until the connection is established.
 - The server gives a random color to each client after accepting the connection request.
 - The server stores a queue of messages up to 100 records. Sends this queue to newly logged in users.
 - The server broadcasts (pushes) new messages to all online users.  

## How to run
The default port number for this application is 6868. To start the server simply run `node main.js` in server directory.

## Others
Origianl code from: https://medium.com/@martin.sikora/node-js-websocket-simple-chat-tutorial-2def3a841b61

Modified by @*manymeeting*