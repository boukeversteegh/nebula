$(function() {
	init();
});

function init() {
	window.view = new View();
	window.uploader = new Uploader();
	
	$('.tabs a').click(function (e) {
		if( e.button == 0 ) {
			e.preventDefault();
			window.view.show($(this).attr('href'), true);
			return false;
		}
	});
	
	$(window).bind('popstate', function(event) {
		// if the event has our history data on it, load the page fragment with AJAX
		var state = event.originalEvent.state;
		if (event.originalEvent.state) {
		    window.view.show(event.originalEvent.state.path, false);
		}
	});
	
	window.view.show(window.location.pathname, true);
}

