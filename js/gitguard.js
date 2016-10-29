$(document).ready(function() {
	$('ul.sidebar-nav li').click(function(e) {
		loadRepo($(this).find("a").text());
	});
	
	//Load repo members, add to names array
	var names = new Array();
	for (var i = 0; i < 10; i++) {
		names[i] = "name " + (i + 1);
	}
	
	names.forEach(function(item) {
		var val = item.replace(/\s/g,"_");
		var elem = "<option value='" + val + "'>" + item + "</option>";
		$('#custom-headers').append(elem);
	});
	
	$('.searchable').multiSelect({
	  selectableHeader: "<input type='text' class='search-input' autocomplete='off'>",
	  selectionHeader: "<input type='text' class='search-input' autocomplete='off'>",
	  afterInit: function(ms){
		var that = this,
			$selectableSearch = that.$selectableUl.prev(),
			$selectionSearch = that.$selectionUl.prev(),
			selectableSearchString = '#'+that.$container.attr('id')+' .ms-elem-selectable:not(.ms-selected)',
			selectionSearchString = '#'+that.$container.attr('id')+' .ms-elem-selection.ms-selected';

		that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
		.on('keydown', function(e){
		  if (e.which === 40){
			that.$selectableUl.focus();
			return false;
		  }
		});

		that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
		.on('keydown', function(e){
		  if (e.which == 40){
			that.$selectionUl.focus();
			return false;
		  }
		});
	  },
	  afterSelect: function(values){
		this.qs1.cache();
		this.qs2.cache();
		//trigger reload graphs here
		loadVisualizations();
	  },
	  afterDeselect: function(values){
		this.qs1.cache();
		this.qs2.cache();
		//trigger reload graphs here
		loadVisualizations();
	  }
	});
});

function loadVisualizations() {
	var selected = new Array();
	var i = 0;
	$('.ms-selection > .ms-list li').each(function() {
		if ($(this).css('display') != 'none') {
			selected[i] = $(this).text();
			i++;
		}
	});
	//selected names are logged here, use them to plot viz
	console.log(selected);
}

function loadRepo(e) {
	$('#title').html(e);
}