$(function() {
	init();
});

function init() {
	window.view = new View();
	window.uploader = new Uploader();
	window.files = new Files();
	window.player = new Player();
	window.player.init('#jplayer');
	window.playlist = new Playlist(window.player);
	window.playlistview = new PlaylistView(window.playlist);
	
	window.view.show(window.location.pathname, true);
	
	$(window).bind('popstate', function(event) {
		// if the event has our history data on it, load the page fragment with AJAX
		var state = event.originalEvent.state;
		if (event.originalEvent.state) {
		    window.view.show(event.originalEvent.state.path, false);
		}
	});
	
	
}

