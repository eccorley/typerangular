'use strict';

angular.module('myApp.sanitize-filter', [])

.filter('sanitize', [function() {
  return function(text) {
    var sanitized = [];
    text.split(' ').filter(function (elem) {
      return elem.replace(/\s/gmi, '');
    }).map(function (elem) {
      return elem.trim();
    }).forEach(function (elem) {
      var span = document.createElement('span');
      span.innerHTML = elem;
      sanitized.push(span.outerHTML);
    });
    return sanitized.join();
  };
}]);
