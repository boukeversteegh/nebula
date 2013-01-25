function Playlist(player) {
	this.player		= player;
	this.playlist	= [];
	this.current	= 0;
	
	this.addItem = function(item, index) {
		
	}
	
	this.play = function() {
		this.player.PlayMedia(this.playlist[this.current]);
	}
}
