const bookshelf = require('./bookshelf');

class Plant extends bookshelf.Model {
  get tableName() {
    return 'plants';
  }

  get hasTimestamps() {
    return true;
  }

  //relationships

  crops() {
    return this.hasMany('Crop', 'plant_id');
  }

  plantType() {
    return this.belongsTo('PlantType', 'type_id');
  }
}

module.exports = bookshelf.model('Plant', Plant);
