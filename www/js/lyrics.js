function Lyrics() {
	this.lyrics = [];
	this.state = {
		position:	0,
		streams:	{}
	};
	
	this.domobjectid = 'lyrics';
	this.enabledstreams = [];
		
	this.test = function() {
			/* Multi-lingual, multivoice lyrics example */
		this.lyrics = {
			"language":	"zh", // Original language
			"lyrics": {
				"lang:zh_TW": {
					"0":	"越山丘\n",	// Linebreak indicates end of phrase. Lyrics are shown phrase by phrase, until \n.
					"2":	"過啞口",		// Previous phrase is shown between [0:00-0:02]
					"3":	""
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
					"2.7":	"Kou",
					"5":	"(eind)"
				}
			}
		};
		this.enabledstreams = ['lang:zh_TW', 'lang:en', 'lang:zh-pinyin'];//, 'lang:en', 'background', 'lang:zh-pinyin'];
		this.loadLyrics(this.lyrics); 
	}
	
	this.test2 = function() {
		this.lyrics = {
			"language":	"en", // Original language
			"lyrics": {
				"lang:en": {
					"0.35": "Ain't not working hard?",
					"1.5": "\n",
					"2": "Yeah right, ",
					"2.5": "picture that with a Kodak",
					"3.7": "\n",
					"3.9": "Or better yet, ",
					"4.6": "go to Time Square",
					"5.5": ", take a picture of me ",
					"6.6": "with a Kodak\n",
					"7.6": "Took my life from a negative to a positive, ",
					"9.3": "I just want you to know that...\n",
					"10.7": "and tonight, ",
					"11.4": "let's enjoy life.",
					"12.3": "\n",
					"12.6": "Pitbull, ",
					"13.1": "Nayer, ",
					"13.7": "Ne-yo, ",
					"14.0": "that's right!\n",
					"15.1": ""
				},
				"neyo": {
					"14.5": "Tonight...",
					"16.3": "\n"
				}
			}
		};
		this.enabledstreams = ['lang:en', 'neyo'];//, 'lang:en', 'background', 'lang:zh-pinyin'];
		this.loadLyrics(this.lyrics);
	}
	
	this.loadLyrics = function(lyrics) {
		var phrases = {};
		for( var i=0; i < this.enabledstreams.length; i++ ) {
			// Process stream
			var streamname = this.enabledstreams[i];
			var stream = this.lyrics.lyrics[streamname];
			phrases[streamname] = [];
			var streamstate = {
				phrase:			null,
				domobjectid:	'stream-' + i
			}
			
			var phrase = {start:null,end:null,chunks:[]};
			var phraseend	= false;
			var lastchunk	= null;
			var index		= 0;
			
			
			
			// Find current phrase
			var times = [];
			for(var time in stream) {
				if( stream.hasOwnProperty(time) ) {
					times.push(time);
				}
			}
			times.sort(function(a,b){return a-b});
			for( var i_time=0; i_time < times.length; i_time++ ) {
				var time = times[i_time];
				var text = stream[time];
				if( stream.hasOwnProperty(time) ) {
					var chunk = {start: time, end: null, text: text};
					if( phraseend ) {
						// Current phrase has passed completely
						// Start new phrase
						phrase.end = time;
						phrases[streamname].push(phrase);
						index++;
						phrase = {
							index:	index,
							start:	null,
							end:	null,
							chunks:	[]
						};
						phraseend	= false;
					}
					if( lastchunk !== null ) {
						lastchunk.end = time;
						
					}
					phrase.chunks.push(chunk);
					if( phrase.start == null ) {
						phrase.start = time;
					}
					
					if( text.slice(-1) == "\n" ) {
						// This is the end of the phrase
						phraseend = true;
					}
					lastchunk = chunk;
				}
			}
			
			if( phrase.chunks.length ) {
				phrases[streamname].push(phrase);
			}
			//if( streamphrases.chunks.length > 0 ) {
				//streamphrases.start = streamphrases.chunks.slice(0).start
				//streamphrases.end	
			//}
			//phrases.push(phrase);
			//console.log(phrase);
			
			this.state.streams[streamname] = streamstate;
		}
		this.phrases = phrases;
		this.addToDom();
		
		$('#tabs').tabs('select', 1);
		
	}
	
	this.addToDom = function() {
		// Add streams to DOM
		for( var i_stream=0; i_stream < this.enabledstreams.length; i_stream++ ) {
			var streamname		= this.enabledstreams[i_stream];
			var streamstate		= this.state.streams[streamname];
			var streamphrases	= this.phrases[streamname];
			
			var streamdomobject = $('<div role="stream" id="' + streamstate.domobjectid + '"/>');
			
			// Phrases to stream
			for( var i_phrase=0; i_phrase < streamphrases.length; i_phrase++ ) {
				var streamphrase	= streamphrases[i_phrase];
				var phrasedomobject	= $('<div role="phrase"/>');
				for( var i_chunk=0; i_chunk < streamphrase.chunks.length; i_chunk++ ) {
					var chunk = streamphrase.chunks[i_chunk];
					var duration = (chunk.end - chunk.start);
					
					var chunkdomobject = $('<span role="chunk"/>');
					chunkdomobject.append('<span class="text">' + chunk.text + '</span>');
					chunkdomobject.css('-webkit-transition-duration', duration + 's');
					
					chunkdomobject.click( (function(p) {
						return function() {
							//lyrics.updatePosition(p)
							$('#jplayer').jPlayer('playHead', p);
						}
					})(chunk.start));
					
					highlight = $('<span class="highlight">' + chunk.text + '</span>');
					highlight.css('-webkit-transition-duration', duration + 's');
					
					chunkdomobject.append(highlight);
					phrasedomobject.append(chunkdomobject);
				}				
				streamdomobject.append(phrasedomobject);
			}
			$('#'+this.domobjectid).append(streamdomobject);
		}
	}
	
	
	this.updatePosition = function(position) {
		for( var i=0; i < this.enabledstreams.length; i++ ) {
			// Process stream
			var streamname		= this.enabledstreams[i];
			var streamstate		= this.state.streams[streamname];
			var streamphrases	= this.phrases[streamname];
			var streamstate		= this.state.streams[streamname];
			var streamdomobject		= $('#'+streamstate.domobjectid);
			
			//var currentphrase_index = streamstate.phrase;
			
			// Find active phrase. Naive implementation
			// Iterates over all phrases and chunks sees whether they are active or not.
			
			/* Possible optimizations:
			 *  - Check if current phrase and chunk are the same
			 *  - If not, see if position is greater or smaller
			 *  - Start searching in the right direction
			 *  - Have a better index to determine the active phrase and chunk within few steps.
			 */
			
			for( var i_phrase=0; i_phrase < streamphrases.length; i_phrase++ ) {
				var phrase = streamphrases[i_phrase];
				var phrasedomobject = streamdomobject.find('[role=phrase]').eq(i_phrase);
				
				if( !this.inRange(position, phrase.start, phrase.end) ) {
					phrasedomobject.removeClass('active').addClass('inactive');
					phrasedomobject.find('[role=chunk]').not('.active').removeClass('ended');
					phrasedomobject.find('[role=chunk]').filter('.active').addClass('ended').removeClass('active');//.find('.highlight').css('-webkit-transition-duration', '');
				} else {
					// Phrase is active
					
					//streamdomobject.addClass('active');
					streamstate.phrase = i_phrase;
					phrasedomobject.not('.active').find('[role=chunk]').removeClass('ended');
					phrasedomobject.removeClass('inactive').addClass('active');
					
					for( var i_chunk = 0; i_chunk < phrase.chunks.length; i_chunk++ ) {
						var chunk = phrase.chunks[i_chunk];
						var chunkdomobject = phrasedomobject.find('[role=chunk]').eq(i_chunk);
						if( !this.inRange(position, chunk.start, chunk.end) ) {
							// Current chunk is not active
							chunkdomobject.filter('.active').addClass('ended').removeClass('active');
							
						} else {
							streamstate.chunk = i_chunk;
							var duration = (chunk.end - position);
							chunkdomobject.addClass('active');
								//.css('-webkit-transition-duration', duration + 's');
							//chunkdomobject.find('.highlight').css('-webkit-transition-duration', duration + 's');
						}
					}
				}
			}
		}		
	}
	
	this.inRange = function(position, start, end) {
		var after_start	= parseFloat(start) <= position;
		var before_end	= ( position < parseFloat(end) || end === null );
		var active = after_start && before_end;
		return active;
	}
}
