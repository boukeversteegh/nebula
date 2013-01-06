function dragdrop_init() {
	var dropbox = document.getElementById("dropbox")
	 
	// init event handlers
	//dropbox.addEventListener("dragstart", dragStart, false);
	dropbox.addEventListener("dragenter", dragEnter, false);
	//dropbox.addEventListener("dragexit", dragExit, false);
	dropbox.addEventListener("dragover", noopHandler, false);
	dropbox.addEventListener("drop", drop, false);
	document.body.addEventListener("dragenter", function() { $('body').addClass('filedrag');} , false);
	document.body.addEventListener("drop", function() { $('body').removeClass('filedrag');} , false);
	console.log("Loaded");
}

function dragEnter(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	//evt.dataTransfer.setData('application/octet-stream', null);
	//console.log("drag Enter");
	$('body').addClass('filedrag');
	return false;
}

function noopHandler(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	return false;
}

function drop(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	 
	$('body').removeClass('filedrag');
	var files = evt.dataTransfer.files;
	var count = files.length;
	console.log(evt.dataTransfer.files);
	// Only call the handler if 1 or more files was dropped.
	if (count > 0)
		handleFiles(files);
	return false;
}

function handleFiles(files) {
	var filenames = [];
	
	for( var i=0; i < files.length; i++ ) {
		filenames.push(files[i].name);
	}
	
	$("#droplabel").html(filenames.join('<br/>'));
	
	var completed = [];
	var progresses = [];
	for( var i=0; i < files.length; i++ ) {
		var file = files[i];
		var xhr = new XMLHttpRequest();
		progresses.push(0);
		xhr.upload._index = i;
		xhr.open('POST', '/upload');


		var formData = new FormData();
		formData.append('upfile', file);
		formData.append('filename', file.name);
	
		xhr.upload.onprogress = function (event) {
			console.log(this);
			if (event.lengthComputable) {
				var progress = (event.loaded / event.total * 100 | 0);
				progresses[this._index] = progress;
				console.log(progresses);
			}
			
			var htmlprogress = [];
			for( var j=0; j<progresses.length; j++) {
				htmlprogress.push(files[j].name + ' ' + progresses[j] + "%");
			}
			$("#droplabel").html(htmlprogress.join('<br/>'));
		}
				
		xhr.onload = function(e) {
			completed.push(true);
			if( completed.length == files.length ) {
				console.log("All files uploaded");
				view.show(view.path);
			}
		};
		
		xhr.send(formData);
	}
}

function handleReaderLoad(evt) {
	/*document.getElementById("droplabel").innerHTML = "Done";
	var audio = document.getElementById("audio");
	var asource = document.getElementById("source");
	audio.src = evt.target.result;
	audio.pause();
	audio.load();*/
}
