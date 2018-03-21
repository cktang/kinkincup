Limit = Backbone.Model.extend({ idAttribute: 'prefix' });
Limits = Backbone.Collection.extend({ model: Limit });

SummaryView = Backbone.View.extend({

  initialize: function() {},

  render: function(limits) {

  }

})

LimitView = Backbone.View.extend({

  collection: Limits,

  initialize: function() {
    //this.collection.on('add', this.render);
    //this.collection.on('change', this.render);
    this.limits = "";
  },

  parse: function(ll) {
    this.limits = ll;
    this.render();
  },

  render: function() {    
    var reply = this.limits;

    //$('#limit .content').find('>div:not(.sample)').remove();
    reply = _.filter(reply, function(i) { return i.prefix===ul.get('value'); });
    if (reply.length == 0) {
      reply ={
        "prefix":ul.get('value'),"marketVolume":0,"scVolume":0,
        "marketShare":0.0,"clearingFees":0,"tradingFees":0,"sellLimit":0,"buyLimit":0,"last":0.0,
        "close":0.0,"spotChange":0.0,"gammaHedge":0.0,"buyCarryForwardtm1":0.0,"sellCarryForwardtm1":0.0,"buyCarryForwardtm2":0.0,"sellCarryForwardtm2":0.0,
        "buyCarryForwardDetails":"","sellCarryForwardDetails":""
      };
    } else reply = reply[0];

    var that = this;
    var div = $('#limit .infotable');
    var usd = $('[name=usd]').val();
    var nextline = "<br>";
    var ff = "#,##0.###";

    //manipulate
    if (reply.prefix === "HKB") reply.lotSize = 400;
    else if (reply.prefix === "AIA" || reply.prefix === "HEX" || reply.prefix === "CPC") reply.lotSize = 2000;
    else if (reply.prefix === "CHT") reply.lotSize = 500;
    else if (reply.prefix === "TCH" || reply.prefix === "CLI") reply.lotSize = 100;
    else reply.lotSize = 1000;

    // console.log(reply.lotSize);
    var quantify = reply.last * reply.lotSize / usd;
    try {
      reply.marketSharePercentage = $.formatNumber(100 * reply.scVolume / (reply.marketVolume + 0.0), {format:"0"}) + "%";
    }catch(e) { reply.marketSharePercentage = 0; }
    reply.marketVolumeNominal = Math.round(reply.marketVolume * quantify);
    reply.scVolumeNominal = Math.round(reply.scVolume * quantify);
    reply.spotChangePercentage = $.formatNumber(100 * (reply.last - reply.close) / reply.close, {format:"0.00"}) + "%";

    try {
      reply.tradingFees = Math.round(reply.tradingFees / 7.8);
      reply.clearingFees = Math.round(reply.clearingFees / 7.8);
      reply.grandtotalbuy = reply.buyLimit + reply.buyCarryForwardtm1 + reply.buyCarryForwardtm2 + Math.max(0, reply.gammaHedge);
      reply.grandtotalsell = reply.sellLimit + reply.sellCarryForwardtm1 + reply.sellCarryForwardtm2 + Math.min(0, reply.gammaHedge);
      reply.gammaHedgePositive = Math.max(0, reply.gammaHedge);
      reply.gammaHedgeNegative = Math.min(0, reply.gammaHedge);
    } catch(e) { }
    // console.log(reply);

    //sample = COMMON.autofill($('#limit .content'), this, true);
    for (var key in reply) {
      try {
        var value = (reply[key]+"").replace(/\r\n/g, nextline);
        $(div).find('.'+key).html(that.isNumber(value)? $.formatNumber(value, {format:ff}): value);
      } catch (e) {}
    }

    //render the synthetics
    var ssl = 0;
    var sss = 0;
    var ulcode = ul.get('value');
    $.each(positions, function(i, e) { 
      try {
        if (e[6] != ulcode) return;
        if (e[3] === "C" && e[10] < 0) sss += Math.abs(e[10]);
        if (e[3] === "P" && e[10] > 0) sss += Math.abs(e[10]);

        if (e[3] === "C" && e[10] > 0) ssl += Math.abs(e[10]);
        if (e[3] === "P" && e[10] < 0) ssl += Math.abs(e[10]);
      }catch(e) {
        console.log(e);
      }
    });
    $('#limit').find('.syntheticShort').html($.formatNumber(sss, {format:ff}));
    $('#limit').find('.syntheticLong').html($.formatNumber(ssl, {format:ff}));
  },  
  
  isNumber: function(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
  }
});