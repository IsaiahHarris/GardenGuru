exports.up = function (knex, Promise) {
  return knex.schema.createTable('photos', table => {
    table.increments();
    table.text('link');
    table.timestamps(true, true);
    table.integer('crop_id').references('crops.id');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('photos');
};
