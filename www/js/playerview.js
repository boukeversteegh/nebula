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
		$('#playlist-repeat').empty().button({
			icons: {primary: "ui-icon-arrowrefresh-1-e"}, text: false
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

		if( window.webkitNotifications.checkPermission() == 0 ) { // 0 is PERMISSION_ALLOWED
			var n_title = '';
			var n_content = '';

			if( file.id3.title && file.id3.artist ) {
				n_title		= file.id3.title;
				n_content	= file.id3.artist;
			} else {
				n_title		= file.file;
			}
			notification = window.webkitNotifications
				.createNotification('', n_title, n_content);
			notification.show();
			setTimeout(
				(function(notification) {
					return function() {
						notification.cancel();
					};
				})(notification)
			, 7000);
			//notification.ondisplay = function() { console.log('ondisplay') };
			//notification.onclose = function() { console.log('onclose') };
		  }
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
