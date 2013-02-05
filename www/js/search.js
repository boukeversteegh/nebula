function Search() {
	this.events = new EventHandler();

	this.search = function(field, query) {
		var url = '/search/' + field + '/' + query;
		var self = this;
		$.getJSON(url, function(data) {
			self.events.trigger('RESPONSE', [data]);
		});
	}
}