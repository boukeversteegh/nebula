$(function() {
	init();
});

function init() {
	window.view = new View();
	$('.tabs a').click(function (e) {
		if( e.button == 0 ) {
			e.preventDefault();
			window.view.show($(this).attr('href'));
		}
	});
	
	window.view.show(window.location.pathname);
}

function View() {
	this.views = {
		"/browse/files*": [
			{
				"cache":	false,
				"template": "/tpl/browse/files",
				"data":		function(path, args) { return "/api/files" + args},
				"target":	"#main"
			}
		]
	};
	
	this.views['/'] = this.views['/browse/files*'];
	
	this.show = function(path) {
		console.log("Showing path: " + path);
		if( window.history.replaceState ) {
			window.history.replaceState(null, null, path);
		}
		
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
			return;
		}
		
		this.path = path;
		
		for( var i=0; i<view.length; i++) {
			cview = {
				"cache":	view[i].cache,
				"template":	view[i].template,
				"data":		view[i].data,
				"target":	view[i].target
			}
			if( typeof cview.data === 'function' ) {
				cview.data = cview.data(path, args);
			}
			//console.log(args);
			//console.log(rmatch);;
			var viewdata = {};
			$.get(cview.data,		function(data) { viewdata['data'] = data;     	self.renderTemplate(cview, viewdata);}, 'json');
			$.get(cview.template,	function(data) { viewdata['template'] = data;	self.renderTemplate(cview, viewdata);}, 'html');
		}
	}
	
	this.showFiles = function() {
		var templateurl = '/tpl/browse/files';
		var dataurl = '/api/files';
		
		var viewdata = {};
		var self = this;
		var target = 'main';
		$.get(dataurl, function(data) { viewdata['data'] = data;     	self.renderTemplate(target, viewdata);}, 'json');
		$.get(templateurl, function(data) { viewdata['template'] = data;	self.renderTemplate(target, viewdata);}, 'text');
	}
	
	this.renderTemplate = function(view, viewdata) {
		if( !('data' in viewdata && 'template' in viewdata) ) {
			//console.log("waiting for data or template");
			return;
		}
		//console.log(viewdata);
		html = Mustache.render(viewdata.template, viewdata.data);
		
		$(view.target).html(html);
		
		$(view.target + " a.showview").click(function (e) {
			if( e.button == 0 ) {
				e.preventDefault();
				window.view.show($(this).attr('href'));
			}
		});
	}
}
