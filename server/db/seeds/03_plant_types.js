
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('plant_types').del()
    .then(function () {
      // Inserts seed entries
      return knex('plant_types').insert([
        { name: 'Vegetable' },
        { name: 'Fruit' },
        { name: 'Herb' }
      ]);
    });
};
