
exports.up = function (knex, Promise) {
  return knex.schema.alterTable('photos', table => {
    table.boolean('selling').defaultTo(false);
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('photos', table => {
    table.dropColumn('selling');
  });
};
