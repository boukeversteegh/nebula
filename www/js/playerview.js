function PlayerView(player) {
	var self = this;
	this.player = player;
	this.player.events.bind('STARTED', function(file) { self.onStarted(file)} );
	
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
