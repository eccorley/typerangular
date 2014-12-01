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
  $scope.players = [];
  $scope.socket = '';
  $scope.checked = 1;
  $scope.history = [];
  $scope.progress = 0;
  $scope.passage = '';

  $scope.join = function () {
    var socket = new WebSocket('ws://localhost:8080/', 'chat-protocol');

    socket.addEventListener('open', function (event) {
      $scope.$apply(function () {
        $scope.status = 'Connected';
        $scope.checked = 0;
        $scope.username = $scope.new_username;
        $scope.progress = 0;
        if (current_span) {
          current_span.className = 'word';
          current_span = document.getElementById('sanitized').firstElementChild;
        }
        socket.send(
            angular.toJson({
              type: 'player',
              playerName: $scope.new_username,
              progress: 0
            }));
      });
    });

    socket.addEventListener('close', function (event) {
      $scope.$apply(function () {
        $scope.status = 'Disconnected';
      });
    });

    socket.addEventListener('message', function (event) {
      $scope.$apply(function () {
        var message = JSON.parse(event.data);
        switch (message.type) {
          case 'progress':
            $scope.players[message.playerIndex - 1].progress = message.progress;
            break;
          case 'passage':
            $scope.raw = message.passage;
            $scope.sanitized = $scope.sanitize(message.passage);
            break;
          case 'message':
            $scope.history.push(message);
            break;
          case 'history':
            message.data.forEach(function (msg) {
              $scope.history.push(msg);
            });
            break;
          default:
            if (message.playerName) {
              break;
            } else if (message.length) {
              $scope.players = message;
            }
        }
      });
    });

    $scope.socket = socket;
    $scope.$watch("raw", function(newValue) {
      $scope.socket.send(
          angular.toJson({
            type: 'passage',
            passage: newValue
          })
      );
    });
  };


  $scope.sendMessage = function () {
    $scope.socket.send(
        angular.toJson({
          type: 'message',
          username: $scope.username,
          message: $scope.message
        }));
    $scope.message = '';
  };

  $scope.sanitize = function (rawText) {
    return rawText.split(' ').filter(function (elem) {
      return elem.replace(/\s/gmi, '');
    }).map(function (elem) {
      return elem.trim();
    });
  };



  // Text input/output module
  var current_span, total, start;
  $scope.raw = "Miss Spink and Miss Forcible lived in the flat below Coraline's, on the ground floor. They were both old and round, and they lived in their flat with a number of ageing highland terriers who had names like Hamish and Andrew and Jock. Once upon a time Miss Spink and Miss Forcible had been actresses, as Miss Spink told Coraline the first time she met her.";
  $scope.sanitized = $scope.sanitize($scope.raw);
  $scope.arr_wpm = [];
  $scope.wpm = 0;

  total = start = new Date();

  angular.element(document.querySelector('#input')).on('keydown', function (event) {
    if (typeof current_span == "null") {
      // todo: handle no raw text scenario
      console.log("Please Enter Text");
    }
    if (typeof current_span == "undefined") {
      current_span = document.getElementById('sanitized').firstElementChild;
    }
    current_span.className = current_span.className + ' active';

    if (event.keyCode === 32) {
      var current = this.value.trim();
      var passageSpans =  angular.element(document.querySelector('#sanitized').children);

      if (current === current_span.innerHTML) {

        var end = new Date();
        $scope.arr_wpm.push(end - start);

        total += $scope.arr_wpm[$scope.arr_wpm.length - 1];
        start = end;

        current_span.className = 'word';

        $scope.$apply(function () {
          $scope.progress = (Array.prototype.indexOf.call(passageSpans, current_span) + 1) / passageSpans.length;
        });



        if ($scope.socket) {
          $scope.socket.send(
              angular.toJson({
                type: 'progress',
                playerIndex: $scope.players.filter(function (val) {
                  return val.playerName = $scope.username;
                })[0].playerIndex,
                username: $scope.username,
                progress: $scope.progress
              }));
        }


        current_span = current_span.nextElementSibling;

        if (current_span) {
          current_span.className = current_span.className + ' active';
        } else {
          for (var i = 0; i < $scope.arr_wpm.length - 1; i++) {
            $scope.arr_wpm = $scope.arr_wpm.slice(1);
            if ($scope.arr_wpm[i+1]) {
              var sum = $scope.arr_wpm[i] + $scope.arr_wpm[i + 1];
            }
            $scope.$apply(function () {
              $scope.wpm = sum / $scope.arr_wpm.length;
            })
          }
        }
      } else {
        current_span.className = current_span.className + ' word-error';
      }
      this.value = '';
    }
  });
}]);