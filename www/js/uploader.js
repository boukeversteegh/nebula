function Uploader() {
	this.active = [];
	this.queue = [];
	this.maxconnections = 2;
	this.uploads = [];
	this.template = 
		'{{#data}}' + 
			'{{#uploads.0}}' +
			'<table width="100%">' +
				'{{#uploads}}'+
				'<tr id="upload-{{index}}" class="upload" data-path="{{path}}/{{file}}">'+
					'<td><div class="path inline"><a class="showview" href="/view/files{{path}}">{{path}}</div></td>'+
					'<td><a class="showview" href="/view/play{{path}}/{{file}}">{{file}}</a></td>'+
					'<td>{{hsize}}</td>' +
					'<td><div class="progress ui-state-default"></div></td>'+
				'</tr>'+
				'{{/uploads}}'+
			'</table>'+
			'{{/uploads.0}}'+
			'{{^uploads}}Drop files here to upload{{/uploads}}'+
		'{{/data}}';
	
	this.upload = function (file, path, fullpath) {
		var xhr = new XMLHttpRequest();
		if( typeof path == "undefined" ) {
			path = window.view.filepath;
		}
		
		if( typeof fullpath == "undefined" ) {
			var filepath = '/' + file.name;
		} else {
			var filepath = fullpath;
		}
		
		var targetpath = '/files' + path + filepath;
		console.log(" " + targetpath);
		
		
		//var targetpath = '/files' + path + '/' + file.name;
		xhr.open('PUT', targetpath);
		
		/*xhr.onuploadprogress = function (event) {
			if (event.lengthComputable) {
				this._upload.progress = (event.loaded / event.total * 100 | 0);
				this._upload.loaded = event.loaded;
			}
			window.uploader.refresh();
		}*/

		xhr.upload.onprogress = function(event) {
			if (event.lengthComputable) {
				this._upload.progress = (event.loaded / event.total * 100 | 0);
				this._upload.loaded = event.loaded;
			}
			window.uploader.refresh(false);
		}

		xhr.onload = function(event) {
			window.uploader.oncomplete(this._upload);
		}
		
		var upload = {
			"file": 			file,
			"path": 			path,
			"targetpath":		targetpath,
			"xhr":				xhr,
			"started":			false,
			"timestarted":		null,
			"timecompleted":	null,
			"completed":		false,
			"progress":			0,
			"loaded":			0
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
			var upload = this.queue.shift();2
			this.active.push(upload);
			
			var formData = new FormData();
			formData.append('file', upload.file);
			formData.append('path', upload.path);
			upload.started = true;
			upload.timestarted = (new Date().getTime() / 1000);
			upload.xhr.send(formData);
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
		if( typeof fullrefresh == 'undefined' ) {
			fullrefresh = true;
		}
		var container = $('#uploads_progress');
		var htmlprogress = '';
		var tuploads = [];
		var tdata = {'data':{'uploads':[]}};
		if( this.uploads.length ) {
			var tuploads = tdata.data.uploads;
			for( var i=0; i<this.uploads.length; i++) {
				var upload = this.uploads[i];
				var tupload = {
					/*   /files/pathabc/file.mp3 --> /pathabc */
					path: '/'+upload.targetpath.split('/').slice(2, -1).join('/'),
					file: upload.file.name,
					size: upload.file.size,
					hsize: this.getHumanSize(upload.file.size),
					completed: upload.completed,
					progress: upload.progress,
					started: upload.started
				};
				
				tuploads.push(tupload);
				if( fullrefresh ) {
					htmlprogress = $(Mustache.render(this.template, tdata));
					htmlprogress.find('.progress')
						.progressbar({'max': 100, 'value': tupload.progress})
							.css({'height': '1em', 'min-width': '50px'})
						.find('.ui-progressbar-value')
							.addClass('ui-state-hover');
					htmlprogress.find('.path').button({icons:{primary:'ui-icon-folder-collapsed'}});
				} else {
					console.log('partial');
					container.find('.upload').eq(i).find('.progress').progressbar('option', {'value': tupload.progress});
				}
			}
		} else {
			htmlprogress = "<i>Drop files here to upload</i>";
		}
		if( fullrefresh ) {
			container.html(htmlprogress);
			view.rebind(container);
		}
	}
	
	this.oncomplete = function(upload) {
		upload.completed = true;
		upload.progress = 100;
		upload.timecompleted = (new Date().getTime() / 1000);
		window.uploader.refresh(false);
		window.uploader.processQueue();
		console.log(upload);
		if( upload.path == view.filepath ) {
			view.show(view.path, false, true);
		}
	}
}
