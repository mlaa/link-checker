/* Main */

/*global window*/

'use strict';

var $ = require('jquery');
var fileReader = require('./modules/file-reader');
var parse = require('csv-parse');
var tablesort = require('tablesort');

var $dropParent = $('#my-droppable');
var $dropInput = $('#my-dropzone');
var $warningDiv = $('#my-warning');
var $loadingDiv = $('#my-loading');
var $errorDiv = $('#my-errors');
var $outputTable = $('#my-table');

var fetchInterval = 500;

var fileReaderOptions = {
  onDragEnter: function () {
    $dropParent.addClass('hover');
  },
  onDragLeave: function () {
    $dropParent.removeClass('hover');
  },
  target: $dropInput[0],
  types: [
    'text/csv',
    'text/comma-separated-values',
    'application/csv',
    'application/vnd.ms-excel'
  ]
};

var confirmNavigation = function () {
  return 'Your report will be cleared and will not be recoverable.';
};

var wrapText = function (str, tagName, className) {
  className = (className) ? ' class="' + className + '"' : '';
  return '<' + tagName + className + '>' + str + '</' + tagName + '>';
};

var createRow = function (datum, rowIndex, isPending) {

  var statusColumn = (isPending) ? 'loading' : 'no url';
  var className = (isPending) ? 'pending' : 'missing';
  var tagName = (rowIndex) ? 'td' : 'th';
  className += ' row-' + rowIndex;

  // Add a status column.
  if (rowIndex) {
    datum.push(statusColumn);
  } else {
    // Header row
    className += ' no-sort';
    datum.push('status');
  }

  var cellText = $.map(datum, function (str) {
    return wrapText(str, tagName);
  }).join('');

  return wrapText(cellText, 'tr', className);

};

var updateRow = function (data) {

  // Log data to console.
  console.log(data);

  var $row = $('.row-' + data.index);

  // Populate status column.
  $row.find('td:last-child()').html(data.status);

  // Format row.
  $row.removeClass('pending');
  $row.addClass('status-' + data.status.substring(0, 1));

};

var processRows = function (err, dataArray) {

  if (err) {
    $errorDiv.append('<p>' + err.message + '</p>').show();
    return;
  }

  var pattern = new RegExp('^https?:\/\/?');

  $loadingDiv.hide();

  dataArray.forEach(function (datum, rowIndex) {

    var isPending = false;

    datum.forEach(function (str, cellIndex) {
      if (pattern.test(str)) {
        datum[cellIndex] = '<a href="' + str + '" target="_blank">' + str + '</a>';
        isPending = setTimeout(function () {
          $.get('check.php', { url: str, index: rowIndex }, updateRow, 'json');
        }, rowIndex * fetchInterval);
      }
    });

    $outputTable.append(createRow(datum, rowIndex, isPending));

  });

  // Make table sortable.
  tablesort($outputTable[0]);

  // Confirm navigation away from page
  window.onbeforeunload = confirmNavigation;

};

var parseCsv = function (err, csvString) {

  $dropParent.hide();

  if (err) {
    processRows(err);
    return;
  }

  $loadingDiv.show();
  parse(csvString, processRows);

};

// Show warning if browser does not support file reading.
if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
  $warningDiv.show();
  $dropParent.hide();
}

fileReader(fileReaderOptions, parseCsv);
