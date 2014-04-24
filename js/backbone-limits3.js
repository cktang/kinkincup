Limit = Backbone.Model.extend({
  idAttribute: 'prefix',

  defaults: {
    //all fields
    prefix:'',                code:'',
    buyCarryForwardtm1: 0,    buyCarryForwardtm2: 0,
    buyLimit: 0,    close: 0,
    fees: 0,    gammaHedge: 0,
    gammaHedgeBuy: 0,    gammaHedgeSell: 0,
    grandtotalbuy: 0,    grandtotalsell: 0,
    last: 0,    lotSize: 0,
    marketShare: 0,    marketSharePercentage: "",
    marketVolume: 0,    marketVolumeNominal: 0,
    scVolume: 0,    scVolumeNominal: 0,
    sellCarryForwardtm1: 0,    sellCarryForwardtm2: 0,
    sellLimit: 0,    spotChange: 0,
    spotChangePercentage: "",    ts: ""
  }
});

Limits = Backbone.Collection.extend({
  model: Limit,

  parse: function(msg) {
    var that = this;
    try {
      $(msg).each(function() {
        //calculate grand total
        // this.grandtotalbuy = this.buyLimit + this.buyCarryForwardtm2 + this.buyCarryForwardtm1 + Math.max(0, this.gammaHedge);
        // this.grandtotalsell = this.sellLimit + this.sellCarryForwardtm2 + this.sellCarryForwardtm1 + Math.min(0, this.gammaHedge);

        this.gammaHedge = Math.round(this.gammaHedge);
        this.grandtotalbuy = this.buyLimit + this.buyCarryForwardtm2 + this.buyCarryForwardtm1 + this.gammaHedge;
        this.grandtotalsell = this.sellLimit + this.sellCarryForwardtm2 + this.sellCarryForwardtm1 - this.gammaHedge;
        this.code = $.formatNumber(this.code.replace("@XHKG", ""), {format:"0000"});

        // //use close figure if possible, after market close
        // if (this.close && this.close > 0) {
        //   this.gammaHedge = Math.round(this.gammaHedge * this.last / this.close);
        // }
    
        //split gammahedge
        this.gammaHedgeBuy = Math.max(this.gammaHedge, 0);
        this.gammaHedgeSell = Math.min(this.gammaHedge * -1, 0);
    
        this.gammaHedgeNew = $.formatNumber(this.gammaHedgeNew, {format:"0"});

        var bean = that.get(this.prefix);
        bean? bean.set(this): that.add(this);
      });
    } catch (e) {
      console.log(e);
    }
  }
});

LimitRowView = Backbone.View.extend({

  tagName: "table",

  format: function(num) {
    return $.formatNumber(num, {format:"#,##0.###"});
  },

  //trigger only on create row
  render: function() {
    console.log('LimitRowView.render()');

    var tr = $('<tr name='+this.model.get('code')+'0 class="sort ' + this.model.get('prefix') + '"></tr>');
    $(tr).append($('<td class="gammaHedgeBuy right"></td>').append(this.format(this.model.get('gammaHedgeBuy'))));
    $(tr).append($('<td class="buyCarryForwardtm2 right"></td>').append(this.format(this.model.get('buyCarryForwardtm2'))));
    $(tr).append($('<td class="buyCarryForwardtm1 right"></td>').append(this.format(this.model.get('buyCarryForwardtm1'))));
    $(tr).append($('<td class="buyLimit right"></td>').append(this.format(this.model.get('buyLimit'))));
    $(tr).append($('<td class="grandtotalbuy right bold"></td>').append(this.format(this.model.get('grandtotalbuy'))));  
    $(tr).append($('<td class=bolder style="text-align:center" ></td>').append(this.model.get('code')+ "&nbsp;" + this.model.get('prefix')));
    $(tr).append($('<td class="grandtotalsell right bold"></td>').append(this.format(this.model.get('grandtotalsell'))));
    $(tr).append($('<td class="sellLimit right"></td>').append(this.format(this.model.get('sellLimit')))); 
    $(tr).append($('<td class="sellCarryForwardtm1 right"></td>').append(this.format(this.model.get('sellCarryForwardtm1'))));
    $(tr).append($('<td class="sellCarryForwardtm2 right"></td>').append(this.format(this.model.get('sellCarryForwardtm2'))));
    $(tr).append($('<td class="gammaHedgeSell right"></td>').append(this.format(this.model.get('gammaHedgeSell'))));
    $(tr).append($('<td class="gammaHedgeNew right"></td>').append(this.format(this.model.get('gammaHedgeNew'))));
    $(this.el).append(tr);
 
    // var tr2 = $('<tr name='+this.model.get('code')+'1 class="' + this.model.get('prefix') + ' bold"></tr>');
    // $(this.el).append(tr).append(tr2);

    //add change event on render
    var that = this;
    this.model.on('change', function() {
      console.log('LimitRowView::changed attribute: ' + that.model.get('prefix'));

      // var trs = $(tr).add($(tr2));
      var trs = $(tr);

      $.each(this.changedAttributes(), function(index, value) { 
        var td = $(trs).find('.'+index);
        $(td).empty().html(that.format(value));
        $(td).stop(true,true).effect("highlight", {}, 3000);
      });

      that.toShow()? $(trs).show(): $(trs).hide();
    });

    that.toShow()? $(that.el).find('tr').show(): $(that.el).find('tr').hide();
    $('#main table').append($(this.el).find('tr'));
    //return $(that.el).find('tr');
  },

  toShow: function() {
    return this.model.get('buyLimit')   != 0 ||
      this.model.get('buyCarryForwardtm1') != 0 || this.model.get('buyCarryForwardtm2') != 0 || 
      this.model.get('sellCarryForwardtm1')!= 0 || this.model.get('sellCarryForwardtm2')!= 0 || 
      this.model.get('gammaHedge') != 0 ||
      this.model.get('grandtotalbuy')   != 0 || this.model.get('sellLimit') != 0||
      this.model.get('grandtotalsell') != 0;
  }
})

LimitView = Backbone.View.extend({

  tagName: "table",

  className: "table table-bordered table-condensed", 

  initialize: function() {
    console.log('LimitView.initialize()');
    this.render();

    var that = this;
    this.collection.on('add', function(obj) {
      console.log('LimitView::collection added');
      new LimitRowView({model: obj}).render();
 
      //sort
      var trs = $('#main table tbody').find('tr');
      trs = _.sortBy(trs, function(e) { return $(e).attr('name'); });
      $('#main table tbody').empty().html(trs);

      //reset strip colors
      $('#main table tbody tr:visible').each(function(i,e) {
        //console.log(Math.floor(i / 2) % 2);
        if ((Math.floor(i / 2)+1) == 0) {
          $(e).addClass('strip');
        } else {
          $(e).removeClass('strip');
        }
      });

    });
  },

  render: function() {
    console.log('LimitView.drawInit()');

    //print header
    $(this.el).append(
      '<thead>'+
      '<tr>' +
      '  <th>Gamma Hedge</th>' +
      '  <th>T-2</th>' +
      '  <th>T-1</th>' +
      '  <th>Intraday</th>' +
      '  <th>Total Limit</th>' +
      '  <th>Underlying</th>' +
      '  <th>Total Limit</th>' +
      '  <th>Intraday</th>' +
      '  <th>T-1</th>' +
      '  <th>T-2</th>' +
      '  <th>Gamma Hedge</th>' +
      '  <th>Gamma Hedge T+1</th>' +
      '</tr>' + 
      '</thead>'
    );

    $('#main').append($(this.el));
  }
}); 