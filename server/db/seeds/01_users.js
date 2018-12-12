exports.seed = function(knex, Promise) {
  return knex('users')
    .del()
    .then(function() {
      return knex('users').insert([
        {
          username: 'johngardener',
          password:
            '$2b$12$HueRLBiASdSjLQA.EC9P6O3NeA0OTAGCl/22O.t2axPDe.oZPOJTO',
          email: 'grobrotest@gmail.com',
          first_name: 'John',
          last_name: 'Doe',
          rating: 0,
          bio: 'Gardening is my hobby. I grow mostly mangoes and avocados. DM me for batches',
          city: 'Honolulu',
          state: 'HI',
          stand_name: 'Mango Madness',
          avatar_link: 'http://extension.msstate.edu/sites/default/files/styles/flexslider_full/public/slideshow/master-gardener-history/20160520_saladtables_1.jpg?itok=3jP8Pghk'
        },
        {
          username: 'jojoestar',
          password:
            '$2b$12$HueRLBiASdSjLQA.EC9P6O3NeA0OTAGCl/22O.t2axPDe.oZPOJTO',
          email: 'grobroadmin@gmail.com',
          first_name: 'Jotaro',
          last_name: 'Kujo',
          rating: 0,
          bio: `Helping my parents sell their veggies.`,
          city: 'Honolulu',
          state: 'HI',
          stand_name: "Joseph's Stand",
          avatar_link: 'https://s3-eu-west-1.amazonaws.com/video.gallereplay.com/production/user_49/picture_2702201752636.jpg'
        },
        {
          username: 'alex12',
          password:
            '$2b$12$HueRLBiASdSjLQA.EC9P6O3NeA0OTAGCl/22O.t2axPDe.oZPOJTO',
          email: 'alexanderthegreat21@gmail.com',
          first_name: 'Alexis',
          last_name: 'Snow',
          rating: 0,
          bio: `It ain't over lentil it's over!`,
          city: 'Honolulu',
          state: 'HI',
          stand_name: "Alex's Organic Veggies",
          avatar_link: 'https://pbs.twimg.com/profile_images/780905013283479552/ldu_bznx_400x400.jpg'
        },
        {
          username: 'thelegend27',
          password:
            '$2b$12$HueRLBiASdSjLQA.EC9P6O3NeA0OTAGCl/22O.t2axPDe.oZPOJTO',
          email: 'froppy@gmail.com',
          first_name: 'Harry',
          last_name: 'Potter',
          rating: 0,
          bio: 'Herb your enthusiasm',
          city: 'Honolulu',
          state: 'HI',
          stand_name: `Harry's Herbs`,
          avatar_link: 'https://pbs.twimg.com/profile_images/687720377032806400/77rcqBG7_400x400.jpg'
        },
        {
          username: 'mint',
          password:
            '$2b$12$HueRLBiASdSjLQA.EC9P6O3NeA0OTAGCl/22O.t2axPDe.oZPOJTO',
          email: 'muibirb@gmail.com',
          first_name: 'Jessica',
          last_name: 'Soo',
          rating: 0,
          bio: 'My plants are mint condition!',
          city: 'Aiea',
          state: 'HI',
          stand_name: 'Mint to be',
          avatar_link: 'https://media.istockphoto.com/photos/pretty-asian-woman-standing-outdoors-picture-id489776304?k=6&m=489776304&s=612x612&w=0&h=GSJaepoaEoZUpeqCufkUY83bRwm_r3RPq7x8qWOGs_I='
        },
        {
          username: 'aiea1',
          password:
            '$2b$12$HueRLBiASdSjLQA.EC9P6O3NeA0OTAGCl/22O.t2axPDe.oZPOJTO',
          email: 'merurun16@gmail.com',
          first_name: 'Mandy',
          last_name: 'Simons',
          rating: 0,
          bio: `Hi! I love gardening!`,
          city: 'Aiea',
          state: 'HI',
          stand_name: `Mandy's Market`,
          avatar_link: 'https://ak1.picdn.net/shutterstock/videos/17173771/thumb/1.jpg'
        }
      ]);
    });
};
