$(function() {
	init();
});

function init() {
	
	window.view = new View();
	window.uploader = new Uploader();
	
	window.player = new Player();
	window.playerview = new PlayerView(window.player);
	window.playerview.init();

	window.files = new Files(window.player);
	window.player.init('#player', '#jplayer');
	
	var userplaylist = new Playlist(window.player);
	var playlistview = new PlaylistView(userplaylist, '#playlist');
	playlistview.refresh();
	
	window.uploader.refresh();

	window.nebula = new Nebula();
	nebula.player = window.player;
	nebula.playlist = window.files.playlist;
	nebula.userplaylist = userplaylist;
	nebula.files = window.files;
	nebula.view = window.view;
	nebula.init();
	

	$('#main').css('margin-top', $('#top').height());
	$('#tabs').buttonset();
	$('#tabs input').each(function() {
		$(this).click( function() {
			var tabname = $(this).val();
			var tabdomid = '#tab_' + tabname;
			
			$('#tabs label').removeClass('ui-state-active');
			$('[role=tab]').hide();
			$(tabdomid).show();
			
			$('#tabs [for=tab-btn-' + tabname + ']').addClass('ui-state-active');
			return false;
		});
	});
	
	//$('[for=tab-btn-files]').addClass('ui-state-active');
	$('#tab-btn-files').trigger('click');
	$('#tabs input').filter(':eq(2), :eq(3)').button('option', 'disabled', true);//.addClass('ui-state-disabled');
	
	window.view.show(window.location.pathname, true);
	
	$(window).bind('popstate', function(event) {
		// if the event has our history data on it, load the page fragment with AJAX
		var state = event.originalEvent.state;
		if (event.originalEvent.state) {
		    window.view.show(event.originalEvent.state.path, false);
		}
	});
	
	
}

