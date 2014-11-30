'use strict';

angular.module('myApp.percentage-filter', [])

.filter('percentage', ['$filter', function($filter) {
    return function(input, decimals) {
        return $filter('number')(input * 100, decimals) + '%';
    };
}]);