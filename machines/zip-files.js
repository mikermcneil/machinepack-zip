module.exports = {
  friendlyName: 'Zip files',
  description: 'Zip up the specified source file or directory and write a .zip file to disk.',
  extendedDescription: '',
  inputs: {
    source: {
      example: '/Users/mikermcneil/.tmp/',
      description: 'The path (relative or absolute) to the file or directory to zip.',
      extendedDescription: 'If a relative path is provided, it will be resolved to an absolute path using the current working directory.',
      required: true
    },
    destination: {
      example: '/Users/mikermcneil/tmp-contents.zip',
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
    var Archiver = require('archiver');

    var sources = [path.resolve(inputs.source)];
    var zipFileDestination = path.resolve(inputs.destination);
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

    archive.bulk([
      { src: sources, dest: zipFileDestination }
    ]);

    archive.finalize();


  },

};
