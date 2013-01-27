function PlayerView(player) {
	this.player = player;
	this.player.view = this;
	
	this.refresh = function() {
		$('.player-current').removeClass('player-current');
		if( this.player.current ) {
			$('[data-path="' + this.player.current.path + '"]').addClass('player-current');
			view.render('/www/tpl/play.html', {data:this.player.current}, '#player-metadata');
		}
	}
}
