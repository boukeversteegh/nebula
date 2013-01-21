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
			for( var time in stream ) {
				time = parseFloat(time);
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
			
			var streamdomobject = $('<div id="' + streamstate.domobjectid + '"/>');
			
			// Phrases to stream
			for( var i_phrase=0; i_phrase < streamphrases.length; i_phrase++ ) {
				var streamphrase	= streamphrases[i_phrase];
				var phrasedomobject	= $('<div role="phrase"/>');
				for( var i_chunk=0; i_chunk < streamphrase.chunks.length; i_chunk++ ) {
					var chunk = streamphrase.chunks[i_chunk];
					var duration = (chunk.end - chunk.start);
					
					var chunkdomobject = $('<span role="chunk"/>');
					chunkdomobject.append('<span class="text">' + chunk.text + '</span>');
					chunkdomobject.click( (function(p) {
						return function() {
							lyrics.updatePosition(p)
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
		/*$('[role=chunk]').wrapInner('<div class="text"/>').each(function() {
			var hl = $('<div class="highlight"> </div>').text($(this).text());
			$(this).append(hl);
		});*/
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
					phrasedomobject.removeClass('active');
					phrasedomobject.find('[role=chunk]').removeClass('active complete');//.find('.highlight').css('-webkit-transition-duration', '');
				} else {
					//streamdomobject.addClass('active');
					streamstate.phrase = i_phrase;
					phrasedomobject.addClass('active');
					
					for( var i_chunk = 0; i_chunk < phrase.chunks.length; i_chunk++ ) {
						var chunk = phrase.chunks[i_chunk];
						var chunkdomobject = phrasedomobject.find('[role=chunk]').eq(i_chunk);
						if( !this.inRange(position, chunk.start, chunk.end) ) {
							chunkdomobject.filter('.active').addClass('complete');
							chunkdomobject.removeClass('active');
							
						} else {
							streamstate.chunk = i_chunk;
							var duration = (chunk.end - position);
							chunkdomobject
								.addClass('active');
								//.css('-webkit-transition-duration', duration + 's');
							//chunkdomobject.find('.highlight').css('-webkit-transition-duration', duration + 's');
						}
					}
				}
			}
		}		
	}
	
	this.inRange = function(position, start, end) {
		var after_start	= start <= position;
		var before_end	= ( position < end || end === null );
		var active = after_start && before_end;
		return active;
	}
	
	this.phraseText = function(phrase) {
		var text = '';
		for( var i=0; i < phrase.chunks.length; i++ ) {
			text += phrase.chunks[i].text;
		}
		return text;
	}
	
	//this.get
	this.render = function() {
		
	}
	
	this.test();
}
