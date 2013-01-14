$(function() {
	init();
});

function init() {
	window.view = new View();
	window.uploader = new Uploader();
	
	$('.tabs a').click(function (e) {
		if( e.button == 0 ) {
			e.preventDefault();
			window.view.show($(this).attr('href'), true);
		}
	});
	
	$(window).bind('popstate', function(event) {
		// if the event has our history data on it, load the page fragment with AJAX
		var state = event.originalEvent.state;
		if (event.originalEvent.state) {
		    window.view.show(event.originalEvent.state.path, false);
		}
	});
	
	window.view.show(window.location.pathname, true);
}

function Uploader() {
	this.active = [];
	this.queue = [];
	this.maxconnections = 2;
	this.uploads = [];
	
	this.upload = function (file, path) {
		var xhr = new XMLHttpRequest();
		if( typeof path == "undefined" ) {
			path = window.view.filepath;
		}
		var targetpath = '/files' + path + '/' + file.name;
		xhr.open('PUT', targetpath);
		
		xhr.onuploadprogress = function (event) {
			if (event.lengthComputable) {
				this._upload.progress = (event.loaded / event.total * 100 | 0);
				this.loaded = event.loaded;
			}
			window.uploader.refresh();
		}

		xhr.upload.onprogress = function(event) {
			if (event.lengthComputable) {
                                this._upload.progress = (event.loaded / event.total * 100 | 0);
                                this.loaded = event.loaded;
                        }
                        window.uploader.refresh();
		}

		xhr.onload = function(event) {
			window.uploader.oncomplete(this._upload);
		}
		
		var upload = {
			"file": 		file,
			"path": 		path,
			"targetpath":	targetpath,
			"xhr":			xhr,
			"started":		false,
			"completed":	false,
			"progress":		0,
			"loaded":		0
		}
		xhr._upload = upload;
		xhr.upload._upload = upload;
		this.queue.push(upload);
		this.uploads.push(upload);
		this.processQueue();
	}
	
	this.processQueue = function() {
		// Remove completed uploads from active
		for( var i=0; i<this.active.length; i++) {
			var activeupload = this.active[i];
			if( activeupload.completed ) {
				this.active.splice(i, 1);
				i--;
			}
		}
		window.uploader.refresh();
		// Start uploads
		while( this.active.length < this.maxconnections && this.queue.length > 0 ) {
			var upload = this.queue.shift();
			this.active.push(upload);
			
			var formData = new FormData();
			formData.append('file', upload.file);
			
			upload.start = true;
			upload.xhr.send(formData);
		}
	}
	
	this.refresh = function() {
		var htmlprogress = '';
		if( this.uploads.length ) {
			for( var i=0; i<this.uploads.length; i++) {
				var upload = this.uploads[i];
				htmlprogress += '<li>' + upload.file.name + '(' + upload.file.size + ' bytes) ' + (upload.progress) + '%</li>';
			}
		} else {
			htmlprogress = "<i>Drop files here to upload</i>";
		}
		$("#uploads_progress").html(htmlprogress);
	}
	
	this.oncomplete = function(upload) {
		upload.completed = true;
		upload.progress = 100;
		window.uploader.refresh();
		window.uploader.processQueue();
		if( upload.path == view.filepath ) {
			view.show(view.path);
		}
	}
}

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
				"target":	"#playercontainer"
			}
		],
		"/view/lyrics*" : [
			{
				"cache":	true,
				"template":	"/www/tpl/lyrics.html",
				"data":		function (path, args) { return "/lyrics" + args},
				"target":	"#main"
			}
		]
	};
	
	this.views['/'] = this.views['/view/files*'];
	
	this.show = function(path, pushstate) {
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
			return;
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
					alert(response.error);
				}
			},
			"data": data
		});
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
