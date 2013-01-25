$(function() {
	init();
});

function init() {
	window.view = new View();
	window.uploader = new Uploader();
	window.fileview = new FileView();
	window.player = new Player();
	window.player.init('#jplayer');
	
	window.view.show(window.location.pathname, true);
	
	$(window).bind('popstate', function(event) {
		// if the event has our history data on it, load the page fragment with AJAX
		var state = event.originalEvent.state;
		if (event.originalEvent.state) {
		    window.view.show(event.originalEvent.state.path, false);
		}
	});
	
	
}

