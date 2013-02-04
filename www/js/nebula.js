function Nebula() {
	var self = this;
	this.player		= null;
	this.files		= null;
	this.playlist	= null;
	this.view		= null;
	this.playlists	= {};

	// Current Tab
	this.tab = null;


	this.addPlaylist = function(playlist) {
		this.playlists[playlist.name] = playlist;
	}

	this.setPlaylist = function(name) {
		this.playlist = this.getPlaylist(name);
	}

	this.getPlaylist = function(name) {
		return this.playlists[name];
	}

	this.init = function() {
		$('#player-prev').click(function() {
			self.clickPrevious();
		});
		
		$('#player-next').click(function() {
			self.clickNext();
		});
		
		$('#playlist-add-all').click(function() {
			self.playlist.loadPlaylist(self.files.playlist);
		});

		$('#player-open-folder').click(function(){
			self.view.show('/view/files' + self.player.current.parent, true);
		});

		$('#playlist-shuffle').click(function() {
			var shuffle = $('#playlist-shuffle').prop('checked');
			self.shuffle = shuffle;
		});

		$('#playlist-repeat').click(function() {
			var repeat = $('#playlist-repeat').prop('checked');
			self.player.repeat = ( repeat ? 'playlist' : false );
		});
	}

	this.clickPrevious = function() {
		var position = this.player.position();
		if( position <= 3 ) {
			this.playlist.previous();
		} else {
			this.player.seek(0);
		}
	}
	
	this.clickNext = function() {
		this.playlist.next();
	}
	
	this.showTab = function(tabname) {
		$('#tab-btn-' + tabname).trigger('click');
	}
}
