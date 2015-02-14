module.exports = {
  friendlyName: 'Unzip',
  description: 'Unzip the specified .zip file and write the decompressed files/directories as contents of the specified destination directory.',
  extendedDescription: '',
  inputs: {
    source: {
      example: '/Users/mikermcneil/stuff.zip',
      description: 'The path (relative or absolute) to the .zip archive.',
      extendedDescription: 'If a relative path is provided, it will be resolved to an absolute path using the current working directory.',
      required: true
    },
    destination: {
      example: '/Users/mikermcneil/my-stuff',
      // TODO: default to using `inputs.source` - ".zip" and just creating the expanded results in the same dir that the archive originally lived in
      description: 'The path (relative or absolute) to a directory where contents should be extracted.',
      extendedDescription: 'If a relative path is provided, it will be resolved to an absolute path using the current working directory.',
      required: true
    }
  },
  defaultExit: 'success',
  exits: {
    error: {
      description: 'Unexpected error occurred.'
    },
    success: {
      description: 'Done- unzipped files written to disk.'
    }
  },
  fn: function(inputs, exits) {

    var path = require('path');
    var fs = require('fs');
    var unzip = require('unzip');
    var Filesystem = require('machinepack-fs');

    var sourceArchive = path.resolve(inputs.source);
    var destinationDir = path.resolve(inputs.destination);

    // Ensure the parent directory exists.
    Filesystem.ensureDir({
      dir: destinationDir
    }).exec({

      // An unexpected error occurred.
      error: exits.error,

      // OK.
      success: function() {

        var srcStream = fs.createReadStream(sourceArchive);
        var drainStream = unzip.Extract({ path: destinationDir });
        drainStream.once('close', function (){ return exits.success(); });
        drainStream.once('error', function (err){ return exits.error(err); });
        srcStream.once('error', function (err){ return exits.error(err); });
        srcStream.pipe(drainStream);
      }
    });

  }

};
