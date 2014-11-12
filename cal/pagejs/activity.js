
var people, activity, activityView, editContact;
$(document).ready(function() {
	people = new App.CollectionView({ 
		collection: new App.PeopleInActivityCollection() , 
		el: $('#peopleList'),
		listeners: [ 
			//new App.ExpandListener(), 
			new App.NewAttendenceButtonListener(), 
			new App.MoneyButtonListener(), 
			new App.GiftButtonListener(),
			new App.ReportButtonListener()
		]  
	});

	activity = new App.Activity();

	activityView = new App.ModelView({
		model: activity,
		el: $('#stats'),
		listeners: []
		// listeners: [ new App.EditButtonListener() ]
	});

	$('#editPersonSaveButton').click(function(e) {
		editContact.save();
	});
});

App.GiftButtonListener = App.Listener.extend({
	apply: function(el, collection, model) {
		$(el).find('.giftButton').on('click', function(e) {
			model.set('gift', !$(e.delegateTarget).hasClass('active'));
	    	e.preventDefault();
	    	e.stopPropagation();
		})
	}
});

App.MoneyButtonListener = App.Listener.extend({
	apply: function(el, collection, model) {
		$(el).find('.moneyButton').on('click', function(e) {
			model.set('money', !$(e.delegateTarget).hasClass('active'));
	    	e.preventDefault();
	    	e.stopPropagation();
		});
	}
});

App.NewAttendenceButtonListener = App.Listener.extend({
	apply: function(el, collection, model) {
		$(el).find('.attendenceButton').on('click', function(e) {
			if ($(e.delegateTarget).find('span').hasClass('glyphicon-minus'))
				model.set('status', 'going');
			else if ($(e.delegateTarget).find('span').hasClass('glyphicon-ok'))
				model.set('status', 'notgoing');
			else if ($(e.delegateTarget).find('span').hasClass('glyphicon-remove'))
				model.set('status', 'unknown');
	    	e.preventDefault();
	    	e.stopPropagation();
		})
	}
});
