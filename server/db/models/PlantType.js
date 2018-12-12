const bookshelf = require('./bookshelf');

class PlantType extends bookshelf.Model {
  get tableName() {
    return 'plant_type';
  }

  get hasTimestamps() {
    return true;
  }

  //relationships

  plants() {
    return this.hasMany('Plant', 'type_id');
  }
}

module.exports = bookshelf.model('PlantType', PlantType);
