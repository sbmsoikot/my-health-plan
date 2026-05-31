/* Common food nutrition database.
   Values are per 100 g (or per 100 ml for liquids), from USDA FoodData Central
   (SR Legacy / Foundation Foods) reference values. Each item also carries a
   typical household serving: sg = grams in 1 serving, su = serving label.
   cal = kcal, p = protein (g), f = dietary fibre (g)  — all per 100 g.
   alt = optional search aliases. */
window.FOODS = [
  // ---- Grains & staples (cooked unless noted) ----
  {n:'White rice, cooked',         c:'Grains', cal:130, p:2.7,  f:0.4,  sg:158, su:'cup', alt:'plain rice steamed'},
  {n:'Brown rice, cooked',         c:'Grains', cal:123, p:2.7,  f:1.8,  sg:195, su:'cup'},
  {n:'Basmati rice, cooked',       c:'Grains', cal:121, p:3.5,  f:0.5,  sg:158, su:'cup'},
  {n:'Roti / chapati (whole wheat)',c:'Grains',cal:297, p:11,   f:4.9,  sg:40,  su:'roti', alt:'phulka'},
  {n:'Paratha',                    c:'Grains', cal:330, p:7,    f:4,    sg:60,  su:'piece'},
  {n:'White bread',                c:'Grains', cal:265, p:9,    f:2.7,  sg:28,  su:'slice'},
  {n:'Whole wheat bread',          c:'Grains', cal:247, p:13,   f:6,    sg:28,  su:'slice', alt:'brown bread'},
  {n:'Oats, rolled (dry)',         c:'Grains', cal:389, p:16.9, f:10.6, sg:40,  su:'serving', alt:'oatmeal raw'},
  {n:'Oatmeal, cooked',            c:'Grains', cal:71,  p:2.5,  f:1.7,  sg:234, su:'cup', alt:'porridge'},
  {n:'Quinoa, cooked',             c:'Grains', cal:120, p:4.4,  f:2.8,  sg:185, su:'cup'},
  {n:'Pasta, cooked',              c:'Grains', cal:158, p:5.8,  f:1.8,  sg:140, su:'cup', alt:'noodles spaghetti'},
  {n:'Barley, cooked',             c:'Grains', cal:123, p:2.3,  f:3.8,  sg:157, su:'cup'},
  {n:'Corn flakes',                c:'Grains', cal:357, p:7.5,  f:3.3,  sg:30,  su:'serving'},
  {n:'Whole wheat flour (atta)',   c:'Grains', cal:340, p:13,   f:10.7, sg:30,  su:'2 tbsp'},
  {n:'All-purpose flour (maida)',  c:'Grains', cal:364, p:10,   f:2.7,  sg:30,  su:'2 tbsp', alt:'refined flour'},
  {n:'Idli',                       c:'Grains', cal:146, p:5,    f:1.3,  sg:40,  su:'idli'},
  {n:'Dosa (plain)',               c:'Grains', cal:168, p:4,    f:1.5,  sg:60,  su:'dosa'},
  {n:'Poha (flattened rice)',      c:'Grains', cal:130, p:2.6,  f:1,    sg:50,  su:'serving', alt:'beaten rice'},

  // ---- Legumes & plant protein (cooked unless noted) ----
  {n:'Lentils / dal, cooked',      c:'Legumes',cal:116, p:9,    f:7.9,  sg:198, su:'cup', alt:'masoor toor arhar'},
  {n:'Chickpeas, cooked',          c:'Legumes',cal:164, p:8.9,  f:7.6,  sg:164, su:'cup', alt:'chana garbanzo'},
  {n:'Kidney beans (rajma), cooked',c:'Legumes',cal:127,p:8.7,  f:6.4,  sg:177, su:'cup'},
  {n:'Black beans, cooked',        c:'Legumes',cal:132, p:8.9,  f:8.7,  sg:172, su:'cup'},
  {n:'Mung beans (moong), cooked', c:'Legumes',cal:105, p:7,    f:7.6,  sg:202, su:'cup', alt:'green gram'},
  {n:'Soybeans, cooked',           c:'Legumes',cal:173, p:16.6, f:6,    sg:172, su:'cup'},
  {n:'Green peas, cooked',         c:'Legumes',cal:84,  p:5.4,  f:5.5,  sg:160, su:'cup', alt:'matar'},
  {n:'Tofu',                       c:'Legumes',cal:76,  p:8,    f:0.3,  sg:100, su:'100 g'},
  {n:'Hummus',                     c:'Legumes',cal:166, p:7.9,  f:6,    sg:30,  su:'2 tbsp'},
  {n:'Edamame, cooked',            c:'Legumes',cal:121, p:11.9, f:5.2,  sg:155, su:'cup'},

  // ---- Nuts & seeds ----
  {n:'Almonds',                    c:'Nuts',   cal:579, p:21,   f:12.5, sg:28,  su:'handful (28g)'},
  {n:'Walnuts',                    c:'Nuts',   cal:654, p:15,   f:6.7,  sg:28,  su:'handful (28g)'},
  {n:'Cashews',                    c:'Nuts',   cal:553, p:18,   f:3.3,  sg:28,  su:'handful (28g)', alt:'kaju'},
  {n:'Pistachios',                 c:'Nuts',   cal:560, p:20,   f:10.6, sg:28,  su:'handful (28g)'},
  {n:'Peanuts',                    c:'Nuts',   cal:567, p:25.8, f:8.5,  sg:28,  su:'handful (28g)', alt:'groundnut'},
  {n:'Chia seeds',                 c:'Nuts',   cal:486, p:16.5, f:34.4, sg:12,  su:'tbsp'},
  {n:'Flaxseed (ground)',          c:'Nuts',   cal:534, p:18.3, f:27.3, sg:10,  su:'tbsp', alt:'linseed alsi'},
  {n:'Pumpkin seeds',              c:'Nuts',   cal:559, p:30,   f:6,    sg:28,  su:'handful (28g)'},
  {n:'Sunflower seeds',            c:'Nuts',   cal:584, p:20.8, f:8.6,  sg:28,  su:'handful (28g)'},
  {n:'Peanut butter',              c:'Nuts',   cal:588, p:25,   f:6,    sg:32,  su:'2 tbsp'},

  // ---- Vegetables ----
  {n:'Potato, boiled',             c:'Veg',    cal:87,  p:1.9,  f:1.8,  sg:150, su:'medium', alt:'aloo'},
  {n:'Sweet potato, cooked',       c:'Veg',    cal:90,  p:2,    f:3.3,  sg:130, su:'medium', alt:'shakarkandi'},
  {n:'Broccoli, cooked',           c:'Veg',    cal:35,  p:2.4,  f:3.3,  sg:156, su:'cup'},
  {n:'Spinach, cooked',            c:'Veg',    cal:23,  p:3,    f:2.4,  sg:180, su:'cup', alt:'palak'},
  {n:'Carrot, raw',                c:'Veg',    cal:41,  p:0.9,  f:2.8,  sg:61,  su:'medium', alt:'gajar'},
  {n:'Tomato',                     c:'Veg',    cal:18,  p:0.9,  f:1.2,  sg:123, su:'medium'},
  {n:'Cucumber',                   c:'Veg',    cal:15,  p:0.7,  f:0.5,  sg:100, su:'100 g'},
  {n:'Onion',                      c:'Veg',    cal:40,  p:1.1,  f:1.7,  sg:110, su:'medium', alt:'pyaz'},
  {n:'Cauliflower, cooked',        c:'Veg',    cal:23,  p:1.8,  f:2.3,  sg:124, su:'cup', alt:'gobi'},
  {n:'Cabbage, raw',               c:'Veg',    cal:25,  p:1.3,  f:2.5,  sg:89,  su:'cup'},
  {n:'Bell pepper',                c:'Veg',    cal:31,  p:1,    f:2.1,  sg:119, su:'medium', alt:'capsicum'},
  {n:'Eggplant, cooked',           c:'Veg',    cal:35,  p:0.8,  f:2.5,  sg:99,  su:'cup', alt:'brinjal baingan'},
  {n:'Green beans, cooked',        c:'Veg',    cal:35,  p:1.9,  f:3.2,  sg:125, su:'cup'},
  {n:'Mushroom',                   c:'Veg',    cal:22,  p:3.1,  f:1,    sg:70,  su:'cup'},
  {n:'Lettuce',                    c:'Veg',    cal:15,  p:1.4,  f:1.3,  sg:36,  su:'cup'},
  {n:'Okra, cooked',               c:'Veg',    cal:33,  p:1.9,  f:3.2,  sg:80,  su:'cup', alt:'bhindi ladyfinger'},
  {n:'Beetroot',                   c:'Veg',    cal:43,  p:1.6,  f:2.8,  sg:100, su:'100 g'},
  {n:'Corn, cooked',               c:'Veg',    cal:96,  p:3.4,  f:2.4,  sg:164, su:'cup', alt:'sweetcorn'},
  {n:'Avocado',                    c:'Veg',    cal:160, p:2,    f:6.7,  sg:100, su:'half'},
  {n:'Pumpkin, cooked',            c:'Veg',    cal:20,  p:0.7,  f:1.1,  sg:245, su:'cup', alt:'kaddu'},

  // ---- Fruits ----
  {n:'Banana',                     c:'Fruit',  cal:89,  p:1.1,  f:2.6,  sg:118, su:'medium'},
  {n:'Apple',                      c:'Fruit',  cal:52,  p:0.3,  f:2.4,  sg:182, su:'medium'},
  {n:'Orange',                     c:'Fruit',  cal:47,  p:0.9,  f:2.4,  sg:131, su:'medium'},
  {n:'Mango',                      c:'Fruit',  cal:60,  p:0.8,  f:1.6,  sg:165, su:'cup', alt:'aam'},
  {n:'Grapes',                     c:'Fruit',  cal:69,  p:0.7,  f:0.9,  sg:92,  su:'cup'},
  {n:'Strawberries',               c:'Fruit',  cal:32,  p:0.7,  f:2,    sg:152, su:'cup'},
  {n:'Blueberries',                c:'Fruit',  cal:57,  p:0.7,  f:2.4,  sg:148, su:'cup'},
  {n:'Watermelon',                 c:'Fruit',  cal:30,  p:0.6,  f:0.4,  sg:152, su:'cup', alt:'tarbooz'},
  {n:'Papaya',                     c:'Fruit',  cal:43,  p:0.5,  f:1.7,  sg:145, su:'cup'},
  {n:'Pineapple',                  c:'Fruit',  cal:50,  p:0.5,  f:1.4,  sg:165, su:'cup'},
  {n:'Pomegranate',                c:'Fruit',  cal:83,  p:1.7,  f:4,    sg:100, su:'100 g', alt:'anar'},
  {n:'Kiwi',                       c:'Fruit',  cal:61,  p:1.1,  f:3,    sg:69,  su:'medium'},
  {n:'Pear',                       c:'Fruit',  cal:57,  p:0.4,  f:3.1,  sg:178, su:'medium'},
  {n:'Dates',                      c:'Fruit',  cal:277, p:1.8,  f:6.7,  sg:8,   su:'date', alt:'khajur'},
  {n:'Guava',                      c:'Fruit',  cal:68,  p:2.6,  f:5.4,  sg:55,  su:'fruit', alt:'amrood'},

  // ---- Dairy & eggs ----
  {n:'Milk, whole',                c:'Dairy',  cal:61,  p:3.2,  f:0,    sg:244, su:'cup (ml)', alt:'full fat'},
  {n:'Milk, skim / low-fat',       c:'Dairy',  cal:42,  p:3.4,  f:0,    sg:245, su:'cup (ml)'},
  {n:'Yogurt, plain low-fat',      c:'Dairy',  cal:63,  p:5.3,  f:0,    sg:245, su:'cup', alt:'curd dahi'},
  {n:'Greek yogurt, low-fat',      c:'Dairy',  cal:59,  p:10.3, f:0,    sg:245, su:'cup'},
  {n:'Paneer',                     c:'Dairy',  cal:296, p:20,   f:0,    sg:50,  su:'50 g', alt:'indian cheese'},
  {n:'Cottage cheese, low-fat',    c:'Dairy',  cal:72,  p:12,   f:0,    sg:100, su:'100 g'},
  {n:'Cheese, cheddar',            c:'Dairy',  cal:403, p:25,   f:0,    sg:28,  su:'slice (28g)'},
  {n:'Butter',                     c:'Dairy',  cal:717, p:0.9,  f:0,    sg:14,  su:'tbsp'},
  {n:'Ghee',                       c:'Dairy',  cal:900, p:0,    f:0,    sg:14,  su:'tbsp', alt:'clarified butter'},
  {n:'Egg, whole',                 c:'Eggs',   cal:143, p:12.6, f:0,    sg:50,  su:'egg'},
  {n:'Egg white',                  c:'Eggs',   cal:52,  p:10.9, f:0,    sg:33,  su:'white'},

  // ---- Meat, poultry & fish (cooked) ----
  {n:'Chicken breast, cooked',     c:'Meat',   cal:165, p:31,   f:0,    sg:100, su:'100 g'},
  {n:'Chicken thigh, cooked',      c:'Meat',   cal:209, p:26,   f:0,    sg:100, su:'100 g'},
  {n:'Mutton / lamb, cooked',      c:'Meat',   cal:294, p:25,   f:0,    sg:100, su:'100 g', alt:'goat'},
  {n:'Beef, lean cooked',          c:'Meat',   cal:250, p:26,   f:0,    sg:100, su:'100 g'},
  {n:'Salmon, cooked',             c:'Fish',   cal:206, p:22,   f:0,    sg:100, su:'fillet (100g)'},
  {n:'Tuna, canned in water',      c:'Fish',   cal:116, p:26,   f:0,    sg:100, su:'100 g'},
  {n:'Cod, cooked',                c:'Fish',   cal:105, p:23,   f:0,    sg:100, su:'100 g'},
  {n:'Tilapia, cooked',            c:'Fish',   cal:129, p:26,   f:0,    sg:100, su:'100 g'},
  {n:'Shrimp, cooked',             c:'Fish',   cal:99,  p:24,   f:0,    sg:85,  su:'serving', alt:'prawn'},
  {n:'Sardines, canned',           c:'Fish',   cal:208, p:25,   f:0,    sg:100, su:'100 g'},

  // ---- Fats & oils ----
  {n:'Olive oil',                  c:'Fats',   cal:884, p:0,    f:0,    sg:14,  su:'tbsp'},
  {n:'Vegetable / sunflower oil',  c:'Fats',   cal:884, p:0,    f:0,    sg:14,  su:'tbsp', alt:'cooking oil'},
  {n:'Mustard oil',                c:'Fats',   cal:884, p:0,    f:0,    sg:14,  su:'tbsp', alt:'sarson'},
  {n:'Coconut oil',                c:'Fats',   cal:862, p:0,    f:0,    sg:14,  su:'tbsp'},
  {n:'Coconut, grated',            c:'Fats',   cal:354, p:3.3,  f:9,    sg:80,  su:'cup', alt:'nariyal'},

  // ---- Sugars & sweets ----
  {n:'Sugar, white',               c:'Sweets', cal:387, p:0,    f:0,    sg:4,   su:'tsp', alt:'cheeni'},
  {n:'Honey',                      c:'Sweets', cal:304, p:0.3,  f:0.2,  sg:21,  su:'tbsp'},
  {n:'Jaggery (gur)',              c:'Sweets', cal:383, p:0.4,  f:0,    sg:20,  su:'piece'},
  {n:'Dark chocolate (70%)',       c:'Sweets', cal:598, p:7.8,  f:11,   sg:10,  su:'square'},
  {n:'Milk chocolate',             c:'Sweets', cal:535, p:7.6,  f:3.4,  sg:40,  su:'small bar'},
  {n:'Biscuit / cookie',           c:'Sweets', cal:480, p:6,    f:2,    sg:15,  su:'biscuit'},

  // ---- Beverages (per 100 ml) ----
  {n:'Tea, plain (no milk/sugar)', c:'Drinks', cal:1,   p:0,    f:0,    sg:240, su:'cup (ml)'},
  {n:'Coffee, black',              c:'Drinks', cal:2,   p:0.3,  f:0,    sg:240, su:'cup (ml)'},
  {n:'Orange juice',               c:'Drinks', cal:45,  p:0.7,  f:0.2,  sg:248, su:'cup (ml)'},
  {n:'Cola / soft drink',          c:'Drinks', cal:41,  p:0,    f:0,    sg:330, su:'can (ml)', alt:'soda fizzy'},
  {n:'Coconut water',              c:'Drinks', cal:19,  p:0.7,  f:1.1,  sg:240, su:'cup (ml)'},
  {n:'Beer',                       c:'Drinks', cal:43,  p:0.5,  f:0,    sg:330, su:'can (ml)'},
  {n:'Lassi, sweet',               c:'Drinks', cal:90,  p:2.6,  f:0,    sg:250, su:'glass (ml)'},

  // ---- Condiments ----
  {n:'Ketchup',                    c:'Other',  cal:101, p:1.1,  f:0.3,  sg:17,  su:'tbsp', alt:'tomato sauce'},
  {n:'Mayonnaise',                 c:'Other',  cal:680, p:1,    f:0,    sg:14,  su:'tbsp'}
];
