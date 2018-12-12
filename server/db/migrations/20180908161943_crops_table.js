exports.up = function (knex, Promise) {
  return knex.schema.createTable('crops', table => {
    table.increments();
    table.string('description').notNullable();
    table.string('garden_description').notNullable();
    table.text('details');
    table.integer('plant_id').references('plants.id');
    table.integer('owner_id').references('users.id');
    table.date('planted_on');
    table.integer('watering_interval');
    table.date('watering_date');
    table.integer('inventory');
    table.timestamps(true, true);
    table.integer('crop_status').references('crop_statuses.id');
    table.string('price');
    table.date('harvest_date');
    table.boolean('selling').defaultTo(false);
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('crops');
};
