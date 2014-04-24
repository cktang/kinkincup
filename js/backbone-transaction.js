///////////////////////////////////////////////////////////////
//Models
Transaction = Backbone.Model.extend({ idAttribute: 'tradeId' });
Underlying = Backbone.Model.extend({ idAttribute: 'ulId' });
State = Backbone.Model.extend({});
Product = Backbone.Model.extend({ idAttribute: 'id' });
Products = Backbone.Collection.extend({ model: Product });

///////////////////////////////////////////////////////////////
//Collections

Transactions = Backbone.Collection.extend({
  model: Transaction,

  format: function(num, f) {
    f = f || "0000";
    if (num === "HSI") return num;
    return $.formatNumber(num, {format:f});
  },

  mapUserShort: function(userId) {
    if (userId === '1401100') return "YM";
    if (userId === '1347449') return "JP";
    if (userId === '1405874') return "MD";
    if (userId === '1354058') return "FL";
    if (userId === '1452175') return "JW";
    if (userId === '1313041') return "KL";
    return userId;
  },

  mapUser: function(userId) {
    if (userId === '1401100') return "YooMin";
    if (userId === '1347449') return "John";
    if (userId === '1405874') return "Mourad";
    if (userId === '1354058') return "Francois";
    if (userId === '1452175') return "JinWoo";
    if (userId === '1313041') return "Kevin";
    return userId;
  },

  parse: function(msg, mode) {
    var that = this;
    // try {
      $(msg).each(function() {
        if (!this.tradeId || this.productId.indexOf("@XHKF") > 0) {
          // console.log('ignored trade:' + this.productId);
          return;
        }

        this.ulId = that.format(this.ulId.replace('@XHKG', ''));
        this.username = that.mapUser(this.userId);
        this.usernameShort = that.mapUserShort(this.userId);
        this.productId = this.productId.replace('@XHKG', '');
        this.timestamp = this.timestamp.substring(11);

        //get market data
        try {
          if (marketData.collection.get(this.productId)) {

          } else {
            marketData.collection.add({localCode: this.productId});
            this.md = marketData.collection.get(this.productId);
            marketData.subscribe(this.productId);
          }

        }catch(e) {
          //that.logError(e);
        }
 
        //francois's vol eqt
        //query = "SELECT USERID,WAY,QUANTITY,PRICE,TIMESTAMP_A,PRODUCTID,ULID,SPOT,BROKEREXCHANGEID,VOLATILITY+PRICESHIFTVALUE/100 AS VOLATILITY,THEORITICALPRICE,VEGA FROM DERIVATIVEEXECUTION WHERE PRODUCTID='" & dbCode & "' ORDER BY TIMESTAMP_A DESC"
        // newTrade.volatility = Round(oRsOracle.Fields(9).Value * 100 + (newTrade.price - oRsOracle.Fields(10).Value) / oRsOracle.Fields(11).Value, 2)
        this.volatility = (this.volatility + (this.priceShiftValue/100.0)) * 100 + (this.price - this.theoriticalPrice) / this.vega;

        var bean = that.get(this.tradeId);
        var isSilent = !mode? false: mode === 'allTransaction'? true: false;
        isSilent = false;
        bean? bean.set(this, {silent:isSilent}): that.add(this, {silent:isSilent});
      });
    // } catch (e) {
    //   console.log(e);
    //   console.trace();
    // } 
  }
});

Underlyings = Backbone.Collection.extend({
  model: Underlying
});

///////////////////////////////////////////////////////////////
//Views

WrapperView = Backbone.View.extend({

  events: {
    "click .well": "focus",
    "click .well table": "select",
    'click .btn-group>button': 'changeDisplayMode',
    "click .filter>*": 'traderFilter'
  },

  changeDisplayMode: function(e) {
    var text = $(e.currentTarget).text().trim();

    if (text === 'Full') {
      $(e.target).parents('.well').find('th, td').show();
    }

    if (text === 'Compact') {
      $(e.target).parents('.well').find('.compact').hide();
    }
  },

  initialize: function(options) {
    this.state = options.state;
    var that = this;

    if(this.collection) {
      this.collection.on('add', this.filter, this);
    }
  },

  hideDiv: function(divs) {
    $(divs).show();
  },

  showDiv: function(divs) {
      $(divs).show();
  },

  filter: function() {
      //if (!init) return;

      var name = this.filterText;
      if (!name || name.length == 0) return;

      console.log('Focus: ' + name);

      var self = this;
      $(underlyingView.el).find('.selected').removeClass('selected');
      var filter = $(this.el).find('.label').text();
      if (filter === 'All' || filter === '') {
        //do nothing
      } else {
        var uu = transactions.chain().filter(function(e) { return e.get('username')===name; }).map(function(e) { return e.get('ulId'); }).uniq().value();          
        $(uu).each(function(i, u) {
          $(underlyingView.el).find('.row-'+u).find('td').first().addClass('selected');
        });
      }

      self.state.set('u', JSON.stringify(_.map($(underlyingView.el).find('td.selected'), function(e) { return $(e).text(); })));
  },

  traderFilter: function(obj) {
      //display related
      $(obj.target).addClass('label').siblings().removeClass('label');
      var name = $(obj.target).text();
      this.filterText = name;
      this.state.set('f', this.filterText);
      this.filter();
  },

  select: function(e) {
    var id = $(e.currentTarget).parents('.well').attr('id');
    console.log('select:' + id);

    if (id === "underlyingDiv") {
      $(e.target).parents('tr').find('td').first().toggleClass('selected');
      this.state.set('u', JSON.stringify(_.map($(e.target).parents('table').find('td.selected'), function(e) { return $(e).text(); })));

      this.showDiv(['warrantsDiv', 'warrantsDivHeader']);
      if ($('#executionsDiv').css('opacity') > 0)
        this.hideDiv(['executionsDiv', 'executionsDivHeader']);

      if ($('#executionsDetailsDiv').css('opacity') > 0)
        this.hideDiv(['executionsDetailsDiv', 'executionsDetailsDivHeader']);
    } 

    if (id === "warrantsDiv") {
      //change underlying state, delegate action
      $(e.target).parents('table').find('td').removeClass('selected');
      $(e.target).parents('tr').find('td').first().addClass('selected');
      this.state.set('w', $(e.target).parents('tr').find('td').first().text());

      this.showDiv(['executionsDiv', 'executionsDivHeader']);

      if ($('#executionsDetailsDiv').css('opacity') > 0)
        this.hideDiv(['executionsDetailsDiv', 'executionsDetailsDivHeader']);
    }

    if (id === "brokerDiv" || id === "executionsDiv") {
      //change underlying state, delegate action
      $(e.target).parents('table').find('td').removeClass('selected');
      var td = $(e.target).parents('tr').find('td').first().toggleClass('selected');
      this.state.set('b', $(td).text());
      this.showDiv(['executionsDetailsDiv', 'executionsDetailsDivHeader']);
    }

    //supress the 'focus' trigger
    e.stopPropagation();    
  },

  focus: function(e) {
    var id = $(e.currentTarget).attr('id');
    console.log('focus:' + id);

    if (id === "underlyingDiv") {
      if ($('#warrantsDiv').css('opacity') > 0)
        this.hideDiv(['warrantsDiv', 'warrantsDivHeader']);

      if ($('#executionsDiv').css('opacity') > 0)
        this.hideDiv(['executionsDiv', 'executionsDivHeader']);

      if ($('#executionsDetailsDiv').css('opacity') > 0)
        this.hideDiv(['executionsDetailsDiv', 'executionsDetailsDivHeader']);
    } 

    if (id === "warrantsDiv") {
      if ($('#executionsDiv').css('opacity') > 0)
        this.hideDiv(['executionsDiv', 'executionsDivHeader']);

      if ($('#executionsDetailsDiv').css('opacity') > 0)
        this.hideDiv(['executionsDetailsDiv', 'executionsDetailsDivHeader']);
    }

    if (id === "executionsDiv") {
      if ($('#executionsDetailsDiv').css('opacity') > 0)
        this.hideDiv(['executionsDetailsDiv', 'executionsDetailsDivHeader']);
    }
  }

});

UnderlyingView = BaseView.extend({

  tagName: "table",
  className: "table table-bordered table-condensed sortable",

  initialize: function(options) {
    console.log('UnderlyingView.initialize()');
    this.state = options.state;
    this.render();
    this.collection.on('add', this.addRow, this);
    this.collection.on('change', this.updateRow, this);

    this.startThrottleUpdate(5000);
  },
 
  updateRow: function(obj) {
    this.update = true;

    //console.log('UnderlyingView.updateRow()');
    var tr = $(this.el).find('.row-'+obj.get('ulId'));
    var that = this;
    $.each(obj.attributes, function(key, value) { 
      if (key === "ulId") value = that.format(value, "0000");
      if (key === "turnover") value = that.format(value);
      if (key === "netpos") value = that.format(value);
      if (key === "delta") value = that.format(value, "#,##0.");
      var e = $(tr).first().find('.field-'+key).empty().html(value);
    });

    this.highlight(tr);
    this.hideCompact();

    //this.addTableSum();
    that.coloring(tr);
    
    if (!that.hasManualSort())
      that.sortByColumn(0);
    else
      that.defaultSort();
  },

  addRow: function(obj) {
    if (obj.get('active') === 0) {
      console.log('addRow: ' + JSON.stringify(obj));
    }


    this.update = true;

    //console.log('UnderlyingView.addRow()');
    tr = $('<tr class="row-'+obj.get('ulId')+'">' +
      '  <td class="field-ulId bold">'+this.format(obj.get('ulId'), "0000")+'</td>' +
      '  <td class="field-active">'+obj.get('active')+'</td>' +
      '  <td class="compact field-turnover">'+this.format(obj.get('turnover'))+'</td>' +
      '  <td class="field-netpos numbers">'+this.format(obj.get('netpos'))+'</td>' +  
      '  <td class="field-pnl numbers">'+this.format(obj.get('pnl'))+'</td>' +
      '  <td class="compact field-delta numbers">'+this.format(obj.get('delta'))+'</td>' +
      '</tr>');
    $(this.el).append(tr);
    
    this.highlight(tr);
    this.hideCompact();

    //this.addTableSum();
    this.coloring(tr); 

    this.numbersElements = $(this.el).find('.numbers');
  },

  findUPnL: function(list) {
    var uu = _.groupBy(list, function(e){ return e.get('productId')});
    
    var pnl = 0.0;
    var that = this;
    _.each(uu, function(ll, key) {
      pnl += that.findPnL(ll);
    });

    return this.format(pnl, "#,##0");
  },

  render: function() {
    console.log('UnderlyingView.render()');
 
    $(this.el).append(
      '<thead>'+
      '<tr>' +
      '  <th width=30>Code</th>' +
      '  <th class="numbers sum">AW</th>' +
      '  <th class="numbers compact sum">TO</th>' +
      '  <th class="numbers sum">NetPos</th>' +
      '  <th class="numbers sum">PnL</th>' +
      '  <th class="numbers sum compact">Delta</th>' +
      '</tr>' + 
      '</thead>'
    );

    $('#underlyingDiv').append($(this.el));  
  }
});

WarrantView = BaseView.extend({

  tagName: "table",
  className: "table table-bordered table-condensed sortable",

  initialize: function(options) {
    console.log('WarrantView.initialize()');
    this.initDraw();
    this.state = options.state;
    this.state.on('change:u', this.render, this);
    this.collection.on('add', this.changed, this);
    this.collection.on('change', this.changed, this);
    marketData.collection.on('change', this.marketDataChanged, this);
  },

  marketDataChanged: function(model,changes) {
    this.renderPartial(state, model.get('localCode'));
  },

  changed: function() {
    try {
      u = JSON.parse(this.state.get('u'));
      if (!_(u).contains(this.state.get('t').get('ulId'))) return;
    } catch(e) { return; }

    //this.renderPartial(this.state, this.state.get('t').get('productId'));
    this.render(this.state);
  },

  renderPartial: function(state, productId) {
    //check if need to update
    if ($(this.el).find('tr[code='+productId+']').length === 0) return;

    //find all transaction with same underlying
    var list = this.collection.filter(function(e) { return e.get('productId') === productId; });

    var that = this;
    var bb = _.filter(list, function(e) { return e.get('way')==='B' });
    var ss = _.filter(list, function(e) { return e.get('way')==='S' });
  
    var bbQty = that.sum(_.map(bb, function(e) { return e.get('quantity'); }));
    var ssQty = that.sum(_.map(ss, function(e) { return e.get('quantity'); }));

    var bbTurnover = that.sum(_.map(bb, function(e) { return e.get('price') * e.get('quantity'); }));
    var ssTurnover = that.sum(_.map(ss, function(e) { return e.get('price') * e.get('quantity'); }));

    var bbAvgPrice = bbQty > 0? bbTurnover / bbQty: 0;
    var ssAvgPrice = ssQty > 0? ssTurnover / ssQty: 0;

    var tr = $(this.el).find('tr[code='+productId+']').empty().html(
      '  <td name=code class=bold>' + list[0].get('productId') + '</td>' + 
      '  <td class=bold>' + list[0].get('ulId') + '</td>' +
      '  <td>' + list[0].get('usernameShort') + '</td>' + 

        '  <td>' + that.format(bbAvgPrice, "0.0000") + '</td>' +
        '  <td>' + that.format(ssAvgPrice, "0.0000") + '</td>' +
        '  <td>' + that.format(marketData.collection.get(list[0].get('productId')).get('m'), "0.##0") + '</td>' +
        '  <td>' + that.format(bbTurnover + ssTurnover) + '</td>' +
        '  <td class=numbers>' + that.format((ssQty * -1) + bbQty) + '</td>' +
        '  <td class=numbers>'+ that.format(that.findPnL(list)) +'</td>'
    );

    this.coloring(tr);
    var td = $(tr).find('td').first();
    if (state.get('w') === $(td).text()) $(td).addClass('selected');
      
    this.hideCompact();
  },

  render: function(state) {
    try {
      u = JSON.parse(state.get('u'));
    } catch(e) { return; }

    console.log('WarrantView.render()');

    //clear the list everytime
    $(this.el).find('tbody tr').remove();

    var u, uu, ww;
    $('.text-udlg').empty().html(state.get('u'));

    //find all transaction with same underlying
    var f = state.get('f');
    uu = this.collection.filter(function(e) { 
      return u.indexOf(e.get('ulId')) >= 0 && (!f || f==='All' || f==='' || f===e.get('username')); });
    ww = _.chain(uu)
      .groupBy(function(e) { return e.get('productId'); })
      // .sortBy(function(e) { return e[0].get('ulId') + e[0].get('productId'); })
      .value();

    var that = this;
    _(ww).each(function(list) {
      // console.log(list[0].get('productId') + " " + productsView.collection.get(list[0].get('productId')));
      var bb = _.filter(list, function(e) { return e.get('way')==='B' });
      var ss = _.filter(list, function(e) { return e.get('way')==='S' });
    
      var bbQty = that.sum(_.map(bb, function(e) { return e.get('quantity'); }));
      var ssQty = that.sum(_.map(ss, function(e) { return e.get('quantity'); }));

      var bbTurnover = that.sum(_.map(bb, function(e) { return e.get('price') * e.get('quantity'); }));
      var ssTurnover = that.sum(_.map(ss, function(e) { return e.get('price') * e.get('quantity'); }));
  
      var bbAvgPrice = bbQty > 0? bbTurnover / bbQty: 0;
      var ssAvgPrice = ssQty > 0? ssTurnover / ssQty: 0;

      $(that.el).append(
        '<tr code='+list[0].get('productId')+' >' +
        '  <td name=code class=bold>' + list[0].get('productId') + '</td>' + 
        '  <td class=bold>' + list[0].get('ulId') + '</td>' +
        '  <td>' + list[0].get('usernameShort') + '</td>' + 
        '  <td>' + that.format(bbAvgPrice, "0.0000") + '</td>' +
        '  <td>' + that.format(ssAvgPrice, "0.0000") + '</td>' +
        '  <td class=mid>' + that.format(marketData.collection.get(list[0].get('productId')).get('m'), "0.##0") + '</td>' +
        '  <td>' + that.format(bbTurnover + ssTurnover) + '</td>' +
        '  <td class=numbers>' + that.format((ssQty * -1) + bbQty) + '</td>' +
        '  <td class=numbers>'+ that.format(that.findPnL(list)) +'</td>' + 
        '</tr>'
      );

      var td = $(that.el).find('tr').last().find('td[name=code]');
      if (state.get('w') === $(td).text()) $(td).addClass('selected');

    });

    if (!this.hasManualSort())
      this.sortByColumnCallback(function(tr) { return $(tr).find('td:eq(1)').text()+$(tr).find('td:eq(0)').text(); });
    else
      this.defaultSort();

    var productId = "";
    if (!this.hasManualSort()) {
      $(this.el).find('tbody tr').each(function() {
        //add extra line between diff. underlyings
        if (productId === '') productId = $(this).find('td:eq(1)').text();
        if (productId != $(this).find('td:eq(1)').text()) {
          $('<tr class=dummy><td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;<td>&nbsp;</tr>').insertBefore(this);
          productId = $(this).find('td:eq(1)').text();
        }
      });
    }

    this.addTableSum();
    this.hideCompact();
    this.coloring();
  },

  initDraw: function(e) {
    $(this.el).append(
      '<thead>'+
      '<tr>' +
      '  <th>Code</th>' +
      '  <th>UL</th>' +
      '  <th>Tr</th>' +
      '  <th class="numbers">Avg<br>BPrice</th>' +
      '  <th class="numbers">Avg<br>SPrice</th>' +
      '  <th class="numbers">Mid</th>' +
      '  <th class="numbers sum">TO</th>' +
      '  <th class="numbers sum">Net Pos</th>' +
      '  <th class="numbers sum">PnL</th>' +
      '</tr>' + 
      '</thead>'
    );

    $('#warrantsDiv').append($(this.el));  
  }
});

ExecutionView = BaseView.extend({

  tagName: "table",
  className: "table table-bordered table-condensed sortable",

  initialize: function(options) {
    console.log('ExecutionView.initialize()');
    this.initDraw();
    this.state = options.state;
    this.state.on('change:w', this.render, this);
    this.state.on('change:b', this.render, this);
    this.collection.on('add', this.changed, this);
    this.collection.on('change', this.changed, this);
  },

  changed: function(e) {
    try {
      if (!this.w) this.w = state.get('w');
      if (this.w != state.get('t').get('productId')) return;
    }catch(e) { console.log(e); }

    this.render(this.state);
    // var self = this;
    // $(this.el).find('td[name=brokerName]').each(function() {
    //   if (e.get('brokerName') === $(this).text()) {
    //     // self.highlight($(this).parent().find('td:visible'));
    //   }
    // });
  },

  render: function(state) {
    this.w = state.get('w');
    console.log('ExecutionView.render()');

    //clear the list everytime
    $(this.el).find('tbody tr').remove();
    $('.text-productId').empty().html(state.get('w'));

    //find all transaction with same underlying
    var ww = this.collection.filter(function(e) { return e.get('productId')===state.get('w'); });
    ww = _.groupBy(ww, function(e) { return e.get('brokerName'); });

    var that = this;
    _.each(ww, function(list, key) {
      var bb = _.filter(list, function(e) {return e.get('way')==='B' });
      var ss = _.filter(list, function(e) {return e.get('way')==='S' });

      var selected = key === state.get('b');
      $(that.el).append(
        '<tr>' +
        '  <td name=brokerName class="bold '+(selected?'selected':'')+'">' + key + '</td>' +
        '  <td style="color:transparent">1</td>' +
        '  <td class="numbers">' + that.format(that.sum(_.map(list, function(e) {return e.get('way')==='B'? e.get('quantity'): e.get('quantity')*-1; }))) + '</td>' +
        '  <td class=compact>' + that.format(that.sum(_.map(bb, function(e) {return e.get('quantity'); }))) + '</td>' +
        '  <td class=compact>'+ that.format(that.findAvgPrice(bb), "0.000") +'</td> ' +
        '  <td class=compact>' + that.format(that.sum(_.map(ss, function(e) {return e.get('quantity'); }))) + '</td>' +
        '  <td class=compact>'+ that.format(that.findAvgPrice(ss), "0.000") +'</td> ' +
        '  <td class="numbers">'+ that.format(that.findPnL(list)) +'</td> ' +
        '</tr>'
      );

    });

    if (!this.hasManualSort())
      this.sortByColumnString(0);
    else
      this.defaultSort();
    
    this.addTableSum();
    this.hideCompact();
    this.coloring();
  },

  initDraw: function(e) {
    $(this.el).append(
      '<thead>'+
      '<tr>' +
      '  <th>Broker</th>' +
      '  <th class="numbers sum">Count</th>' +
      '  <th class="numbers sum">Net Pos</th>' +
      '  <th class="sum compact numbers">BQty</th>' +
      '  <th class="numbers compact">Avg<br>BPrice</th>' +
      '  <th class="numbers sum compact">SQty</th>' +
      '  <th class="numbers compact">Avg<br>SPrice</th>' +
      '  <th class="numbers sum">PnL</th>' +
      '</tr>' + 
      '</thead>'
    );

    $('#executionsDiv').append($(this.el));  
  }
});

ExecutionDetailsView = BaseView.extend({

  tagName: "table",
  className: "table table-condensed table-bordered sortable",

  initialize: function(options) {
    console.log('ExecutionDetailsView.initialize()');
    this.initDraw();
    this.state = options.state;
    this.state.on('change:w', this.render, this);
    this.state.on('change:b', this.render, this);
    this.collection.on('add', this.changed, this);
    this.collection.on('change', this.changed, this);
  },

  changed: function(e) {
    try {
      if (!this.w) this.w = state.get('w');
      if (this.w != state.get('t').get('productId')) return;
    }catch(e) { console.log(e); }

    this.render(this.state);

    var self = this;
    $(this.el).find('td[name=timestamp]').each(function() {
      if (e.get('timestamp') === $(this).text()) {
        // self.highlight($(this).parent().find('td:visible'));
      }
    });
  },

  render: function(state) {
    this.w = state.get('w');
    console.log('ExecutionDetailsView.render()');

    //clear the list everytime
    $(this.el).find('tbody tr').remove();
    $('.text-brokerName').empty().html(state.get('b'));

    //find all transaction with same underlying
    var ww = _.chain(this.collection.filter(function(e) { return e.get('productId')===state.get('w'); }))
      .sortBy(function(e) { return e.get('timestamp')})
      .reverse()
      .value();

    var that = this;
    _.each(ww, function(w) {
      var name = w.get('brokerName');
      if (state.get('b') != '' && state.get('b') != name) return;
      // if (name.length > 15) name = name.substring(0,15) + "..."; 

      $(that.el).append(
        '<tr>' +
        '  <td name=brokerName class=bold onmouseout="$(\'.tooltip\').remove()" onmouseover="$(this).tooltip({title:\''+w.get('brokerExchangeId')+'\'}).tooltip(\'show\')">' + name + '</td>' +
        '  <td class=bold>' + w.get('productId') + '</td>' +
        '  <td class='+(w.get('way')==='B'?'buy':'sell')+'>' + w.get('way') + '</td>' +
        '  <td>' + w.get('price') + '</td>' +
        '  <td class=numbers>' + that.format(w.get('quantity') * (w.get('way')==='B'? 1: -1)) + '</td>' +
        '  <td name=timestamp>' + w.get('timestamp') + '</td>' +
        '  <td>' + that.format(w.get('spot'), "#,##0.00") + '</td>' +
        '  <td>' + that.format(w.get('volatility'), "#,##0.00") + '</td>' +
        '</tr>'
      );
    });

    this.addTableSum();
    this.hideCompact();
    this.coloring();

    //John specific colorings
    // $(this.el).find('.highlight').removeClass('highlight'); 
    $(this.el).find('td:contains(Macquarie)').addClass('highlight');  
    $(this.el).find('td:contains(Trinity)').addClass('highlight');    
  },

  initDraw: function(e) {
    $(this.el).append(
      '<thead>'+
      '<tr>' +
      '  <th>Broker</th>' +
      '  <th>Code</th>' +
      '  <th>Way</th>' +
      '  <th class="numbers">Price</th>' +
      '  <th class="numbers">Qty</th>' +
      '  <th>TS</th>' +
      '  <th class="numbers">Spot</th>' +
      '  <th class="numbers">Vol</th>' +
      '</tr>' + 
      '</thead>'
    );

    $('#executionsDetailsDiv').append($(this.el));  
  }
});

BrokerView = BaseView.extend({

  tagName: "table",
  className: "table table-bordered table-condensed sortable",

  initialize: function(options) {
    console.log('BrokerView.initialize()');
    this.state = options.state;
    this.initDraw();
    this.state.on('change:b', this.render, this);
    this.collection.on('add', this.render, this);
    //this.collection.on('change', this.render, this);

    this.subCollection = {};

    this.startThrottleUpdate(2000);
  },

  render: function(obj,a,b,c) {
    if (!obj) return;
    this.update = true;

    var list = this.subCollection[obj.get('brokerName')] || new Array;
    list.push(obj);
    this.subCollection[obj.get('brokerName')] = list;

    try {
      var brokerNameClass = 'row-'+obj.get('brokerName').replace(/[ '&\(\)\.,]/gi,'');
    } catch(e) {
      console.log(e);
    }

    var that = this;

    if ($(this.el).find('.'+brokerNameClass).length > 0) {
      var tr = $(this.el).find('.'+brokerNameClass).first();
    } else {
      var tr = $('<tr class="'+brokerNameClass+'"></tr>');
      $(this.el).append(tr);
    }

    var bb = this.subCollection[obj.get('brokerName')];

    // var bb = _.chain(this.collection.filter(function(e) { return e.get('brokerName') === obj.get('brokerName'); }))
    //   .groupBy(function(e) { return e.get('brokerName'); })
    //   .sortBy(function(e) { return e[0].get('brokerName'); }).value();

    // _(bb).each(function(list) {

    //find all transaction with same underlying
    var ww = _(bb).groupBy(function(e) { return e.get('productId'); });
    var pnl = that.sum(_(ww).map(function(e) { return that.findPnL(e); }));

    $(tr).empty().html(
      '  <td class=bold>' + bb[0].get('brokerName') + '</td>' +
      '  <td style="color: transparent">1</td>' +
      '  <td class=numbers>' + that.format(that.sum(_.map(bb, function(e) { return e.get('price') * e.get('quantity'); }))) + '</td>' +
      '  <td class=numbers>' + that.format(that.sum(_.map(bb, function(e) { return e.get('way')==='B'? e.get('quantity'): e.get('quantity')*-1; }))) + '</td>' +
      '  <td class=numbers>'+ that.format(pnl, "#,##0") +'</td>'
    );

    if (init) {
      if (!this.hasManualSort())
        this.sortByColumn(1);
      else
        this.defaultSort();

      // this.addTableSum();
      // this.coloring();
      this.highlight(tr);

      //John specific colorings
      // $(this.el).find('.highlight').removeClass('highlight'); 
      $(this.el).find('td:contains(Macquarie)').addClass('highlight');  
      $(this.el).find('td:contains(Trinity)').addClass('highlight');    
    }
  },

  initDraw: function() {
    // console.log('UnderlyingView.render()');
 
    $(this.el).append(
      '<thead>'+
      '<tr>' +
      '  <th>Broker</th>' +
      '  <th class="numbers sum">Count</th>' +
      '  <th class="numbers sum">TO</th>' +
      '  <th class="numbers sum">Net Pos</th>' +
      '  <th class="numbers sum">PnL</th>' +
      '</tr>' + 
      '</thead>'
    );

    $('#brokerDiv').append($(this.el));  
  }
});

BrokerDetailsView = BaseView.extend({

  tagName: "table",
  className: "table table-condensed table-bordered sortable",

  initialize: function(options) {
    console.log('BrokerDetailsView.initialize()');
    this.initDraw();
    this.state = options.state;
    this.state.on('change:b', this.render, this);
    this.collection.on('add', this.changed, this);
    this.collection.on('change', this.changed, this);
  },

  changed: function(e) {

    try {
      if (!this.b) this.b = state.get('b');
      if (this.b != state.get('t').get('brokerName')) return;
    }catch(e) { console.log(e); }

    this.render(this.state);
    var self = this;
    //console.log(e);

    // $(this.el).find('td[name=code]').each(function() {
    //   if (e.get('productId') === $(this).text()) {
    //     // self.highlight($(this).parent().find('td:visible'));
    //   }
    // });
  },

  render: function(state) {
    this.b = state.get('b');
    console.log('BrokerDetails::render()');

    //clear the list everytime
    $(this.el).find('tbody tr').remove();
    $('.text-brokerDetailsName').empty().html(state.get('b'));

    //find all transaction with same underlying
    var ww = _.chain(this.collection.filter(function(e) { return e.get('brokerName') === state.get('b'); }))
      .groupBy(function(e) { return e.get('productId'); })
      .sortBy(function(e) { return e[0].get('productId'); }).value();

    var that = this;
    var sum = that.sum(_.map(_.flatten(ww), function(e) { return e.get('price') * e.get('quantity'); }));
    _.each(ww, function(w) {
      var name = w[0].get('brokerName');
 
      $(that.el).append(
        '<tr>' +
        '  <td name=code class=bold>' + w[0].get('productId') + '</td>' +
        '  <td class=bold>' + w[0].get('ulId') + '</td>' +
        '  <td class=numbers>' + that.format(that.sum(_.map(w, function(e) { return e.get('price') * e.get('quantity'); }))) + '</td>' +
        '  <td class=numbers>' + that.format(that.sum(_.map(w, function(e) { return e.get('way')==='B'? e.get('quantity'): e.get('quantity')*-1; }))) + '</td>' +
        '  <td class=numbers>'+ that.format(that.findPnL(w)) +'</td>' +
        '  <td>' + w.length + '</td>' +
        '  <td>' + that.format(that.sum(_.map(w, function(e) { return e.get('price') * e.get('quantity'); })) / sum, "0.00%") + '</td>' +
        '</tr>'
      );
    });

    this.addTableSum();
    this.hideCompact();
    this.coloring();
    
    if (!this.hasManualSort())
      this.sortByColumnString(0);
    else
      this.defaultSort();
  },

  initDraw: function(e) {
    $(this.el).append(
      '<thead>'+
      '<tr>' +
      '  <th>Code</th>' +
      '  <th>UL</th>' +
      '  <th class="numbers sum">TO</th>' +
      '  <th class="numbers sum">Net Pos</th>' +
      '  <th class="numbers sum">PnL</th>' +
      '  <th class="numbers sum">Execs</th>' +
      '  <th>Ratio</th>' +
      '</tr>' + 
      '</thead>'
    );

    $('#brokerDetailsDiv').append($(this.el));  
  }
});

ProductsView = BaseView.extend({
  initialize: function() {
    this.model.on('change:w', this.render, this);
  },

  render: function() {
    if (!init) return;
    if (this.model.get('w') === this.w) return;
    if (this.model.get('w') === '') return; 

    //save last update
    this.w = this.model.get('w'); 

    console.log('ProductView:update');
    try {
      var p = this.collection.get(this.model.get('w') + "@XHKG");
      $(this.el).empty().html("" 
        + "<Strong>" + p.get('id').replace("@XHKG","") + "</strong>"
        + "<small style='margin-left:15px'>" + p.get('strike') + "</small> " 
        + "<small style='margin-left:15px'>" + p.get('maturity').substring(0,10) + "</small>" 
        + "<small style='margin-left:15px'>" + (p.get('optionType')===1?'C':'P') + "</small>" 
        + "<small style='margin-left:15px'>" + p.get('wParity') + "</small>" 
        + "<small style='margin-left:15px'>" + p.get('yesterdayPosition') + "</small>" 
        + "");
    }catch(e) {}
  }
});
