function View() {
	this.path = '';
	this.filepath = '/';
	this.templates = {};
	this.views = {
		"/view/files*": [
			{
				"cache":		true,
				"templateurl": "/www/tpl/files.html",
				"dataurl":		function() { return "/metadata" + this.trail},
				"target":		'#tab_files',
				"history":		true,
				"onrender":		function() {
					var trail = this.data.path.split('/');
					var breadcrumbs = [];
					for( var i=0; i<trail.length; i++) {
						breadcrumbs.push( {'path': trail.slice(0,i+1).join('/'), 'folder': trail[i]} );
					}
					this.data['breadcrumbs'] = breadcrumbs;
					var playlistindex = 0;
					for( var i=0; i<this.data.files.length; i++ ) {
						var file = this.data.files[i];
						file.index = i;
						file.playable = ( file.mimetype == 'audio/mpeg' );
						if( file.playable ) {
							file.playlistindex = playlistindex;
							playlistindex++;
						}
					}


					if( playlistindex > 0 ) {
						this.data.hasPlayableFiles = true;
					}
					window.files.loadView(JSON.parse(JSON.stringify(this.response)));
					nebula.showTab('files');
				},
				"onload": 	function() {
					dragdrop_init();
					$('button.delete').button();
										
					$('#breadcrumbs').buttonset();
					$('#breadcrumbs a:eq(-1)').addClass('ui-state-active');
					
					$('#files tr.file, #folders li.folder').not('#parentfolder').draggable({
						revert:		'invalid',
						cursorAt:	{ left: -5 },
						delay:		50,
						distance:	10,
						helper:		function( event ) {
										var clone = $(this).clone();
										clone.filter('td').remove('.ui-button');
										//clone = clone.not('.extra');
										clone.css({padding:'0.25em', display: 'inline-block'});
										clone.html(clone.text());
										//console.log(clone.text());
										return $( '<div class="file"/>' ).button().css({width: 'auto'}).html(clone);
									}
					});
					$('#folders .folder, #breadcrumbs .folder').droppable({
						drop: function( event, ui ) {
								var sourcepath = ui.draggable[0].dataset.path;
								var targetpath = this.dataset.path + '/' + ui.draggable[0].dataset.file
								window.view.xhttp('POST', '/files' + sourcepath, {'action':'mv', 'target': targetpath})
								event.preventDefault();
								event.stopPropagation();
								return false;
							},
						hoverClass: "ui-state-hover",
						tolerance: 'pointer'
					})
					$('#mkdir').button({icons: {primary: 'ui-icon-plus'}});
					$('#playlist-add-all').button({icons: {primary: 'ui-icon-plus'}});
					$('#rmdir').button();
					$('#folders .folder a').button({icons: {primary: 'ui-icon-folder-collapsed'}});
 					
					window.uploader.refresh();
					window.playerview.refresh();
					
					$('#files').find('.playlist-add').empty().button({
						icons: {primary: 'ui-icon-plus'},
						text: false
					});
					
					$('#files').find('.playlist-play').empty().button({
						icons: {primary: 'ui-icon-play'},
						text: false
					});
				}
			}
		],
		"/view/lyrics*" : [
			{
				"cache":		true,
				"templateurl":	"/www/tpl/lyrics.html",
				"dataurl":		function () { return "/lyrics" + this.trail},
				"target":		'#tab_lyrics'
			}
		],
		"/view/playlist/add*": [
			{
				"onstart": function() {
					console.log("Adding to playlist");
					console.log(this.trail);
					
				}
			}
		]
	};
	
	this.views['/'] = this.views['/view/files*'];
	
	this.show = function(path, pushstate, nocache) {
		var view = null;
		var viewname = null;
		var trail = null;
		var self = this;
		for( var key in this.views ) {
			if( this.views.hasOwnProperty(key) ) {
				if( key.slice(-1) == "*" ) {
					var issubpath = (path[key.length-1] == "/") && path.slice(0, key.length-1) == key.slice(0,-1);
					var isroot = key.slice(0,-1) == path;
					if( issubpath || isroot ) {
						view = this.views[key];
						viewname = key.slice(0,-1);
						trail = path.slice(viewname.length);
						break;
					}
				} else {
					if( path == key ) {
						view = this.views[key];
						viewname = key;
						trail = '';
					}
				}
				continue;
			}
		}
		if( view == null ) {
			alert("Invalid view: " + path);
			return false;
		}
		
		for( var i=0; i<view.length; i++) {
			if( pushstate && view[i].history ) {
				if( window.history.pushState ) {
					window.history.pushState({"path": path}, null, path);
				}
				this.path = path;
			}
			cview = {
				"path":			path,
				"trail":		trail,
				"cache":		view[i].cache,
				"templateurl":	view[i].templateurl,
				"dataurl":		view[i].dataurl,
				"target":		view[i].target,
				"onstart":		view[i].onstart,
				"onload":		view[i].onload,
				"onrender":		view[i].onrender
			}
			if( typeof cview.dataurl === 'function' ) {
				cview.dataurl = cview.dataurl.call(cview);
			}
			
			if( typeof cview.onstart === 'function' ) {
				if( cview.onstart.call(cview) === false ) {
					return false;
				}
			}
			
			var headers = {};
			if( !!nocache ) {
				headers['Cache-Control'] = 'no-cache';
			}
			
			var ifLoaded = function(view, fn) {
				if( !('data' in view && 'template' in view) ) {
					return;
				} else {
					return fn();
				}
			}
			
			var onLoad = function() {
				var dorender = true;
				if( cview.onrender ) {
					var dorender = cview.onrender.call(cview);
				}
				if( dorender !== false ) {
					self.renderView(cview);
				}
				if( cview.onload ) {
					cview.onload.call(cview);
				}
			}
			
			$.ajax({
				"url":		cview.dataurl,
				"success":	function(response) {
								//viewdata['response'] = response;
								cview['response'] = response;
								cview['data'] = response.data;
								ifLoaded(cview, onLoad);
							},
				"dataType":	"json",
				"headers":	headers
			});
			$.ajax({
				"url":		cview.templateurl,
				"success":	function(template) {
								//viewdata['template'] = template;
								cview['template'] = template;
								ifLoaded(cview, onLoad);
							},
				"dataType":	"html"
			});
		}
	}
	
	this.xhttp = function(method, url, data, nextpath) {
		$.ajax({
			"url": url,
			"type": method,
			"success": function(response) {
				if( response.success ) {
					if( typeof nextpath == "undefined" ) { 
						nextpath = view.path;
					}
					view.show(nextpath, true, true);
				} else {
					alert(response.error);
				}
			},
			"data": data
		});
	}
	
	
	this.render = function(templateurl, data, target) {
		var self = this;
		var cb_rendertemplate = function (template, data, target) {
			var html = Mustache.render(template, data);
			$(target).html(html);
			self.rebind(target);
		}
		
		if( typeof this.templates[templateurl] != "undefined" ) {
			var template = this.templates[templateurl];
			var defer = $.Deferred(function() { cb_rendertemplate(template, data, target); });
			defer.resolve();
			return defer;
		} else {
			return $.ajax({
				"url":		templateurl,
				"datatype":	"html",
				"success":	(function(templateurl, data, target, templates) {
					return function(template) {
						templates[templateurl] = template;
						cb_rendertemplate(template, data, target);
					}
				})(templateurl, data, target, this.templates)
			});
		}
	}
	
	this.renderView = function(view) {
		var html = Mustache.render(view.template, view.response);
		
		$(view.target).html(html);
		this.rebind(view.target);
		
		var hashpos = view.path.indexOf('#');
		if( hashpos > -1 ) {
			// Go to anchor after loading view.
			// Doesn't work because of player fixed position.
			/// window.location.assign(view.path.slice(hashpos));
		}
	}
	
	this.rebind = function(target) {
		$(target).find(" a.showview").click(function (e) {
			if( e.button == 0 ) {
				e.preventDefault();
				e.stopPropagation();
				window.view.show($(this).attr('href'), true);
			}
		});
	}
}
