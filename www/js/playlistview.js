function PlaylistView(playlist, target) {
	this.playlist = playlist;
	this.target = target;
	
	this.playlist.view = this;

	
	this.refresh = function() {
		var self = this;
		view.render('/www/tpl/playlist.html', {data: this.playlist}, this.target).then(function() {
			$(self.target).find('.playlist-play').empty().button({text:false, icons: {primary: 'ui-icon-play'}});
			$('#files').find('.playlist-add').removeClass('ui-state-focus');
			for( var i=0; i<self.playlist.items.length; i++) {
				var item = self.playlist.items[i];
				$('#files').find('[data-path="' + item.path + '"] .playlist-add').addClass('ui-state-focus');
			}
		});
	}
}
