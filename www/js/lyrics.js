function Lyrics() {
	this.lyrics = [];
	this.position = 0;
	
	this.lyricsid = '#lyrics';
	this.enabledstreams = [];
	
	this.test = function() {
			/* Multi-lingual, multivoice lyrics example */
		this.lyrics = {
			"language":	"zh", // Original language
			"lyrics": {
				"lang:zh_TW": {
					"0":	"越山丘\n",	// Linebreak indicates end of phrase. Lyrics are shown phrase by phrase, until \n.
					"2":	"過啞口"		// Previous phrase is shown between [0:00-0:02]
				},
				"background": {
					"0":	"Yeah~\n",
					"2":	""			// At [0:02] previous phrase ends. Phrase ended in \n so it will be cleared.
				},
				"lang:zh_CN": {
					"0":	"越山丘\n",	// Phrase for zh_TW and zh_CN have same timing and number of words so can be shown in alignment.
					"2":	"过哑口"
				},
				"lang:zh-pinyin": {
					"0":	"yue shan qiu\n",
					"2":	"guo Ya Kou"
				},
				"lang:en": {
					"0":	"Over the hill, \n",
					"2":	"pass ",
					"2.5":	"Ya ",
					"2.7":	"Kou"
				}
			}
		};
		this.enabledstreams = ['lang:en'];//, 'lang:en', 'background', 'lang:zh-pinyin'];
	}
	
	this.updatePosition = function(position) {
		
		//var phrases = [];
		// Iterate enabled streams
		for( var i=0; i < this.enabledstreams.length; i++ ) {
		
			// Process stream
			var streamname = this.enabledstreams[i];
			var stream = this.lyrics.lyrics[streamname];
			
			var phrase = [];
			var phrasestart = false;
			var phraseend = false;
			// Find current phrase
			for( var time in stream ) {
				time = parseFloat(time);
				var chunk = stream[time];
				if( stream.hasOwnProperty(time) ) {

					if( phraseend ) {
						if( time <= position ) {
							// Current phrase has passed completely
							phrase = [];
							phraseend = false;
							phrasestart = false;
						} else {
							// Current phrase still active
							if( phrasestart ) {
								break;
							}
						}
					}
					if( phrasestart || time <= position ) {
						// Now we are past the start of phrase. It might be active.
						phrase.push(chunk);
						phrasestart = true;
					}
					if( chunk.slice(-1) == "\n" ) {
						// This is the end of the phrase
						phraseend = true;
					}
				}
			}
			//phrases.push(phrase);
			console.log(phrase);
		}
	}
	
	//this.get
	this.render = function() {
		
	}
}
