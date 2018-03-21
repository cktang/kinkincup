var socket;

var App = App || {};

$(document).ready(function() {

	socket = new App.Websocket({
		ip: "localhost",
		port: 1234
	});

	socket.connect();

	socket.msgCallback = function(data) {
		if (data.type == 'log') {
			$('#status').html(data.payload);
		}
	}

});