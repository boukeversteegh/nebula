function PlayerView(player) {
	var self = this;
	this.player = player;
	this.player.events.bind('STARTED', function(file) { self.onStarted(file)} );
	
	this.init = function() {
		$('#player-stop').button({
			icons: {primary: "ui-icon-stop"}, text: false
		});
		$('#player-play').button({
			icons: {primary: "ui-icon-play"}, text: false
		});
		$('#player-pause').button({
			icons: {primary: "ui-icon-pause"}, text: false
		});
		$('#player-prev').button({
			icons: {primary: "ui-icon-seek-prev"}, text: false
		});
		$('#player-next').button({
			icons: {primary: "ui-icon-seek-next"}, text: false
		});
		$('#playlist-shuffle').empty().button({
			icons: {primary: "ui-icon-shuffle"}, text: false
		});

		$('#player-prevplaypausenext').buttonset();

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

	this.onStarted = function(file) {
		window.view.render('/www/tpl/play.html', {data:file}, '#player-metadata');
		this.refresh();
	}
	
	this.refresh = function() {
		$('.player-current').removeClass('player-current');
		if( this.player.current ) {
			$('[data-path="' + this.player.current.path + '"]').addClass('player-current');
			view.render('/www/tpl/play.html', {data:this.player.current}, '#player-metadata');
		}
	}
}
