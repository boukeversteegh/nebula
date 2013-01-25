function Playlist(player) {
	this.player		= player;
	this.items		= [];
	this.current	= 0;
	this.type		= "playlist";
	
	this.addItem = function(item, index) {
		if( typeof index !== "undefined" ) {
			this.items.slice(index, 0, item);
		} else {
			this.items.push(item);
		}
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

