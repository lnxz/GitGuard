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

	authorData.forEach(function (item) {
    var email = item.email
		var val = email.replace(/\s/g, "_");
		var elem = "<option>" + item.name + ", " + item.email + "</option>";
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
      var content = $(this).text().split(' ');
			selected[i] = content[content.length - 1];
			i++;
			updateMinMax(content[content.length - 1]);
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
	//rawData = varPablohoffmanJSON;

	rawData.sort(function (a, b) { var c = new Date(a.date); var d = new Date(b.date); return c - d; });
	//console.log(rawData);

	if (TypeOfFormat == 1)//day per commit
	{ formatedData = commitPerDay(rawData, email, series); }

	return formatedData;

	function commitPerDay(rawData, email, series) {

		var individualFirstCommitDate = reconstructRawDate(new Date(rawData[0].date));
		var individualLastCommitDate = reconstructRawDate(new Date(rawData[rawData.length - 1].date));

		function setData(start, end, series) {
			var array = [];
			var lineSeries = series;
			var startDate = new Date(start);
			var day = 0;
			if (startDate == end) {
				var commits = 0;
				for (var i = 0; i < rawData.length; i++) {
					if (reconstructRawDate(new Date(rawData[i].date)).toString() == startDate.toString()) { //same date
						commits++; //increment by 1 commit
						arrayOfCommitKey.push(rawData[i].commit);
					}
				}
				array.push({ "commitkey": arrayOfCommitKey, "series": series, "label": reconstructRawDate(startDate), "x": reconstructRawDate(startDate), "y": commits });
			}
			else {
				var i = 0;
				//check startdate is always smaller than end, because:
				//if(startDate==end) cover if its equal
				//sort is ascending order end cfm bigger than startdate
				while (startDate <= end) {
					var commits = 0;
					var arrayOfCommitKey = [];
					// loop rawData(a lot)
					for (; i < rawData.length; i++) {
						//check if rawData date equals startDate(current date)
						if (reconstructRawDate(new Date(rawData[i].date)).toString() == startDate.toString()) {
							commits++; //increment by 1 commit
							arrayOfCommitKey.push(rawData[i].commit);
						}
						else {
							//if nt equal means, no point looping. cos futher down the loop cfm is some larger dates.
							//i is use to keep track of current position
							break;
						}
					}
					array.push({ "commitkey": arrayOfCommitKey, "series": series, "label": reconstructRawDate(startDate), "x": reconstructRawDate(startDate), "y": commits });
					day++;
					startDate.setDate(startDate.getDate() + 1);
				}
			}
			return array;
		}
		
		return finalData = {
			"area": false,
			"key": email,
			"values": setData(minDate, maxDate),
			"firstCommitDate": individualFirstCommitDate,
			"lastCommitDate": individualLastCommitDate,
			"totalcommit": rawData.length,

		};
	}

}

function plotChart(selected, selectedData) {
	var MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	nv.addGraph(function () {
		var chart = nv.models.lineWithFocusChart();
		chart.xAxis.axisLabel('Date').tickFormat(function (d) { return d3.time.format('%d-%b-%y')(new Date(d)); });
		chart.focusHeight(50 + 20);
		chart.focusMargin({ "bottom": 20 + 20 });
		chart.x2Axis.axisLabel('Date').tickFormat(function (d) { return d3.time.format('%d-%b-%y')(new Date(d)); });
		chart.yAxis.tickFormat(d3.format('d'));
		chart.y2Axis.tickFormat(d3.format('d'));
		if (selectedData.length > 0) {
			chart.lines.dispatch.on('elementClick', function (e) {

				console.log("e[0].series.totalcommit.toString() : " + e[0].series.totalcommit.toString());
				console.log("e " + e);
				console.log("total number of points: " + e.length);
				console.log("correct email address: " + e[0].series.key);
				console.log("total number of commit hash code: " + e[0].point.commitkey.length);
				console.log("total number of commit hash code: " + e[0].point.commitkey.toString());
				console.log("correct label (x-axis point): " + e[0].point.label);
				console.log("correct label (x-axis point): " + e[0].point.label.toString());
				var xAxisDate = new Date(e[0].point.label);
				var xAxisFormatedDate = xAxisDate.getDate() + " " + MONTH[xAxisDate.getMonth()] + " " + xAxisDate.getFullYear();
				console.log("correct label (x-axis point): " + xAxisDate.getDate() + " " + MONTH[xAxisDate.getMonth()] + " " + xAxisDate.getFullYear());


				$(document).ready(function () {
					var mytable = $('#tblItems').DataTable({
						"paging": true,
						"lengthChange": false,
						"searching": false,
						"ordering": true,
						"info": true,
						"autoWidth": false,
						"sDom": 'lfrtip',
						"destroy": true
					});
					mytable.clear();
					for (var x = 0; x < selectedData.length; x++) {
						var xAxisDate = new Date(e[x].point.label);
						var xAxisFormatedDate = xAxisDate.getDate() + " " + MONTH[xAxisDate.getMonth()] + " " + xAxisDate.getFullYear();
						var allCommitKey = "";
						for (var k = 0; k < e[x].point.commitkey.length; k++) {
							allCommitKey += e[x].point.commitkey[k] + "<br>";
						}
						var commitOverTotalCommits = e[x].point.commitkey.length.toString() + " / " + e[x].series.totalcommit.toString();
						mytable.row.add([x + 1, e[x].series.key, xAxisFormatedDate, commitOverTotalCommits, allCommitKey]);
					}
					mytable.draw();
				});




			});
		}
		else if (selectedData.length == 0) {
			console.log("in here");
			$(document).ready(function () {
				var oTable = $('#tblItems').dataTable();

				// Immediately 'nuke' the current rows (perhaps waiting for an Ajax callback...)
				oTable.fnClearTable();
			});
			chart.noData("Nothing to see here.");

		}
		chart.useInteractiveGuideline(true);

		d3.select('#chart svg')
			.datum(selectedData)
			.call(chart);

		nv.utils.windowResize(chart.update);

		return chart;
	});



}
function reconstructRawDate(dateObj) { //accept date object return parsedFormat of date
	var parseTime = d3.time.format("%d-%b-%y");
	var MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var itemDateMthYearCombine = dateObj.getDate() + "-" + MONTH[dateObj.getMonth()] + "-" + dateObj.getFullYear().toString().substr(2, 2);
	return parseTime.parse(itemDateMthYearCombine);
}
