
var ideasView, ratings, users, user, userView;

$(document).ready(function() {
	ratings = new App.Ratings;
	users = new App.Users;
	user = new App.User;

	users.on('sync', function() {
		ideasView = new App.CollectionView({
			collection: new App.Ideas,
			el: $('#ideas'),
			listeners: [ new App.RatingsListener() ]  
		});
	});

	userView = new App.ModelView({
		model: user,
		el: $('#user')
	});

	$('#addButton').on('click', function() { $('#add').modal(); });

	$('form').on('submit', function(e) {
		e.stopPropagation();
		e.preventDefault();

		var obj = _.fromQuery($(e.target).serialize());
		obj.id = App.uuid();
		obj.ownerId = user.get('id');
		ideasView.collection.add(obj);
	});	
});

App.RatingsListener = Backbone.View.extend({
	apply: function(el, collection, model, view) {
		view.rating = $(el).find('.rating').rating();
		view.rating.rating('update', model.get('rating'));
	}
});