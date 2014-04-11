angular.module("meancalculator", ['mgcrea.ngStrap', 'xeditable'])
.config(['$compileProvider', function($compileProvider){
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/);
}])
.config(['$alertProvider', function($alertProvider) {
  angular.extend($alertProvider.defaults, {
    container: '#alert-container',
    duration: 3
  });
}])
.controller("MeanCalculator", ['$scope', '$document', '$alert', '$sce', function($scope, $document, $alert, $sce) {
  $scope.dataset = {};
  $scope.dataset.entries = [];
  $scope.dataset.add = function(newEntry) {
    var newEntry = angular.copy(newEntry);
    newEntry['weight'] = +(newEntry['weight']);
    newEntry['value'] = +(newEntry['value']);
    newEntry['enabled'] = true;
    $scope.dataset.entries.unshift(newEntry);
  };
  $scope.dataset.remove = function(index) {
    $scope.dataset.entries.splice(index, 1);
  };
  $scope.dataset.sumOfWeights = function() {
    var sum = 0;
    for(var i = 0; i < $scope.dataset.entries.length; i++) {
      if(!$scope.dataset.entries[i].enabled) continue;
      sum += $scope.dataset.entries[i].weight;
    }
    return sum;
  };
  $scope.dataset.sumOfWeightedValues = function() {
    var sum = 0;
    for(var i = 0; i < $scope.dataset.entries.length; i++) {
      if(!$scope.dataset.entries[i].enabled) continue;
      sum += $scope.dataset.entries[i].weight * $scope.dataset.entries[i].value;
    }
    return sum;
  };
  $scope.dataset.weightedMean = function() {
    var sumValues = 0;
    var sumWeights = 0;
    for(var i = 0; i < $scope.dataset.entries.length; i++) {
      if(!$scope.dataset.entries[i].enabled) continue;
      sumValues += $scope.dataset.entries[i].weight * $scope.dataset.entries[i].value;
      sumWeights += $scope.dataset.entries[i].weight;
    }
    if(sumWeights == 0) {
      return "--";
    }
    return sumValues/sumWeights;
  };
  function updateDonwlodLink() {
    $scope.downloadLink = 'data:application/json;charset=utf-8,' + encodeURIComponent(angular.toJson($scope.dataset.entries));
  }
  $scope.updateDownloadLink = updateDonwlodLink;
  function importEntries() {
    var fileInput = $document[0].getElementById('importFile');
    if(fileInput.files.length < 1) {
      $alert({title: "Error:", content: $sce.trustAsHtml("Please select a valid JSON file"), type: 'danger'});
    } else {
      var reader = new FileReader();
      reader.onload = function(e) { 
        var text = reader['result'];
        try {
          var importedEntries = JSON.parse(text);
        } catch(e) {
          $alert({title: "Error:", content: $sce.trustAsHtml("Please select a valid JSON file"), type: 'danger'});
          return;
        }
        if(!importedEntries instanceof Array) {
          $alert({title: "Error:", content: $sce.trustAsHtml("The specified file does not have the correct format"), type: 'danger'});
          return;
        }
        $scope.dataset.entries = importedEntries;
      };
      reader.onerror = function(e) {
        $alert({title: "Error:", content: $sce.trustAsHtml("Unable to read the file"), type: 'danger'});
      }
      reader.readAsText(fileInput.files[0]);
    }
  }
  $scope.importEntries = importEntries;
}]);
