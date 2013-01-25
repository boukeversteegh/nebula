/*
	Stores files and folders in current view
*/
function Files(player) {
	this.player = player;
	this.folders = [];
	this.files = [];
	this.playlist = null;
	
	this.loadView = function(response) {
		this.folders	= response.data.folders;
		this.path		= response.data.path;
		
		var playlist = new Playlist(this.player);
		
		var files = [];
		for( var i=0; i < response.data.files.length; i++ ) {
			var file = response.data.files[i];
			file.path = this.path + '/' + file.file;
			file.type = 'file';
			playlist.addItem(file);
			files.push(file);
		}
		this.files = files;
		this.playlist = playlist;
	}
}
