import Vue from 'vue'
import App from './components/App.vue'

//import Vue components
import Home from './components/Home.vue'
import StackBarViz from './components/StackBarViz.vue'
import HeatMapViz from './components/HeatMapViz.vue'

import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import VueD3 from 'vue-d3'

Vue.use( VueResource )
Vue.use( VueRouter )
Vue.use( VueD3 )

Vue.http.headers.common[ 'Authorization' ] = 'Bearer ' + localStorage.getItem( 'id_token' );

export var router = new VueRouter()

//define all the routes here and update index.html
router.map( {
    '/home': {
        component: Home
    },
    '/stackbarviz': {
        component: StackBarViz
    },
    '/heatmapviz': {
        component: HeatMapViz
    },
} )

router.redirect( {
    '*': '/home'
} )

router.start( App, '#app' )
