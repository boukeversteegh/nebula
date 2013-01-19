function Uploader() {
	this.active = [];
	this.queue = [];
	this.maxconnections = 2;
	this.uploads = [];
	
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
			formData.append('path', upload.path);
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
			view.show(view.path, false, true);
		}
	}
}
