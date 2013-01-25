/*
	Stores files and folders in current view
*/
function Files() {
	this.folders = [];
	this.files = [];
	
	this.loadView = function(response) {
		this.folders	= response.data.folders;
		this.files		= response.data.files;
		this.path		= response.data.path;
	}
}
