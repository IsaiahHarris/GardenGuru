exports.up = function (knex, Promise) {
  return knex.schema.createTable('plants', table => {
    table.increments();
    table.string('name').notNullable();
    table.text('description').notNullable();
    table.integer('days_to_harvest');
    table.integer('type_id').references('plant_types.id').notNullable();
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('plants');
};
