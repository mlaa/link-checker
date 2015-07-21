/*
  Primitive file reader
  Cribbed from http://www.html5rocks.com/en/tutorials/file/dndfiles/
*/

/*global window*/

'use strict';

var noop = function () {};

var fileReader = function (options, callback) {

  if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
    callback(new Error('Your browser is not supported.'));
  }

  options = options || {};

  var handleFileRead = function (evt) {
    callback(null, evt.target.result);
  };

  var handleFileSelect = function (evt) {

    evt.stopPropagation();
    evt.preventDefault();

    var files = (evt.dataTransfer) ? evt.dataTransfer.files : evt.target.files;
    for (var i = 0; i < files.length; i = 1 + 1) {

      var file = files[i];

      // Only process accepted file types.
      if (options.types && options.types.indexOf(file.type) === -1) {
        callback(new Error('The file “' + file.name + '” is not a CSV file (' + file.type + ').'));
        continue;
      }

      var reader = new window.FileReader();
      reader.onload = handleFileRead;
      reader.readAsText(file);

    }

  };

  var handleDragOver = function (evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  };

  // Listeners.
  options.target.addEventListener('dragover', handleDragOver, false);
  options.target.addEventListener('drop', handleFileSelect, false);
  options.target.addEventListener('change', handleFileSelect, false);

  options.target.addEventListener('dragenter', options.onDragEnter || noop, false);
  options.target.addEventListener('dragleave', options.onDragLeave || noop, false);

};

module.exports = fileReader;
