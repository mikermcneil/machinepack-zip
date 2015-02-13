module.exports = {
  friendlyName: 'Zip files',
  description: 'Zip up a file or directory.',
  extendedDescription: '',
  inputs: {},
  defaultExit: 'success',
  exits: { error: { description: 'Unexpected error occurred.' },
    success: { description: 'Done.' } },
  fn: function (inputs,exits) {
    return exits.success();
  },

};
