const bookshelf = require('./bookshelf');
require('./Photo');

class User extends bookshelf.Model {
  get tableName() {
    return 'users';
  }

  get hasTimestamps() {
    return true;
  }

  //relationships

  crops() {
    return this.hasMany('Crop', 'crop_id');
  }

  photos() {
    return this.hasOne('Photo', 'user_id');
  }

  toMessages() {
    return this.hasMany('Message', 'to');
  }

  fromMessages() {
    return this.hasMany('Message', 'from');
  }
}

module.exports = bookshelf.model('User', User);
