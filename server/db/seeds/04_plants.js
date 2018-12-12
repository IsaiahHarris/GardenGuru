
exports.seed = function (knex, Promise) {
  return knex('plants').del()
    .then(function () {
      return knex('plants').insert([
        {
          name: 'Lemons',
          description: 'Yellow fruit known for its tangy taste, the juice and rinds each used for both culinary and non-culinary purposes. Lemon trees are to be watered deeply each week.',
          days_to_harvest: 180,
          type_id: 2
        },
        {
          name: 'Blueberries',
          description: 'Shallow-rooted perennial plants that produce small blue- or purple-colored berries, and are native to North America. They typically have a sweet taste upon reaching maturity, though they also have varying acidity. Thrives in acidic soils of 4-5 pH, and requires 1-2 inches of water weekly, increasing to 4 inches while the fruit ripens.',
          days_to_harvest: 700,
          type_id: 2
        },
        {
          name: 'Cherries',
          description: 'A fruit of which its name can refer to many things such as cherry wood, almonds, or cherry blossoms. Like some other trees, cherry seeds need to be exposed to the cold in order to germinate which can be done by planting them in autumn, or by first refrigerating the seeds in order to mimic the process before planting in the spring. Keep the soil moist by watering once every 7-10 days.',
          days_to_harvest: 420,
          type_id: 2
        },
        {
          name: 'Apples',
          description: 'Widely known and cultivated around the world, apples are often used in various ways such as cooking, for ciders, or eating raw. Can be planted in the autumn, provided the weather is more moist in the winter as well. Apple trees need much sunlight, and grow with enough water in the soil to still allow air flow. Water deeply 1-2 times weekly when young and growing.',
          days_to_harvest: 90,
          type_id: 2
        },
        {
          name: 'Strawberries',
          description: 'Popular fruit identifiable by its bright red skin and the seeds on it, and cultivated worldwide for the fruit. Typically grown in cooler climates, they are difficult to grow in in warmer climates of around 29C or higher, but possible with proper preparations. As shallow-rooted plants, one must be mindful of watering too much or too little, so a weekly inch of water will do.',
          days_to_harvest: 35,
          type_id: 2
        },
        {
          name: 'Eggplants',
          description: 'The spongy, absorbent fruit of the plant is widely used in cooking in many different cuisines, and is often considered as a vegetable, even though it is a berry by botanical definition. As a member of the genus Solanum, it is related to the tomato and the potato. Like the tomato, its skin and seeds can be eaten, but, like the potato, it is not advisable to eat it raw. The capability of the fruit to absorb oils and flavors into its flesh through cooking is well known in the culinary arts.',
          days_to_harvest: 14,
          type_id: 1
        },
        {
          name: 'Cabbage',
          description: 'Cabbages are prepared many different ways for eating; they can be pickled, fermented (for dishes such as sauerkraut), steamed, stewed, sautéed, braised, or eaten raw. Cabbage is a good source of vitamin K, vitamin C and dietary fiber. The Food and Agriculture Organization of the United Nations (FAO) reported that world production of cabbage and other brassicas for 2014 was 71.8 million metric tonnes, with China accounting for 47% of the world total.',
          days_to_harvest: 7,
          type_id: 1
        },
        {
          name: 'Tomatoes',
          description: 'The tomato is consumed in diverse ways, raw or cooked, as an ingredient in many dishes, sauces, salads, and drinks. While tomatoes are fruits botanically classified as berries, they are considered culinarily as vegetables, to be utilized as an ingredient or side dish for savory meals.',
          days_to_harvest: 6,
          type_id: 1
        },
        {
          name: 'Zucchini',
          description: 'In a culinary context, the zucchini is treated as a vegetable; it is usually cooked and presented as a savory dish or accompaniment. Botanically, zucchinis are fruits, a type of botanical berry called a "pepo", being the swollen ovary of the zucchini flower.',
          days_to_harvest: 12,
          type_id: 1
        },
        {
          name: 'Kale',
          description: 'In the Southern United States, kale is often served braised, either alone or mixed with greens like collard, mustard, or turnip. It is also used in salads.',
          days_to_harvest: 8,
          type_id: 1
        },
        {
          name: 'Celery',
          description: 'In North America, commercial production of celery is dominated by the cultivar called "Pascal" celery. Gardeners can grow a range of cultivars, many of which differ from the wild species, mainly in having stouter leaf stems. They are ranged under two classes, white and red. The stalks grow in tight, straight, parallel bunches, and are typically marketed fresh that way, without roots and just a little green leaf remaining. The stalks are eaten raw, or as an ingredient in salads, or as a flavoring in soups, stews, and pot roasts.',
          days_to_harvest: 11,
          type_id: 1
        },
        {
          name: 'Arugula',
          description: 'A pungent, leafy green vegetable resembling a longer-leaved and open lettuce, Eruca sativa is rich in vitamin C and potassium.[10] In addition to the leaves, the flowers, young seed pods and mature seeds are all edible.',
          days_to_harvest: 5,
          type_id: 1
        },
        {
          name: 'Avocados',
          description: 'Avocados are commercially valuable and are cultivated in tropical and Mediterranean climates throughout the world.[4] They have a green-skinned, fleshy body that may be pear-shaped, egg-shaped, or spherical. Commercially, they ripen after harvesting. Avocado trees are partially self-pollinating and are often propagated through grafting to maintain a predictable quality and quantity of the fruit.',
          days_to_harvest: 6,
          type_id: 2
        },
        {
          name: 'Mangoes',
          description: 'Mangoes are juicy stone fruit (drupe) from numerous species of tropical trees belonging to the flowering plant genus Mangifera, cultivated mostly for their edible fruit.',
          days_to_harvest: 28,
          type_id: 2
        },
        {
          name: 'Guava',
          description: 'The entire fruit is a key ingredient in punch, and the juice is often used in culinary sauces (hot or cold), candies, dried snacks, fruit bars, and desserts, or dipped in chamoy. In many countries, guava is eaten raw, typically cut into quarters or eaten like an apple, whereas in other countries it is eaten with a pinch of salt and pepper, cayenne powder or a mix of spices (masala). ',
          days_to_harvest: 16,
          type_id: 2
        },
        {
          name: 'Mint',
          description: 'The leaf, fresh or dried, is the culinary source of mint. Fresh mint is usually preferred over dried mint when storage of the mint is not a problem. The leaves have a warm, fresh, aromatic, sweet flavor with a cool aftertaste, and are used in teas, beverages, jellies, syrups, candies, and ice creams. In Middle Eastern cuisine, mint is used on lamb dishes, while in British cuisine and American cuisine, mint sauce and mint jelly are used, respectively.',
          days_to_harvest: 10,
          type_id: 3
        },
        {
          name: 'Thyme',
          description: 'Depending on how it is used in a dish, the whole sprig may be used (e.g., in a bouquet garni), or the leaves removed and the stems discarded. Usually, when a recipe specifies "bunch" or "sprig", it means the whole form; when it specifies spoons, it means the leaves. It is perfectly acceptable to substitute dried for whole thyme. Leaves may be removed from stems either by scraping with the back of a knife, or by pulling through the fingers or tines of a fork. Thyme retains its flavour on drying better than many other herbs.',
          days_to_harvest: 6,
          type_id: 3
        },
        {
          name: 'Oregano',
          description: 'Oregano is a culinary herb, used for the flavor of its leaves, which can be more flavorful when dried than fresh. It has an aromatic, warm, and slightly bitter taste, which can vary in intensity. Good-quality oregano may be strong enough almost to numb the tongue, but cultivars adapted to colder climates may have a lesser flavor. Factors such as climate, season, and soil composition may affect the aromatic oils present, and this effect may be greater than the differences between the various species of plants.',
          days_to_harvest: 8,
          type_id: 3
        },
        {
          name: 'Rosemary',
          description: 'Rosemary leaves are used as a flavoring in foods,[2] such as stuffing and roast lamb, pork, chicken, and turkey. Fresh or dried leaves are used in traditional Mediterranean cuisine. They have a bitter, astringent taste and a characteristic aroma which complements many cooked foods. Herbal tea can be made from the leaves. When roasted with meats or vegetables, the leaves impart a mustard-like aroma with an additional fragrance of charred wood that goes well with barbecued foods.',
          days_to_harvest: 5,
          type_id: 3
        },
        {
          name: 'Basil',
          description: 'Basil is most commonly used fresh in recipes. In general, it is added at the last moment, as cooking quickly destroys the flavor. The fresh herb can be kept for a short time in plastic bags in the refrigerator, or for a longer period in the freezer, after being blanched quickly in boiling water. The dried herb also loses most of its flavor, and what little flavor remains tastes very different, with a weak coumarin flavor, like hay.',
          days_to_harvest: 12,
          type_id: 3
        },
        {
          name: 'Parsley',
          description: 'Parsley is widely used in Middle Eastern, European, Brazilian, and American cooking. Curly leaf parsley is used often as a garnish. Green parsley is used frequently as a garnish on potato dishes (boiled or mashed potatoes), on rice dishes (risotto or pilaf), on fish, fried chicken, lamb, goose, and steaks, as well in meat or vegetable stews (including shrimp creole, beef bourguignon, goulash, or chicken paprikash).',
          days_to_harvest: 10,
          type_id: 3
        },
        {
          name: 'Chives',
          description: 'Chives are grown for their scapes and leaves, which are used for culinary purposes as a flavoring herb, and provide a somewhat milder flavor than those of other Allium species.',
          days_to_harvest: 10,
          type_id: 3
        },
        {
          name: 'Dill',
          description: 'Successful cultivation requires warm to hot summers with high sunshine levels; even partial shade will reduce the yield substantially. It also prefers rich, well drained soil. The seeds are viable for three to ten years. The plants are somewhat monocarpic and quickly die after "bolting" (producing seeds). Hot temperatures can quicken bolting.',
          days_to_harvest: 0,
          type_id: 3
        },
      ]);
    });
};
