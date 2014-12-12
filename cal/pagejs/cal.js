
var calView;

$(document).ready(function() {

	calView = new App.Calendar({ 
		el: $('#cal')
	});

	calView.render();
});

App.Calendar = Backbone.View.extend({

	events: {
		'click #nextMonth': 'nextMonth',
		'click #prevMonth': 'prevMonth',
		'click .box': 'chooseDate'
	},

	initialize: function(options) {
		this.moment = moment().date(1).minute(0).hour(0).second(0);
	},

	chooseDate: function(e) {
		var d = $(e.currentTarget).find('.d').text();
		if (d.length = 0) return;
		$(this.el).find('#dateName').html(this.moment.clone().date(d).format('Do'));
		$(this.el).find('#dateDetails').html($(e.currentTarget).find('i'));
	},

	nextMonth: function() {
		this.moment.add(1, 'M');
		this.render();
	},

	prevMonth: function() {
		this.moment.subtract(1, 'M');
		this.render();
	},

	createBox: function(content) {
		var rand = Math.random();
		var duty = rand < 0.3? 'd1': rand < 0.6? 'd2': rand < 0.8? 'd3': 'o';

		return $('<div class="link box btn btn-outlined ' + duty + '"></div>').append(
			'<span class="d">' + content + '</span>' + '<br>' +  
			'<span class="activities">' + 
				(Math.random() > 0.3? '<span class="type music"><i class="fa fa-music"></i></span>': '') +
				(Math.random() > 0.3? '<span class="type food"><i class="fa fa-birthday-cake"></i></span>': '') +
				(Math.random() > 0.3? '<span class="type ams"><i class="fa fa-ambulance"></i></span>': '') +
			'</span>'
		);
	},

	render: function() {
		var d = this.moment.clone();
		var self = this;
		$(this.el).find('#dates').html("");

		$(this.el).find('#monthName').html(d.format('MMM'));
		$(this.el).find('#yearName').html(d.format('YYYY'));

		//fill in the days before 1st in the first week
		_(_.range(d.weekday())).each(function() {
			$('#dates').append(self.createBox(''));
		});

		var month = d.month();
		while (true) {
			$('#dates').append(this.createBox(d.date()));
			d.add(1, 'd');

			if (month != d.month()) return;
		}
	}
})