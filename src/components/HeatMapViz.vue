<template>
<div class="row">
    <div class="col-md-10">
        <input class="inputUserRepo u-full-width" type="text" placeholder="tungnk1993/scrapy" v-model="userRepo">
    </div>
    <div class="col-md-2">
        <button class="btn btn-default" v-on:click="getViz">Visualize</button>
    </div>
</div>
<div id="viz"></div>
</template>

<script>
export default {

    //do nothing for now
    data() {
        return {
            userRepo: ''
        }
    },
    computed() {
        var marginTop = 30,
            marginLeft = 30,
            marginRight = 0,
            marginBottom = 100,
            width = 960 - marginLeft - marginRight,
            height = 430 - marginTop - marginBottom,
            gridSize = Math.floor(width / 24),
            legendElementWidth = gridSize * 2,
            buckets = 9,
            colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"],
            days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            times = ["12am", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"],
            defaultUrl = 'https://api.github.com/repos/',
            defaultUserRepo = 'tungnk1993/scrapy',
            defaultStats = '/stats/punch_card';

        var dayIndex = 0;
        var hourIndex = 1;
        var commitsIndex = 2;

        var tip = {};
        var svgContainer;
    },

    methods: {
        getViz() {
            this.initChart();
            this.getHourlyCommitsFromGithub(this.userRepo);

        },
        initChart() {
            var d3 = this.$d3;
            var svgContainer;

            svgContainer = d3.select(".chart").append("svg")
                .attr("width", this.width + this.marginLeft + this.marginRight)
                .attr("height", this.height + this.marginTop + this.marginBottom)
                .append("g")
                .attr("transform", "translate(" + this.marginLeft + "," + this.marginTop + ")");

            // svgContainer.call(tip);

            // var dayLabels = svgContainer.selectAll(".dayLabel")
            //     .data(this.days)
            //     .enter().append("text")
            //     .text(function(d) {
            //         return d;
            //     })
            //     .attr("x", 0)
            //     .attr("y", function(d, i) {
            //         return i * this.gridSize;
            //     })
            //     .style("text-anchor", "end")
            //     .attr("transform", "translate(-6," + this.gridSize / 1.5 + ")")
            //     .attr("class", function(d, i) {
            //         return ((i >= 1 && i <= 5) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis");
            //     });

            // var timeLabels = svgContainer.selectAll(".timeLabel")
            //     .data(this.times)
            //     .enter().append("text")
            //     .text(function(d) {
            //         return d;
            //     })
            //     .attr("x", function(d, i) {
            //         return i * this.gridSize;
            //     })
            //     .attr("y", 0)
            //     .style("text-anchor", "middle")
            //     .attr("transform", "translate(" + this.gridSize / 2 + ", -6)")
            //     .attr("class", function(d, i) {
            //         return "timeLabel mono axis axis-worktime";
            //     });

        },


        getHourlyCommitsFromGithub(userRepo) {
            if (userRepo.length <= 0) {
                userRepo = this.defaultUserRepo;
            }

            // var url = this.defaultUrl + userRepo + this.defaultStats;
            var url = 'https://api.github.com/repos/tungnk1993/scrapy/stats/punch_card';
            var d3 = this.$d3;
            console.log('Getting data from: ' + url);
            d3.json(url, function(json) {
                this.createHeatMap(json);
            });

        },

        createHeatMap(data) {
            var d3 = this.$d3;
            var colorScale = d3.scaleQuantile()
                .domain([0, this.buckets - 1, d3.max(data,
                    function(d) {
                        return d[commitsIndex];
                    })])
                .range(this.colors);


            var cards = svgContainer.selectAll(".hour")
                .data(data, function(d) {
                    return d[this.dayIndex] + ':' + d[this.hourIndex];
                });


            // EXIT old elements not present in new data.
            cards.exit().remove();


            cards.enter()
                .append("rect")
                .attr("x", function(d) {
                    return (d[this.hourIndex]) * this.gridSize;
                })
                .attr("y", function(d) {
                    return (d[this.dayIndex]) * this.gridSize;
                })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "hour bordered")
                .attr("width", this.gridSize)
                .attr("height", this.gridSize)
                .style("fill", this.colors[0])
                .merge(cards)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .transition().duration(1000)
                .style("fill", function(d) {
                    return colorScale(d[this.commitsIndex]);
                });

            var legend = svgContainer.selectAll(".legend")
                .data([0].concat(colorScale.quantiles()), function(d) {
                    return d;
                });

            legend.exit().remove();

            legend.enter().append("g")
                .attr("class", "legend");


            svgContainer.selectAll(".legend").append("rect")
                .attr("x", function(d, i) {
                    return this.legendElementWidth * i;
                })
                .attr("y", this.height)
                .attr("width", this.legendElementWidth)
                .attr("height", this.gridSize / 2)
                .style("fill", function(d, i) {
                    return this.colors[i];
                });

            svgContainer.selectAll(".legend").append("text")
                .attr("class", "mono")
                .text(function(d) {
                    return "≥ " + Math.round(d);
                })
                .attr("x", function(d, i) {
                    return this.legendElementWidth * i;
                })
                .attr("y", this.height + this.gridSize);
        },

    }
}
</script>

<style>
.axis text {
    font: 14px sans-serif;
}

.axis line,
.axis path {
    fill: none;
    stroke: #000;
    shape-rendering: crispEdges;
}

.axis--x path {
    display: none;
}

svg {
    border: solid 1px #ccc;
    font: 10px sans-serif;
    shape-rendering: crispEdges;
}
</style>
