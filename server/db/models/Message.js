const bookshelf = require('./bookshelf');

class Message extends bookshelf.Model {
  get tableName() {
    return 'messages';
  }

  get hasTimestamps() {
    return true;
  }

  //relationships

  to() {
    return this.belongsTo('User', 'to');
  }

  from() {
    return this.belongsTo('User', 'from');
  }
}

module.exports = bookshelf.model('Message', Message);
