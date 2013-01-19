function View() {
	this.path = '';
	this.filepath = '/';
	this.templates = {};
	
	this.views = {
		"/view/files*": [
			{
				"cache":	true,
				"template": "/www/tpl/files.html",
				"data":		function(path, args) { return "/metadata" + args},
				"target":	"#main",
				"history":	true,
				"onload": function() {
					dragdrop_init();
					window.view.filepath = "{{{data.path}}}";
					$('button.delete').button();
					$('#files tr.file, #folders li.folder').not('#parentfolder').draggable({
						revert: 'invalid',
						cursorAt: { left: -5 },
						delay: 50,
						distance: 10,
						helper: function( event ) {
							return $( '<div class="file"/>' ).button().css({width: 'auto'}).html($(this).find('a').clone().css({padding:'0.25em', display: 'inline-block'}));
						}
					});
					$('#folders li.folder').droppable({
						drop: function( event, ui ) {
								var sourcepath = ui.draggable[0].dataset.path;
								var targetpath = this.dataset.path + '/' + ui.draggable[0].dataset.file
								console.log([sourcepath, targetpath])
								view.xhttp('POST', '/files' + sourcepath, {'action':'mv', 'target': targetpath})
								event.preventDefault();
								event.stopPropagation();
								return false;
							},
						hoverClass: "ui-state-hover"
					})
					$('#mkdir,#rmdir').button();
					$('#folders .folder a').button();
					$('#parentfolder a').button({
						icons: {primary: 'ui-icon-arrowreturnthick-1-w'}
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
				"cache":	true,
				"template":	"/www/tpl/play.html",
				"data":		function (path, args) { return "/metadata" + args},
				"target":	"#player-metadata",
				"onstart":	function() {
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
				"path":		path,
				"cache":	view[i].cache,
				"template":	view[i].template,
				"data":		view[i].data,
				"target":	view[i].target,
				"onstart":	view[i].onstart,
				"onload":	view[i].onload,
				"onrender":	view[i].onrender
			}
			if( typeof cview.data === 'function' ) {
				cview.data = cview.data(path, args);
			}
			
			if( typeof cview.onstart === 'function' ) {
				if( cview.onstart.call(cview) === false ) {
					return false;
				}
			}
			
			var viewdata = {};
			
			var headers = {};
			if( !!nocache ) {
				headers['Cache-Control'] = 'no-cache';
			}
			
			var ifLoaded = function(viewdata, fn) {
				if( !('data' in viewdata && 'template' in viewdata) ) {
					return;
				} else {
					return fn();
				}
			}
			
			var onLoad = function() {
				var dorender = true;
				if( cview.onrender ) {
					var dorender = cview.onrender(cview, viewdata);
				}
				if( dorender !== false ) {
					self.renderTemplate(cview, viewdata);
				}
				if( cview.onload ) {
					cview.onload(cview, viewdata);
				}
			}
			
			$.ajax({
				"url":		cview.data,
				"success":	function(data) {
								viewdata['data'] = data;
								ifLoaded(viewdata, onLoad);
							},
				"dataType":	"json",
				"headers":	headers
			});
			$.ajax({
				"url":		cview.template,
				"success":	function(data) {
								viewdata['template'] = data;
								ifLoaded(viewdata, onLoad);
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
	
	this.renderTemplate = function(view, viewdata) {
		html = Mustache.render(viewdata.template, viewdata.data);
		
		$(view.target).html(html);
		
		$(view.target + " a.showview").click(function (e) {
			if( e.button == 0 ) {
				e.preventDefault();
				window.view.show($(this).attr('href'), true);
			}
		});
	}
}
