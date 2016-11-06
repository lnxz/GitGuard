$(document).ready(function () {
	$('ul.sidebar-nav li').click(function (e) {
		loadRepo($(this).find("a").text());
	});

	//Load repo members, add to names array
	var names = new Array();

	//return something like : https://github.com/scrapy/scrapy.git

	//var repoURL = giveMeRepoUrl();
	authorData = (function () {
		var json = null;
		$.ajax({
			'async': false,
			'global': false,
			'url': "http://ec2-54-169-173-47.ap-southeast-1.compute.amazonaws.com/authors?repo=https://github.com/scrapy/scrapy.git",
			'dataType': "json",
			'success': function (data) {
				json = data;
			}
		});
		return json;
	})();

	for (var i = 0; i < authorData.length; i++) {
		names[i] = authorData[i].email;
	}


	names.forEach(function (item) {
		var val = item.replace(/\s/g, "_");
		var elem = "<option value='" + val + "'>" + item + "</option>";
		$('#custom-headers').append(elem);
	});

	$('.searchable').multiSelect({
		selectableHeader: "<input type='text' class='search-input' autocomplete='off'>",
		selectionHeader: "<input type='text' class='search-input' autocomplete='off'>",
		afterInit: function (ms) {
			var that = this,
				$selectableSearch = that.$selectableUl.prev(),
				$selectionSearch = that.$selectionUl.prev(),
				selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)',
				selectionSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected';

			that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
				.on('keydown', function (e) {
					if (e.which === 40) {
						that.$selectableUl.focus();
						return false;
					}
				});

			that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
				.on('keydown', function (e) {
					if (e.which == 40) {
						that.$selectionUl.focus();
						return false;
					}
				});
		},
		afterSelect: function (values) {
			this.qs1.cache();
			this.qs2.cache();
			//trigger reload graphs here
			loadVisualizations();
		},
		afterDeselect: function (values) {
			this.qs1.cache();
			this.qs2.cache();
			//trigger reload graphs here
			loadVisualizations();
		}
	});
});

function loadRepo(e) {
	$('#title').html(e);
}


function loadVisualizations() {
	var selected = new Array();
	var selectedData = [];
	var minDate; var maxDate;
	var i = 0;
	$('.ms-selection > .ms-list li').each(function () {
		if ($(this).css('display') != 'none') {
			selected[i] = $(this).text();
			i++;
			updateMinMax($(this).text());
		}
	});

	for (var x = 0; x < selected.length; x++) {
		var series = x;
		selectedData.push(jsonDataFrom(selected[x], 1, minDate, maxDate, x));//selected[i] is email
	}

	plotChart(selected, selectedData);

	function isEmpty(str) {
		return (!str || 0 === str.length);
	}
	function updateMinMax(email) {
		//var repo =getRepoName();
		var rawData = (function () {
			var json = null;
			$.ajax({
				'async': false,
				'global': false,
				'url': "http://ec2-54-169-173-47.ap-southeast-1.compute.amazonaws.com/commits?repo=https://github.com/scrapy/scrapy.git&author=" + email.toString(),
				'dataType': "json",
				'success': function (data) {
					json = data;
				}
			});
			return json;
		})();

		rawData.sort(function (a, b) { var c = new Date(a.date); var d = new Date(b.date); return c - d; });
		var parseTime = d3.time.format("%d-%b-%y");
		var MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var rawDataMinDate = reconstructRawDate(new Date(rawData[0].date));
		var rawDataMaxDate = reconstructRawDate(new Date(rawData[rawData.length - 1].date));
		if (isEmpty(minDate) && isEmpty(maxDate)) {
			minDate = rawDataMinDate;
			maxDate = rawDataMaxDate;
		}
		else if (rawDataMinDate.getTime() < minDate.getTime()) {
			minDate = rawDataMinDate;
		}
		else if (rawDataMaxDate.getTime() > maxDate.getTime()) {
			maxDate = rawDataMaxDate;
		}
		function reconstructRawDate(dateObj) { //accept date object return parsedFormat of date
			var itemDateMthYearCombine = dateObj.getDate() + "-" + MONTH[dateObj.getMonth()] + "-" + dateObj.getFullYear().toString().substr(2, 2);
			return parseTime.parse(itemDateMthYearCombine);
		}



	}
}
function jsonDataFrom(email, TypeOfFormat, minDate, maxDate, series) {
	var formatedData;
	//var repo =getRepoName();
	var rawData = (function () {
		var json = null;
		$.ajax({
			'async': false,
			'global': false,
			'url': "http://ec2-54-169-173-47.ap-southeast-1.compute.amazonaws.com/commits?repo=https://github.com/scrapy/scrapy.git&author=" + email.toString(),
			'dataType': "json",
			'success': function (data) {
				json = data;
			}
		});
		return json;
	})();

	rawData.sort(function (a, b) { var c = new Date(a.date); var d = new Date(b.date); return c - d; });
	//console.log(rawData);

	if (TypeOfFormat == 1)//day per commit
	{ formatedData = commitPerDay(rawData, email, series); }

	if (TypeOfFormat == 2)//month per commit looks werid
	{ formatedData = commitPerMonth(rawData, email, series); }

	return formatedData;

	function commitPerDay(rawData, email, series) {
		var parseTime = d3.time.format("%d-%b-%y");
		var MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var individualFirstCommitDate = reconstructRawDate(new Date(rawData[0].date));
		var individualLastCommitDate = reconstructRawDate(new Date(rawData[rawData.length - 1].date));
		function reconstructRawDate(dateObj) { //accept date object return parsedFormat of date
			var itemDateMthYearCombine = dateObj.getDate() + "-" + MONTH[dateObj.getMonth()] + "-" + dateObj.getFullYear().toString().substr(2, 2);
			return parseTime.parse(itemDateMthYearCombine);
		}

		function setData(start, end, series) {
			var array = [];
			var lineSeries = series;
			var startDate = new Date(start);
			var day = 0;
			if (startDate == end) {
				var commits = 0;
				for (var i = 0; i < rawData.length; i++) {
					if (reconstructRawDate(new Date(rawData[i].date)).toString() == startDate.toString()) { //same date
						day++;
						commits++; //increment by 1 commit
					}
				}
				array.push({ "x": reconstructRawDate(startDate), "y": commits });
			}
			else {
				var i = 0;
				//check startdate is always smaller than end, because:
				//if(startDate==end) cover if its equal
				//sort is ascending order end cfm bigger than startdate
				while (startDate <= end) {
					var commits = 0;
					// loop rawData(a lot)
					for (; i < rawData.length; i++) {
						//check if rawData date equals startDate(current date)
						if (reconstructRawDate(new Date(rawData[i].date)).toString() == startDate.toString()) {
							commits++; //increment by 1 commit
						}
						else {
							//if nt equal means, no point looping. cos futher down the loop cfm is some larger dates.
							//i is use to keep track of current position
							break;
						}
					}
					array.push({ "series": series, "label": reconstructRawDate(startDate), "x": reconstructRawDate(startDate), "y": commits });
					day++;
					startDate.setDate(startDate.getDate() + 1);
				}
			}
			return array;
		}

		return finalData = {
			"area": false,
			"key": email,
			"values": setData(minDate, maxDate)
		};
	}

}
function plotChart(selected, selectedData) {
	console.log(selected);
	nv.addGraph(function () {
		var chart = nv.models.lineWithFocusChart();
		chart.xAxis.axisLabel('Date').tickFormat(function (d) { return d3.time.format('%d-%b-%y')(new Date(d)); });
		chart.focusHeight(50 + 20);
		chart.focusMargin({ "bottom": 20 + 20 });
		chart.x2Axis.axisLabel('Date').tickFormat(function (d) { return d3.time.format('%d-%b-%y')(new Date(d)); });
		chart.yAxis.tickFormat(d3.format('d'));
		chart.y2Axis.tickFormat(d3.format('d'));
		chart.useInteractiveGuideline(true);

		//chart.tooltip: {contentGenerator: function(d) { return '<h3>HELLO WORLD</h3>'; }}                

		d3.select('#chart svg')
			.datum(selectedData)
			.call(chart);

		nv.utils.windowResize(chart.update);

		return chart;
	});



}
