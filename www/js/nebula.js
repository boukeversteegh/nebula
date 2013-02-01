function Nebula() {
	var self = this;
	this.player		= null;
	this.files		= null;
	this.playlist	= null;
	this.view		= null;

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
