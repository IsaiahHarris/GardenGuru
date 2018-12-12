exports.up = function(knex, Promise) {
  return knex.schema.createTable('messages', table => {
    table.increments();
    table.timestamps(true, true);
    table.integer('to').references('users.id');
    table.integer('from').references('users.id');
    table.text('content').notNullable();
    table.boolean('read').defaultTo(false);
  })  
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('messages');
};
