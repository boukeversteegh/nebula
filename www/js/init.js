$(function() {
	init();
});

function init() {
	
	window.view = new View();
	window.uploader = new Uploader();
	
	window.player = new Player();
	window.playerview = new PlayerView(window.player);
	window.playerview.init();

	window.files = new Files(window.player);
	window.player.init('#player', '#jplayer');
	
	var userplaylist = new Playlist(window.player, 'user:default');
	var playlistview = new PlaylistView(userplaylist, '#playlist');
	playlistview.refresh();

	var searchplaylist = new Playlist(window.player, 'search:default');
	var search = new Search();
	var searchplaylistview = new PlaylistView(searchplaylist, '#search-playlist');
	var searchview = new SearchView(search, searchplaylistview);
	
	searchview.init();
	
	window.uploader.refresh();

	window.nebula = new Nebula();
	nebula.player = window.player;

	nebula.addPlaylist(userplaylist);

	nebula.userplaylist	= userplaylist;
	nebula.files		= window.files;
	nebula.view			= window.view;
	nebula.search		= search;
	nebula.uploader		= window.uploader;
	nebula.init();
	
	window.debug = {
		searchplaylistview: searchplaylistview,
		search: search,
		searchplaylist: searchplaylist
	}
	

	$('#main').css('margin-top', $('#top').height());
	$('#tabs').buttonset();
	$('#tabs input').each(function() {
		$(this).click( function() {
			var tabname = $(this).val();
			var tabdomid = '#tab_' + tabname;
			nebula.tab = tabname;
			this.checked = true;
    		$(this).button("refresh");
			$('[role=tab]').not(tabdomid).hide();
			$(tabdomid).show();
			
			return false;
		});
	});
	$('#tab-btn-search').click(function(){
		$('#search-query').focus();
	})
	
	//$('[for=tab-btn-files]').addClass('ui-state-active');
	$('#tab-btn-files').trigger('click');
	$('#tabs input').filter(':eq(3), :eq(4), :eq(5)').button('option', 'disabled', true);//.addClass('ui-state-disabled');
	
	window.view.show(window.location.pathname, true);
	
	$(window).scroll(function() {
		var currentstate = window.history.state;
		currentstate.scrollY = window.scrollY;
		currentstate.scrollX = window.scrollX;
		window.history.replaceState(currentstate);
	});

	$(window).bind('popstate', function(event) {
		if (event.originalEvent.state) {
			var state = event.originalEvent.state;
		    window.view.show(state.path, false, {state:state});
		}
	});
	
	
}

