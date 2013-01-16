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
	});
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
			console.log(this);
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
	
	var files = evt.dataTransfer.files;
	for( var i=0; i < files.length; i++ ) {
		window.uploader.upload(files[i], path);
	}
	return false;
}
