ip = "10.20.44.16";
ws = null;    

function connect() {
  console.log('connect()');
  ws = new WebSocket('ws://'+ip+':7788');   
  ws.onmessage = function(evt) {  
    console.log("Message in");
    var data = JSON.parse(evt.data);
    console.log("Reply: " + JSON.stringify(data.reply));

    try { webSocketDataCallback(data); } catch (e) {}
  };

  ws.onclose = function(evt) { console.log("Websocket Closed"); $('header .status').html('Disconnected'); setTimeout(connect, 5000); };  
  ws.onerror = function(evt){ console.log("Websocket Error"); $('header .status').html('Disconnected'); setTimeout(connect, 5000);}  
  ws.onopen = function(evt) { console.log("Websocket Opened"); $('header .status').html('Connected'); };   
}

function sendMsg(msg) {
  if (ws == null) return;
  msg.login = "ZONE1-SCBNET\\1400364";

  //reformat and send message
  msg = JSON.stringify(msg);
  console.log("Sending: " + msg);     
  ws.send(msg);
}
