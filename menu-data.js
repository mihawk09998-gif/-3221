const CATEGORIES = {
  breakfasts: { id: "breakfasts", name: "Завтраки", icon: "coffee" },
  salads: { id: "salads", name: "Салаты", icon: "leaf" },
  mains: { id: "mains", name: "Вторые блюда", icon: "utensils" },
  grill: { id: "grill", name: "Шашлык & Мангал", icon: "flame" },
  sets: { id: "sets", name: "Сеты от шефа", icon: "star" },
  steaks: { id: "steaks", name: "Стейки & Горячее", icon: "beef" },
  starters: { id: "starters", name: "Закуски & Супы", icon: "soup" },
  kids: { id: "kids", name: "Детское меню", icon: "smile" },
  pizza: { id: "pizza", name: "Пицца", icon: "pizza" },
  drinks: { id: "drinks", name: "Напитки & Кофе", icon: "glass" }
};

const MENU_DATA = [
  // === ЗАВТРАКИ ===
  {
    id: "br-1",
    category: "breakfasts",
    name: "Омлет с сыром",
    price: 290,
    portion: "200 гр",
    description: "Классический воздушный омлет с добавлением нежного сыра.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "br-2",
    category: "breakfasts",
    name: "Не испанский завтрак",
    price: 490,
    portion: "350 гр",
    description: "Фирменный сытный завтрак с яйцами, колбасками, тостами и гарниром.",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "br-3",
    category: "breakfasts",
    name: "Сырники со сметаной",
    price: 320,
    portion: "200 гр",
    description: "Нежные домашние сырники из свежего творога с хрустящей корочкой. Подаются со сметаной.",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "br-4",
    category: "breakfasts",
    name: "Блинчики со сметаной",
    price: 250,
    portion: "180 гр",
    description: "Тонкие кружевные домашние блинчики со сметаной.",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "br-5",
    category: "breakfasts",
    name: "Блинчики с творогом",
    price: 290,
    portion: "220 гр",
    description: "Аппетитные блинчики со сладкой начинкой из нежного творога.",
    image: "https://images.unsplash.com/photo-1622484211148-716598e04041?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "br-6",
    category: "breakfasts",
    name: "Шакшука",
    price: 390,
    portion: "250 гр",
    description: "Традиционная восточная яичница в остром соусе из томатов, сладкого перца, лука и специй.",
    image: "https://images.unsplash.com/photo-1590412200988-a436bb705300?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "br-7",
    category: "breakfasts",
    name: "Английский завтрак",
    price: 550,
    portion: "400 гр",
    description: "Сытный завтрак: глазунья, жареный бекон, фасоль в томате, грибы, колбаски и тосты.",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "br-8",
    category: "breakfasts",
    name: "Каша рисовая",
    price: 220,
    portion: "250 гр",
    description: "Нежная молочная рисовая каша со сливочным маслом.",
    image: "https://images.unsplash.com/photo-1517686469429-8faf88b9f7af?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "br-9",
    category: "breakfasts",
    name: "Каша овсяная",
    price: 220,
    portion: "250 гр",
    description: "Полезная классическая овсяная каша на молоке с добавлением сливочного масла.",
    image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "br-10",
    category: "breakfasts",
    name: "Каша из киноа",
    price: 220,
    portion: "250 гр",
    description: "Суперфуд-каша из крупы киноа, приготовленная на молоке. Лёгкая и питательная.",
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "br-11",
    category: "breakfasts",
    name: "Гранола с йогуртом",
    price: 350,
    portion: "200 гр",
    description: "Запечённая хрустящая гранола со злаками, орехами, сухофруктами и натуральным йогуртом.",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60"
  },

  // === САЛАТЫ ===
  {
    id: "sl-1",
    category: "salads",
    name: "Свежий салат",
    price: 250,
    portion: "200 гр",
    description: "Витаминный микс из свежих сезонных овощей с заправкой на выбор.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sl-2",
    category: "salads",
    name: "Греческий салат",
    price: 390,
    portion: "250 гр",
    description: "Свежие огурцы, помидоры, перец болгарский, оливки, маслины, сыр фета, оливковое масло.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sl-3",
    category: "salads",
    name: "Китайский салат",
    price: 390,
    portion: "220 гр",
    description: "Пикантный салат со свежими овощами, древесными грибами и соевой заправкой.",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sl-4",
    category: "salads",
    name: "Древесные грибы Муэр",
    price: 390,
    portion: "180 гр",
    description: "Азиатский салат из хрустящих черных древесных грибов муэр с кунжутным маслом и чесноком.",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sl-5",
    category: "salads",
    name: "Салат с копченым лососем",
    price: 590,
    portion: "220 гр",
    description: "Изысканный салат с ломтиками копченого лосося, миксом зелени и фирменным соусом.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sl-6",
    category: "salads",
    name: "Цезарь с курицей",
    price: 450,
    portion: "250 гр",
    description: "Хрустящие листья салата романо, сочная куриная грудка-гриль, сухарики, сыр пармезан и соус цезарь.",
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sl-7",
    category: "salads",
    name: "Нисуаз с форелью",
    price: 690,
    portion: "280 гр",
    description: "Сытный салат французской кухни с нежной форелью, картофелем, яйцом пашот, фасолью и оливками.",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sl-8",
    category: "salads",
    name: "Овощной салат с авокадо",
    price: 490,
    portion: "240 гр",
    description: "Здоровое сочетание спелого авокадо, огурцов, черри, листьев салата и легкой заправки.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sl-9",
    category: "salads",
    name: "Азиатский салат",
    price: 420,
    portion: "210 гр",
    description: "Пряный салат с хрустящими овощами, зеленью и восточным соусом.",
    image: "https://images.unsplash.com/photo-1561131248-3164a6421971?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sl-10",
    category: "salads",
    name: "Аристократ",
    price: 490,
    portion: "230 гр",
    description: "Изысканный салат с деликатесным мясом, сыром и авторской заправкой.",
    image: "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sl-11",
    category: "salads",
    name: "Горячая фунчоза",
    price: 450,
    portion: "250 гр",
    description: "Рисовая лапша, обжаренная с соломкой из говядины и болгарского перца в соевом соусе.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sl-12",
    category: "salads",
    name: "Капрезе",
    price: 490,
    portion: "200 гр",
    description: "Классический итальянский салат из томатов, моцареллы, базилика и соуса песто.",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sl-13",
    category: "salads",
    name: "Хрустящие баклажаны",
    price: 420,
    portion: "220 гр",
    description: "Обжаренные до хрустящей корочки баклажаны в кисло-сладком соусе со свежими помидорами и кинзой.",
    image: "https://images.unsplash.com/photo-1625938670751-243da9999396?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sl-14",
    category: "salads",
    name: "Нежный краб",
    price: 350,
    portion: "200 гр",
    description: "Легкий салат с крабовым мясом, кукурузой, яйцом и сливочной заправкой.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60"
  },

  // === ВТОРЫЕ БЛЮДА ===
  {
    id: "mn-1",
    category: "mains",
    name: "Куурдак из говядины",
    price: 590,
    portion: "350 гр",
    description: "Традиционное жаркое из сочной говядины с луком и картофелем, обжаренное до румяной корочки.",
    image: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "mn-2",
    category: "mains",
    name: "Куурдак из баранины",
    price: 640,
    portion: "350 гр",
    description: "Аутентичный куурдак из свежей баранины на косточке с луком и золотистым картофелем.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "mn-3",
    category: "mains",
    name: "Казан-кебаб с говядиной",
    price: 690,
    portion: "400 гр",
    description: "Аппетитные куски говядины с запеченным картофелем, приготовленные в казане со специями.",
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "mn-4",
    category: "mains",
    name: "Мясо с овощами",
    price: 590,
    portion: "320 гр",
    description: "Ломтики говядины, тушенные с сезонными овощами и восточными специями.",
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "mn-5",
    category: "mains",
    name: "Мясо по-китайски",
    price: 620,
    portion: "300 гр",
    description: "Обжаренная говядина в фирменном китайском соусе с перцем и древесными грибами.",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "mn-6",
    category: "mains",
    name: "Телятина с картофелем",
    price: 690,
    portion: "380 гр",
    description: "Нежная телятина, томленая с молодым картофелем и ароматными травами.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "mn-7",
    category: "mains",
    name: "Картофель по-домашнему",
    price: 350,
    portion: "300 гр",
    description: "Жареный картофель с луком, грибами и чесноком по традиционному рецепту.",
    image: "https://images.unsplash.com/photo-1518013006365-1d4e78f7e274?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "mn-8",
    category: "mains",
    name: "Босо лагман",
    price: 390,
    portion: "350 гр",
    description: "Жареная домашняя лапша ручной тяжки с говядиной, овощами и специями в воке.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "mn-9",
    category: "mains",
    name: "Гуйру лагман",
    price: 420,
    portion: "400 гр",
    description: "Тянутая вручную лапша с крупно нарезанными овощами и говядиной в густом подливе.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "mn-10",
    category: "mains",
    name: "Манты (порция)",
    price: 390,
    portion: "4 шт",
    description: "Паровые манты с начинкой из рубленой говядины и лука с курдючным жиром.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "mn-11",
    category: "mains",
    name: "Яичная лапша",
    price: 350,
    portion: "300 гр",
    description: "Сытная лапша на яйцах с куриным филе и овощами вок.",
    image: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "mn-12",
    category: "mains",
    name: "Курица по-пекински",
    price: 620,
    portion: "350 гр",
    description: "Кусочки куриного филе в глазури с кунжутом, перцем и оригинальным пекинским соусом.",
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "mn-13",
    category: "mains",
    name: "Феттучини с курицей",
    price: 490,
    portion: "320 гр",
    description: "Паста феттучини с нежным куриным филе и шампиньонами в сливочном соусе с пармезаном.",
    image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "mn-14",
    category: "mains",
    name: "Феттучини с семгой",
    price: 690,
    portion: "320 гр",
    description: "Паста феттучини с филе красной рыбы в нежном сливочном соусе с зеленью.",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "mn-15",
    category: "mains",
    name: "Котлета по-киевски",
    price: 520,
    portion: "250 гр",
    description: "Сочная куриная грудка в хрустящей панировке со сливочным маслом и зеленью внутри. Подается с гарниром.",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&auto=format&fit=crop&q=60"
  },

  // === ШАШЛЫКИ И БЛЮДА НА МАНГАЛЕ ===
  {
    id: "gr-1",
    category: "grill",
    name: "Баранина на косточках",
    price: 690,
    portion: "300 гр",
    description: "Нежные ребрышки и пистолетики молодой баранины, зажаренные на углях.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-2",
    category: "grill",
    name: "Шашлык из говядины",
    price: 620,
    portion: "250 гр",
    description: "Маринованные кусочки отборной говядины, приготовленные на мангале с луком.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-3",
    category: "grill",
    name: "Курица филе (шашлык)",
    price: 450,
    portion: "250 гр",
    description: "Диетическое и сочное куриное филе на углях.",
    image: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-4",
    category: "grill",
    name: "Курица на костях",
    price: 420,
    portion: "250 гр",
    description: "Части курицы на косточке с хрустящей корочкой гриль.",
    image: "https://images.unsplash.com/photo-1626201870407-5f57db8f081c?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-5",
    category: "grill",
    name: "Крылышки на мангале",
    price: 490,
    portion: "350 гр",
    description: "Золотистые пикантные куриные крылышки с ароматом дыма.",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-6",
    category: "grill",
    name: "Оромо-кебаб",
    price: 520,
    portion: "250 гр",
    description: "Крученый шашлык из мясного фарша со специями в тонкой сетке.",
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-7",
    category: "grill",
    name: "Кебаб в лаваше",
    price: 490,
    portion: "250 гр",
    description: "Люля-кебаб, завернутый в лаваш со свежей зеленью и маринованным луком.",
    image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-8",
    category: "grill",
    name: "Кебаб в рубашке",
    price: 590,
    portion: "300 гр",
    description: "Кебаб из рубленого мяса, обернутый в тонкую жировую сетку для сочности.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-9",
    category: "grill",
    name: "Люля-кебаб",
    price: 490,
    portion: "300 гр",
    description: "Традиционный люля-кебаб из нежного фарша говядины и баранины со специями.",
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-10",
    category: "grill",
    name: "Ассорти шашлыков",
    price: 790,
    portion: "400 гр",
    description: "Микс из разных видов шашлыка: говядина, курица, люля-кебаб с овощами.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-11",
    category: "grill",
    name: "Утиная грудка",
    price: 400,
    portion: "300 гр",
    description: "Нежная и ароматная утиная грудка, подкопченная на углях.",
    image: "https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-12",
    category: "grill",
    name: "Печень в рубашке",
    price: 490,
    portion: "250 гр",
    description: "Нежная говяжья печень в жировой сетке на мангале. Очень сочная.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-13",
    category: "grill",
    name: "Форель на углях",
    price: 890,
    portion: "350-400 гр",
    description: "Речная форель целиком со специями и лимоном, запеченная на решетке.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-14",
    category: "grill",
    name: "Овощи на мангале",
    price: 290,
    portion: "250 гр",
    description: "Помидоры, перец болгарский, баклажаны, запеченные с дымком.",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-15",
    category: "grill",
    name: "Картофель на мангале",
    price: 220,
    portion: "250 гр",
    description: "Ломтики картофеля со специями, обжаренные на шампурах.",
    image: "https://images.unsplash.com/photo-1518013006365-1d4e78f7e274?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-16",
    category: "grill",
    name: "Кукуруза на мангале",
    price: 220,
    portion: "1 шт",
    description: "Сладкий початок кукурузы, обжаренный со сливочным маслом и солью на углях.",
    image: "https://images.unsplash.com/photo-1551754625-702980ca8f6a?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "gr-17",
    category: "grill",
    name: "Шампиньоны на мангале",
    price: 320,
    portion: "200 гр",
    description: "Крупные сочные шампиньоны со специями, запеченные на шампурах.",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=60"
  },

  // === СЕТЫ ОТ ШЕФА ===
  {
    id: "st-1",
    category: "sets",
    name: "Сет «Малый»",
    price: 2990,
    portion: "1.8 кг",
    description: "Баранина на косточках, Говядина, Курица на костях, Оромо-кебаб, Овощи на мангале, Кукуруза, Лепешки на углях, Шашлычный соус.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "st-2",
    category: "sets",
    name: "Сет «Солидный»",
    price: 4990,
    portion: "3.2 кг",
    description: "Баранина на косточках, Говядина, Крылышки, Кебаб в рубашке, Овощи на мангале, Картофель на мангале, Утиные грудки, Лепешки на углях.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=60"
  },

  // === СТЕЙКИ И ГОРЯЧЕЕ ===
  {
    id: "sk-1",
    category: "steaks",
    name: "Стейк из форели",
    price: 890,
    portion: "300 гр",
    description: "Нежный стейк красной рыбы со специями и лимонным соусом.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sk-2",
    category: "steaks",
    name: "Стейк из семги",
    price: 1290,
    portion: "320 гр",
    description: "Премиальный стейк из семги, приготовленный на гриле.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sk-3",
    category: "steaks",
    name: "Тибон стейк",
    price: 1490,
    portion: "450 гр",
    description: "Большой стейк на Т-образной кости, сочетающий стриплойн и нежную вырезку.",
    image: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sk-4",
    category: "steaks",
    name: "Рибай стейк",
    price: 1690,
    portion: "350 гр",
    description: "Самый сочный стейк с высокой степенью мраморности из премиальной говядины.",
    image: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sk-5",
    category: "steaks",
    name: "Ковбой стейк",
    price: 1890,
    portion: "500 гр",
    description: "Стейк рибай на кости. Настоящий брутальный мужской стейк.",
    image: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sk-6",
    category: "steaks",
    name: "Жареная форель",
    price: 790,
    portion: "1 шт",
    description: "Целая форель, зажаренная до хрустящей аппетитной корочки.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sk-7",
    category: "steaks",
    name: "Курица в кисло-сладком соусе",
    price: 510,
    portion: "300 гр",
    description: "Кусочки курицы, обжаренные с болгарским перцем и ананасами в пикантном соусе.",
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sk-8",
    category: "steaks",
    name: "Жареный рис",
    price: 390,
    portion: "300 гр",
    description: "Рассыпчатый жареный рис с овощами и яйцом в азиатском стиле.",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sk-9",
    category: "steaks",
    name: "Медальоны из телятины",
    price: 790,
    portion: "300 гр",
    description: "Нежные медальоны из телячьей вырезки под грибным или сливочным соусом.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sk-10",
    category: "steaks",
    name: "Антрекот",
    price: 790,
    portion: "350 гр",
    description: "Сочный межреберный отруб говядины, обжаренный со специями.",
    image: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sk-11",
    category: "steaks",
    name: "Кесадилья с курицей",
    price: 520,
    portion: "280 гр",
    description: "Пшеничная тортилья с начинкой из сочного филе цыпленка, кукурузы, перца и расплавленного сыра.",
    image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sk-12",
    category: "steaks",
    name: "Фахитос с говядиной",
    price: 690,
    portion: "350 гр",
    description: "Шипящая сковорода с полосками говядины и овощей. Подается с тортильями.",
    image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sk-13",
    category: "steaks",
    name: "Фрикассе с рисом",
    price: 490,
    portion: "320 гр",
    description: "Рагу из курицы в нежном сливочном соусе с грибами, подается на подушке из риса.",
    image: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sk-14",
    category: "steaks",
    name: "Бефстроганов с пюре",
    price: 690,
    portion: "350 гр",
    description: "Классическое блюдо из тонко нарезанных кусочков говядины под сливочно-сметанным соусом с нежным пюре.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sk-15",
    category: "steaks",
    name: "Мясо с картофелем фри",
    price: 530,
    portion: "320 гр",
    description: "Кусочки обжаренной сочной говядины с порцией хрустящего картофеля фри.",
    image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&auto=format&fit=crop&q=60"
  },

  // === ЗАКУСКИ И СУПЫ ===
  {
    id: "sp-1",
    category: "starters",
    name: "Овощная нарезка",
    price: 450,
    portion: "300 гр",
    description: "Свежие огурцы, помидоры, редис, зелень, болгарский перец.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-2",
    category: "starters",
    name: "Мясная нарезка",
    price: 990,
    portion: "350 гр",
    description: "Ассорти из благородных сортов копченого и вяленого мяса, рулетов и деликатесов.",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-3",
    category: "starters",
    name: "Рулет из баклажанов",
    price: 420,
    portion: "220 гр",
    description: "Аппетитные рулетики из обжаренных баклажанов с начинкой из сыра, чеснока и орехов.",
    image: "https://images.unsplash.com/photo-1625938670751-243da9999396?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-4",
    category: "starters",
    name: "Сырная нарезка",
    price: 990,
    portion: "280 гр",
    description: "Ассорти из изысканных сортов сыра с медом, орехами и виноградом.",
    image: "https://images.unsplash.com/photo-1559561853-08026f989595?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-5",
    category: "starters",
    name: "Шорпо из говядины",
    price: 320,
    portion: "350 мл",
    description: "Наваристый прозрачный суп с куском отборной говядины, картофелем и морковью.",
    image: "https://images.unsplash.com/photo-1547825407-2d060104b7c8?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-6",
    category: "starters",
    name: "Шорпо из баранины",
    price: 350,
    portion: "350 мл",
    description: "Традиционный насыщенный бульон со свежей бараниной, крупно нарезанными овощами и специями.",
    image: "https://images.unsplash.com/photo-1547825407-2d060104b7c8?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-7",
    category: "starters",
    name: "Китайский суп",
    price: 360,
    portion: "350 мл",
    description: "Пряный легкий суп с древесными грибами, лапшой, зеленью и яйцом.",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-8",
    category: "starters",
    name: "Чечевичный крем-суп",
    price: 280,
    portion: "300 мл",
    description: "Нежный бархатистый суп-пюре из красной чечевицы. Подается с лимоном и сухариками.",
    image: "https://images.unsplash.com/photo-1547592165-e1d17fed6005?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-9",
    category: "starters",
    name: "Сливочный суп из форели",
    price: 490,
    portion: "350 мл",
    description: "Сытный суп из форели, картофеля, порея и моркови на сливках.",
    image: "https://images.unsplash.com/photo-1547825407-2d060104b7c8?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-10",
    category: "starters",
    name: "Жидкий лагман",
    price: 350,
    portion: "450 мл",
    description: "Национальное уйгурское блюдо с домашней лапшой, говядиной и большим количеством овощей в бульоне.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-11",
    category: "starters",
    name: "Чучбаро острое",
    price: 450,
    portion: "350 мл",
    description: "Мелкие мясные пельмени в остром и наваристом бульоне с зеленью.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-12",
    category: "starters",
    name: "Чучук (порция)",
    price: 350,
    portion: "100 гр",
    description: "Традиционная деликатесная домашняя колбаса из конины со специями.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-13",
    category: "starters",
    name: "Шашлык из курицы",
    price: 320,
    portion: "180 гр",
    description: "Нежные куриные шашлычки на шпажках с соусом.",
    image: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-14",
    category: "starters",
    name: "Наггетсы куриные",
    price: 290,
    portion: "200 гр",
    description: "Хрустящие куриные наггетсы в золотистой панировке с соусом.",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-15",
    category: "starters",
    name: "Домашние пельмени",
    price: 320,
    portion: "250 гр",
    description: "Пельмени ручной лепки с начинкой из говядины. Подаются со сметаной.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-16",
    category: "starters",
    name: "Перепелиный суп",
    price: 390,
    portion: "350 мл",
    description: "Лёгкий и очень полезный бульон с перепелиным яйцом и нежным мясом.",
    image: "https://images.unsplash.com/photo-1547825407-2d060104b7c8?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-17",
    category: "starters",
    name: "Мампар",
    price: 320,
    portion: "400 мл",
    description: "Наваристый суп с кусочками теста, мяса, болгарского перца, чеснока и яичным блином.",
    image: "https://images.unsplash.com/photo-1547825407-2d060104b7c8?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-18",
    category: "starters",
    name: "Рамен с курицей",
    price: 420,
    portion: "450 мл",
    description: "Японский пшеничный суп с куриным филе, лапшой, водорослями нори и яйцом.",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-19",
    category: "starters",
    name: "Рамен с говядиной",
    price: 490,
    portion: "450 мл",
    description: "Сытный рамэн с ломтиками томленой говядины, маринованным яйцом и зеленью.",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "sp-20",
    category: "starters",
    name: "Том Ям с морепродуктами",
    price: 690,
    portion: "400 мл",
    description: "Классический тайский кисло-острый суп с креветками, кальмарами, грибами и кокосовым молоком.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60"
  },

  // === ДЕТСКОЕ МЕНЮ ===
  {
    id: "kd-1",
    category: "kids",
    name: "Детские наггетсы",
    price: 290,
    portion: "150 гр",
    description: "Маленькие хрустящие наггетсы для детей, подаются с кетчупом.",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "kd-2",
    category: "kids",
    name: "Картофель фри с сосиской",
    price: 320,
    portion: "200 гр",
    description: "Золотистый картофель фри с забавной фигурной сосиской.",
    image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "kd-3",
    category: "kids",
    name: "Вареники с картофелем",
    price: 250,
    portion: "180 гр",
    description: "Нежные детские вареники с картофельным пюре и маслом.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "kd-4",
    category: "kids",
    name: "Пельмешки детские со сметаной",
    price: 290,
    portion: "180 гр",
    description: "Маленькие пельмешки с фаршем из говядины и сметанным соусом.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "kd-5",
    category: "kids",
    name: "Куриный супчик с лапшой",
    price: 220,
    portion: "250 мл",
    description: "Легкий диетический суп с куриной грудкой и вермишелью.",
    image: "https://images.unsplash.com/photo-1547825407-2d060104b7c8?w=500&auto=format&fit=crop&q=60"
  },

  // === ПИЦЦА ===
  {
    id: "pz-1",
    category: "pizza",
    name: "Маргарита",
    price: 590,
    portion: "30 см",
    description: "Итальянская классика: томатный соус, сыр моцарелла, свежие томаты и базилик.",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "pz-2",
    category: "pizza",
    name: "Пепперони",
    price: 690,
    portion: "30 см",
    description: "Острая пицца с пикантной колбасой пепперони, томатным соусом и сыром моцарелла.",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "pz-3",
    category: "pizza",
    name: "Пицца Чили",
    price: 690,
    portion: "30 см",
    description: "Острая мясная пицца с перчиком халапеньо, говядиной и луком.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "pz-4",
    category: "pizza",
    name: "Куриная пицца",
    price: 690,
    portion: "30 см",
    description: "Пицца с куриным филе, шампиньонами, кукурузой и сливочным соусом.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "pz-5",
    category: "pizza",
    name: "Пицца Цезарь",
    price: 750,
    portion: "30 см",
    description: "Куриное филе, пармезан, помидоры черри, листья салата, соус цезарь.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "pz-6",
    category: "pizza",
    name: "Пицца Капрезе",
    price: 750,
    portion: "30 см",
    description: "Сыр моцарелла, томаты, соус песто и руккола.",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "pz-7",
    category: "pizza",
    name: "Пицца 4 сыра",
    price: 790,
    portion: "30 см",
    description: "Изысканное сочетание сыров моцарелла, дорблю, пармезан и гауда.",
    image: "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "pz-8",
    category: "pizza",
    name: "Фирменная «Самоор»",
    price: 890,
    portion: "32 см",
    description: "Мясное ассорти с томатами, болгарским перцем, грибами, солеными огурчиками и соусом от шефа.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=60"
  },

  // === НАПИТКИ И КОФЕ ===
  {
    id: "dr-1",
    category: "drinks",
    name: "Эспрессо",
    price: 180,
    portion: "50 мл",
    description: "Классический крепкий кофе.",
    image: "https://images.unsplash.com/photo-1510701115857-7f99b78a0d6a?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-2",
    category: "drinks",
    name: "Американо",
    price: 180,
    portion: "300 / 400 мл",
    description: "Классический черный кофе средней крепости.",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-3",
    category: "drinks",
    name: "Кофе Латте",
    price: 190,
    portion: "300 / 400 мл",
    description: "Кофейный напиток с нежной молочной пенкой.",
    image: "https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-4",
    category: "drinks",
    name: "Капучино",
    price: 210,
    portion: "300 / 400 мл",
    description: "Крепкий кофе с густой молочной пенкой.",
    image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-5",
    category: "drinks",
    name: "Флэт Уайт",
    price: 220,
    portion: "250 мл",
    description: "Двойной эспрессо с подогретым паром молоком.",
    image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-6",
    category: "drinks",
    name: "Глинтвейн б/а",
    price: 220,
    portion: "300 мл",
    description: "Согревающий напиток на основе сока со специями и фруктами.",
    image: "https://images.unsplash.com/photo-1543254006-c6702c253520?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-7",
    category: "drinks",
    name: "Какао с соленой карамелью",
    price: 240,
    portion: "300 / 400 мл",
    description: "Сладкий какао-напиток с карамельным сиропом и щепоткой соли.",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-8",
    category: "drinks",
    name: "Горячий шоколад",
    price: 220,
    portion: "300 мл",
    description: "Густой согревающий напиток из натурального шоколада.",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-9",
    category: "drinks",
    name: "Кофе Раф",
    price: 240,
    portion: "300 / 400 мл",
    description: "Нежный десертный кофе на сливках с ванильным вкусом.",
    image: "https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-10",
    category: "drinks",
    name: "Айс Латте (холодный)",
    price: 220,
    portion: "400 мл",
    description: "Освежающий эспрессо с холодным молоком и льдом.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-11",
    category: "drinks",
    name: "Лимонад Манго-маракуйя",
    price: 250,
    portion: "400 мл",
    description: "Авторский лимонад со вкусом манго и маракуйи со льдом.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-12",
    category: "drinks",
    name: "Фирменный Чай «Самоор»",
    price: 250,
    portion: "1 л",
    description: "Фирменный ягодный чай от заведения, подается в литровом чайнике.",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-13",
    category: "drinks",
    name: "Милкшейк классический",
    price: 250,
    portion: "250 мл",
    description: "Молочный коктейль с мороженым.",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-14",
    category: "drinks",
    name: "Максым (национальный)",
    price: 170,
    portion: "1 л",
    description: "Традиционный кыргызский освежающий кислый злаковый напиток из ячменя, пшеницы и кукурузы.",
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-15",
    category: "drinks",
    name: "Чалап (национальный)",
    price: 170,
    portion: "1 л",
    description: "Кисломолочный освежающий напиток с добавлением минеральной воды.",
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-16",
    category: "drinks",
    name: "Аралаш (национальный)",
    price: 170,
    portion: "1 л",
    description: "Коктейль из смеси максыма и чалапа в пропорции 50/50.",
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-17",
    category: "drinks",
    name: "Курут классический (штука)",
    price: 120,
    portion: "1 уп",
    description: "Соленые высушенные шарики сузьмы (концентрированного кислого молока).",
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-18",
    category: "drinks",
    name: "Кока Кола",
    price: 180,
    portion: "1 л",
    description: "Классический газированный напиток.",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "dr-19",
    category: "drinks",
    name: "Свежевыжатый сок апельсин",
    price: 350,
    portion: "250 мл",
    description: "Натуральный сок холодного отжима из сочных апельсинов.",
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=500&auto=format&fit=crop&q=60"
  }
];
