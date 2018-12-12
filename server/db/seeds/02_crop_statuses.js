
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('crop_statuses').del()
    .then(function () {
      // Inserts seed entries
      return knex('crop_statuses').insert([
        {
          name: 'Growing'
        },
        {
          name: 'Removed'
        },
      ]);
    });
};
