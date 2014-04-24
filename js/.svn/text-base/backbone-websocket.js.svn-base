App.Websocket = Backbone.View.extend(
    _.extend({}, 
    App.Mixins.Utilities, {
  ip: "",
  port: "",
  ws: null,
  login: 'ZONE1-SCBNET/1400364',

  initialize: function(options) {
    this.ip = options.ip || this.ip;
    this.port = options.port || this.port;
    this.wsString = 'ws://'+this.ip+':'+this.port;

    this.init();
  },

  onmessage: function(evt) {  
    if (!evt.data) return;
    var msg = evt.data;
    //this.wrapper.logInfo('result: ' + msg);
    msg = JSON.parse(msg);
    this.wrapper.msgCallback(msg);
  },

  onclose: function() {   
    this.wrapper.logInfo("Lost Connection, retry in 5s");  
    setTimeout($.proxy(this.wrapper.connect, this.wrapper), 5000);
  },

  onerror: function(evt){  
    this.wrapper.logInfo("Error: "+evt.data, "negative, retry in 5s");  
    setTimeout($.proxy(this.wrapper.connect, this.wrapper), 5000);
  },

  onopen: function(evt) {   
    this.wrapper.logInfo("Connection Established"); 
    this.wrapper.onConnect(evt); 
  },

  /*********** user extend area ***********/
  init: function() {

  },

  onConnect: function(evt) {
    this.logInfo("OnConnect: " + evt);
  },

  msgCallback: function(msg) {
    this.logInfo("msgCallback: " + msg);
  },
  /*********** user extend area ***********/

  connect: function() {   
    var self = this;

    try {
      self.logInfo("connecting: " + this.wsString);
      this.ws = null;    
      this.ws = new WebSocket(this.wsString);   
      this.ws.wrapper = self;
      this.ws.onmessage = this.onmessage;
      this.ws.onclose = this.onclose;
      this.ws.onerror = this.onerror;
      this.ws.onopen = this.onopen;
    }catch(e) {
      this.logError("Error: " + e);
    }   
  },

  sendMsg: function(msg) {
    if (this.ws == null) return;
    msg.login = this.login;
    msg = JSON.stringify(msg);
    this.logInfo("Sending: " + msg);     
    this.ws.send(msg);
  }   

}));



    // function connect() {   
    //  ws = null;    
    //  // ws = testSocket; ws.start();   
    //  ws = new WebSocket('ws://'+ip+':'+port);   

    //  ws.onmessage = function(evt) {  
    //    if (!evt.data) return;
    //    msg = JSON.parse(evt.data);

    //    //console.log(msg.reply);
    //    if (msg.reply && msg.type == "loadBrokerGroup") {
    //      brokerGroupsView.loadFromCache(msg.reply);
    //    }

    //    if (msg.reply && msg.type == "transaction") {
    //      transactions.parse([msg.reply]);
    //    }
    //    if (msg.reply && msg.type == "allTransaction") {

    //      // if (msg.reply.length > 0 && toNum > 100) {
    //      if (msg.reply.length > 0) {
    //        toNum += 50;
    //        fromNum += 50; 
    //        sendMsg({type:'allTransaction', from:fromNum, to:toNum});
    //        $('#executionCount').html(toNum);
 
    //      } else {
    //        setTimeout(function() { $('#loading').modal('hide')}, 1000);
    //        init = true;

    //        // load products
    //        var req = $.getJSON('instrument.json')
    //          .complete(function() { 
    //            var pp = JSON.parse(req.responseText);
    //            products.add(
    //              _(pp).chain()
    //                .filter(function(e) { return e.name==='Warrant'; })
    //                .map(function(e) {
    //                  try {
    //                    e.yesterdayPosition = Transactions.prototype.format(JSON.parse(e.description).yesterdayPosition, "#,##0"); 
    //                  } catch(e) { console.log(e); }
    //                  return e;
    //                })
    //                .value(), 
    //              {silent:true}
    //            );
    //          });

    //        state.trigger("change");
    //        transactions.trigger('change');
    //      }
    //      transactions.parse(msg.reply, msg.type);

    //    }
    //  };   
        
    //  ws.onclose = function() {   
    //    console.log("Lost Connection, retry in 5s");  
    //    ws = null;  
    //    setTimeout(connect, 5000);
    //  };  
    //  ws.onerror = function(evt){   
    //    console.log("Error: "+evt.data, "negative, retry in 5s");  
    //    ws = null;  
    //    setTimeout(connect, 5000);
    //  }  
    //  ws.onopen = function(evt) {   
    //    console.log("Connection Established");  
    //    sendMsg({type:'loadBrokerGroup'});  
    //    sendMsg({type:'transaction'});  
    //    sendMsg({type:'allTransaction', from:fromNum, to:toNum}); 
    //    $('#loading').modal('show');
    //  };   
    // }   

    // function sendMsg(msg) {
    //  if (ws == null) return;
    //  msg.login = login;
            
    //  //reformat and send message
    //  msg = JSON.stringify(msg);
    //  console.log("Sending: " + msg);     
    //  ws.send(msg);
    // }  


/***********************************************************************************/


    // function sendMsg(msg) {
    //  //check connection
    //  if (ws == null) return;
      
    //  //loading block
    //  COMMON.loading(true);
      
    //  //add login credentials per message
    //  msg.login = $('input[name=login]').val();
            
    //  //reformat and send message
    //  query = msg = JSON.stringify(msg);
    //  //log("Sending Msg");
    //  log("Sending: " + msg);     
    //  ws.send(msg);
      
    //  //update "Query" box
    //  $('#query input[name=query]').val(msg);
    // }

        // function connect() {   
    //  console.log("connecting: " + 'ws://'+ip+':'+port);

    //  ws = null;    
    //  ws = new WebSocket('ws://'+ip+':'+port);   
    //  ws.onmessage = function(evt) {  
    //    log("Receiving Msg");
      
    //    if (!evt.data) return;
    //    var msg = evt.data;
    //    // console.log('result: ' + msg);

    //    //try {
    //      msg = JSON.parse(msg);
          
    //      if (msg.reply) {
            
    //        if (msg.type == "limit") {
   //             // summaryView.render(msg.reply);
    //          limitView.parse(msg.reply);
    //        }
            
    //        if (msg.type == "Poser") { 
    //          //console.log(JSON.stringify(msg));      
    //          positions = msg.reply;

    //          graph2.render(msg.reply);
    //          graph.render(msg.reply);

    //          setTimeout(function() {
    //             //    $('#positionChartWrapper').show();
    //             //    $('#pnlChartWrapper').show();

    //            // generateGraph();
    //            // generatePnLGraph();
    //          }, 200);

    //          //update CPC/CPD relationships

    //          //update filter
    //          if ($('[name=filter] option').length == 0) {
    //            // var prefixes = _.uniq(_.map(msg.reply, function(e) { return e[6]; }));
    //            // var names = _.uniq(_.map(msg.reply, function(e) { return e[13]; }));
    //            var pairs = _(msg.reply).chain().map(function(e) { return [e[6], e[13]]; }).uniq(function(e) { return e[0]; }).value();
    //            var select = $('<select></select>');
    //            $(pairs).each(function(i, e) {
    //              $(select).append("<option value='"+e[0]+"'>"+ e[1]+"</option>");
    //            });

    //            var my_options = $(select).find('option');
    //            my_options.sort(function(a,b) {
    //                if (a.text > b.text) return 1;
    //                else if (a.text < b.text) return -1;
    //                else return 0;
    //            });
    //            $(select).empty().append( my_options );
    //            $('[name=filter]').html($(select).html());    
    //          }

    //        } else {
    //          logResult(COMMON.jsonToTable(msg.reply));
    //          logResult($('<input type=text />').val(query));
    //        }
    //      } else {
    //        log('unknown msg: ' + evt.data);
    //      }
    //    //}catch(e) { log("Error: " + e); 
    //    //}finally { COMMON.loading(false); }
    //    COMMON.loading(false);
    //  };   
        
    //  ws.onclose = function() {   
    //    log("Lost Connection, retry in 5s");  
    //    ws = null;  
    //    setTimeout(connect, 5000);
    //  };  
    //  ws.onerror = function(evt){  
    //    log("Error: "+evt.data, "negative, retry in 5s");  
    //    ws = null;  
    //    setTimeout(connect, 5000);
    //  }  
    //  ws.onopen = function(evt) {   
    //    log("Connection Established");  

    //    //subscribe to positions and limits
    //    sendMsg({type:'limit'}); 
    //    sendMsg({type:'Poser'});
    //    sendMsg({type:'focus'}); 

    //    /*
    //    setTimeout(
    //      function() {
    //        ul.set('value', $('[name=filter]').val());
    //      }, 2000
    //    );
    //    */ 
    //  };   
    // }   
     