function Playlist(player) {
	this.player		= player;
	this.items		= [];
	this.current	= 0;
	this.type		= "playlist";
	
	this.view		= null;
	
	this.add = function(item, index) {
		if( typeof index !== "undefined" ) {
			this.items.slice(index, 0, item);
		} else {
			this.items.push(item);
		}
		
		for( var i=0; i < this.items.length; i++ ) {
			this.items[i].index = i;
		}
		this._refresh_views();
	}
	
	this._refresh_views = function() {
		if( this.view ) {
			this.view.refresh();
		}
		if( this.player && this.player.view ) {
			this.player.view.refresh();
		}
	}
	
	this.clear = function() {
		this.items = [];
		this._refresh_views();		
	}
	
	this.get = function(index) {
		return this.items[index];
	}
	
	this.loadPlaylist = function(playlist) {
		var items = [];
		for( var i=0; i<playlist.items.length; i++ ) {
			var item = playlist.items[i];
			items.push(item);
		}
		this.items = items;
	}
	this.play = function(index) {
		if( typeof index == "undefined" ) {
			index = this.current;
		}
		this.player.playMedia('/files' + this.items[index].path);
	}
}

