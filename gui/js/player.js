$(function() {
	init();
});

function init() {
	window.view = new View();
	$('.tabs a').click(function (e) {
		if( e.button == 0 ) {
			e.preventDefault();
			window.view.show($(this).attr('href'), true);
		}
	});
	
	$(window).bind('popstate', function(event) {
		// if the event has our history data on it, load the page fragment with AJAX
		var state = event.originalEvent.state;
		console.log(event.originalEvent);
		if (event.originalEvent.state) {
		    window.view.show(event.originalEvent.state.path, false);
		}
	});
	
	window.view.show(window.location.pathname, true);
	
}

function View() {
	this.path = '';
	this.filepath = '/';
	
	this.views = {
		"/browse/files*": [
			{
				"cache":	false,
				"template": "/tpl/browse/files",
				"data":		function(path, args) { return "/files" + args},
				"target":	"#main",
				"history":	true
			}
		],
		"/play*" : [
			{
				"cache":	true,
				"template":	"/tpl/play",
				"data":		function (path, args) { return "/metadata" + args},
				"target":	"#player"
			}
		]
	};
	
	this.views['/'] = this.views['/browse/files*'];
	
	this.show = function(path, pushstate) {
		console.log(["Showing path: " + path, pushstate]);
		
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
		
		if( pushstate ) {
			this.path = path;
		}
		
		for( var i=0; i<view.length; i++) {
			if( pushstate && window.history.pushState && view[i].history ) {
				console.log("Push history");
				window.history.pushState({"path": path}, null, path);
			}
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
	
	this.xhttp = function(method, url, data) {
		$.ajax({
			"url": url,
			"type": method,
			"success": function(response) {
				if( response.success ) {
					view.show(view.path);
				} else {
					alert(response);
				}
			},
			"data": data
		});
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
				window.view.show($(this).attr('href'), true);
			}
		});
	}
}
