_.templateSettings = {
	interpolate : /\{\{(.+?)\}\}/
};

window.App = {
	urlBase: 'http://projects.palapple.com/popularqb/index.php/go/index/'
};

App.Mixins = { }

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
	},

	format: function(num, f) {
  		//test if num is a number
  		try { 
  			if (isNaN(parseFloat(num))) return num; 
  		} catch(e) { return num; }

  		//maturity
  		if (num.indexOf(" ") > 0) return num;
  		if (num.indexOf("-") > 0) return num;

		f = f || "0000";
		if (num === "HSI") return num;
		return $.formatNumber(num, {format:f});
	}
};

//allow manually inject bean
App.Mixins.BeanInjection = {
	injectBeans: function(beans) {
		this.logDebug('BeanInjection.injectBeans()');
		this.beans = beans;
		this.trigger('injectBeanCompleted', this.beans);
	}
};

App.Mixins.ServerFetch = {
	fetchBaseURL: "http://projects.palapple.com/popularqb/index.php/api/",
	fetchURLTemplate: "http://projects.palapple.com/popularqb/index.php/api/sqlquery",
	fetch: function(url) {
		this.logDebug('ServerFetch::fetch()');
		var self = this;
		$.ajax({
			url: url || self.baseURL,
			type: 'POST'	
		}).success(function(data) {
			self.logDebug('fetch Result: ' + data);
			try {
				self.beans = JSON.parse(data);
				self.beans = self.afterFetch(self.beans);
				self.trigger('FetchCompleted', self.beans);
			}catch(e) {
				self.logError('Error parsing: ' + data + '|' + e);
				self.trigger('FetchError', data);
			}
		});
	},

	//default implementation, to be overloaded
	afterFetch: function(beans) {
		return beans;
	},

	autoFetch: function(params) { 
		this.fetch(_.template(this.fetchBaseURL + this.fetchURLTemplate)(params || {})); 
		return this;
	}
};

//add SQL fetch functionalities
App.Mixins.DirectSQLFetch = {
	//define SQL url
	baseURL: "http://projects.palapple.com/popularqb/index.php/api/sqlquery",

	fetch: function(sql) {
		this.logDebug('DirectSQLFetch::fetch()');
		var self = this;
		$.ajax({
			url: this.baseURL,
			data: { sql: sql },
			type: 'POST'	
		}).success(function(data) {
			self.logDebug('SQL Result: ' + data);
			try {
				self.beans = JSON.parse(data);
				self.beans = self.afterFetch(self.beans);
				self.trigger('FetchCompleted', self.beans);
			}catch(e) {
				self.logError('Error parsing: ' + data + '|' + e);
				self.trigger('FetchError', data);
			}
		});
	},	

	//default implementation, to be overloaded
	afterFetch: function(beans) {
		return beans;
	},

	autoFetch: function(params) { 
		this.fetch(_.template(this.sqlTemplate)(params || {})); 
		return this;
	}
};

//add SQL fetch functionalities
App.Mixins.WebSocketFetch = {
	fetch: function(sql) {
		this.logDebug('WebSocketFetch::fetch()');
		var self = this;
		
		sendMsg({
		  type:'warrantsDBSQL', 
		  data:[{name:'sql', value:sql}, {name:'cid', value:this.cid}]
		});

		if (this.options.main) {
			main.on('wsMessage', function(msg) {
				if (!msg.data) return;

				for(var i=0; i<msg.data.length; i++) {
					if (msg.data[i].name && msg.data[i].name==='cid' && msg.data[i].value!=self.cid) return;
				};

				var beans = msg.reply;
				self.logDebug('SQL Result: ' + beans);
				try {
					self.beans = beans;
					self.beans = self.afterFetch(self.beans);
					self.trigger('FetchCompleted', self.beans);
				}catch(e) {
					self.logError('Error parsing: ' + data + '|' + e);
					self.trigger('FetchError', data);
				}
			});
		}
	},	

	//default implementation, to be overloaded
	afterFetch: function(beans) {
		return beans;
	},

	autoFetch: function(params) { 
		this.fetch(_.template(this.sqlTemplate || this.options.sqlTemplate)(params || {})); 
		return this;
	}
};

App.BaseView = Backbone.View.extend(
	  _.extend({}, 
  	App.Mixins.BeanInjection,
  	App.Mixins.Utilities, {
}));

App.SelectView = Backbone.View.extend(
	  _.extend({}, 
  	App.Mixins.WebSocketFetch,  
  	App.Mixins.BeanInjection, 
  	App.Mixins.Utilities, {

	initialize: function(options) {
		this.logDebug('App.SelectView.initialize()');
		this.on('FetchCompleted', this.renderComboBox, this);
		this.on('injectBeanCompleted', this.renderComboBox, this);

		if (options.name) {
			this.name = options.name;
		} else {
			this.logError('SelectView name attribute missing');
		}

		//bean inject during init
		if (options.beans) {
			this.beans = options.beans;
			this.renderComboBox(this.beans);
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
		var comboBox = $('<select' + 
			(this.options.multiple?' multiple':'') + 
			(this.options.placeholder?' data-placeholder="'+this.options.placeholder+'"': '') + 
			' name="'+this.name+'"></select>');

		var self = this;
		//beans = _.chain(beans).map(function(e) { return _.isObject(e)? _(e).values()[0]: e; }).flatten().value();
		
		if (this.options.hasEmpty) $(comboBox).append('<option value=""></option>');

		_(beans.rows).each(function(e, i) {
			self.logDebug(e);
			$(comboBox).append('<option value="'+e[1]+'">'+self.map(e[0])+'</option>');
		});

		$(this.el).html("").append(comboBox);
		try {
			$(this.el).find('select').chosen();
		}catch(e) {}
		this.trigger('rendered');
	}

}));

App.TableRow = new Object({
	content: function(bean) { return bean[this.name] || '/'; }
});

App.DefaultRowRenderer = Backbone.View.extend({
  	rowTemplate: "<li>{{content}}</li>",
	render: function(bean) {
		return "<li>"+_.template(this.rowTemplate)(bean)+"</li>";
	}
});

App.ListView = Backbone.View.extend(
  _.extend({}, 
  	App.Mixins.DirectSQLFetch, 
  	App.Mixins.Utilities, {

  	//default no action init, to be used by overriders
  	init: function() {},

	initialize: function(options) {
		this.on('FetchCompleted', this.renderList, this);
		this.init();
		$(this.el).hide();
	},

	renderList: function(beans) {
		this.logInfo('ListView.renderList()');
		if (!beans || beans.length == 0) return;

		var ul = $('<ul></ul>');

		//print limited rows
		var self = this;
		_(beans).each(function(bean, i) {
			var renderer = bean.renderer || new App.DefaultRowRenderer({el :$('<li></li>')});
			var element = renderer.render(bean);
			$(ul).append(element);
			renderer.el = $(ul).find('>li').last();
			renderer.registerListener();
			renderer.detectStatus();
		});

		$(this.el).append(ul);
		$(this.el).show('fade'); 
		this.trigger('renderListFinished');
		this.trigger('rendered');
	}
}));

App.QuickTableArrayView = Backbone.View.extend(
  _.extend({}, 
  	App.Mixins.WebSocketFetch, 
  	App.Mixins.BeanInjection, 
  	App.Mixins.Utilities, {

  	MAX_COLUMNS: 20,
  	MAX_ROWS: 10000,

	initialize: function(options) {
		this.on('FetchCompleted', this.renderHeader, this);
		this.on('FetchCompleted', this.renderBody, this);
		this.on('injectBeanCompleted', this.renderHeader, this);
		this.on('injectBeanCompleted', this.renderBody, this);
	},

	renderHeader: function(sqlResult) {
		this.logInfo('TableView.renderHeader()');
		//if (!beans || beans.length == 0) return;

		var header = this.$('thead');
		if (!header || header.length == 0) {
			$(this.el).append("<thead></thead>");
			header = this.$('thead');
		}

		//clean previous results
		$(header).html("");

		var self = this;
		var tr = $('<tr></tr>');
		var keys = sqlResult.headers;
		_(keys).each(function(e, i) {
			self.logDebug(i + ": " + e);

			//print limited columns
			if (i < self.MAX_COLUMNS) {
				$(tr).append("<th>"+e+"</th>");
			}
		});

		$(header).append(tr);
	},

	renderBody: function(sqlResult) {
		this.logInfo('TableView.renderBody()');

		var body = this.$('tbody');
		if (!body || body.length == 0) {
			$(this.el).append("<tbody></tbody>");
			body = this.$('tbody');
		}

		//clean previous results
		$(body).html("");

		var self = this;

		if (!sqlResult.rows || sqlResult.rows.length == 0) return;

		//print limited rows
		_(this.MAX_ROWS).times(function(count) {
			var tr = $('<tr></tr>');
			var keys = _.values(sqlResult.rows[count]);
			_(keys).each(function(e, i) {
				self.logDebug(i + ": " + e);

				//print limited columns
				if (i < self.MAX_COLUMNS) {
					$(tr).append("<td>"+self.format(e, 
						_.contains(['Underlying', 'Code'], sqlResult.headers[i])?
							"0000":"#,##0.##")+"</td>");
				}
			});
			$(body).append(tr);
		});		
		this.trigger('rendered');
	}
}));


App.QuickTableView = Backbone.View.extend(
  _.extend({}, 
  	App.Mixins.DirectSQLFetch, 
  	App.Mixins.BeanInjection, 
  	App.Mixins.Utilities, {

  	MAX_COLUMNS: 10,
  	MAX_ROWS: 30,

	initialize: function(options) {
		this.on('FetchCompleted', this.renderHeader, this);
		this.on('FetchCompleted', this.renderBody, this);
		this.on('injectBeanCompleted', this.renderHeader, this);
		this.on('injectBeanCompleted', this.renderBody, this);
	},

	renderHeader: function(beans) {
		this.logInfo('TableView.renderHeader()');
		//if (!beans || beans.length == 0) return;

		var header = this.$('thead');
		if (!header || header.length == 0) {
			$(this.el).append("<thead></thead>");
			header = this.$('thead');
		}

		//clean previous results
		$(header).html("");

		var self = this;
		var tr = $('<tr></tr>');
		var keys = _.keys(beans[0]);
		_(keys).each(function(e, i) {
			self.logDebug(i + ": " + e);

			//print limited columns
			if (i < self.MAX_COLUMNS) {
				$(tr).append("<td>"+e+"</td>");
			}
		});

		$(header).append(tr);
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

		//print limited rows
		_(this.MAX_ROWS).times(function(count) {
			var tr = $('<tr></tr>');
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
		this.on('FetchCompleted', this.renderHeader, this);
		this.on('FetchCompleted', this.renderBody, this);
		this.on('injectBeanCompleted', this.renderHeader, this);
		this.on('injectBeanCompleted', this.renderBody, this);

		if (options) {
			if (options.fields) this.fields = options.fields;
		}
		this.init();
		this.renderHeader();
		$(this.el).hide();
	}, 

	renderHeader: function(beans) {
		this.logInfo('TableView.renderHeader()');
		// if (!beans || beans.length == 0) return;

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

		var body = this.$('tbody');
		if (!body || body.length == 0) {
			$(this.el).append("<tbody></tbody>");
			body = this.$('tbody');
		}

		//clean previous results
		$(body).html("");

		if (!beans || beans.length == 0) {
			//do nothing
		} else {
			var self = this;

			//print limited rows
			_(beans).each(function(bean, i) {
				var tr = self.renderRow(bean);
				_(self.fields).each(function(e, i) {
					$(tr).append("<td>"+e.content(bean)+"</td>");
				});
				$(body).append(tr);
			});			
		}

		$(this.el).show('fade');

		this.trigger('renderBodyFinished');
		this.trigger('rendered'); 
	}
}));



App.TimerView = Backbone.View.extend(
  _.extend({}, 
  	App.Mixins.Utilities, {

  		model: new Backbone.Model,

  		events: {
  			'click .start': 'start',
  			'click .stop': 'stop',
  			'click .reset': 'reset'
  		},

  		initialize: function(options) {
  			this.model.set('time', 0);
  			if (options.seconds) {
  				this.model.set('time', options.seconds);
  			}
  			if (options.minutes) {
  				this.model.set('time', this.model.get('time') + options.minutes * 60);
  			}

  			//backup time
  			this.model.set('originalTime', this.model.get('time'));

  			//render display per second change
  			this.model.on('change:time', this.render, this);
  		},

  		render: function() {
  			this.logDebug('TimerView:render()');
  			$(this.el).find('.text').html(this.model.get('time'));
  		},

  		start: function() {
  			this.logInfo('TimerView:start()');
  			var self = this;
  			this.timer = setInterval(function() {
  				self.model.set('time', self.model.get('time') - 1);

  				if (self.model.get('time') === 0) {
  					self.stop();
  					self.trigger('timerUp');
  				}
  			}, 1000);
  		},

  		stop: function() {
  			this.logInfo('TimerView:stop()');
  			if (this.timer) {
  				clearInterval(this.timer);
  			}
  		},

  		reset: function() {
  			this.logInfo('TimerView:reset()');
  			this.model.set('time', this.model.get('originalTime'));
  		}
  	}
));

App.ModalView = Backbone.View.extend({
	show: function() {
		$(this.el).modal('show');
	},

	hide: function() {
		$(this.el).modal('hide');
	},

	updateHeader: function(html) {
		$(this.el).find('.header').html(html);
	},

	updateBody: function(html) {
		$(this.el).find('.body').html(html);
	},

	updateBody: function(html) {
		$(this.el).find('.footer').html(html);
	}
});
