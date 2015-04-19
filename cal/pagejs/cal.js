
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
		'click li': 'update',
		'click #prevDate': 'prevDate',
		'click #nextDate': 'nextDate'		
	},

	render: function(model) {
		$(this.el).addClass('active');
		$(this.el).find('.active').toggle('touchstart').removeClass('active').show();

		if (!model) return;
		var self = this;

		_(model.toJSON()).each(function(v, k) {
			// console.log("k=" + k + " v=" + v);
			if (v == '')return ;

			if ($(self.el).find('[data-id=' + k + '][data-value='+v+']').length > 0) {
				$(self.el).find('[data-id=' + k + '][data-value='+v+']').addClass('active');
			} else {
				$(self.el).find('[data-id=' + k + ']').addClass('active');
			}
		});
	},

	update: function() {
		//unselect OFF choices
		$(this.el).find('[data-value=OFF]').removeClass('active');

		var temp = _($('#form .active')).map(function(e) { return {name:$(e).attr('data-id'), value:$(e).attr('data-value')||1 }; })
		var data = _.object(_.map(temp, function(x){return [x.name, x.value]}));
		data.id = $('#date').html();
		this.collection.add(data, {merge:true});
	},

	prevDate: function() {
		var d = moment($(this.el).find('#date').text(), 'YYYY-MM-DD')
			.subtract(1, 'days')
			.format('YYYY-MM-DD');
		$(this.el).find('#date').html(d);
		this.render(this.collection.get(d));
	},

	nextDate: function() {
		var d = moment($(this.el).find('#date').text(), 'YYYY-MM-DD')
			.add(1, 'days')
			.format('YYYY-MM-DD');
		$(this.el).find('#date').html(d);
		this.render(this.collection.get(d));
	}
})

App.Calendar = Backbone.View.extend({

	events: {
		'click #nextMonth': 'nextMonth',
		'click #prevMonth': 'prevMonth',
		'click .box': 'chooseDate'
	},

	initialize: function(options) {
		this.today = moment().format('YYYY-MM-DD');
		this.moment = moment().date(1).minute(0).hour(0).second(0);
		this.collection.on('all', this.render, this);
	},

	chooseDate: function(e) {
		var d = $(e.currentTarget).find('.d').text();
		var dd = $(e.currentTarget).find('.dd').text();
		if (d.length == 0) return;
		$(this.el).find('#dateName').html(this.moment.clone().date(d).format('Do'));
		$(this.el).find('#dateDetails').html($(e.currentTarget).find('i'));
		$('#date').html(dd);
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
		var duty = model? model.get('d'): '';
		var isToday = this.today == fulldate;

		duty = duty || '';
		if (duty == 'X') duty = '';

		if (!model) 
			return $('<div class="box btn btn-outlined"></div>').append(
				'<span class="dd" style="display:none">' + fulldate + '</span>' + '<br>' +  
				'<span class="d">' + content + '</span>' + '<br>' 
			);

		return $('<div class="link box btn btn-outlined ' + 
				(model.get('d')?'work':'') + 
				' ' + (isToday?'today':'') + '"></div>').append(
			'<span class="l">' + duty + '</span>' +
			'<span class="dd" style="display:none">' + fulldate + '</span>' + '<br>' +  
			'<span class="d">' + content + '</span>' + '<br>' +  
			'<span class="activities">' + 
				(model.get('piano')? '<span class="type music"><i class="fa fa-music"></i></span>': '') +
				(model.get('ams')? '<span class="type ams"><i class="fa fa-ambulance"></i></span>': '') +
				'<br>' +
				(model.get('choir')? '<span class="type choir"><i class="fa fa-headphones"></i></span>': '') +
				(model.get('food')? '<span class="type food">'+model.get('food')+'</span>': '') +
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

		$(this.el).find('.box').hide().show('blind');
	}
})