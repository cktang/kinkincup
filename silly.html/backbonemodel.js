App = { 
	Mixins: {},
	savePrefix: 'silly-',
	local: localStorage,
	access: function(name) {
		return App.local[App.savePrefix + name] || '';
	},
	save: function(name, value) {
		App.local[App.savePrefix + name] = value;
	}
};

//Utility
App.FormHandler = Backbone.View.extend({
	serialize: function() {
		return this.el && _($(this.el).serializeArray()).chain().map(function(e) { return _(e).values(); }).object().value()
	}
});
//Utility End

// Handlebar mixin start
Handlebars.registerHelper('filter', function(list, options) {
  return new Handlebars.SafeString(_(list).where(options.hash).length);
});

Handlebars.registerHelper('printStatus', function(object) {
  return new Handlebars.SafeString(object.status == "going"? "success": object.status == "notgoing"? "danger" : "default" );
});

App.Mixins.HandlebarModelRenderer = {
	render: function() {
		if (!this.el || (!this.collection && !this.model)) return;
		var self = this;

		//clear screen
		$(this.el).find('*').not('script.template').empty().remove();

		this.collection && this.collection.each(function(model, i) {
			self.renderModel(self.el, model)
		});

		this.model && this.renderModel(this.el, this.model);

		this.trigger('rendered');
	},

	renderModel: function(container, model) {
		var existingEl = $(container).find('[data-id=' + model.id + ']')[0];
		var el = this.realRenderModel(container, model, existingEl);
		$(el).find('.hide').removeClass('hide').hide();
		this.registerListeners(el);	
		this.handleEmpty();
	},
	
	realRenderModel: function(container, model, el) {
		if ($(container).find('script.template').length == 0) return;
		this.template = this.template || Handlebars.compile($(container).find('script.template').html());

		if (el && this.template) {
			var newEl = $(this.template(model.toJSON())).insertAfter($(el)).hide().show('fade');
			$(el).remove();
			return newEl;
		} else {
			return this.template && $(this.template(model.toJSON())).appendTo($(container)).hide().show('fade');
		}
	},

	removeModel: function(container, model) {
		$(container).find('[data-id=' + model.id + ']').hide("fade");
		this.handleEmpty();
	},

	handleEmpty: function() {
		$(this.el).find('#noactivity').remove();
		if (this.collection && this.collection.length == 0) {
			$(this.el).append("<div id=noactivity class=well>No Record</div>")
		}
	}
};
// Handlebar mixin end

App.CollectionView = Backbone.View.extend(
	_.extend( App.Mixins.HandlebarModelRenderer, {

	initialize: function(options) {
		this.options = options || {};
		this.collection.on('all', this.handlChange, this);
	},

	handlChange: function(action, model) {		
		console.log("collection change: " + action);
		if (_(['sync']).contains(action)) {
			this.synced = true;
			this.render();
		}
		if (!this.synced) return;
		if (_(['add', 'change']).contains(action)) this.render();
		if (_(['remove']).contains(action)) this.removeModel(this.el, model);
	},

	registerListeners: function(element) {
		if (!this.options.listeners) return;
		var self = this;
		_(this.options.listeners).each(function(listener) {
			listener.apply && listener.apply(element, self.collection, 
				self.model || (self.collection && self.collection.where({ id: $(element).attr('data-id') })[0]),
				self
			);
		})
	}
}));

App.ModelView = Backbone.View.extend(
	_.extend( App.Mixins.HandlebarModelRenderer, {

	initialize: function(options) {
		this.options = options || {};
		this.model.on('all', this.handlChange, this);
	},

	handlChange: function(action) {
		console.log("model change: " + action);
		if (_(['sync']).contains(action)) this.render();
	}
}));

