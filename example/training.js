var talkkie = require('../lib/talkkie'),
    fs = require('graceful-fs'),
    path = require('path'),
    async = require('async');

// Import training data
var classifier = new talkkie.Classifier();

// Go through an entire directory of test scripts
dive('/Users/Me/Desktop/Scripts/', '.txt', trainScript, function (functions) {
  console.log('Done training, exporting data.');
  classifier.export();
});

/*
 * Some helper functions
 */

// Preform action on each file in a directory
function dive (directory, extension, action, callback) {

  // Make sure
  if (typeof action !== 'function') {
    action = function (error, file) {};
  }

  fs.readdir(directory, function (err, contents) {
    if (err) return;

    // Preform action on file
    async.each(contents, function (file, cb) {

      var filePath  = directory + '/' + file;
      var fileExtension = path.extname(file);

      fs.stat(filePath, function (err, stat) {
        // If the file is a directory
        if (stat && stat.isDirectory()) {
          // Dive into the directory
          dive(filePath, extension, action, callback);
        }
        else {
          // Do the action
          if (fileExtension === extension) action(null, filePath);

          // Tell async this function is done
          cb();
        }
      });

    }, function (err) {
        if (err) throw err;
        console.log('calling callback');
        callback();
    });
  });
}

function trainScript (error, file) {
  console.log('opening file');
  if (error) console.log(error);

  var genre = path.basename(path.join(file, '../'));
  var script = fs.readFileSync(file).toString();

  classifier.train(script, genre);
  console.log('Added');
}