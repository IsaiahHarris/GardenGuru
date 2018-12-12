exports.up = function (knex, Promise) {
  return knex.schema.createTable('users', table => {
    table.bigIncrements();
    table.string('username').unique().notNullable();
    table.string('password').notNullable();
    table.string('email').notNullable();
    table.string('first_name');
    table.string('last_name');
    table.integer('rating');
    table.text('bio');
    table.string('city').notNullable();
    table.string('state').notNullable();
    table.string('stand_name');
    table.timestamps(true, true);
    table.text('avatar_link');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('users');
};
