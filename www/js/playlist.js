function Playlist(player, name) {
	var self		= this;
	this.player		= player;
	this.name		= name;
	this.items		= [];
	this.current	= 0;
	this.type		= "playlist";
	this.playing	= false; // A song is loaded and playback has been started
	this.paused		= false; // Player is paused at the moment
	
	this.view		= null;
	
	this.player.events.bind('ENDED', function(e) {
		if( self.isActivePlaylist() && self.playing ) {
			self.onSongEnded();
		}
	});
	
	this.player.events.bind('PAUSE', function(e) {
		if( self.isActivePlaylist() ) {
			self.paused = true;
		}
	});
	
	this.player.events.bind('PLAY', function(e) {
		if( self.isActivePlaylist() ) {
			self.paused = false;
			self.playing = true;
		}
	});

	this.isActivePlaylist = function() {
		return (nebula.playlist === this);
	}
	
	this.onSongEnded = function() {
		if( this.isLast(this.current) ) {
			this.onPlaylistEnded();
		} else {
			this.next();
		}
	}
	
	this.onPlaylistEnded = function() {
		if( nebula.repeat === 'playlist' ) {
			this.next();
		} else {
			this.playing = false;
			this._refresh_views();
		}
	}
	
	// Advance the playlist to the next song.
	// Also starts playing if a song was being played before.
	// Next will always advance, and will cycle at the end of a list.
	// Non play-list repeat is achieved by not calling next() at list end.
	this.next = function() {
		if( this.current === null ) {
			return false;
		}
		
		if( nebula.shuffle ) {
			// Get a random next song
			var next = Math.floor(Math.random()*this.items.length);

			// Make sure we don't repeat the previous song.
			// But only care if we actually have 2 or more songs in the list.
			while( this.items.length > 1 && next == this.current ) {
				var next = Math.floor(Math.random()*this.items.length);
			}
			
		} else {
			if( this.isLast(this.current) ) {
				// Repeat list if next song is requested.
				// For non-playlist repeat, don't call .next().
				var next = 0;
			} else {
				var next = this.current + 1;
			}
		}
		
		
		if( this.setCurrent(next) ) {
			if( this.playing && !this.paused ) {
				this.playing = false;
				this.play();
			}
		} else {
			this.playing = false;
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
	
	this._add = function(item, index) {
		if( item.mimetype == 'audio/mpeg' ) {
			if( typeof index !== "undefined" ) {
				this.items.splice(index, 0, item);
			} else {
				this.items.push(item);
			}
			return true;
		}
		return false;
	}
	
	this.add = function(item, index) {
		if( this._add(item, index) ) {
			this._rebuild_indexes();
			this._refresh_views();
		}
	}

	this.addItems = function(items) {
		for( var i=0; i < items.length; i++ ) {
			var item = items[i];
			this._add(item);
		}
		this._rebuild_indexes();
		this._refresh_views();
	}
	
	this._remove = function(index) {
		this.items.splice(index, 1);
		return true;
	}
	
	this.remove = function(index) {
		if( this._remove(index) ) {
			this._rebuild_indexes();
			this._refresh_views();
		}
	}
	
	this.move = function(from, to) {
		var item = this.get(from);
		console.log(item);
		this._remove(from);
		this._add(item, to);
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
	
	this.isLast = function(index) {
		return ( this.items.length-1 === index );
	}
	
	this.setCurrent = function(index) {
		if( index === null || index < 0 || index >= this.items.length ) {
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
			this._add(item);
		}
		this._rebuild_indexes();
		this._refresh_views();
	}
	
	this.load = function(index) {
		this.player.loadFile(this.items[index]);
	}
	
	this.play = function(index) {
		if( typeof index == "undefined" ) {
			index = this.current;
		}
		if( !this.setCurrent(index) ){ 
			this.onPlaylistEnded();
			return;
		}
		
		this.player.playFile(this.items[index]);
		this.playing = true;
		this.paused = false;
		window.webkitNotifications.requestPermission();
		window.nebula.playlist = this;
	}
	
}

