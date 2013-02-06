function SearchView(search, playlist) {
	this.search		= search;
	this.playlist	= playlist;

	search.events.bind('RESPONSE', function(data) {
		view.render('/www/tpl/playlist.html', {data: this.playlist, playlist: this.playlist.name}, '#search-playlist');
	});

	this.init = function() {
		$('#button-search').button();

		$('#button-search').click(function() {
			nebula.search.search('title', $('#search-query').val())
		});
	}
}