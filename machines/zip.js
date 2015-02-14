module.exports = {
  friendlyName: 'Zip',
  description: 'Compress the specified source files or directories into a .zip file.',
  extendedDescription: 'If something already exists at the specified destination (where the .zip file is going to go), it will be overwritten. If any of the specified sources do not exist, they will be ignored.',
  inputs: {
    sources: {
      example: ['/Users/mikermcneil/foo/api/'],
      description: 'The paths (relative or absolute) to the files or directories to zip.',
      extendedDescription: 'If a relative paths are provided, they will be resolved to an absolute path using the current working directory.',
      required: true
    },
    destination: {
      example: '/Users/mikermcneil/my-app.zip',
      // TODO: default to using `inputs.source` + ".zip" and just creating the output archive in the same dir that the source lives in (or i.e. the first source in the list, or something)
      description: 'The path (relative or absolute) where the .zip file should be written.',
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
      description: 'Done- archive has been finalized and the output file descriptor has closed.',
      example: {
        bytesWritten: 3523523,
      }
    }
  },
  fn: function(inputs, exits) {

    var path = require('path');
    var fs = require('fs');
    var _ = require('lodash');
    var Archiver = require('archiver');
    var Filesystem = require('machinepack-fs');

    var srcPaths = _.map(inputs.sources, function (sourcePath){
      return path.resolve(sourcePath);
    });
    var zipFileDestination = path.resolve(inputs.destination);
    var zipFileParentPath = path.resolve(zipFileDestination, '..');

    // Ensure the parent directory exists.
    Filesystem.ensureDir({
      dir: zipFileParentPath
    }).exec({

      // An unexpected error occurred.
      error: exits.error,

      // OK.
      success: function() {

        var archive = Archiver('zip');

        var outputStream = fs.createWriteStream(zipFileDestination);
        outputStream.once('close', function() {
          return exits.success({
            bytesWritten: archive.pointer()
          });
        });
        outputStream.once('error', function (err) {
          return exits.error(err);
        });
        archive.once('error', function (err) {
          return exits.error(err);
        });

        archive.pipe(outputStream);

        archive.bulk(_.map(srcPaths, function convertPathIntoArchiverBulkInstr(srcPath){
          // Get (1) srcPath's parent and (2) the relative path to our srcPath from its parent
          var srcParent = path.resolve(srcPath, '..');
          var srcRelative = path.relative(srcParent, srcPath);
          return { src: [ srcRelative, path.join(srcRelative, '**') ], cwd: srcParent, expand: true };
        }));

        archive.finalize();

      }
    });

  },

};
