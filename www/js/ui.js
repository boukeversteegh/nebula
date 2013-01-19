$(document).ready(function() {

	// PLAYER UI
	$('#player-stop').button({
		icons: {primary: "ui-icon-stop"}
	});
	$('#player-play').button({
		icons: {primary: "ui-icon-play"}
	});
	$('#player-pause').button({
		icons: {primary: "ui-icon-pause"}
	});

	$('#player-open-folder').button({
		text: false,
		icons: {primary: "ui-icon-folder-collapsed"}
	});
	$('#player-open-file').button({
		text: false,
		icons: {primary: "ui-icon-arrowthickstop-1-s"}
	});
	
	$("#player-progress").progressbar({"value":0.1, "max":100}).hover(
		function() { $(this).find('.ui-progressbar-value').addClass('ui-state-hover'); },
		function() { $(this).find('.ui-progressbar-value').removeClass('ui-state-hover') }
	);
	$('#tabs').css('margin-top', $('#top').height());
	//$('#tabs').css('margin-top', '100px');
	$('#tabs').tabs();
});
