Execution = BaseModel.extend({
  defaults : {
      bidShiftValue: 0,
      bidTickShift: 0,
      brokerName: "broker name not found",
      brokerageFees: 0,
      clearingFees: 0,
      context: "OPTION_CONTEXT",
      currencyId: "HKD",
      delta: 0,
      deltaUnderlying: 0,
      exchangeFees: 0,
      executionState: "",
      gamma: 0,
      gammaUnderlying: 0,
      immediateHedgePercent: 0,
      imsId: "",
      imsUserId: "",
      isComplete: true,
      marketTradeId: "",
      mic: "",
      mu: 0,
      muUnderlying: 0,
      orderId: "",
      portfolioId: "",
      price: 1.6,
      priceShiftValue: 0,
      productId: "",
      quantity: 30,
      rawPrice: 0,
      rho: 0,
      rhoUnderlying: 0,
      sessionId: "",
      spot: 0,
      theoriticalPrice: 0,
      theta: 0,
      thetaUnderlying: 0,
      tradeId: "",
      ulId: "",
      userId: "",
      vega: 0,
      vegaUnderlying: 0,
      volatility: 0,
      way: ""
  }
});

Executions = BaseCollection.extend({
  model: Execution,
  fetch: function() { },
});

AlertView = StandardView.extend({
  initialize: function(options) {
    console.log('AlertView.initialize()');
    var view = this;

    options = options || {};
    this.el = options.el;
    options.title = options.title || prompt ("Name?", "New Alert");
    StandardView.prototype.initialize.call(this, options);
    _.bindAll(this);
    this.collection.on('batchUpdate', this.checkCondition);

/*
    var that = $(this.el).find('[name=help]').first();
    var keys = _.map(new Execution().defaults, function(value, key) { return key; })
    _.each(keys, function(key) {
      $(that).append('<option value="e.'+key+'">'+key+'</option>');
    });    
*/

    console.log($(this.content));
    $(this.content).find('[name=criteria]').first().select();
    $(this.el).addClass('alertview').effect('slide');
  },

  events: {
    "keydown [name=criteria]": 'evaluate'
  },

  checkCondition: function() {
    console.log('AlertView.checkCondition()');  

        
  },

  evaluate: function() {
    console.log('AlertView.evaluate()');
    try {
      var $criteria = $('[name=criteria]');
      var result = eval($criteria.val());
      $criteria.removeClass('negative').removeClass('positive');
    } catch(e) {
      $criteria.removeClass('positive').addClass('negative');
    }
  },

  render: function() { }
});
