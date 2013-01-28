function Player() {
	this.jplayer	= null;
	this.jplayerid	= null;
	this.current	= null;
	this.filesroot	= '/files';
	this.events		= new EventHandler();
	
	this.init = function(playerid, jplayerid) {
		this.playerid	= playerid;
		this.jplayerid	= jplayerid;
		
		this.showPlayer();
		this.loadJplayer();
		
		/*this.jp().jPlayer('option', 'ended',function() {
			alert('song ended');
		});*/
	}
	
	this.showPlayer = function() {
		$('#player-stop').button({
			icons: {primary: "ui-icon-stop"}
		});
		$('#player-play').button({
			icons: {primary: "ui-icon-play"}
		});
		$('#player-pause').button({
			icons: {primary: "ui-icon-pause"}
		});

		$('#player-open-folder').button({
			text: false,
			icons: {primary: "ui-icon-folder-collapsed"}
		});
		$('#player-open-file').button({
			text: false,
			icons: {primary: "ui-icon-arrowthickstop-1-s"}
		});
		$("#player-progress").progressbar({"value":0.1, "max":100}).hover(
			function() { $(this).find('.ui-progressbar-value').addClass('ui-state-hover'); },
			function() { $(this).find('.ui-progressbar-value').removeClass('ui-state-hover') }
		);
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
			ended: function(a,b) {
				self.events.trigger('ENDED');
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
	
	this.playFile = function(file) {
		var url = this.filesroot + file.path;
		this.jp().jPlayer("setMedia", {mp3: url}).jPlayer('play');
		this.current = file;
		this.events.trigger('STARTED', [file]);
	}
}
