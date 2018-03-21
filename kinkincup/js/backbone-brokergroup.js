BrokerGroup = Backbone.Model.extend({ idAttribute:'name' });
BrokerGroups = Backbone.Collection.extend({ model: BrokerGroup });
BrokerGroupsView = Backbone.View.extend({	
	collection: new BrokerGroups,
	events: {
		'click .plus': 'addButtonClicked',
		'click #brokerGroupsList>div': 'selectBrokerGroup'
	},

	selectBrokerGroup: function(e) {
		if (!this.options.state) return;
		this.options.state.set('group', this.collection.where({name: $(e.target).text()})[0]);
		$('#brokerGroupsList>div').removeClass('active');
		$(e.target).addClass('active');
	},

	addButtonClicked: function() {
		console.log('addButtonClicked()');
		var name = $.trim(prompt('Name?'));
		if (name === '') return;

		var brokerGroup = new BrokerGroup;
		brokerGroup.set('brokers', new Array);
		brokerGroup.set('color', Colors.random());
		brokerGroup.set('name', name);
		this.collection.add(brokerGroup);
	},

	initialize: function(options) { 
		console.log('BrokerGroupsView:initialize'); 
		this.collection.on('add', this.addBrokerGroup, this);
		this.options.state.on('change:save', this.saveToCache, this);
		this.options = options;
	},

	addBrokerGroup: function(model) {
		console.log('addBrokerGroup()');
		$('#brokerGroupsList').append($('<div></div>').append(model.get('name')));
	},

	loadFromCache: function(msg) {
		console.log('BrokerGroupsView:loadFromCache'); 
		try {
			console.log(msg);
			var groups = JSON.parse(msg);			
			console.log('BrokerGroupsView:loadFromCache: found ' + groups.length + ' objects'); 

			$(groups).each(function() {
				var bb = new Array;
				var that = this;
				$(this.brokers).each(function(i,e) {
					var broker = new Broker;
					broker.set({
						brokerName: e,
						brokerGroup: that.name
					})
					brokers.add(broker);
					bb.push(broker);
				});
				this.brokers = bb;		
			});
			this.collection.add(groups);
		} catch(e) {

		}
	},

	saveToCache: function() {
		console.log('BrokerGroupsView:saveToCache'); 

		var array = this.collection.toJSON();
		$(array).each(function() {
			var newArray = new Array;
			$(this.brokers).each(function() {
				newArray.push(this.get('brokerName'));
			})
			this.brokers = newArray;
		});

		var obj = new Object;
		obj.groups = array;
		obj.type = 'saveBrokerGroup';
		sendMsg(obj);
	}
});