function dragdrop_init() {
	var dropbox = document.getElementById("dropbox")
	 
	// init event handlers
	//dropbox.addEventListener("dragstart", dragStart, false);
	dropbox.addEventListener("dragenter", dragEnter, false);
	dropbox.addEventListener("dragexit", dragExit, false);
	dropbox.addEventListener("dragover", noopHandler, false);
	dropbox.addEventListener("drop", function(evt) {
		drop(evt, this.dataset.path);
		evt.stopPropagation();
		evt.preventDefault();
		return false;
	}
	, false);
	document.body.addEventListener("dragenter", function() { $('body').addClass('filedrag');} , false);
	document.body.addEventListener("drop", function() { $('body').removeClass('filedrag');} , false);
	
	$('#folders .folder a').bind('dragover', function() {
		$(this).addClass('ui-state-hover');//.removeClass('ui-state-default');
	});
	$('#folders .folder a').bind('dragleave', function() {
		$(this).removeClass('ui-state-hover');//.removeClass('ui-state-default');
	});
	
	$('#folders .folder').each(function() {
		this.addEventListener('drop', function(evt) {
			drop(evt, this.dataset.path);
			evt.stopPropagation();
			evt.preventDefault();
			return false;
		});
	});
}

function dragEnter(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	//evt.dataTransfer.setData('application/octet-stream', null);
	//console.log("drag Enter");
	$('body').addClass('filedrag');
	return false;
}

function dragExit(evt) {
	//$('body').removeClass('filedrag');
}

function noopHandler(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	return false;
}

function drop(evt, path) {
	evt.stopPropagation();
	evt.preventDefault();
	
	$('body').removeClass('filedrag');
	
	var handledir = (function(path) {
		return function(entries) {
			for( var i=0; i < entries.length; i++ ) {
				//console.log(entries[i]);
				var entry = entries[i];
				//console.log(entry.fullPath);
				if( entry.isFile ) {
					entry.file(  (function(entry) { return function(file) {
						window.uploader.upload(file, path, entry.fullPath);
					}})(entry));
				} else {
					var reader = entry.createReader();
					var direntry = reader.readEntries(handledir);
					while( direntry ) {
						reader.readEntries(handledir);
					}
				}
			}
		}
	})(path);
	
	if( evt.dataTransfer.items.length == 0 ) {
		if( evt.dataTransfer ) {
			var files = evt.dataTransfer.files;
			for( var i=0; i < files.length; i++ ) {
				//console.log(files[i]);
				window.uploader.upload(files[i], path);
			}
		}
	} else {
		var items = evt.dataTransfer.items;
		//console.log(evt.dataTransfer.items[0]);
		var uploads = [];
		for( var i=0; i < items.length; i++ ) {
			if( items[i].kind == "file" ) {
				if( items[i].webkitGetAsEntry ) {
					var entry = items[i].webkitGetAsEntry();
					if (entry.isFile) {
						console.log("is File");
						entry.file(  (function(entry) { return function(file) {
							window.uploader.upload(file, path, entry.fullPath);
						}})(entry));
					}
					if (entry.isDirectory ) {
						console.log("is Directory");
						//console.log(entry);
						var reader = entry.createReader();

						var direntry = reader.readEntries(handledir);
						while( direntry ) {
							reader.readEntries(handledir);
						}
					}
				}
			}
		}
	}
	
	
	return false;
}
