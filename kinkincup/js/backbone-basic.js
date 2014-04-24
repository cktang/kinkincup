Backbone.sync = function(method, model, option) {
  console.log(method + "|" + JSON.stringify(model) + "|" + JSON.stringify(option));
  //sendMsg(option);
};

BaseModel = Backbone.Model.extend({
  initialize: function() { /*console.log('Model Init');*/ }
});

BaseCollection = Backbone.Collection.extend({
  initialize: function() {
    console.log('Collection Init: ' + JSON.stringify(this) );
  },

  parse: function(response) {
    console.log('Collection parse');
    var raws = response || [];
    // if (!_.isArray(raws)) 
    this.add(raws, {silent:true});
    this.trigger("batchUpdate", this);
  }
});

StandardView = Backbone.View.extend({
  el: null,
  title: "",

  events: {
    "click input[name=start]": "start"
  },

  initialize: function(options) {
    options = options || {};
    this.title = options.title || $(this.el).attr('title');
    console.log("Init StandardView: " + this.title);

    var html = $(this.el).html();
    try {
      if ($(this.el).attr('class').indexOf('-template') != -1) {
        $(this.el).attr('class', $(this.el).attr('class').replace('-template',''));
      } 
    } catch(e) {}

    //add header
    this.header = $('<h1>'+this.title+' ' + 
      '<input name=destroy style="float:right" type=button value="X"/>' + 
      '<input style="float:right" value="--" type=button value="" onclick="$(this).parents(\'.window\').find(\'.content\').toggle(\'blind\')"/>' + 
      '</h1>');
    this.content = $('<div class=content></div>').html(html);
    $(this.el).addClass('window').empty().append(this.header).append(this.content);

    var that = this;
    $(this.el).find('[name=destroy]').click(function() {
      console.log('destroying: ' + that);
      $(that.el).effect('drop', {}, 1000, function() {
        that.remove();
      });
    });
    try { this.render(); } catch(e) {}
  },
  start: function() {},
  render: function() {}, 
  addRow: function() {}
});