var ws;   
var query;
// var ip = "10.20.44.16";
// var ip = "10.20.225.135";
// var login = "ZONE1-SCBNET\\1400364";

$(document).ready(function() {
  try { a = alice.init(); } catch(e) {}
  connect();
});
     
function log(msg) {
  try {
    if (console) console.log(msg);
  }catch(e) {}
}

function connect() {   
  try {
    var wsString;
    try { wsString = getWSString(); } catch(e) { wsString = 'ws://'+ip+':'+port; }

    log("connecting: " + wsString);
    if (ws != null) {
      ws.onclose = function() {}
      ws = null;    
    }
    ws = new WebSocket(wsString);   
    ws.onmessage = function(evt) {  
      if (!evt.data) return;
      var msg = evt.data;
      log('result: ' + msg);
      msg = JSON.parse(msg);
      try {
        msgCallback(msg);
      } catch(e) {
        log(e);
      }
    };         
    ws.onclose = function() {   
      log("Lost Connection, retry in 5s");  
      setTimeout(connect, 5000);
    };  
    ws.onerror = function(evt){  
      log("Error: "+evt.data, "negative, retry in 5s");  
      //setTimeout(connect, 5000);
    }  
    ws.onopen = function(evt) {   
      log("Connection Established"); 
      try { onConnect(); } catch(e) { console.log(e); } 
    };
  }catch(e) {
    
  }   
}   

function sendMsg(msg) {
  if (ws == null) return;
  msg.login = login;
  msg = JSON.stringify(msg);
  log("Sending: " + msg);     
  ws.send(msg);
}   