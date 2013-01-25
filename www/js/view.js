function View() {
	this.path = '';
	this.filepath = '/';
	this.templates = {};
	
	this.views = {
		"/view/files*": [
			{
				"cache":		true,
				"templateurl": "/www/tpl/files.html",
				"dataurl":		function(path, args) { return "/metadata" + args},
				"target":		'#tab_files',
				"history":		true,
				"onrender":		function(view) {
					var trail = view.data.path.split('/');
					var breadcrumbs = [];
					for( var i=0; i<trail.length; i++) {
						breadcrumbs.push( {'path': trail.slice(0,i+1).join('/'), 'folder': trail[i]} );
					}
					view.data['breadcrumbs'] = breadcrumbs;
					window.files.loadView(view.response);
				},
				"onload": 	function(view) {
					dragdrop_init();
					$('button.delete').button();
					$('#files tr.file, #folders li.folder').not('#parentfolder').draggable({
						revert:		'invalid',
						cursorAt:	{ left: -5 },
						delay:		50,
						distance:	10,
						helper:		function( event ) {
										return $( '<div class="file"/>' ).button().css({width: 'auto'}).html($(this).find('a').clone().css({padding:'0.25em', display: 'inline-block'}));
									}
					});
					$('#folders .folder, #breadcrumbs .folder').droppable({
						drop: function( event, ui ) {
								var sourcepath = ui.draggable[0].dataset.path;
								var targetpath = this.dataset.path + '/' + ui.draggable[0].dataset.file
								console.log([sourcepath, targetpath])
								window.view.xhttp('POST', '/files' + sourcepath, {'action':'mv', 'target': targetpath})
								event.preventDefault();
								event.stopPropagation();
								return false;
							},
						hoverClass: "ui-state-hover",
						tolerance: 'pointer'
					})
					$('#mkdir').button({icons: {primary: 'ui-icon-plus'}});
					$('#rmdir').button();
					$('#folders .folder a').button({icons: {primary: 'ui-icon-folder-collapsed'}});
					
					$('#breadcrumbs .folder a').button();
					$('#breadcrumbs .folder a').eq(-1).button({
						icons: {primary: 'ui-icon-folder-open'},
						disabled: true
					});
 					
					window.uploader.refresh();
					if( window.player.current !== null ) {
						$('[data-path="' + window.player.current.substr("/files".length) + '"]').addClass('player-current');
					}
				}
			}
		],
		"/view/play*" : [
			{
				"cache":		true,
				"templateurl":	"/www/tpl/play.html",
				"dataurl":		function (path, args) { return "/metadata" + args},
				"target":		"#player-metadata",
				"onstart":		function() {
					var filepath = this.path.split('/view/play')[1];
					window.player.playMedia("/files" + filepath);
					//$('#jplayer').jPlayer('setMedia', {mp3: "/files" + filepath });
					//$('#jplayer').jPlayer('play');
					$('.player-current').removeClass('player-current');
					$('[data-path="' + window.player.current.substr("/files".length) + '"]').addClass('player-current');
				}
				//"onload"
				//"onrender"
			}
		],
		"/view/lyrics*" : [
			{
				"cache":		true,
				"templateurl":	"/www/tpl/lyrics.html",
				"dataurl":		function (path, args) { return "/lyrics" + args},
				"target":		'#tab_lyrics'
			}
		]
	};
	
	this.views['/'] = this.views['/view/files*'];
	
	this.show = function(path, pushstate, nocache) {
		//console.log(["Showing path: " + path, pushstate]);
		var view = null;
		var viewname = null;
		var tail = null;
		var self = this;
		for( var key in this.views ) {
			if( this.views.hasOwnProperty(key) ) {
				if( key.slice(-1) == "*" ) {
					if( path.slice(0, key.length-1) == key.slice(0,-1) ) {
						view = this.views[key];
						viewname = key.slice(0,-1);
						args = path.slice(viewname.length)
						break;
					}
				} else {
					if( path == key ) {
						view = this.views[key];
						viewname = key;
						args = '';
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
				"cache":		view[i].cache,
				"templateurl":	view[i].templateurl,
				"dataurl":		view[i].dataurl,
				"target":		view[i].target,
				"onstart":		view[i].onstart,
				"onload":		view[i].onload,
				"onrender":		view[i].onrender
			}
			if( typeof cview.dataurl === 'function' ) {
				cview.dataurl = cview.dataurl(path, args);
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
					var dorender = cview.onrender(cview);
				}
				if( dorender !== false ) {
					self.renderTemplate(cview);
				}
				if( cview.onload ) {
					cview.onload(cview);
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
	
	this.renderTemplate = function(view) {
		html = Mustache.render(view.template, view.response);
		
		$(view.target).html(html);
		this.rebind(view.target);
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
