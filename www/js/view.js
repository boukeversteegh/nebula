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
				"history":	true
			}
		],
		"/view/play*" : [
			{
				"cache":	true,
				"template":	"/www/tpl/play.html",
				"data":		function (path, args) { return "/metadata" + args},
				"target":	"#player-metadata",
				"onload":	function(view, viewdata) {
					$('#jplayer').jPlayer('setMedia', {mp3: "/files" + viewdata.data.data.path});
					$('#jplayer').jPlayer('play');
				}//,
				//onrender
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
				"cache":	view[i].cache,
				"template":	view[i].template,
				"data":		view[i].data,
				"target":	view[i].target,
				"onload":	view[i].onload,
				"onrender":	view[i].onrender
			}
			if( typeof cview.data === 'function' ) {
				cview.data = cview.data(path, args);
			}
			//console.log(args);
			//console.log(rmatch);;
			var viewdata = {};
			//$.get(cview.data,		function(data) { viewdata['data'] = data;     	self.renderTemplate(cview, viewdata);}, 'json');
			//#$.get(cview.template,	function(data) { viewdata['template'] = data;	self.renderTemplate(cview, viewdata);}, 'html');
			
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
	
	this.xhttp = function(method, url, data) {
		$.ajax({
			"url": url,
			"type": method,
			"success": function(response) {
				if( response.success ) {
					view.show(view.path, false, true);
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
