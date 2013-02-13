function Uploader() {
	this.active = [];
	this.queue = [];
	this.maxconnections = 1;
	this.uploads = [];
	
	this.upload = function (file, path, fullpath) {
		var xhr = new XMLHttpRequest();
		if( typeof path == "undefined" ) {
			path = window.files.path;
		}
		
		if( typeof fullpath == "undefined" ) {
			var filepath = '/' + file.name;
			var parent = path;
		} else {
			var parent = path + fullpath.split('/').slice(0,-1).join('/');
			var filepath = fullpath;
		}
		
		var targetpath = '/files' + path + filepath;
		
		xhr.open('PUT', targetpath);

		xhr.upload.onprogress = function(event) {
			if (event.lengthComputable) {
				var progress = (event.loaded / event.total * 100 | 0);
				if( progress < 100 && progress - this._upload.uploaddata.progress < 10 ) {
					return;
				}
				this._upload.uploaddata.progress = progress
				this._upload.uploaddata.loaded = event.loaded;
			}
			window.uploader.refresh(false);
		}

		xhr.onload = function(event) {
			window.uploader.oncomplete(this._upload);
		}
		
		var upload = {
			// Same fields as normal File.
			"file": 	file.name,
			"size":		file.size, 
			"path": 	path + filepath,
			"parent":	parent,
			"section":	path,
			"uploaddata":	{
				"filehandle":		file,
				"xhr":				xhr,
				"started":			false,
				"timestarted":		null,
				"timecompleted":	null,
				"completed":		false,
				"progress":			0,
				"loaded":			0
			}
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
			if( activeupload.uploaddata.completed ) {
				this.active.splice(i, 1);
				i--;
			}
		}
		window.uploader.refresh(false);
		// Start uploads
		while( this.active.length < this.maxconnections && this.queue.length > 0 ) {
			var item = this.queue.shift();2
			this.active.push(item);
			
			var formData = new FormData();
			formData.append('file', item.uploaddata.filehandle);
			formData.append('path', item.section);
			item.uploaddata.started = true;
			item.uploaddata.timestarted = (new Date().getTime() / 1000);
			item.uploaddata.xhr.send(formData);
		}
	}
	
	this.getHumanSize = function(size) {
		var hsize = size;
		var units = ['Kb','Mb','Gb','Tb','Pb','Eb'];
		var unit = 'b';
		while( hsize >= 1024 && units.length > 1) {
			unit = units.shift();
			hsize/=1024;
		}
		return Math.round(hsize*10)/10 + unit;
	}
	
	this.refresh = function(fullrefresh /*=true*/) {
		var self = this;
		if( typeof fullrefresh == 'undefined' ) {
			fullrefresh = true;
		}
		var container		= $('#uploads_progress');
		var htmlprogress	= '';
		var tuploads		= [];
		// Template Data
		var tdata			= {
			'data':	{
				'uploads': tuploads
			}
		};
		
		for( var i=0; i<this.uploads.length; i++) {
			var upload = this.uploads[i];
			var tupload = {
				path:			upload.path,
				parent:			upload.parent,
				file:			upload.file,
				size:			upload.size,
				hsize:			this.getHumanSize(upload.size),
				uploadindex:	i,
				uploaddata:		{
					index:		i,
					completed:	upload.uploaddata.completed,
					progress:	upload.uploaddata.progress,
					started:	upload.uploaddata.started,
					loaded:		upload.uploaddata.loaded
				}
			};
			
			tuploads.push(tupload);

			if( !fullrefresh) {
				container.find('.upload').eq(i).find('.progress').progressbar('option', {'value': tupload.uploaddata.progress});
			}
		}
		if( fullrefresh ) {
			view.render('/www/tpl/uploads.html', tdata, '#uploads_progress').then(
				function() {
					$(container).find('.progress').each(function(index) {
						$(this)
							.progressbar({'max': 100, 'value': self.get(index).uploaddata.progress})
								.css({'height': '1em', 'min-width': '50px'})
							.find('.ui-progressbar-value')
								.addClass('ui-state-hover');
					});
					$(container).find('.uploader-showfolder').button({icons:{primary:'ui-icon-folder-collapsed'}});
					$(container).find('.uploader-play').button({
						icons: {primary: 'ui-icon-play'},
						text: false
					})
				}
			);
			view.rebind(container);
		}
	}
	
	this.get = function(index) {
		return this.uploads[index];
	}
	
	this.oncomplete = function(item) {
		item.uploaddata.completed = true;
		item.uploaddata.progress = 100;
		item.uploaddata.timecompleted = (new Date().getTime() / 1000);
		window.uploader.processQueue();
		if( item.parent == window.files.path || item.section == window.files.path ) {
			view.show(view.path, false, true);
		}
	}

	this.clear = function() {
		if( this.uploads.length == 0 ) {
			return;
		}

		var newuploads = [];
		for( var i=0; i < this.uploads.length; i++ ) {
			var upload = this.uploads[i];
			if( upload.uploaddata.completed == false ) {
				newuploads.push(upload);
			}
		}
		this.uploads = newuploads;
		this.refresh();
	}
	
	this.test = function() {
		this.uploads = [
			{
				file:	"foobar.mp3",
				path:	"/Test/foobar.mp3",
				parent: "/Test",
				size: 123234,
				uploaddata:	{
					file: {
						name: "foobar.mp3",
						size: 123234
					},
					progress: 100,
					completed: true
				}
			},
			{
				file:	"foobar2.mp3",
				path:	"/Test/sub/foobar2.mp3",
				parent: "/Test/sub",
				size: 1453421,
				uploaddata:	{
					file: {
						name: "foobar2.mp3",
						size: 1453421
					},
					progress: 30,
					completed:false
				}
			}
		];
		this.refresh();
	}
}
