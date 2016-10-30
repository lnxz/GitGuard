<template>
<nav class="navbar navbar-inverse navbar-fixed-top">
    <div class="container-fluid">
        <div class="navbar-header">
            <a class="navbar-brand" href="#" style="width:200px">GIT Guard</a>
        </div>

        <!--update all your v-links here to point to the defined routes in index.js  -->
        <ul class="nav navbar-nav">
            <li><a v-link="'home'">Home</a></li>
            <li><a v-link="'stackbarviz'">StackBarVisualization</a></li>
            <li><a v-link="'heatmapviz'">HeatMapViz</a></li>
        </ul>
        <ul class="nav navbar-nav navbar-right">
            <li><a href="#"><span class="glyphicon glyphicon-user"></span> Sign Up</a></li>
            <li><a href="#"><span class="glyphicon glyphicon-log-in"></span> Login</a></li>
        </ul>
    </div>
</nav>

<div class="wrapper">
    <!-- Sidebar -->
    <div class="sidebar-wrapper">
        <ul class="sidebar-nav">
            <li>
                <a href="#">Repo 1</a>
            </li>
            <li>
                <a href="#">Repo 2</a>
            </li>
        </ul>
    </div>

    <div class="container">
        <!-- Page Content -->
        <div class="page-content-wrapper">
            <div class="container-fluid">
                <router-view></router-view>
            </div>
        </div>
        <!-- /#page-content-wrapper -->
    </div>
</template>

<style>
/*!
 * Start Bootstrap - Simple Sidebar (http://startbootstrap.com/)
 * Copyright 2013-2016 Start Bootstrap
 * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap/blob/gh-pages/LICENSE)
 */

body {
    overflow-x: hidden;
}


/* Toggle Styles */

div.wrapper {
    padding-left: 0;
    -webkit-transition: all 0.5s ease;
    -moz-transition: all 0.5s ease;
    -o-transition: all 0.5s ease;
    transition: all 0.5s ease;
}

div.wrapper.toggled {
    padding-left: 250px;
}

div.sidebar-wrapper {
    z-index: 1000;
    position: fixed;
    left: 200px;
    width: 0;
    height: 100%;
    margin-left: -200px;
    overflow-y: auto;
    background: #000;
    -webkit-transition: all 0.5s ease;
    -moz-transition: all 0.5s ease;
    -o-transition: all 0.5s ease;
    transition: all 0.5s ease;
}

div.wrapper.toggled div.sidebar-wrapper {
    width: 250px;
}

div.page-content-wrapper {
    width: 100%;
    position: absolute;
    padding: 15px;
}

div.wrapper.toggled div.page-content-wrapper {
    position: absolute;
    margin-right: -200px;
}


/* Sidebar Styles */

ul.sidebar-nav {
    position: absolute;
    top: 50px;
    width: 200px;
    margin: 0;
    padding: 0;
    list-style: none;
}

ul.sidebar-nav li {
    text-indent: 20px;
    line-height: 40px;
}

ul.sidebar-nav li a {
    display: block;
    text-decoration: none;
    color: #999999;
}

ul.sidebar-nav li a:hover {
    text-decoration: none;
    color: #fff;
    background: rgba(255, 255, 255, 0.2);
}

ul.sidebar-nav li a:active,
ul.sidebar-nav li a:focus {
    text-decoration: none;
}

ul.sidebar-nav>.sidebar-brand {
    height: 65px;
    font-size: 18px;
    line-height: 60px;
}

ul.sidebar-nav>.sidebar-brand a {
    color: #999999;
}

ul.sidebar-nav>.sidebar-brand a:hover {
    color: #fff;
    background: none;
}

@media(min-width:768px) {
    div.wrapper {
        margin-left: 200px;
    }
    div.wrapper.toggled {
        padding-left: 0;
    }
    div.sidebar-wrapper {
        width: 200px;
    }
    div.wrapper.toggled div.sidebar-wrapper {
        width: 0;
    }
    div.page-content-wrapper {
        margin-top: 50px;
        padding: 20px;
        position: relative;
    }
    div.wrapper.toggled div.page-content-wrapper {
        margin-top: 50px;
        position: relative;
        margin-right: 0;
    }
}
</style>
