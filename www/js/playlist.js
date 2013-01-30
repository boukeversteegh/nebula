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
		this.next();
	}
	
	this.next = function() {
		var hasnext = this.setCurrent(this.current+1);
		if( hasnext && this.playing ) {
			this.playing = false;
			this.play();
		}
	}
	
	this.previous = function() {
		var hasprev = this.setCurrent(this.current-1);
		if( hasprev ) {
			if( this.playing ) {
				this.playing = false;
				this.play();
			}
		} else {
			this.player.seek(0);
		}
	}
	
	this.onListEnded = function() {
		console.log("List ended");
	}
	
	this.add = function(item, index) {
		if( item.mimetype == 'audio/mpeg' ) {
			if( typeof index !== "undefined" ) {
				this.items.splice(index, 0, item);
			} else {
				this.items.push(item);
			}
		
			this._rebuild_indexes();
			this._refresh_views();
		}
	}
	
	this.remove = function(index) {
		this.items.splice(index, 1);
		this._rebuild_indexes();
		this._refresh_views();
	}
	
	this._rebuild_indexes = function() {
		for( var i=0; i < this.items.length; i++ ) {
			this.items[i].index = i;
		}
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
	
	this.setCurrent = function(index) {
		if( index < 0 || index >= this.items.length ) {
			this.current = null;
			return false;
		} else {
			this.current = index;
			return true;
		}
	}
	
	this.loadPlaylist = function(playlist) {
		for( var i=0; i<playlist.items.length; i++ ) {
			var item = playlist.items[i];
			this.add(item);
		}
		this.view.refresh();
	}
	
	this.play = function(index) {
		if( typeof index == "undefined" ) {
			index = this.current;
		}
		if( !this.setCurrent(index) ){ 
			this.onListEnded();
			return;
		}
		
		this.player.playFile(this.items[index]);
		this.playing = true;
	}
	
}

