_.templateSettings = {
	interpolate : /\{\{(.+?)\}\}/g
};

window.App = {};

App.Mixins = {}

App.Mixins.Formatter = {
  format: function(num, f) {
  	try {
	    f = f || "0000";
	    return $.formatNumber(num, {format:f});
	}catch(e) {}
	return num;
  },
}

App.Mixins.Utilities = {

	//log level: 0=DEBUG, 1=INFO, 2=ERROR
	logLevel: 1,

	logInfo: function(msg) { 
		try {
			if (this.logLevel > 1) return;
			console.log("Info: " + msg);
		}catch(e) {}
	},

	logDebug: function(msg) { 
		try {
			if (this.logLevel > 0) return;
			console.trace("Debug: " + msg);
		}catch(e) {}
	},

	logError: function(msg) { 
		try {
			if (this.logLevel > 2) return;
			console.error("Error: " + msg);
		}catch(e) {}
	}
}

//allow manually inject bean
App.Mixins.BeanInjection = {
	injectBeans: function(beans) {
		this.logDebug('BeanInjection.injectBeans()');
		this.beans = beans;
		this.trigger('injectBeanCompleted', this.beans);
	}
};

//add SQL fetch functionalities
App.Mixins.DirectSQLFetch = {
	//define SQL url
	baseURL: "../index.php/api/sqlquery",

	fetchSQL: function(sql) {
		this.logDebug('DirectSQLFetch::fetchSQL()');
		var self = this;
		$.ajax({
			url: this.baseURL,
			data: { sql: sql },
			type: 'POST'	
		}).success(function(data) {
			self.logDebug('SQL Result: ' + data);
			try {
				self.beans = JSON.parse(data);
				self.beans = self.afterSQLFetch(self.beans);
				self.trigger('SQLFetchCompleted', self.beans);
			}catch(e) {
				self.logError('Error parsing: ' + data + '|' + e);
				self.trigger('SQLFetchError', data);
			}
		});
	},	

	//default implementation, to be overloaded
	afterSQLFetch: function(beans) {
		return beans;
	},

	autoFetch: function(params) { 
		this.fetchSQL(_.template(this.sqlTemplate)(params || {})); 
	}
};

App.BaseView = Backbone.View.extend(
	  _.extend({}, 
  	App.Mixins.Utilities, {
}));

App.SelectView = Backbone.View.extend(
	  _.extend({}, 
  	App.Mixins.DirectSQLFetch, 
  	App.Mixins.BeanInjection, 
  	App.Mixins.Utilities, {

	initialize: function(options) {
		this.logDebug('App.SelectView.initialize()');
		this.on('SQLFetchCompleted', this.renderComboBox, this);
		this.on('injectBeanCompleted', this.renderComboBox, this);

		if (options.name) {
			this.name = options.name;
		} else {
			this.logError('SelectView name attribute missing');
		}
	},

	//to be overridden by custom select box mappings
	map: function(val) {
		return val;
	},

  	events: {
  		'change select': function() { this.trigger('changed'); }
  	},

	renderComboBox: function(beans) {
		this.logInfo('ComboView.renderComboBox()');

		this.logDebug(JSON.stringify(beans));
		var comboBox = $('<select name="'+this.name+'"></select>');

		var self = this;
		beans = 
			!_.isArray(beans)?
				_.chain(beans).map(function(e) { return _(e).values(); }).flatten().value():
				beans;
		_(beans).each(function(e, i) {
			self.logDebug(e);
			$(comboBox).append('<option value="'+e+'">'+self.map(e)+'</option>');
		});

		$(this.el).html("").append(comboBox);
		this.trigger('rendered');
	}

}));

App.TableModelRow = new Object({
	content: function(bean) { return bean.get(this.name) || '/'; }
});

App.TableRow = new Object({
	content: function(bean) { return bean[this.name] || '/'; }
});

App.ListView = Backbone.View.extend(
  _.extend({}, 
  	App.Mixins.DirectSQLFetch, 
  	App.Mixins.Utilities, {

  	//default no action init, to be used by overriders
  	init: function() {},

  	rowTemplate: "<li>{{content}}</li>",

	initialize: function(options) {
		this.on('SQLFetchCompleted', this.renderList, this);
		this.init();
	},

	renderList: function(beans) {
		this.logInfo('TableView.renderHeader()');
		if (!beans || beans.length == 0) return;

		var ul = $('<ul></ul>');

		//print limited rows
		var self = this;
		_(beans).each(function(bean, i) {
			$(ul).append("<li>"+_.template(self.rowTemplate)(bean)+"</li>");
		});

		$(this.el).append(ul);
		this.trigger('renderListFinished');
		this.trigger('rendered');
	}
}));

App.QuickTableView = Backbone.View.extend(
  _.extend({}, 
  	App.Mixins.DirectSQLFetch, 
  	App.Mixins.BeanInjection, 
  	App.Mixins.Utilities, {

  	MAX_COLUMNS: 15,
  	MAX_ROWS: 10000,

	initialize: function(options) {
		this.on('SQLFetchCompleted', this.renderHeader, this);
		this.on('SQLFetchCompleted', this.renderBody, this);
		this.on('injectBeanCompleted', this.renderHeader, this);
		this.on('injectBeanCompleted', this.renderBody, this);
	},

	renderHeader: function(beans) {
		this.logInfo('TableView.renderHeader()');
		if (!beans || beans.length == 0) return;

		//for handling SQLResult object
		if (beans.headers) {
			beans = beans.headers;
		} else {
			beans = _.keys(beans[0]);
		}

		var header = this.$('thead');
		if (!header || header.length == 0) {
			$(this.el).append("<thead></thead>");
			header = this.$('thead');
		}

		//clean previous results
		$(header).html("");

		var self = this;
		var tr = $('<tr></tr>');
		var keys = beans;
		_(keys).each(function(e, i) {
			self.logDebug(i + ": " + e);

			//print limited columns
			if (i < self.MAX_COLUMNS) {
				$(tr).append("<th>"+e+"</th>");
			}
		});

		$(header).append(tr);
	},

	renderBody: function(beans) {
		this.logInfo('TableView.renderBody()');

		//for handling SQLResult objects
		if (beans.rows) {
			beans = beans.rows;
		}

		if (!beans || beans.length == 0) return;
 
		var body = this.$('tbody');
		if (!body || body.length == 0) {
			$(this.el).append("<tbody></tbody>");
			body = this.$('tbody');
		}

		//clean previous results
		$(body).html("");

		var self = this;

		//print limited rows
		_(this.MAX_ROWS).times(function(count) {
			var tr = $('<tr></tr>');
			if (!beans[count]) return;

			var keys = _.values(beans[count]);
			_(keys).each(function(e, i) {
				self.logDebug(i + ": " + e);

				//print limited columns
				if (i < self.MAX_COLUMNS) {
					$(tr).append("<td>"+e+"</td>");
				}
			});
			$(body).append(tr);
		});		
		this.trigger('rendered');
	}
}));

App.TableView = Backbone.View.extend(
  _.extend({}, 
  	App.Mixins.DirectSQLFetch, 
  	App.Mixins.BeanInjection, 
  	App.Mixins.Utilities, {

  	fields: {},

  	//default no action init, to be used by overriders
  	init: function() {

  	},

	initialize: function(options) {
		this.on('SQLFetchCompleted', this.renderHeader, this);
		this.on('SQLFetchCompleted', this.renderBody, this);
		this.on('injectBeanCompleted', this.renderHeader, this);
		this.on('injectBeanCompleted', this.renderBody, this);

		if (options) {
			if (options.fields) this.fields = options.fields;
		}
		this.init();
	}, 

	render: function() {
		this.renderHeader(this.collection);
		this.renderBody(this.collection);
	},

	renderHeader: function(beans) {
		this.logInfo('TableView.renderHeader()');
		if (!beans || beans.length == 0) return;

		var header = this.$('thead');
		if (!header || header.length == 0) {
			$(this.el).append("<thead></thead>");
			header = this.$('thead');
		}

		//clean previous results
		$(header).html("");

		var self = this;
		var tr = $('<tr></tr>');

		_(this.fields).each(function(e, i) {
			$(tr).append("<th>"+e.header+"</th>");
		});

		$(header).append(tr);
		this.trigger('renderHeaderFinished');
	},

	//to be overridden if there're specific row rules
	renderRow: function(bean) {
		this.logDebug('TableView.renderRow()');
		return $('<tr></tr>');
	},

	renderBody: function(beans) {
		this.logInfo('TableView.renderBody()');

		if (!beans || beans.length == 0) return;

		var body = this.$('tbody');
		if (!body || body.length == 0) {
			$(this.el).append("<tbody></tbody>");
			body = this.$('tbody');
		}

		//clean previous results
		$(body).html("");

		var self = this;

		var printRow = function(bean,i) {
			var tr = self.renderRow(bean);
			_(self.fields).each(function(e, i) {
				$(tr).append("<td>"+e.content(bean)+"</td>");
			});
			$(body).append(tr);
		}
		
		if (beans instanceof Backbone.Collection) {
			beans.each(printRow);
		} else {
			_(beans).each(printRow);
		}
	
		this.trigger('renderBodyFinished');
		this.trigger('rendered');
	}
}));
