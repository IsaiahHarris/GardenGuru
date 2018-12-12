const bookshelf = require('./bookshelf');

class Photo extends bookshelf.Model {
  get tableName() {
    return 'photos';
  }
  get hasTimestamps() {
    return true;
  }

  //relationships

  crops() {
    return this.belongsTo('Crop', 'crop_id');
  }
}

module.exports = bookshelf.model('Photo', Photo);
