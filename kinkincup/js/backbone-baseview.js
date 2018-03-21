_.sum = function(aa) { return _.reduce(aa, function(memo, num){ if (!memo) memo = 0; if (!num) num = 0; return memo + num; }, 0); };

BaseView = Backbone.View.extend({
  isSorting: false,

  events: {
    'click thead>tr>th': 'autoSort'
  },

  stopThrottleUpdate: function() {
    if (this.throttleUpdate) this.throttleUpdate.stop();
  },

  startThrottleUpdate: function(period) {
    //throttle update 
    var self = this;
    this.throttleUpdate = setInterval(function() {
      if (self.update && init) {
        console.log('Throttle Update: ' + self);
        self.update = false;
        try {
          self.addTableSum();

          if (!self.hasManualSort())
            self.sortByColumn(0);
          else
            self.defaultSort();
        }catch(e) {
          console.error(e);
        }
      }
    }, period);
  },

  hasManualSort: function() {
    return $(this.el).find('thead>tr>th.asc, thead>tr>th.desc').length > 0;
  },

  defaultSort: function(e) {
    if (!init) return;
    this.attributes = this.attributes || [];

    var e;
    if ($(this.el).find('thead>tr>th.asc, thead>tr>th.desc').length > 0) {
      e = $(this.el).find('thead>tr>th.asc, thead>tr>th.desc').first();
      var column = $(e).prevAll().length;

      if ($(e).hasClass('numbers'))
        this.sortByColumn(column, this.attributes.sortOrder);
      else
        this.sortByColumnString(column, this.attributes.sortOrder);
    }
  },

  autoSort: function(e) {
    //delete dummy empty lines before sort
    $(this.el).find('.dummy').remove();

    // console.log("autoSort: " + e.target);
    this.attributes = this.attributes || [];    
    var column = $(e.target).prevAll().length;
    
    if (this.attributes.sortColumn && column === this.attributes.sortColumn) {
      this.attributes.sortOrder = this.attributes.sortOrder * -1;
    } else {
      this.attributes.sortOrder = 1;
    }

    if ($(e.target).hasClass('numbers'))
      this.sortByColumn(column, this.attributes.sortOrder);
    else
      this.sortByColumnString(column, this.attributes.sortOrder);

    this.attributes.sortColumn = column;
  },

  sortByColumnCallback: function(callback) {
    var self = this;
    if (this.isSorting === true) {
      setTimeout(function() { self.sortByColumnCallback(callback) ; }, 100);
      return;
    }

    this.isSorting = true;

    var trs = $(this.el).find('tbody>tr');
    trs = _.sortBy(trs, callback);
    $(this.el).find('tbody').empty().html(trs);

    this.isSorting = false;
  },

  sortByColumnString: function(column, order) {
    var self = this;
    if (this.isSorting) return;

    this.isSorting = true;

    order = order || 1;

    //color the header
    $(this.el).find('thead>tr>th').removeClass('asc').removeClass('desc');
    $(this.el).find('thead>tr>th:eq('+column+')').addClass(order===1?'asc':'desc');

    var trs = $(this.el).find('tbody>tr');
    trs = _.sortBy(trs, function(tr) { return $(tr).find('td:eq('+column+')').text().toLowerCase(); });
    if (order < 0) trs = trs.reverse();
    $(this.el).find('tbody').empty().html(trs);

    this.isSorting = false;
  },

  sortByColumn: function(column, order) {
    var self = this;
    if (!init) return;
    if (this.isSorting === true) {
      setTimeout(function() { self.sortByColumn(column, order) ; }, 100);
      return;
    }

    this.isSorting = true;

    order = order || 1;

    //color the header
    $(this.el).find('thead>tr>th').removeClass('asc').removeClass('desc');
    $(this.el).find('thead>tr>th:eq('+column+')').addClass(order===1?'asc':'desc');

    var trs = $(this.el).find('tbody>tr');
    trs = _.sortBy(trs, function(tr) { return parseInt($(tr).find('td:eq('+column+')').text().replace(/,/gi,'')); });
    if (order < 0) trs = trs.reverse();
    $(this.el).find('tbody').empty().html(trs);

    this.isSorting = false;
  },

  hideCompact: function() {   
    if ($(this.el).parent().find('.btn-group .active').text() === 'Compact') {
      $(this.el).find('.compact').hide();
    }
  },

  addTableSum: function() {
    // if (!init) return;

    var table = $(this.el);
    var cols = $(table).find('thead th').length;
    var total;

    if ($(table).find('th.sum').length === 0) return;

    if ($(table).find('.total').length === 0) {
      var tr = $('<tr class=total></tr>');
      $.each(_.range(cols), function(col) {
        $(tr).append('<td class=numbers></td>');
      });
      $(table).find('thead').append(tr);
      total = $(table).find('.total');
    } else {
      total = $(table).find('.total');
    }

    var that = this;
    setTimeout(function() {
      $.each(_.range(cols), function(col) {
        if (!$(table).find('th:eq('+col+')').hasClass('sum')) return;

        var value = that.sum(_($(table).find('tbody').find('tr').find('td:eq('+col+')')).map(function(e) { return parseInt($(e).text().replace(/,/gi,'')) || 0; }));
        var td = $(total).find('td:eq('+col+')');
        $(td).empty().html($.formatNumber(value, {format:'#,##0'}));
      
        if ($(table).find('th:eq('+col+')').hasClass('compact')) {
          var td = $(total).find('td:eq('+col+')');
          $(td).addClass('compact');
        }

        that.coloring($(table).find('thead'));
      });
    }, 10);
  },

  sum: function(list) {
    return _.reduce(list, function(memo, num){ return memo + num; }, 0);
  },

  findAvgPrice: function(list) {
      var qty = this.sum(_.map(list, function(e) { return e.get('quantity')}));
      var avgPrice = this.sum(_.map(list, function(e) { return e.get('price')*e.get('quantity'); })) / qty;
      return avgPrice;
  },

  findPnL: function(list) {
    try {
      var ways = _(list).groupBy(function(e) { return e.get('way'); });
      var bb = _(ways['B'] || []).sortBy(function(e) { return e.get('timestamp'); });
      var ss = _(ways['S'] || []).sortBy(function(e) { return e.get('timestamp'); });

      var bQty = this.sum(_.map(bb, function(e) { return e.get('quantity')} ));
      var sQty = this.sum(_.map(ss, function(e) { return e.get('quantity')} ));
      var minQty = Math.min(bQty, sQty);

      // new method , time based, suggested by JP
      // if (bQty > minQty) bb = this.trimArray(bb, { propertyName: 'quantity', minQty: minQty });
      // if (sQty > minQty) ss = this.trimArray(ss, { propertyName: 'quantity', minQty: minQty });
      
      var bAvgPrice = this.sum(_.map(bb, function(e) { return e.get('price')*e.get('quantity'); })) / bQty;
      var sAvgPrice = this.sum(_.map(ss, function(e) { return e.get('price')*e.get('quantity'); })) / sQty;
      var priceDiff = ((sAvgPrice - bAvgPrice) || 0);

      //calculate mark to market
      var mid = marketData.collection.get(list[0].get('productId')).get('m') || 0;
      var markToMarket = mid === 0? 0: ((sQty - bQty) > 0? (sQty - bQty) * (sAvgPrice - mid): (bQty - sQty) * (mid - bAvgPrice));

      return minQty * priceDiff + markToMarket;
    } catch(e) {
      return -1;
    }
  },

  format: function(num, f) {
    f = f || "#,###,##0";
    if (num === "HSI") return num;
    return $.formatNumber(num, {format:f});
  },

  coloring: function(e) {
    var that = this;
    var ee = this.numbersElements || (e? $(e).find('td.numbers'): $(this.el).find('td.numbers'));
    
    setTimeout(function() {
      $(ee).each(function() {  
        if (parseInt($(this).text()) < 0) { 
          $(this).addClass('negative');
        } else {
          $(this).removeClass('negative');
        }
      });
    }, 10);
  },

  changed: function(e) {
    // // this.render(this.state, false);
    // //console.log(e);

    // $(this.el).find('td[name=code]').each(function() {
    //   if (e.get('productId') === $(this).text()) {
    //     // $(this).parent().find('td:visible').stop(true, true).effect('highlight', {}, 500);
    //   }
    // });
  },

  highlight: function(e) {
    try {
      if (!init || this.inHighlight) return;
      if (this.state && this.state.get('inDrag') === 'true') return;
    } catch(e) { console.log(e); }

    // $(e).removeClass('flash').addClass('flash');

    var self = this;
    this.inHighlight = true;
    setTimeout(function() {
      $(e).stop(true, true).effect({
        complete: function() { self.inHighlight = false; },
        duration: 200,
        effect: 'highlight',
        easing: 'linear'
      });
    }, 10);
  }

});