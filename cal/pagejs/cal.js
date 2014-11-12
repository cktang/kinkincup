
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
		return $('<div class="box btn btn-outlined"></div>').append(
			'<span class="d">' + content + '</span>' + '<br>' + 
			'<span class="duty">' + 
				'C1' +
			'</span>' +
			'<span class="activities">' + 
				(Math.random() > 0.3? '<i class="fa fa-music fa-lg"></i>': '') +
				(Math.random() > 0.3? '<i class="icon-food-1"></i>': '') +
				(Math.random() > 0.3? '<i class="fa fa-plus-square fa-lg"></i>': '') +
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