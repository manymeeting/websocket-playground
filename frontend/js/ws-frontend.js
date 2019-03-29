$(function() {
	"use strict";
	const $content = $('#content');
  	const $input = $('#input');
  	const $status = $('#status');

  	let myColor = false;
  	let myName = false;

  	// Check Websocket compatibility
  	if(!window.WebSocket) {
  		$content.html($("<p>Your browser doesn\'t support WebSocket.</p>"));
  		$input.hide();
  		$('span').hide();
  		return;
  	}

	const WS_PORT = 6868;
	const connection = new WebSocket("ws://127.0.0.1:" + WS_PORT);
	connection.onopen = function () {
	    // Connection is opened and ready to use
	    // Allow user to input name
	    $input.removeAttr("disabled");
	    $status.text("Input name");
	};

	connection.onerror = function(error) {
		$content.html($("<p>Some error occurred.</p>"));
	}

	connection.onmessage = function(message) {
		try {
			let json = JSON.parse(message.data);

			if(json.type === "color") {
				myColor = json.data;
				$status.text(myName + ": ").css("color", myColor);
				$input.removeAttr("disabled").focus();
			}
			else if(json.type === "history") {
				for(let i = 0; i < json.data.length; i++) {
					let msg = json.data[i]; 
					addMessage(msg.author, msg.text, msg.color, new Date(msg.time));
				}
			}
			else if(json.type === "message") {
				// A single message
				$input.removeAttr("disabled");
				addMessage(json.data.author, json.data.text, json.data.color, new Date(json.data.time));
			}
			else {
				console.log("Invalid response format");
			}

		}
		catch(e) {
			console.log("JSON parse failed.", message.data);
			return;
		}

		// Handle incoming message

	}

	/**
   	* Send message when user presses Enter key
   	*/

   	$(document).on("keydown", "#input", function(e) {
   		if(e.keyCode == 13) {
   			// Enter key pressed
   			let msg = $(this).val();
   			if(!msg) {
   				return;
   			}

   			// Send messae
   			connection.send(msg);
   			$(this).val("");

   			// Disable the input field to make the user wait until server sends back response
   			$input.attr("disabled", "disabled");

   			// First msg will be the user's name
   			if(!myName) {
   				myName = msg;
   			}

   		}
   	})

 
 	/**
   	* Add message to the chat window
   	*/
   	function addMessage(author, message, color, dt) {
   		$content.prepend(
   			`
   				<p>
   					<span style="color:${color}">${author}</span> @
   					${dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()}
   				: ${dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes()}
   				: ${message} 
   				</p>
   			`);
   	}
});