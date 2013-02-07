function SearchView(search, playlistview) {
	var self = this;
	this.search			= search;
	this.playlistview	= playlistview;

	/*search.events.bind('RESPONSE', function(data) {
		data.playlist = this.playlist.name;
		//view.render('/www/tpl/playlist.html', data, '#search-playlist');
	});*/

	search.events.bind('NEWPLAYLIST', function(playlist) {
		self.playlistview.connect(playlist, '#search-playlist');
	});
	this.init = function() {
		$('#button-search').button();

		$('#button-search').click(function() {
			nebula.search.search('title', $('#search-query').val())
		});
	}
}
