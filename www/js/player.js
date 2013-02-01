function Player() {
	this.jplayer	= null;
	this.jplayerid	= null;
	this.current	= null;
	this.filesroot	= '/files';
	this.events		= new EventHandler();
	
	this.init = function(playerid, jplayerid) {
		this.playerid	= playerid;
		this.jplayerid	= jplayerid;
		
		this.loadJplayer();
		
		/*this.jp().jPlayer('option', 'ended',function() {
			alert('song ended');
		});*/
	}
	
	this.loadJplayer = function() {
		var self = this;
		$(this.jplayerid).jPlayer({
			swfPath:			'/www/jplayer',
			solution:			'html, flash',
			supplied:			'mp3',
			preload:			'auto',
			volume:				0.8,
			muted:				false,
			backgroundColor:	'#000000',
			cssSelectorAncestor:	'#player',
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
				duration: '#player-duration',
				//fullScreen: '.player-full-screen',
				//restoreScreen: '.player-restore-screen',
				//repeat: '.player-repeat',
				//repeatOff: '.player-repeat-off',
				//gui: '.player-gui',
				//noSolution: '.player-no-solution'
			},
			//ready: function() {},
			ended: function() {
				self.events.trigger('ENDED');
			},
			pause: function(e) {
				// Don't trigger Pause event when the song ended.
				// For player.js, pause means when the user requested pause.
				if( !e.jPlayer.status.ended ) {
					self.events.trigger('PAUSE');
				}
			},
			play: function() {
				self.events.trigger('PLAY');
			},
			errorAlerts: true,
			warningAlerts: false
		});
	}
	
	this.jp = function() {
		if( this.jplayer == null ) {
			this.jplayer = $(this.jplayerid);
		}
		return this.jplayer;
	}
	
	this.loadFile = function(file) {
		var url = this.filesroot + file.path;
		url = url.replace('#', '%23');
		this.jp().jPlayer("setMedia", {mp3: url});
		this.current = file;
	}
	
	this.playFile = function(file) {
		this.loadFile(file);
		this.jp().jPlayer('play');
		this.events.trigger('STARTED', [file]);
	}
	
	this.seek = function(position) {
		this.jp().jPlayer('playHead', position);
	}
	
	this.position = function() {
		return this.jp().data('jPlayer').status.currentTime;
	}
}
