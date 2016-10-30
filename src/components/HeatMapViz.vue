<template>
<div class="row">
    <div class="col-md-10">
        <input class="inputUserRepo u-full-width" type="text" placeholder="tungnk1993/scrapy" v-model="userRepo">
    </div>
    <div class="col-md-2">
        <button class="btn btn-default" v-on:click="getViz">Visualize</button>
    </div>
    <keep-alive>
        <div class="col-md-12 viz"></div>
        <keep-alive>
</div>
</template>

<script>
import HeatMapViz from '../store/HeatMapViz'
export default {

    //do nothing for now
    data() {
        return {
            userRepo: ''
        }
    },

    methods: {
        getViz() {
            //create a variable to hold the d3 instance from vue context for this component
            let d3 = this.$d3;

            //pass the d3 reference the functions
            HeatMapViz.initChart(d3);
            HeatMapViz.getHourlyCommitsFromGithub(d3, this.userRepo);

        }
    }
}
</script>

<style>
.container {
    margin-top: 40px;
}

.content {
    margin-top: 10px;
    border: 1px solid #E1E1E1;
    border-radius: 4px;
}

rect.bordered {
    stroke: #E6E6E6;
    stroke-width: 2px;
}

text.mono {
    font-size: 9pt;
    font-family: Consolas, courier;
    fill: #aaa;
}

text.axis-workweek {
    fill: #000;
}

text.axis-worktime {
    fill: #000;
}
</style>
}
</style>
