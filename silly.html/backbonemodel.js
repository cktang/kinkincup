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

App.Mixins.HandlebarModelRenderer = {
	render: function() {
		if (!this.el || !this.collection) return;
		var self = this;

		//clear screen
		$(this.el).find('*').not('script.template').empty().remove();

		this.collection.each(function(model, i) {
			self.renderModel(self.el, model)
		});

		this.trigger('rendered');
	},

	renderModel: function(container, model) {
		var el = this.realRenderModel(container, model);
		this.registerListeners(el);	
		this.handleEmpty();
	},
	
	realRenderModel: function(container, model) {
		if ($(container).find('script.template').length == 0) return;
		this.template = this.template || Handlebars.compile($(container).find('script.template').html());
		return this.template && $(this.template(model.toJSON())).appendTo($(container)).hide().show('fade');
	},

	removeModel: function(container, model) {
		$(container).find('[data-id=' + model.id + ']').hide("fade");
		this.handleEmpty();
	},

	handleEmpty: function() {
		$(this.el).find('#noactivity').remove();
		if (this.collection.length == 0) {
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
		// console.log("handleChange: " + action);
		if (_(['sync']).contains(action)) {
			this.synced = true;
			this.render();
		}
		if (this.synced && _(['add']).contains(action)) this.renderModel(this.el, model);
		if (this.synced && _(['remove']).contains(action)) this.removeModel(this.el, model);
	},

	registerListeners: function(element) {
		if (!this.options.listeners) return;
		var self = this;
		_(this.options.listeners).each(function(listener) {
			listener.apply && listener.apply(element, self.collection);
		})
	}
}));

App.ModelView = Backbone.View.extend(
	_.extend( App.Mixins.HandlebarModelRenderer, {

	initialize: function(options) {
		this.model.on('all', this.handlChange, this);
	},

	handlChange: function(action) {
		// console.log("handleChange: " + action);
		if (_(['add', 'change']).contains(action)) this.render();
	}
}));

//Listeners
App.Listener = Backbone.View.extend({
	apply: function(element) {
		//to be overriden
	}
});

App.RemoveListener = App.Listener.extend({
	apply: function(el, collection) {
		$(el).find('.removeButton').on('click', function(e) {
			e.stopPropagation();
			if (!confirm('delete??')) return;
			var model = collection.where({ id: $(el).attr('data-id') })[0];
			model && collection.remove(model);
		});
	}
});
App.LinkListener = App.Listener.extend({
	apply: function(el, collection) {
		$(el).on('click', function(e) {
			e.stopPropagation();
			App.save($(el).attr('data-id-type') + '-id', $(el).attr('data-id'));
			if ($(el).attr('data-target')) location.href=$(el).attr('data-target');
		});
	}
});

App.ContactSelectListener = App.Listener.extend({
	apply: function(el, collection) {
		$(el).find('.contactSelectButton').on('click', function(e) {
			e.stopPropagation();
			var id = $(e.target).parents('[data-id]').attr('data-id');

			$('#activityContact').modal();

			var contacts = new App.CollectionView({ 
				collection: new App.PeopleCollection, 
				el: $('#contactSelect'),
				listeners: [ new App.YesOrNoListItemListener() ]  
			});

			contacts.on('rendered', function() {
				var peopleList = collection.get(id).get('people');
				_(peopleList).each(function(p, i) {
					$(contacts.el).find('[data-id='+p.id+']')
						.addClass('list-group-item-success')
				})
			})
		});
	}
});


App.YesOrNoListItemListener = App.Listener.extend({
	apply: function(el, collection) {
		$(el).find('.btn-success').on('click', function(e) {
			e.stopPropagation();
			$(e.target).parents('.list-group-item')
				.removeClass('list-group-item-danger')
				.addClass('list-group-item-success')
		});
		$(el).find('.btn-danger').on('click', function(e) {
			e.stopPropagation();
			$(e.target).parents('.list-group-item')
				.removeClass('list-group-item-success')
				.addClass('list-group-item-danger')
		});
	}
});
//Listeners end

