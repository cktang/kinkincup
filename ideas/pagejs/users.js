
var usersView;

$(document).ready(function() {
	usersView = new App.CollectionView({
		collection: new App.Users,
		el: $('#users'),
		listeners: [ new App.LinkListener() ]  
	});
});