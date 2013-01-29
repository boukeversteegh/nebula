$(function() {
	init();
});

function init() {
	window.view = new View();
	window.uploader = new Uploader();
	
	window.player = new Player();
	window.playerview = new PlayerView(window.player);
	
	window.files = new Files(window.player);
	window.player.init('#player', '#jplayer');
	window.playlist = new Playlist(window.player);
	window.playlistview = new PlaylistView(window.playlist, '#playlist');
	window.playlistview.refresh();
	
	window.uploader.refresh();
	window.nebula = new Nebula();

	nebula.player = window.player;
	nebula.playlist = window.playlist;
	nebula.files = window.files;
	nebula.init();
	

	$('#main').css('margin-top', $('#top').height());
	$('#tabs').buttonset();
	$('#tabs a').each(function() {
		$(this).click( function() {
			var tabid = $(this).attr('href');
			$('[role=tab]').hide();
			$(tabid).show();
			return false;
		});
	});
	
	window.view.show(window.location.pathname, true);
	
	$(window).bind('popstate', function(event) {
		// if the event has our history data on it, load the page fragment with AJAX
		var state = event.originalEvent.state;
		if (event.originalEvent.state) {
		    window.view.show(event.originalEvent.state.path, false);
		}
	});
	
	
}

