/*
	Stores files and folders in current view
*/
function Files(player) {
	this.player		= player;
	this.folders	= [];
	this.files		= [];

	this.playlist	= null;
	
	this.loadView = function(response) {
		this.folders	= response.data.folders;
		this.path		= response.data.path;
		
			
		var files = [];
		for( var i=0; i < response.data.files.length; i++ ) {
			var file = response.data.files[i];

			file.path	= this.path + '/' + file.file;
			file.parent	= this.path;
			files.push(file);
		}
		this.files = files;
		
		// Store a separate playlist for every path.
		// This allows continous playing of a folder while browsing.

		var playlist = nebula.getPlaylist('files:' + this.path);
		if( !playlist || !response.cached ) {
			var playlist = new Playlist(this.player, 'files:' + this.path);
			nebula.addPlaylist(playlist);
			playlist.addItems(files);
		}
		this.playlist = playlist;
	}
	
	this.get = function(index) {
		return this.files[index];
	}
	
	this.mkdir = function(path) {
		view.xhttp('POST', '/files' + path, {'action':'mkdir'});
	}
}
