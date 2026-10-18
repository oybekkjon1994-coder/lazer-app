/* Post yordamchi — tayyor matnlar. {nom} {tel} {manzil} {tg} {ig} {narx} {mahsulot} o‘rniga profildagi ma’lumot qo‘yiladi. */
window.TOPICS = {
  lazer: {
    name: "Lazer kesish xizmati", ico: "✂️",
    uz: {
      hook: ["Metallni millimetrigacha aniq kesamiz ✂️", "Chizmangiz bormi? Ertaga tayyor detal 🔥", "Qo‘lda kesish bilan vaqt yo‘qotmang — lazer bor!", "Har qanday shakl — 1 mm aniqlikda"],
      body: ["Lazer bilan list metall kesish: 1 mm dan 10 mm gacha qora metall va nerjaveyka. Detal, panel, naqsh, harf — chizma bo‘lsa, kesamiz. Chizma bo‘lmasa, o‘zimiz chizib beramiz.", "DXF fayl yuboring — narxini darhol aytamiz. Kesish uzunligiga qarab hisoblaymiz, ortiqcha to‘lov yo‘q.", "Ustaxonamizda zamonaviy lazer stanogi: tez, toza, aniq. Kichik buyurtma ham, katta partiya ham qabul qilamiz."],
      cta: ["📩 Narxini bilish uchun chizmani Direct’ga yoki Telegramga yuboring.", "📞 Qo‘ng‘iroq qiling yoki yozing — 5 daqiqada narx aytamiz.", "👇 Buyurtma uchun pastdagi raqamga yozing."]
    },
    ru: {
      hook: ["Режем металл с точностью до миллиметра ✂️", "Есть чертёж? Завтра готовая деталь 🔥", "Лазерная резка любой сложности"],
      body: ["Лазерная резка листового металла от 1 до 10 мм: чёрный металл и нержавейка. Детали, панели, узоры, буквы — режем по вашему чертежу или нарисуем сами.", "Пришлите DXF — сразу скажем цену. Считаем по длине реза, без переплат."],
      cta: ["📩 Пишите в Direct или Telegram — посчитаем стоимость.", "📞 Звоните или пишите — цена за 5 минут."]
    },
    tags: "#lazerkesish #lazerrezka #лазернаярезка #metall #cnc #ustaxona #uzbekistan #toshkent #резкаметалла #dxf",
    story: ["Bugun kesdik 🔥 Sizga ham kerakmi? 👇", "Chizma yuboring — narxini 5 daqiqada aytamiz ⏱", "Savol stikeri: «Qanday detal kerak?»"],
    reels: ["Kadr: lazer uchqunlari yaqindan (3 s) → tayyor detal qo‘lda (2 s) → mijozga topshirish (2 s). Ustiga yozuv: «Chizmadan detalgacha — 1 kunda»", "Kadr: kompyuterda chizma → stanok kesyapti (tezlashtirilgan) → natija. Musiqa: tez ritm"],
    ai: ["Close-up of a fiber laser cutting a steel sheet, bright orange sparks flying, dark industrial workshop, slow motion, cinematic lighting, shallow depth of field, vertical 9:16", "Overhead shot of a CNC laser head moving fast over a metal sheet, cutting precise geometric shapes, glowing sparks, modern factory, vertical 9:16"]
  },
  darvoza: {
    name: "Darvoza va panjara", ico: "🚪",
    uz: {
      hook: ["Uyingizning yuzi — darvoza 🏡", "Darvozangiz qo‘shnilarnikidan farq qilsinmi?", "Naqshli darvoza — uyning ko‘rki ✨"],
      body: ["Darvoza, kalitka va panjaralar uchun naqshli panellarni lazerda kesamiz. O‘lchamingizni ayting — dizaynini tayyorlab, ko‘rsatamiz, keyin kesamiz.", "Islomiy naqsh, zamonaviy geometriya yoki o‘zingiz xohlagan rasm — hammasini metallda qilamiz. Bo‘yash va yig‘ish ham bor.", "Rasm yuboring, o‘lchamni ayting — darvozangiz qanday ko‘rinishini oldindan rasmda ko‘rasiz."],
      cta: ["📩 Darvoza rasmini va o‘lchamini yuboring — dizayn tekin.", "📞 Narx va muddat uchun yozing."]
    },
    ru: {
      hook: ["Ворота — лицо вашего дома 🏡", "Узорные ворота на заказ ✨"],
      body: ["Режем узорные панели для ворот, калиток и ограждений. Скажите размер — подготовим дизайн, покажем, потом изготовим.", "Восточные узоры, современная геометрия или ваш рисунок — всё в металле. Покраска и сборка."],
      cta: ["📩 Пришлите фото и размеры — дизайн бесплатно.", "📞 Пишите — цена и сроки."]
    },
    tags: "#darvoza #ворота #panjara #забор #naqsh #metalldarvoza #kovka #uzbekistan #toshkent #lazerkesish",
    story: ["Qaysi biri yoqdi? 1 yoki 2 (so‘rovnoma stikeri)", "Yangi darvoza tayyor ✅ O‘lchamingizni yozing 👇"],
    reels: ["Kadr: eski darvoza → yangi naqshli darvoza (o‘tish effekti). Yozuv: «Oldin / Keyin»", "Kadr: panel kesilishi → bo‘yash → o‘rnatish → uy egasining reaksiyasi"],
    ai: ["A modern black metal gate with an intricate Islamic geometric pattern on an Uzbek house, warm evening light, camera slowly pushing in, photorealistic, vertical 9:16", "Golden sunset light passing through a laser-cut decorative metal gate, casting patterned shadows on the ground, cinematic, vertical 9:16"]
  },
  naqsh: {
    name: "Islomiy naqsh panellar", ico: "🕌",
    uz: {
      hook: ["Sharq naqshlari — metallda ✨", "Har bir naqsh — o‘ziga xos san’at", "Devoringizga ruh bering 🕌"],
      body: ["Islomiy girih naqshli panellar: devor bezagi, fasad, ayvon, panjara va eshiklar uchun. 60 dan ortiq naqsh turi, istalgan o‘lchamda.", "Naqsh ichiga yozuv ham qo‘yamiz: «Bismillah», ism yoki oila nomi. Rangini o‘zingiz tanlaysiz: qora, oltin, bronza."],
      cta: ["📩 O‘lcham va naqsh tanlash uchun yozing.", "👇 Katalogni so‘rang — Direct’da yuboramiz."]
    },
    ru: {
      hook: ["Восточные узоры в металле ✨", "Искусство, которое живёт на стене"],
      body: ["Панели с исламским геометрическим узором: декор стен, фасадов, айванов и дверей. Более 60 видов узоров, любой размер.", "Добавим надпись внутрь узора: «Бисмиллях», имя или фамилию. Цвет на выбор: чёрный, золото, бронза."],
      cta: ["📩 Пишите — подберём узор и размер.", "👇 Запросите каталог в Direct."]
    },
    tags: "#naqsh #girih #islomiynaqsh #исламскийузор #восточныйорнамент #decor #metalldecor #uzbekistan #lazerkesish #interyer",
    story: ["Qaysi naqsh chiroyli? 👇 (slayder stikeri)", "Yangi panel tayyor — «Bismillah» yozuvi bilan ✨"],
    reels: ["Kadr: naqsh chiziqlari ekranda chizilib boradi → metall panelga aylanadi → devorga osiladi", "Kadr: orqadan LED yorug‘lik bilan yoritilgan naqsh panel, kamera sekin yaqinlashadi"],
    ai: ["An elegant black metal wall panel with a detailed Islamic star pattern, warm backlight glowing through the cutouts, luxury interior, slow camera push-in, vertical 9:16", "A golden laser-cut Islamic geometric panel on a white wall, soft sunlight moving across it, cinematic, vertical 9:16"]
  },
  mangal: {
    name: "Mangal va qozon o‘chog‘i", ico: "🔥",
    uz: {
      hook: ["Dam olish kunlari tayyormisiz? 🔥", "Qozon o‘chog‘i — har bir hovliga kerak", "Mangal o‘zingizning naqshingiz bilan!"],
      body: ["Mangal, qozon o‘chog‘i va kamin ekranlarini qalin metalldan tayyorlaymiz. Qozoningiz o‘lchamiga moslab, eshikcha va kolosnik bilan.", "Yon devorlariga naqsh yoki ismingizni o‘yib beramiz — sovg‘a uchun ham zo‘r."],
      cta: ["📩 Qozon o‘lchamini yozing — narxini aytamiz.", "📞 Buyurtma uchun qo‘ng‘iroq qiling."]
    },
    ru: {
      hook: ["Готовы к выходным? 🔥", "Печь под казан для каждого двора"],
      body: ["Изготовим мангал, печь под казан и экраны для камина из толстого металла. Под размер вашего казана, с дверцей и колосником.", "На стенках вырежем узор или имя — отличный подарок."],
      cta: ["📩 Напишите размер казана — скажем цену.", "📞 Звоните для заказа."]
    },
    tags: "#mangal #мангал #qozon #казан #печьподказан #ochoq #hovli #dacha #uzbekistan #metall",
    story: ["Shu hafta kim osh damlaydi? 🍚🔥", "Yangi mangal tayyor — naqshli ✨"],
    reels: ["Kadr: o‘chog‘da olov yoqiladi → qozon qo‘yiladi → osh tayyor. Yozuv: «O‘chog‘i bizdan»", "Kadr: mangal yon devoridagi naqshdan olov yorug‘i chiqib turadi (kechqurun)"],
    ai: ["A black metal outdoor stove with a large Uzbek kazan cooking plov, flames visible through decorative laser-cut holes, evening courtyard, cozy atmosphere, vertical 9:16"]
  },
  dekor: {
    name: "Devor dekori, soat, siluet", ico: "🦅",
    uz: {
      hook: ["Bo‘sh devorga jon kiriting 🖼", "Sovg‘a qidiryapsizmi? 🎁", "Metall san’at — uyingiz uchun"],
      body: ["Metall devor dekorlari: hayot daraxti, ot, burgut, tog‘ manzaralari, devor soatlari va ko‘zgu ramkalari. Istalgan o‘lcham va rangda.", "Ism, oila nomi yoki sana yozilgan dekor — to‘y, yubiley va yangi uy uchun eng yaxshi sovg‘a."],
      cta: ["📩 Qaysi rasm yoqdi? Direct’ga yozing.", "🎁 Sovg‘a uchun buyurtma — 2–3 kunda tayyor."]
    },
    ru: {
      hook: ["Оживите пустую стену 🖼", "Ищете подарок? 🎁"],
      body: ["Металлический декор на стену: древо жизни, конь, орёл, горы, настенные часы и рамы для зеркал. Любой размер и цвет.", "Декор с именем, фамилией или датой — лучший подарок на свадьбу, юбилей и новоселье."],
      cta: ["📩 Что понравилось? Пишите в Direct.", "🎁 Подарок на заказ — за 2–3 дня."]
    },
    tags: "#devordekori #декорнастену #metallart #металлическийдекор #sovga #подарок #interyer #soat #uzbekistan #lazerkesish",
    story: ["Qaysi biri: ot 🐎 yoki burgut 🦅? (so‘rovnoma)", "Mijozimiz devorida 😍"],
    reels: ["Kadr: bo‘sh devor → dekor osiladi → xona o‘zgaradi (oldin/keyin)", "Kadr: dekor kesilishi tezlashtirilgan, keyin bo‘yalgan holda devorda"],
    ai: ["A black metal tree of life wall art on a beige living room wall, soft morning light, camera slowly panning, cozy modern interior, vertical 9:16"]
  },
  aksiya: {
    name: "Aksiya va chegirma", ico: "🎉",
    uz: {
      hook: ["⚡ FAQAT SHU HAFTA!", "🎉 Aksiya boshlandi!", "Chegirma — {narx} gacha!"],
      body: ["{mahsulot} uchun maxsus narx. Aksiya cheklangan muddatga — ulgurib qoling!", "Birinchi 10 ta buyurtmaga sovg‘a: bo‘yash bepul."],
      cta: ["📩 Joy band qilish uchun hozir yozing.", "⏳ Aksiya tugashiga oz qoldi — yozing!"]
    },
    ru: {
      hook: ["⚡ ТОЛЬКО ЭТУ НЕДЕЛЮ!", "🎉 Акция началась!"],
      body: ["Специальная цена на {mahsulot}. Акция ограничена по времени — успейте!", "Первым 10 заказам — покраска в подарок."],
      cta: ["📩 Пишите сейчас, чтобы забронировать.", "⏳ До конца акции осталось мало времени!"]
    },
    tags: "#aksiya #акция #chegirma #скидка #uzbekistan #toshkent #lazerkesish #metall",
    story: ["⏳ Aksiya tugashiga 2 kun! (taymer stikeri)", "Savol: «Aksiya qaysi mahsulotga kerak?»"],
    reels: ["Kadr: katta yozuv «-20%» → mahsulotlar ketma-ket (har biri 1 s) → «Faqat shu hafta»"],
    ai: ["Dynamic promotional shot of laser-cut metal products appearing one by one on a dark background with orange light streaks, energetic, vertical 9:16"]
  },
  tayyor: {
    name: "Tayyor ish", ico: "✅",
    uz: {
      hook: ["Ish topshirildi ✅", "Yangi ish — yangi naqsh ✨", "Bugungi ishimiz 👇"],
      body: ["{mahsulot} tayyor bo‘ldi va mijozga topshirildi. O‘lcham, naqsh va rang — mijoz xohlaganidek.", "Bizga ishonganingiz uchun rahmat! Har bir buyurtmaga o‘zimiznikidek qaraymiz."],
      cta: ["📩 Sizga ham shunday kerakmi? Yozing.", "👇 Buyurtma uchun Direct’ga yozing."]
    },
    ru: {
      hook: ["Работа сдана ✅", "Новая работа ✨"],
      body: ["{mahsulot} готово и передано клиенту. Размер, узор и цвет — как хотел клиент.", "Спасибо за доверие! К каждому заказу относимся как к своему."],
      cta: ["📩 Хотите так же? Пишите.", "👇 Заказ — в Direct."]
    },
    tags: "#tayyorish #готоваяработа #uzbekistan #lazerkesish #metall #toshkent",
    story: ["Bugungi ish ✅ Sizga qaysi rang yoqadi? (so‘rovnoma)", "Mijoz ruxsati bilan uning yuborgan haqiqiy rasm yoki fikrini ulashing"],
    reels: ["Kadr: kesish → bo‘yash → o‘rnatish → tayyor ish umumiy ko‘rinishda (har biri 2 s)"],
    ai: ["Slow cinematic reveal of a finished black laser-cut metal panel installed on a house facade, golden hour light, vertical 9:16"]
  },
  jarayon: {
    name: "Ish jarayoni (video)", ico: "🎬",
    uz: {
      hook: ["Bu qanday yasaladi? 👀", "Chizmadan tayyor detalgacha ⏱", "Ustaxonamizdan bir kun"],
      body: ["Avval kompyuterda chizamiz, keyin lazer stanogi kesadi, so‘ng tozalab, bo‘yab topshiramiz. Hammasi bitta ustaxonada.", "Lazer metallni eritib kesadi — shuning uchun chetlari tekis va toza chiqadi."],
      cta: ["🔔 Obuna bo‘ling — har kuni yangi ish ko‘rsatamiz.", "📩 Savollaringizni izohda yozing."]
    },
    ru: {
      hook: ["Как это делается? 👀", "От чертежа до готовой детали ⏱"],
      body: ["Сначала рисуем на компьютере, потом лазер режет, затем зачищаем, красим и отдаём. Всё в одной мастерской.", "Лазер плавит металл — поэтому края ровные и чистые."],
      cta: ["🔔 Подписывайтесь — каждый день новые работы.", "📩 Вопросы пишите в комментариях."]
    },
    tags: "#jarayon #процесс #lazerkesish #лазернаярезка #ustaxona #мастерская #cnc #uzbekistan",
    story: ["Hozir kesyapmiz 🔥 (jonli video)", "Taxmin qiling: bu nima bo‘ladi? 🤔"],
    reels: ["Kadr: 1) chizma ekranda 2) stanok ishga tushadi 3) uchqunlar yaqindan 4) detal qo‘lda. Har biri 1,5 s, tez musiqa", "Kadr: «Taxmin qiling» — kesilayotgan detal, oxirida tayyor buyum ko‘rsatiladi"],
    ai: ["Timelapse of a metal workshop day: laser cutting machine working, worker cleaning parts, painting, final product on a table, warm cinematic light, vertical 9:16"]
  },
  ilova: {
    name: "Lazer ilovasi (sotuv)", ico: "📱",
    uz: {
      hook: ["Lazer ustaxonasi uchun o‘zbekcha ilova 📱", "DXF narxi — 1 soniyada ⚡", "Chizmani telefonda yasang!"],
      body: ["Narx hisoblash, DXF yasash, 60+ islomiy naqsh, tayyor shablonlar, nesting, buyurtmalar va mijozga rasm — hammasi bitta ilovada.", "Mijoz DXF yuborsa — kesish uzunligi va narxi darhol chiqadi. Darvoza rasmini o‘lchamga moslab, DXF qilib beradi."],
      cta: ["📲 Ilovani olish uchun Telegram botga yozing: {tg}", "👇 Batafsil — profildagi havolada."]
    },
    ru: {
      hook: ["Приложение для мастерской лазерной резки 📱", "Цена по DXF — за 1 секунду ⚡"],
      body: ["Расчёт цены, создание DXF, 60+ исламских узоров, готовые шаблоны, раскрой листа, заказы и картинка для клиента — всё в одном приложении."],
      cta: ["📲 Чтобы получить приложение, пишите в Telegram-бот: {tg}"]
    },
    tags: "#lazerkesish #лазернаярезка #dxf #cnc #ilova #приложение #ustaxona #uzbekistan",
    story: ["Ilova qanday ishlaydi — 15 soniyada 👇", "Savol stikeri: «Ilova haqida nima bilmoqchisiz?»"],
    reels: ["Kadr: telefonda DXF ochiladi → narx chiqadi → naqsh tanlanadi → devordagi ko‘rinish. Yozuv: «Hammasi bitta ilovada»"],
    ai: ["A craftsman in a metal workshop looking at a smartphone, then at a laser cutting machine, nodding with satisfaction, natural light, vertical 9:16"]
  },
  gap: {
    name: "Gap daftari (ilova)", ico: "🤝",
    uz: {
      hook: ["Gapda kim to‘ladi, kim to‘lamadi? 🤔", "Gap hisobi endi telefonda 📱", "Navbat, to‘lov, davomat — bitta ilovada"],
      body: ["Gap daftari: qur’a bilan navbat, kim berdi-bermadi, qisman to‘lov, davomat, gap joyi va xarajatni bo‘lish. Eslatmani bir tugma bilan guruhga yuborasiz.", "Daftar va kalkulyatorni unuting — ilova hammasini o‘zi hisoblaydi va eslatib turadi."],
      cta: ["📲 Yuklab olish uchun yozing: {tg}", "👇 Havola profilda."]
    },
    ru: {
      hook: ["Кто сдал, кто не сдал? 🤔", "Учёт «гапа» теперь в телефоне 📱"],
      body: ["Gap daftari: очередь по жребию, кто сдал, частичная оплата, посещаемость, место встречи и деление расходов. Напоминание в группу одной кнопкой."],
      cta: ["📲 Скачать — пишите: {tg}"]
    },
    tags: "#gap #гап #chernayakassa #чернаякасса #ilova #приложение #uzbekistan",
    story: ["Sizning gapingizda nechta kishi bor? (savol)", "Gap kuni hisob 1 daqiqada ✅"],
    reels: ["Kadr: daftar va kalkulyator stolda → telefon olinadi → ilovada qur’a → «To‘ladi» belgilari → guruhga eslatma"],
    ai: ["Friends sitting around a table at a home gathering in Uzbekistan, one person showing a smartphone app to others, warm evening light, cheerful mood, vertical 9:16"]
  }
};
