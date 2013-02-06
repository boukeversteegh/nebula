function PlaylistView(playlist, target) {
	this.playlist = playlist;
	this.target = target;
	
	this.playlist.view = this;

	
	this.refresh = function() {
		var self = this;
		var data = {
			data:		{
				files: this.playlist.items
			},
			playlist: this.playlist.name
		};
		view.render('/www/tpl/playlist.html', data, this.target).then(function() {
			var targetdomobject = $(self.target);
			targetdomobject.find('.playlist-play').empty().button({text:false, icons: {primary: 'ui-icon-play'}});
			targetdomobject.find('.playlist-remove').empty().button({text:false, icons: {primary: 'ui-icon-close'}});
			
			$('#files').find('.playlist-add').removeClass('ui-state-focus');
			for( var i=0; i<self.playlist.items.length; i++) {
				var item = self.playlist.items[i];
				$('#files').find('[data-path="' + item.path + '"] .playlist-add').addClass('ui-state-focus');
			}
		});
	}
}
