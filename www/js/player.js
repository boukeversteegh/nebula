function Player() {
	this.jplayer = null;
	this.jplayerid = null;
	
	this.current = null;
	
	this.init = function(jplayerid) {
		this.jplayerid = jplayerid;
	}
	
	this.jp = function() {
		if( this.jplayer == null ) {
			this.jplayer = $(this.jplayerid);
		}
		return this.jplayer;
	}
	
	this.playMedia = function(url, data) {
		//this.jp().jPlayer("stop");
		this.jp().jPlayer("setMedia", {mp3: url}).jPlayer('play');
		this.current = url;
	}
}
