function Search(playlist) {
	var self = this;
	this.events = new EventHandler();
	this.playlist = playlist;

	this.search = function(field, query) {
		var url = '/search/' + field + '/' + query;
		$.getJSON(url, function(response) {
			
			self.playlist = new Playlist(nebula.player, 'search:'+field+'/'+query);
			
			self.events.trigger('NEWPLAYLIST', [self.playlist]);
			self.playlist.addItems(response.data.files);
			nebula.addPlaylist(self.playlist);
		});
	}
}
