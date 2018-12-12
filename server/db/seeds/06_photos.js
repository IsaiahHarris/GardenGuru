
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('photos').del()
    .then(function () {
      // Inserts seed entries
      return knex('photos').insert([
        {
          link: 'https://cdn.shopify.com/s/files/1/2083/6855/products/Liberty-Lemons.jpg',
          crop_id: 1
        },
        {
          link: 'https://www.afarmgirlsdabbles.com/wp-content/uploads/2017/07/IMG_6468-2_crop1200optim-600x900.jpg',
          crop_id: 2
        },
        {
          link: 'http://3.bp.blogspot.com/-yQKETG0FqDU/UH2soi4M0DI/AAAAAAAADXo/vkdbPeKCAqI/s1600/Sweet+Cherry+03.jpg',
          crop_id: 3
        },
        {
          link: 'https://www.bangaloreagrico.in/wp-content/uploads/2018/01/apple-plant-bangalore-agrico-600x600.jpg',
          crop_id: 4
        },
        {
          link: 'http://www.handymanmagazine.co.nz/sites/default/files/sweet-strawberries-mar-14-p104-main.jpg',
          crop_id: 5
        },
      ]);
    });
};
