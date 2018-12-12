const bookshelf = require('./bookshelf');
require('./User');
require('./CropStatus');
require('./Plant');
require('./Photo');

class Crop extends bookshelf.Model {
  get tableName() {
    return 'crops';
  }

  get hasTimestamps() {
    return true;
  }

  //relationships

  owner() {
    return this.belongsTo('User', 'owner_id');
  }

  cropStatus() {
    return this.belongsTo('CropStatus', 'crop_status');
  }

  plant() {
    return this.belongsTo('Plant', 'plant_id');
  }

  photo() {
    return this.hasMany('Photo', 'crop_id');
  }

  messages() {
    return this.hasMany('Message', 'crop_id');
  }
}

module.exports = bookshelf.model('Crop', Crop);
