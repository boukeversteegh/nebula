function SearchView(search) {
	this.search = search;

	search.events.bind('RESPONSE', function(data) {
		console.log('trigger');
		$('#tab_search').append(JSON.stringify(data));
	});

	this.init = function() {
		$('#button-search').button();


		$('#button-search').click(function() {
			nebula.search.search('title', $('#search-query').val())
		});
	}
}