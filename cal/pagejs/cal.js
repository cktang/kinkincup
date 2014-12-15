
var calView, detailsView, items;

$(document).ready(function() {
	items = new App.Items;

	var init = function() {
		calView = new App.Calendar({ 
			el: $('#cal'),
			collection: items
		});

		detailsView = new App.CalendarDetails({
			el: $('#form'),
			collection: items
		})

		calView.render();
		calView.on('dateClicked', detailsView.render, detailsView);
	}

	items.on('sync', init);
});

App.CalendarDetails = Backbone.View.extend({
	events: {
		'click li': 'update'
	},

	render: function(model) {
		$(this.el).find('.active').removeClass('active');

		if (!model) return;
		var self = this;

		_(model.toJSON()).each(function(v, k) {
			console.log(v + "|" + k);
			console.log($(self.el).find('[data-id=' + k + '][data-value='+v+']').length);
			$(self.el).find('[data-id=' + k + '][data-value='+v+']').addClass('active');

			if (v == 1) {
				$(self.el).find('[data-id=' + k + ']').addClass('active');
			}
		});
	},

	update: function() {
		var temp = _($('#form .active')).map(function(e) { return {name:$(e).attr('data-id'), value:$(e).attr('data-value')||1 }; })
		var data = _.object(_.map(temp, function(x){return [x.name, x.value]}));
		data.id = $('#date').html();

		data.d = data.d || 'o';
		data.l = data.l || 'o';

		this.collection.add(data, {merge:true});
	}
})

App.Calendar = Backbone.View.extend({

	events: {
		'click #nextMonth': 'nextMonth',
		'click #prevMonth': 'prevMonth',
		'click .box': 'chooseDate'
	},

	initialize: function(options) {
		this.moment = moment().date(1).minute(0).hour(0).second(0);
		this.collection.on('all', this.render, this);
	},

	chooseDate: function(e) {
		var d = $(e.currentTarget).find('.d').text();
		var dd = $(e.currentTarget).find('.dd').text();
		if (d.length = 0) return;
		$(this.el).find('#dateName').html(this.moment.clone().date(d).format('Do'));
		$(this.el).find('#dateDetails').html($(e.currentTarget).find('i'));
		$('#date').html(dd);
		$('#form').addClass('active');
		this.trigger('dateClicked', this.collection.get(dd));
	},

	nextMonth: function() {
		this.moment.add(1, 'M');
		this.render();
	},

	prevMonth: function() {
		this.moment.subtract(1, 'M');
		this.render();
	},

	createBox: function(content, fulldate) {
		var model = this.collection.get(fulldate);

		if (!model) 
			return $('<div class="link box btn btn-outlined"></div>').append(
				'<span class="dd" style="display:none">' + fulldate + '</span>' + '<br>' +  
				'<span class="d">' + content + '</span>' + '<br>' 
			);

		return $('<div class="link box btn btn-outlined d' + model.get('d') + '"></div>').append(
			'<span class="l">' + model.get('l') + '</span>' +
			'<span class="dd" style="display:none">' + fulldate + '</span>' + '<br>' +  
			'<span class="d">' + content + '</span>' + '<br>' +  
			'<span class="activities">' + 
				(model.get('piano')? '<span class="type music"><i class="fa fa-music"></i></span>': '') +
				(model.get('choir')? '<span class="type food"><i class="fa fa-birthday-cake"></i></span>': '') +
				(model.get('ams')? '<span class="type ams"><i class="fa fa-ambulance"></i></span>': '') +
				(model.get('food')? '<span class="type ams"><i class="fa fa-plus"></i></span>': '') +
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
			$('#dates').append(this.createBox(d.date(), d.format('YYYY-MM-DD')));
			d.add(1, 'd');
			if (month != d.month()) break;
		}

		$(this.el).find('.link').on('click', function() {
			$('#formButton').click();
		});
	}
})