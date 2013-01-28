function Playlist(player) {
	var self		= this;
	
	this.player		= player;
	this.items		= [];
	this.current	= 0;
	this.type		= "playlist";
	this.playing	= false;
	
	this.view		= null;
	
	this.player.events.bind('ENDED', function(e) {
		if( self.playing ) {
			self.onSongEnded();
		}
	});
	
	this.onSongEnded = function() {
		this.playing = false;
		this.current++;
		this.play();
	}
	
	this.onListEnded = function() {
		console.log("List ended");
	}
	
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
		for( var i=0; i<playlist.items.length; i++ ) {
			var item = playlist.items[i];
			item.index = this.items.length;
			this.items.push(item);
			
		}
		this.view.refresh();
	}
	this.play = function(index) {
		if( typeof index == "undefined" ) {
			index = this.current;
		}
		if( !this.items[index] ) {
			this.onListEnded();
			return;
		}
		this.current = index;
		this.player.playFile(this.items[index]);
		this.playing = true;
	}
}

