'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', function($scope){

  /* TODO: Typeracer Websocket implementation

      Open - Create player object (username, progress)
             and store in players Array

      Message - Receive player object (username, progress)
                from server and update progress bar

      Send - On completion of word, send player object
             to server for broadcasting

  */

  // WebSocket implementation
  $scope.status = 'Disconnected';
  $scope.username = '';
  $scope.socket = '';
  $scope.checked = 1;
  $scope.history = [];

  $scope.join = function () {
    var socket = new WebSocket('ws://localhost:8080/', 'echo-protocol');

    socket.addEventListener('open', function (event) {
      $scope.$apply(function () {
        $scope.status = 'Connected';
        $scope.checked = 0;
        $scope.username = $scope.new_username;
        socket.send(
            angular.toJson({new: $scope.new_username})
        );
      });
    });

    socket.addEventListener('close', function (event) {
      $scope.$apply(function () {
        $scope.status = 'Disconnected';
      });
    });

    socket.addEventListener('message', function (event) {
      $scope.$apply(function () {
        $scope.history.push(JSON.parse(event.data));
      });
    });

    $scope.socket = socket;
  };

  $scope.send = function () {
    $scope.socket.send(
        angular.toJson({
          username: $scope.username,
          message: $scope.message
        }));
    $scope.message = '';
  };



  // Text input/output module
  var current_span, total, start;
  $scope.raw = '';
  $scope.sanitized = [];
  $scope.$watch("raw", function(newValue) {
    $scope.sanitized = newValue.split(' ').filter(function (elem) {
      return elem.replace(/\s/gmi, '');
    }).map(function (elem) {
      return elem.trim();
    });
  });

  $scope.arr_wpm = [];
  $scope.wpm = 0;
  $scope.$watch('sanitized', function () {
    current_span = document.getElementById('sanitized').firstElementChild;
    if (current_span){
      current_span.className = current_span.className + ' active';
    }
  });

  total = start = new Date();

  angular.element(document.querySelector('#input')).on('keydown', function (event) {

    if (event.keyCode === 32) {
      var current = this.value.trim();

      if (current === current_span.innerHTML) {
        var end = new Date();
        $scope.arr_wpm.push(end - start);
        total += $scope.arr_wpm[$scope.arr_wpm.length - 1];
        start = end;
        current_span.className = 'word';
        current_span = current_span.nextElementSibling;
        if (current_span) {
          current_span.className = current_span.className + ' active';
        } else {
          for (var i = 0; i < $scope.arr_wpm.length - 1; i++) {
            var sum = $scope.arr_wpm[i] + $scope.arr_wpm[i + 1];
            $scope.$apply(function () {
              $scope.wpm = sum / $scope.arr_wpm.length;
            })
          }
        }
      } else {
        current_span.className = current_span.className + ' error';
      }
      this.value = '';
    }
  });
}]);