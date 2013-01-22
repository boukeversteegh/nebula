$(function() {
	init();
});

function init() {
	window.view = new View();
	window.uploader = new Uploader();
	window.player = new Player();
	window.player.init('#jplayer');
	window.lyrics = new Lyrics();
	
	$('#jplayer').jPlayer({
		swfPath: '/www/jplayer',
		solution: 'html, flash',
		supplied: 'mp3',
		preload: 'auto',
		volume: 1,
		muted: false,
		backgroundColor: '#000000',
		cssSelectorAncestor: '#player',
		cssSelector: {
			//videoPlay: '.player-video-play',
			play: '#player-play',
			pause: '#player-pause',
			stop: '#player-stop',
			seekBar: '#player-progress',
			playBar: '.ui-progressbar-value',
			//mute: '.player-mute',
			//unmute: '.player-unmute',
			//volumeBar: '.player-volume-bar',
			//volumeBarValue: '.player-volume-bar-value',
			//volumeMax: '.player-volume-max',
			currentTime: '#player-current-time',
			//duration: '.player-duration',
			//fullScreen: '.player-full-screen',
			//restoreScreen: '.player-restore-screen',
			//repeat: '.player-repeat',
			//repeatOff: '.player-repeat-off',
			//gui: '.player-gui',
			//noSolution: '.player-no-solution'
		},
		ready: function() {},
		timeupdate: function(e) {
			if( !e.jPlayer.status.paused ) {
				var position = e.jPlayer.status.currentTime;
				window.lyrics.updatePosition(position);
			}
		},
		errorAlerts: true,
		warningAlerts: false
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

