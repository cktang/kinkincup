$(document).ready(function() {
	$('a[href]').click(function(e) {
		console.log(e);
		linkEvent(e);
		return false;
	});
});
