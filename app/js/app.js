'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers',

    'rzModule', // angularjs-slider

    'ui.bootstrap'
]).
config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/greenhouses', {
            templateUrl: 'partials/greenhouses-list.html',
            controller: 'GreenhousesListController'
        });

        $routeProvider.when('/greenhouses/remote/:remoteName', {
            templateUrl: 'partials/greenhouses-list.html',
            controller: 'GreenhousesListController'
        });

        $routeProvider.when('/greenhouses/simulator/:simulatorName', {
            templateUrl: 'partials/greenhouses-list.html',
            controller: 'GreenhousesListController'
        });

        $routeProvider.otherwise({
            redirectTo: '/greenhouses'
        });
    }
]);