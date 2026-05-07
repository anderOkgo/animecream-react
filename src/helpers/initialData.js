/**
 * Datos semilla para SEO y carga instantánea.
 * Contiene una muestra representativa para que los buscadores
 * encuentren contenido real antes de la respuesta del API.
 */
const initialData = [
  {
    production_name: "Frieren: Beyond Journey's End",
    production_year: 2023,
    production_description:
      'El diseño de personajes y escenarios acompaña con acierto una historia de aventura construida desde la memoria. Más allá de las gestas heroicas, la serie revisita un viaje ya concluido, revelando hazañas que para los humanos fueron trascendentales y que, con el paso del tiempo, se vuelven instantes fugaces. Un relato melancólico que reflexiona sobre lo breve de la vida humana y cómo el tiempo continúa avanzando entre recuerdos.',
    production_description_en:
      'The character and world design effectively supports an adventure story built through memory. Beyond heroic feats, the series revisits a journey already completed, revealing deeds that were transcendent for humans yet become fleeting moments over time. A melancholic tale reflecting on the brevity of human life and how time continues to move forward through memories.',
    production_number_chapters: 28,
    production_image_path: '/img/tarjeta/476.jpg',
    production_ranking_number: 71,
    demographic_name: 'Shōnen',
    genre_names: 'Magia,Drama,Fantasía,Aventura,Misterio',
    id: 476,
  },
  {
    production_name: 'Attack on Titan: The Final Season',
    production_year: 2020,
    production_description:
      'Se presenta como una poderosa antítesis del concepto tradicional de la guerra, cuestionando la figura de héroes y villanos y la historia narrada por los vencedores. A través de múltiples puntos de vista, expone los errores recurrentes de la humanidad en una obra que combina acción intensa, carga emocional y un uso simbólico profundo, alcanzando un resultado tan devastador como apoteósico.',
    production_description_en:
      'It presents itself as a powerful antithesis to the traditional concept of war, questioning the roles of heroes and villains and the history written by the victors. Through multiple perspectives, it exposes humanity’s recurring mistakes in a work that blends intense action, emotional weight, and rich symbolism, achieving a result that is both devastating and apotheotic.',
    production_number_chapters: 16,
    production_image_path: '/img/tarjeta/474.jpg',
    production_ranking_number: 50,
    demographic_name: 'Shōnen-Seinen',
    genre_names: 'Acción,Drama,Fantasía,Suspenso,Misterio',
    id: 474,
  },
  {
    production_name: '86 - Eighty Six',
    production_year: 2021,
    production_description:
      'La serie plantea un entorno bélico dominado por facciones militares, donde el grupo conocido como los 86 es enviado a combatir como fuerza desechable en una guerra que no les pertenece. A través de este conflicto se exploran la deshumanización, la segregación y el peso psicológico de la guerra, construyendo una narrativa sostenida por la tensión constante y el desarrollo emocional de sus personajes.',
    production_description_en:
      'The series presents a war-torn setting ruled by military factions, where the group known as the 86 is sent to fight as expendable forces in a war that is not theirs. Through this conflict, it explores dehumanization, segregation, and the psychological burden of war, building a narrative sustained by constant tension and the emotional development of its characters.',
    production_number_chapters: 23,
    production_image_path: '/img/tarjeta/480_1765765261788.jpg',
    production_ranking_number: 76,
    demographic_name: 'Seinen',
    genre_names: 'Drama,Ciencia ficción,Suspenso,Bélico,Filosófico',
    id: 480,
  },
  {
    production_name: 'Hunter × Hunter 2011',
    production_year: 2011,
    production_description:
      'Los cazadores son personajes que tienen el poder de acceder a una gran cantidad de recursos ilimitados. El protagonista se embarca en un viaje de acción y aventuras siguiendo el rastro de uno de los más grandes cazadores, encontrándose por el camino con personajes grandiosos y peligrosos en una trama muy ecléctica, atractiva y entretenida.',
    production_description_en:
      'Hunters are characters who have the power to access vast unlimited resources. The protagonist embarks on an action-adventure journey following the trail of one of the greatest hunters, encountering magnificent and dangerous characters along the way in a very eclectic, attractive, and entertaining plot.',
    production_number_chapters: 148,
    production_image_path: '/img/tarjeta/7.jpg',
    production_ranking_number: 10,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Fantasía,Aventura,Entretenimiento',
    id: 7,
  },
  {
    production_name: 'Code Geass',
    production_year: 2006,
    production_description:
      'En una brillante mezcla entre mechas, dictaduras y opresión con un singular toque de fantasía, cuentan una historia intrigante de estrategia bélica entre facciones militares, rebeldes y ambición política, en entornos de misterios como el Geass, el poder de los reyes, el cual tiene la potestad de cambiar el rumbo de esta revolución a nivel mundial.',
    production_description_en:
      'In a brilliant blend of mechas, dictatorships and oppression with a unique touch of fantasy, they tell an intriguing story of war strategy between military factions, rebels and political ambition, in settings of mysteries like Geass, the power of kings, which has the authority to change the course of this worldwide revolution.',
    production_number_chapters: 25,
    production_image_path: '/img/tarjeta/243_1767493200853.jpg',
    production_ranking_number: 6,
    demographic_name: 'Seinen',
    genre_names: 'Ciencia ficción,Mecha,Triller Psicológico',
    id: 243,
  },
  {
    production_name: 'FLCL',
    production_year: 2000,
    production_description:
      'En un universo de aparente ridiculez inconsecuente, Haruko Haruhara llega a la tranquila ciudad de Mabase en busca de quien tenga el poder de emular al rey de los piratas, capaz de abrir portales espaciales y teletransportar incluso planetas enteros, generando conflictos con la Medical Mechanica y la Fraternidad Espacial, envolviendo a los protagonistas en un aparente sin sentido.',
    production_description_en:
      'In a universe of seemingly inconsequential absurdity, Haruko Haruhara arrives in the peaceful town of Mabase searching for someone with the power to emulate the Pirate King, capable of opening spatial portals and teleporting entire planets, creating conflicts with Medical Mechanica and the Space Brotherhood, dragging the protagonists into apparent nonsense.',
    production_number_chapters: 6,
    production_image_path: '/img/tarjeta/5.jpg',
    production_ranking_number: 3,
    demographic_name: 'Seinen',
    genre_names: 'Ciencia ficción,Musical,Otaku,Misterio',
    id: 5,
  },
  {
    production_name: 'Neon Genesis Evangelion',
    production_year: 1995,
    production_description:
      'La historia comienza cuando el protagonista llega a la ciudad fortaleza de Tokio-3, justo cuando los Ángeles invaden para reclamar lo que consideran suyo. Esto desata una lucha por la supremacía que provoca efectos colaterales de autodestrucción psicológica, alcanzando niveles apocalípticos y de reflexión existencial, rompiendo los paradigmas y límites de toda obra creada anteriormente.',
    production_description_en:
      'The story begins as the protagonist arrives in the fortress city of Tokyo-3, just as the Angels invade to reclaim what they see as theirs. This sparks a struggle for supremacy with side effects of psychological self-destruction, reaching apocalyptic and existential levels, breaking the paradigms and limits of any work created before.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/2_1766551615193.jpg',
    production_ranking_number: 1,
    demographic_name: 'Shōnen-Seinen',
    genre_names: 'Psicologico,Ciencia ficción,Suspenso,Misterio',
    id: 2,
  },
  {
    production_name: 'Mobile Suit Gundam Wing',
    production_year: 1995,
    production_description:
      'La desigualdad ha creado un inconformismo entre las colonias y la alianza terrestre. En simultáneo se planea una infiltración a la Tierra. Cuatro experimentados pilotos, sin ser del todo conscientes, hacen parte de esa operación, desplegando batallas y conflictos con intereses políticos entre una gran cantidad de facciones internas, externas y las colonias.',
    production_description_en:
      'Inequality has created discontent between the colonies and the Earth Alliance. Simultaneously, an infiltration of Earth is planned. Four experienced pilots, without being fully aware, are part of that operation, deploying battles and conflicts with political interests among a large number of internal, external factions and the colonies.',
    production_number_chapters: 49,
    production_image_path: '/img/tarjeta/21.jpg',
    production_ranking_number: 12,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Ciencia ficción,Mecha',
    id: 21,
  },
  {
    production_name: 'Berserk',
    production_year: 1997,
    production_description:
      'En un mundo dónde las voluntades humanas son controladas por fuerzas como el destino escritas por la mano divina, se cuenta la historia de un grupo de mercenarios que intentan hacerse un lugar en este sombrío y entrópico entorno, donde en cualquier momento la mano divina puede cambiarlo todo, influenciando la existencia humana y liberando caos por el mundo.',
    production_description_en:
      'In a world where human wills are controlled by forces like destiny written by the divine hand, the story of a group of mercenaries trying to make a place for themselves in this gloomy and entropic environment is told, where at any moment the divine hand can change everything, influencing human existence and unleashing chaos throughout the world.',
    production_number_chapters: 25,
    production_image_path: '/img/tarjeta/30.jpg',
    production_ranking_number: 24,
    demographic_name: 'Seinen',
    genre_names: 'Acción,Drama,Fantasía,Sobrenatural',
    id: 30,
  },
  {
    production_name: 'Space Adventure Cobra',
    production_year: 1982,
    production_description:
      'Después de mucho tiempo, el famoso pirata espacial más perseguido del universo despierta de su letargo, sumergiéndose en aventuras surrealistas que mezclan perfectamente la ficción y la fantasía, con viajes de acción y aventura. Está rodeado de personajes interesantes, haciendo énfasis en los femeninos, que irían quedando por el camino tras la poderosa estela de Cobra.',
    production_description_en:
      "After a long time, the universe's most wanted famous space pirate awakens from his slumber, diving into surreal adventures that perfectly blend fiction and fantasy with action-adventure journeys. He is surrounded by interesting characters, with an emphasis on female ones who would fall by the wayside in the powerful wake of Cobra.",
    production_number_chapters: 31,
    production_image_path: '/img/tarjeta/3.jpg',
    production_ranking_number: 14,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Ciencia ficción,Fantasía,Aventura,Space ópera,Crimen',
    id: 3,
  },
  {
    production_name: 'The Rose of Versailles',
    production_year: 1979,
    production_description:
      'La obra se desarrolla en una Francia anterior a la revolución como una meta-historia. Cuenta sucesos de la monarquía tanto austriaca como francesa, teniendo como epicentro a París, un entorno preciso para incluir la historia de Lady Óscar, quien tiene por misión cuidar a la reina y al mismo tiempo se debate entre su deber ser y su verdadero ser.',
    production_description_en:
      'The story takes place in pre-revolutionary France as a meta-history. It recounts events of both the Austrian and French monarchy, with Paris as the epicenter - a precise setting to include the story of Lady Oscar, whose mission is to protect the queen while struggling between her duty and her true self.',
    production_number_chapters: 41,
    production_image_path: '/img/tarjeta/8.jpg',
    production_ranking_number: 16,
    demographic_name: 'Shōjo',
    genre_names: 'Drama,Romance,Histórico,Realismo',
    id: 8,
  },
  {
    production_name: 'Conan Future Boy',
    production_year: 1978,
    production_description:
      'Después del fin del mundo, una emergente civilización ubicada en la isla Industria quiere volver a activar las armas bélicas que lo causaron. Conan se ve involucrado en medio de esta disputa junto a grandes personajes, contando una historia de aventura y acción con enormes gestos técnicos que la elevan como uno de los más grandes clásicos del entretenimiento.',
    production_description_en:
      'After the end of the world, an emerging civilization located on Industry Island wants to reactivate the weapons of war that caused it. Conan becomes involved in this dispute alongside great characters, in a story of adventure and action with tremendous technical prowess that elevates it as one of the greatest classics of entertainment.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/4.jpg',
    production_ranking_number: 89,
    demographic_name: 'Shōnen',
    genre_names: 'Aventura,Post Apocalíptico,Entretenimiento',
    id: 4,
  },
  {
    production_name: 'Galaxy Express 999',
    production_year: 1978,
    production_description:
      'Quizás la más grande adaptación de Leiji Matsumoto, presentando una historia de aventura y crecimiento, recorriendo el vasto universo de forma surreal en un expreso que llevaría al protagonista a su inminente destino, acompañado de la representación de los anhelos de la eterna juventud, encarnados en el inmortal personaje de Maetel, dando un aire melancólico existencial.',
    production_description_en:
      'Perhaps the greatest adaptation of Leiji Matsumoto, presenting a story of adventure and growth, traveling through the vast universe surreally on an express train that would take the protagonist to his imminent destiny, accompanied by the representation of the longing for eternal youth, embodied in the immortal character of Maetel, giving an existential melancholic air.',
    production_number_chapters: 113,
    production_image_path: '/img/tarjeta/14_1765335770330.jpg',
    production_ranking_number: 120,
    demographic_name: 'Shōnen',
    genre_names: 'Drama,Ciencia ficción,Aventura,Space ópera',
    id: 14,
  },
  {
    production_name: 'The Super Dimension Fortress Macross',
    production_year: 1982,
    production_description:
      'Macross es un remanente de tecnología extraterrestre antigua dejado en la Tierra. La historia comienza cuando la nave despega forzosamente con su tripulación en medio de una invasión, desencadenando un conflicto entre humanos y Zentraedi. La serie sobresale por el desarrollo de sus personajes y relaciones, integrando drama, guerra y música en una estructura narrativa sólida que rompe con los esquemas clásicos del real robot.',
    production_description_en:
      'Macross is a remnant of ancient alien technology left on Earth. The story begins when the ship is forced to launch with its crew amid an invasion, triggering a conflict between humans and the Zentraedi. The series stands out for its character development and relationships, blending drama, warfare, and music within a solid narrative structure that breaks away from classic real robot conventions.',
    production_number_chapters: 36,
    production_image_path: '/img/tarjeta/10.jpg',
    production_ranking_number: 2,
    demographic_name: 'Shōnen-Seinen',
    genre_names: 'Ciencia ficción,Romance,Musical,Space ópera,Mecha',
    id: 10,
  },
  {
    production_name: 'Armored Trooper VOTOMS',
    production_year: 1983,
    production_description:
      'Una guerra tan extensa de la cual se ha olvidado el motivo ha llegado a su fin, dejando como remanentes a soldados que no tienen lugar en este nuevo universo. El protagonista se ve involucrado en una misión que lo envuelve en una extraña conspiración, mientras él intenta huir y sobrevivir, termina encontrándose con su destino ligado a una misteriosa mujer.',
    production_description_en:
      'A war so extensive that its reason has been forgotten has come to an end, leaving as remnants soldiers who have no place in this new universe. The protagonist gets involved in a mission that wraps him in a strange conspiracy, and as he tries to flee and survive, he ends up meeting his destiny tied to a mysterious woman.',
    production_number_chapters: 52,
    production_image_path: '/img/tarjeta/17.jpg',
    production_ranking_number: 11,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Ciencia ficción,Space ópera,Mecha',
    id: 17,
  },
  {
    production_name: 'Ashita no Joe 2',
    production_year: 1980,
    production_description:
      "Siendo una readaptación de los capítulos finales de la saga de los 70's, nos presentan a un Joe más bohemio, que intenta regresar y buscar un lugar en el mundo, incluyendo nuevos e impactantes rivales, que llevarán a Joe al límite, con un vendaval de emociones que involucran a todos los personajes contando una trama con sabor a victoria y tragedia.",
    production_description_en:
      'Being a re-adaptation of the final chapters of the 70s saga, they present us with a more bohemian Joe, who tries to return and find a place in the world, including new and shocking rivals, who will push Joe to the limit, with a whirlwind of emotions involving all the characters telling a plot with a taste of victory and tragedy.',
    production_number_chapters: 47,
    production_image_path: '/img/tarjeta/134.jpg',
    production_ranking_number: 18,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Drama,Deporte',
    id: 134,
  },
  {
    production_name: 'Ranma ½  Nibun no Ichi',
    production_year: 1989,
    production_description:
      'En esta ocasión el protagonista es un peleador varonil en contraste al común estereotipo de protagonistas de Rumiko, pero para emparejarlo le agrega un vergonzoso secreto, hundiendo al protagonista en un sinfín de problemas generalmente causados por su padre, mientras intenta recuperar lo que ha perdido en un entorno de comedia romántica-harem, proyectándola como una obra magistral.',
    production_description_en:
      "This time the protagonist is a masculine fighter in contrast to Rumiko's common protagonist stereotype, but to balance it she adds an embarrassing secret, sinking the protagonist into endless problems generally caused by his father, while he tries to recover what he has lost in a romantic-harem comedy setting, projecting it as a masterful work.",
    production_number_chapters: 18,
    production_image_path: '/img/tarjeta/31.jpg',
    production_ranking_number: 39,
    demographic_name: 'Shōnen',
    genre_names: 'Comedia,Romance,Entretenimiento',
    id: 31,
  },
  {
    production_name: 'Serial Experiments Lain',
    production_year: 1998,
    production_description:
      'De forma muy adelantada a su época, planteó un entorno cyberpunk, con trasfondos tecnológicos y la implementación de teorías y argumentos científicos para proporcionar una trama de suspenso y misterio cercana al horror, creando un futuro distópico muy similar a la realidad actual. Es uno de los más grandes referentes del culto cyberpunk.',
    production_description_en:
      'Way ahead of its time, it presented a cyberpunk environment with technological backgrounds and the implementation of scientific theories and arguments to provide a suspense-mystery plot bordering on horror, creating a dystopian future very similar to current reality. It stands as one of the greatest references of cyberpunk cult classics.',
    production_number_chapters: 13,
    production_image_path: '/img/tarjeta/6.jpg',
    production_ranking_number: 4,
    demographic_name: 'Seinen',
    genre_names: 'Ciencia ficción,Suspenso,Cyberpunk,Triller Psicológico',
    id: 6,
  },
  {
    production_name: 'Cowboy Bebop',
    production_year: 1998,
    production_description:
      'En un entorno de ficción haciendo referencia al universo como un enorme territorio desolado, es necesaria la existencia de cazarrecompensas espaciales en busca de villanos, aventuras y realidades humanas a lo largo del espacio, con ese toque nostálgico surrealista qué envuelve a los protagonistas, más bandas sonoras impecables y melancólicas.',
    production_description_en:
      'In a fictional setting referring to the universe as a huge desolate territory, the existence of space bounty hunters is necessary in search of villains, adventures, and human realities throughout space, with that surreal nostalgic touch that envelops the protagonists, plus impeccable and melancholic soundtracks.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/20.jpg',
    production_ranking_number: 8,
    demographic_name: 'Seinen',
    genre_names: 'Acción,Ciencia ficción,Aventura,Space ópera',
    id: 20,
  },
  {
    production_name: 'Future GPX Cyber Formula Sin',
    production_year: 1998,
    production_description:
      'Se nota el cambio argumental y de guión de esta entrega, a tal punto que la eleva a un nivel superlativo, convirtiendo a esta saga en la cúspide más alta y al mismo tiempo reafirmándola no sólo como la mejor saga de los 90, sino como una de las grandes instituciones creadas por el estudio Sunrise.',
    production_description_en:
      'The argumentative and script change of this installment is noticeable, to the point that it elevates it to a superlative level, turning this saga into the highest peak and at the same time reaffirming it not only as the best saga of the 90s, but as one of the great institutions created by the Sunrise studio.',
    production_number_chapters: 5,
    production_image_path: '/img/tarjeta/213_1776645795708.jpg',
    production_ranking_number: 13,
    demographic_name: 'Shōnen-Seinen',
    genre_names: 'Drama,Ciencia ficción,Suspenso,Deporte',
    id: 213,
  },
  {
    production_name: 'Infinite Ryvius',
    production_year: 1999,
    production_description:
      'En una interesante mezcla entre ciencia ficción y fantasía, presentan una historia con rasgos de experimento social y detrimento psicológico que involucra a un grupo de adolescentes cuya única opción es vagar a la deriva en el espacio, mientras luchan tratando de buscar un lugar a dónde regresar.',
    production_description_en:
      'In an interesting mix between science fiction and fantasy, they present a story with traits of social experiment and psychological detriment that involves a group of teenagers whose only option is to drift in space, while they struggle trying to find a place to return to.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/86.jpg',
    production_ranking_number: 19,
    demographic_name: 'Seinen',
    genre_names: 'Psicologico,Drama,Ciencia ficción,Romance,Suspenso,Space ópera',
    id: 86,
  },
  {
    production_name: 'Tengen Toppa Gurren-Lagann',
    production_year: 2007,
    production_description:
      'La evolución humana se encuentra al límite. Partimos con los protagonistas desde el fondo de las cavernas hasta los más remotos confines del universo, dejando por el camino sagas de acción, aventura y luchas entre mechas evocando un poderío Súper robot, y las fabulosas secuencias de animación de alta calidad generando una obra apoteósica magistral.',
    production_description_en:
      'Human evolution is at its limit. We start with the protagonists from the depths of caves to the most remote confines of the universe, leaving along the way sagas of action, adventure, and mecha fights evoking Super robot power, and fabulous high-quality animation sequences generating a masterful apotheosic work.',
    production_number_chapters: 27,
    production_image_path: '/img/tarjeta/24.jpg',
    production_ranking_number: 15,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Drama,Ciencia ficción,Aventura,Mecha,Post Apocalíptico',
    id: 24,
  },
  {
    production_name: 'Death Note',
    production_year: 2006,
    production_description:
      'En una sociedad tan displicente donde la gente pasa a segundo plano, es aquí donde un nuevo poder cae en manos del protagonista, que se encargará de impartir justicia a su modo, para crear una historia policíaca detectivesca muy intensa, donde sobresalen entornos, personajes y estrategias, más algunos sutiles toques sobrenaturales pero en un ambiente muy realista.',
    production_description_en:
      "In such a dismissive society where people become secondary, it is here that a new power falls into the protagonist's hands, who will impart justice in his own way, to create a very intense detective police story, where environments, characters, and strategies stand out, plus some subtle supernatural touches but in a very realistic atmosphere.",
    production_number_chapters: 37,
    production_image_path: '/img/tarjeta/35.jpg',
    production_ranking_number: 7,
    demographic_name: 'Shōnen-Seinen',
    genre_names: 'Suspenso,Realismo,Sobrenatural,Triller Psicológico',
    id: 35,
  },
  {
    production_name: 'Fullmetal Alchemist Brotherhood',
    production_year: 2009,
    production_description:
      'En principio plantean un remake de la primera entrega, adaptando lo más fielmente al contenido del manga, adquiriendo nuevas ramas pero al mismo tiempo perdiendo terreno con respecto a su antecesora, agregando una gran trama de nuevo contenido y sagas de acción y fantasía.',
    production_description_en:
      'In principle they propose a remake of the first installment, adapting as faithfully as possible to the content of the manga, acquiring new branches but at the same time losing ground with respect to its predecessor, adding a great plot of new content and action and fantasy sagas.',
    production_number_chapters: 64,
    production_image_path: '/img/tarjeta/198.jpg',
    production_ranking_number: 26,
    demographic_name: 'Shōnen',
    genre_names: 'Fantasía,Aventura',
    id: 198,
  },
  {
    production_name: 'Ghost in the Shell: Stand Alone Complex',
    production_year: 2003,
    production_description:
      'Presentan un mundo lleno de tendencias tecnológicas y cambios políticos-sociales emergentes que tienden a salirse de control, por esta razón es necesario de un escuadrón especial que se encargue de investigar y controlar esta clase de crímenes y problemas tecnológicos que se presentan en esta versión de mundo distópico.',
    production_description_en:
      'They present a world full of technological trends and emerging political-social changes that tend to get out of control, for this reason a special squad is needed to investigate and control this kind of crimes and technological problems that occur in this version of a dystopian world.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/88.jpg',
    production_ranking_number: 23,
    demographic_name: 'Seinen',
    genre_names: 'Acción,Ciencia ficción,Cyberpunk',
    id: 88,
  },
  {
    production_name: 'Dragon Ball Z',
    production_year: 1989,
    production_description:
      'Como continuación de Dragon Ball, esta saga se enfoca más en la acción y en las luchas contra seres provenientes del universo, destacando los orígenes de Gokú, y las aventuras en busca de las esferas del dragón en otro planeta, presentando una y otra vez enemigos poderosos permitiendo a los protagonistas despertar una serie de nuevos poderes.',
    production_description_en:
      "As a continuation of Dragon Ball, this saga focuses more on action and fights against beings from the universe, highlighting Goku's origins, and the adventures in search of the dragon balls on another planet, repeatedly presenting powerful enemies allowing the protagonists to awaken a series of new powers.",
    production_number_chapters: 291,
    production_image_path: '/img/tarjeta/50.jpg',
    production_ranking_number: 66,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Fantasía,Aventura,Entretenimiento',
    id: 50,
  },
  {
    production_name: 'Rurouni Kenshin',
    production_year: 1996,
    production_description:
      'Después de la restauración, los samuráis se han convertido en armas obsoletas. La historia comienza cuando Kenshin encuentra un lugar a donde pertenecer y al mismo tiempo es perseguido por todas las secuelas de su violento pasado, generando potentes historias personales en función de memorables personajes y arcos cargados de acción y emoción.',
    production_description_en:
      'After the restoration, samurai have become obsolete weapons. The story begins when Kenshin finds a place to belong while simultaneously being haunted by all the consequences of his violent past, generating powerful personal stories based on memorable characters and arcs loaded with action and emotion.',
    production_number_chapters: 95,
    production_image_path: '/img/tarjeta/32.jpg',
    production_ranking_number: 25,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Drama,Histórico,Samuráis,Realismo',
    id: 32,
  },
  {
    production_name: 'Slayers Next',
    production_year: 1996,
    production_description:
      'El mundo se vuelve cada vez más caótico, las consecuencias de batallas ancestrales han dado frutos, creando revoluciones y bandos entre los mismos demonios. Lina Inverse y sus amigos se ven involucrados en juegos de conspiraciones y luchas internas entre demonios, donde los seres humanos no tienen oportunidad. Siendo esta la mejor adaptación de la franquicia.',
    production_description_en:
      'The world becomes increasingly chaotic, the consequences of ancestral battles have borne fruit, creating revolutions and sides among the demons themselves. Lina Inverse and her friends become involved in games of conspiracies and internal struggles among demons, where humans have no chance. This being the best adaptation of the franchise.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/83_1766551167526.jpg',
    production_ranking_number: 37,
    demographic_name: 'Shōnen',
    genre_names: 'Magia,Fantasía,Aventura',
    id: 83,
  },
  {
    production_name: 'Princess Tutu',
    production_year: 2002,
    production_description:
      'Inverosímilmente genial y encantadora, abrumadora, una banda sonora impecable, la narrativa inicial e intermedia incluida de forma casi perfecta, una mezcla entre un entorno a su real de fantasía y ficción muy estremecedora, mientras se intentaba mezclar el valet la fantasía y los cuentos de hadas de una forma tan equilibrada y con personajes tan atractivos que simplemente era genial.',
    production_description_en:
      'Unbelievably great and charming, overwhelming, an impeccable soundtrack, the initial and intermediate narrative included almost perfectly, a mix between a real environment of fantasy and fiction very thrilling, while trying to mix valet fantasy and fairy tales in such a balanced way and with such attractive characters that it was simply great.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/331.jpg',
    production_ranking_number: 53,
    demographic_name: 'Josei',
    genre_names: 'Magia,Drama,Comedia,Fantasía,Romance',
    id: 331,
  },
  {
    production_name: 'The Vision of Escaflowne',
    production_year: 1996,
    production_description:
      "Retomando la idea de inserción en mundos mágicos con mechas, soportadas con una potente animación y bandas sonoras, intentaba revolucionar y dar un nuevo aire a este tipo de género pero lamentablemente se convirtió en una rareza y en una obra aislada de los 90's, como siempre Sunrise intentando crear nuevas tendencias.",
    production_description_en:
      'Taking up again the idea of insertion in magical worlds with mechas, supported by powerful animation and soundtracks, it tried to revolutionize and give a new air to this type of genre but unfortunately it became a rarity and an isolated work of the 90s, as always Sunrise trying to create new trends.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/149.jpg',
    production_ranking_number: 55,
    demographic_name: 'Shōnen',
    genre_names: 'Ciencia ficción,Fantasía,Romance,Mecha',
    id: 149,
  },
  {
    production_name: 'Kill La Kill',
    production_year: 2013,
    production_description:
      'De forma brillante utilizan nuevos estilos de animación para desarrollar una parodia inteligente en función de los chicos y chicas mágicas, armaduras y trajes de batalla, pero en medio presentando una historia decente que pareciera ser profunda en función de planteamientos de ciencia ficción, al mismo tiempo agregando elementos de fanservice a propósito para aumentar la ironía.',
    production_description_en:
      'Brilliantly they use new animation styles to develop an intelligent parody based on magical boys and girls, armors and battle suits, but in the middle presenting a decent story that seems to be deep based on science fiction approaches, at the same time adding fanservice elements on purpose to increase the irony.',
    production_number_chapters: 24,
    production_image_path: '/img/tarjeta/171.jpg',
    production_ranking_number: 57,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Comedia,Ciencia ficción',
    id: 171,
  },
  {
    production_name: 'Katanagatari',
    production_year: 2010,
    production_description:
      'De entrada es una historia muy atípica con personajes muy distorsionados, que permiten contar una trama diferente con una animación muy singular y una sumatoria de eventos que llevarían a los protagonistas en búsqueda de su destino, qué va ligado a su pasado, con un desenlace inesperado, tanto como el destino de los personajes.',
    production_description_en:
      'From the start it is a very atypical story with very distorted characters, which allow telling a different plot with a very singular animation and a sum of events that would lead the protagonists in search of their destiny, which is linked to their past, with an unexpected outcome, as much as the destiny of the characters.',
    production_number_chapters: 12,
    production_image_path: '/img/tarjeta/170.jpg',
    production_ranking_number: 59,
    demographic_name: 'Seinen',
    genre_names: 'Acción,Drama,Romance,Aventura,Samuráis',
    id: 170,
  },
  {
    production_name: 'Kimagure Orange Road',
    production_year: 1987,
    production_description:
      'Una mezcla bastante inusual y extraña, posiblemente el anime más ridículo que se haya creado, con las connotaciones típicas del anime cancerígeno moderno pero al mismo tiempo incluyendo una fórmula de narrativa impecable, una de las mejores de este tipo, contando las historias en función de uno de los mejores prototipos de waifus y el protagonista en sus años de juventud.',
    production_description_en:
      'A rather unusual and strange mix, possibly the most ridiculous anime ever created, with the typical connotations of modern "cancerous" anime but at the same time including an impeccable narrative formula, one of the best of its kind, telling stories based on one of the best waifu prototypes and the protagonist in his youth years.',
    production_number_chapters: 48,
    production_image_path: '/img/tarjeta/33.jpg',
    production_ranking_number: 65,
    demographic_name: 'Seinen',
    genre_names: 'Romance',
    id: 33,
  },
  {
    production_name: 'Yū Yū Hakusho',
    production_year: 1992,
    production_description:
      'En algunos momentos de la historia de la humanidad, el mundo espiritual ha estado a punto de salirse de control. En ocasiones especiales, algunos humanos son reclutados para mantener el equilibrio en ambos mundos. De esa forma, el protagonista y sus amigos se ven involucrados en batallas épicas contra seres de otras dimensiones, encarnando uno de los más grandes shonen.',
    production_description_en:
      'At some moments in human history, the spiritual world has been on the verge of getting out of control. On special occasions, some humans are recruited to maintain the balance in both worlds. In this way, the protagonist and his friends become involved in epic battles against beings from other dimensions, embodying one of the greatest shonen.',
    production_number_chapters: 112,
    production_image_path: '/img/tarjeta/37.jpg',
    production_ranking_number: 67,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Aventura,Entretenimiento,Sobrenatural',
    id: 37,
  },
  {
    production_name: 'Slam dunk',
    production_year: 1993,
    production_description:
      "Uno de los más grandes clásicos del shonen de los 90's, con rasgos de anime deportivo, luchas impresionantes, historias de vida impactantes, con un sentido del humor muy refinado, presentaba perfectamente al estilo visual súper deforme en apartados humorísticos, siendo una de las más grandes sagas de esta década.",
    production_description_en:
      'One of the greatest classics of 90s shonen, with traits of sports anime, impressive fights, impactful life stories, with a very refined sense of humor, it perfectly presented the super deformed visual style in humorous segments, being one of the greatest sagas of this decade.',
    production_number_chapters: 101,
    production_image_path: '/img/tarjeta/39.jpg',
    production_ranking_number: 68,
    demographic_name: 'Shōnen',
    genre_names: 'Comedia,Deporte,Entretenimiento',
    id: 39,
  },
  {
    production_name: 'Yuri!!! on Ice',
    production_year: 2016,
    production_description:
      'La animación simplemente es maravillosa cargada con contrastes de entre capas y luminosidades que junto a la meticulosa y bien dibujada escenografía coreografías y personajes le proyectaban un atractivo visual que se le sumaba a la enorme sutileza emocional cargada de profundidad y elementos figurativos muy envolventes creando una experiencia abrumadora en proyectada a través de este deporte.',
    production_description_en:
      'The animation is simply wonderful loaded with contrasts between layers and luminosities that together with the meticulous and well-drawn scenography choreographies and characters projected a visual appeal that was added to the enormous emotional subtlety loaded with depth and very enveloping figurative elements creating an overwhelming experience projected through this sport.',
    production_number_chapters: 12,
    production_image_path: '/img/tarjeta/420.jpg',
    production_ranking_number: 74,
    demographic_name: 'Seinen',
    genre_names: 'Drama,Deporte,Yaoi',
    id: 420,
  },
  {
    production_name: 'Ping Pong the Animation',
    production_year: 2014,
    production_description:
      'De primera impresión queda la singularidad y sobre expresiva animación que resulta ser impactante, mezclándose con un gran set de personajes que empiezan a darle evolución a la historia a través de sus experiencias y vínculos con su pasado, llegando a ser intensa en algunos momentos y muy emotiva teniendo como eje central una ambientación ligada a este deporte.',
    production_description_en:
      'At first impression, the uniqueness and over-expressive animation that turns out to be striking remains, mixing with a great set of characters that begin to give evolution to the story through their experiences and links with their past, becoming intense at times and very emotional having as a central axis an setting linked to this sport.',
    production_number_chapters: 11,
    production_image_path: '/img/tarjeta/367.jpg',
    production_ranking_number: 75,
    demographic_name: 'Seinen',
    genre_names: 'Drama,Deporte',
    id: 367,
  },
  {
    production_name: 'Last Exile',
    production_year: 2003,
    production_description:
      'Desde el principio su propuesta es muy novedosa y atractiva, incluso la animación le dan un toque muy singular, una serie que se mantiene pareja e interesante llena de tantos giros, llevando a los personajes a verse involucrados en conspiraciones y misterios, en los capítulos finales se vuelve un poco inestable centrándose en una trama adyacente con un final conmovedor.',
    production_description_en:
      'From the beginning, its proposal is very novel and attractive, even the animation gives it a very unique touch, a series that remains even and interesting full of so many twists, leading the characters to become involved in conspiracies and mysteries, in the final chapters it becomes a bit unstable focusing on an adjacent plot with a touching ending.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/309.jpg',
    production_ranking_number: 78,
    demographic_name: 'Seinen',
    genre_names: 'Ciencia ficción,Aventura',
    id: 309,
  },
  {
    production_name: 'Texhnolyze',
    production_year: 2003,
    production_description:
      'El aferrante deseo de sobrevivir lleva al protagonista a arrastrarse con la mitad de sus miembros por una ciudad opaca envuelta en la ruina, el ambiente de esta historia describe un mundo distópico dominado por mafias, sectas y pandilleros, en el trasfondo de misterios, conspiraciones, y un letargo existencial.',
    production_description_en:
      'The clinging desire to survive leads the protagonist to crawl with half of his limbs through a dull city wrapped in ruin, the atmosphere of this story describes a dystopian world dominated by mafias, sects and gangsters, in the background of mysteries, conspiracies, and an existential lethargy.',
    production_number_chapters: 22,
    production_image_path: '/img/tarjeta/159.jpg',
    production_ranking_number: 80,
    demographic_name: 'Seinen',
    genre_names: 'Acción,Drama,Ciencia ficción,Suspenso,Cyberpunk',
    id: 159,
  },
  {
    production_name: 'Ergo Proxy',
    production_year: 2006,
    production_description:
      'Se presenta como una historia de ciencia ficción oscura y llamativa, con un arte visual sobrio, una ambientación distópica bien construida y una banda sonora que refuerza constantemente el tono de la serie. A lo largo de su desarrollo aborda temas de identidad, conciencia y existencia, aunque en varios momentos la pretensión conceptual termina pesando más que el propio avance de la historia.',
    production_description_en:
      'It presents itself as a dark and striking science fiction story, with a sober visual style, a well-built dystopian setting, and a soundtrack that constantly reinforces the series’ tone. Throughout its development it tackles themes of identity, consciousness, and existence, although at times its conceptual pretension ends up outweighing the narrative progression itself.',
    production_number_chapters: 23,
    production_image_path: '/img/tarjeta/164.jpg',
    production_ranking_number: 84,
    demographic_name: 'Seinen',
    genre_names: 'Ciencia ficción,Suspenso,Cyberpunk,Triller Psicológico',
    id: 164,
  },
  {
    production_name: 'Psycho-Pass',
    production_year: 2012,
    production_description:
      'En un futuro próximo, es posible medir de forma instantánea el estado mental de una persona, la personalidad y la probabilidad de que dicha persona vaya a cometer delitos gracias a un escáner psico-somático que realiza un escaneo de las funciones del cerebro y de las demás funciones biológicas y químicas del cuerpo, determinando el Psycho-Pass.',
    production_description_en:
      "In the near future, it is possible to instantly measure a person's mental state, personality and the probability that said person will commit crimes thanks to a psycho-somatic scanner that scans the functions of the brain and the other biological and chemical functions of the body, determining the Psycho-Pass.",
    production_number_chapters: 22,
    production_image_path: '/img/tarjeta/366.jpg',
    production_ranking_number: 85,
    demographic_name: 'Seinen',
    genre_names: 'Acción,Drama,Ciencia ficción,Policíaco,Cyberpunk,Realismo',
    id: 366,
  },
  {
    production_name: 'Higurashi When They Cry',
    production_year: 2006,
    production_description:
      'Una historia plagada con todos los efectos y elementos de animación destinados a traer un público otaku, al mismo tiempo planteando una interesante obra desde diferentes arcos y puntos de vista, proponiendo un laberinto sin salida y crear una de las tramas más interesantes y misteriosas que se hayan desarrollado, dejando una sensación de incertidumbre constante.',
    production_description_en:
      'A story plagued with all the effects and animation elements intended to bring an otaku audience, at the same time posing an interesting work from different arcs and points of view, proposing a maze with no exit and creating one of the most interesting and mysterious plots ever developed, leaving a feeling of constant uncertainty.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/163.jpg',
    production_ranking_number: 86,
    demographic_name: 'Seinen',
    genre_names: 'Psicologico,Drama,Suspenso,Sobrenatural,Misterio',
    id: 163,
  },
  {
    production_name: 'Air',
    production_year: 2005,
    production_description:
      'Un claro ejemplo de anime pastel adaptado de novelas visuales, donde el moe se combina con una trama que al inicio resulta ligera y algo extraña. A medida que avanza, la historia comienza a inclinarse hacia lo fantástico, incorporando giros ligados a memorias que se transmiten a través del tiempo. Una propuesta emocional que crece de forma sutil y constante.',
    production_description_en:
      'A clear example of pastel anime adapted from visual novels, where moe elements blend with a plot that initially feels light and somewhat peculiar. As it progresses, the story gradually leans into fantasy, introducing twists connected to memories passed down through time. An emotional proposal that grows in a subtle and steady way.',
    production_number_chapters: 13,
    production_image_path: '/img/tarjeta/162.jpg',
    production_ranking_number: 88,
    demographic_name: 'Shōnen-Seinen',
    genre_names: 'Drama,Romance',
    id: 162,
  },
  {
    production_name: 'Nadia: The Secret Blue Water',
    production_year: 1990,
    production_description:
      'Una aventura clásica que combina ciencia ficción y exploración con el sello inconfundible de Gainax, inspirada en grandes referentes del género. A través de viajes, persecuciones y conflictos crecientes, la historia gira en torno a la búsqueda de identidad y a misterios que escalan hasta tocar los orígenes mismos de la humanidad, manteniendo un tono épico y aventurero.',
    production_description_en:
      'A classic adventure that blends science fiction and exploration with Gainax’s unmistakable touch, drawing inspiration from major genre references. Through journeys, pursuits, and escalating conflicts, the story revolves around a search for identity and mysteries that rise to question the very origins of humanity, maintaining an epic and adventurous tone.',
    production_number_chapters: 39,
    production_image_path: '/img/tarjeta/75_1766548166301.jpg',
    production_ranking_number: 91,
    demographic_name: 'Shōnen',
    genre_names: 'Ciencia ficción,Romance',
    id: 75,
  },
  {
    production_name: 'Hellsing Ultimate',
    production_year: 2006,
    production_description:
      'Esta versión retoma la historia con una mirada más cruda y sangrienta, explorando la violencia y la locura de forma directa. Como reinterpretación más fiel del material original, eleva notablemente la calidad audiovisual, fortalece la narrativa y profundiza en sus personajes. El resultado es una serie intensa, muy entretenida, con escenas de acción brutal que definen su identidad.',
    production_description_en:
      'This version revisits the story with a much cruder and bloodier approach, directly exploring violence and madness. As a more faithful reinterpretation of the original material, it significantly raises the audiovisual quality, strengthens the narrative, and deepens its characters. The result is an intense and highly entertaining series, defined by its brutal action scenes.',
    production_number_chapters: 10,
    production_image_path: '/img/tarjeta/211.jpg',
    production_ranking_number: 92,
    demographic_name: 'Seinen',
    genre_names: 'Acción,Sobrenatural',
    id: 211,
  },
  {
    production_name: 'Soul Eater',
    production_year: 2008,
    production_description:
      'Destaca principalmente por su diseño visual oscuro y estilizado, acompañado de una animación muy sólida que sobresale especialmente en las escenas de acción. Su historia es ligera y directa, pensada más como un soporte para explotar su identidad visual y su ritmo dinámico. El resultado es un anime muy enfocado en el entretenimiento, con una estética marcada y una personalidad clara que lo hace fácil de reconocer.',
    production_description_en:
      'It mainly stands out for its dark and stylized visual design, accompanied by very solid animation that shines especially in action scenes. Its story is light and straightforward, serving mainly as a framework to enhance its visual identity and dynamic pacing. The result is an anime clearly focused on entertainment, with a strong aesthetic and a recognizable personality.',
    production_number_chapters: 51,
    production_image_path: '/img/tarjeta/201_1766547951645.jpg',
    production_ranking_number: 93,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Fantasía,Aventura',
    id: 201,
  },
  {
    production_name: 'Naruto',
    production_year: 2002,
    production_description:
      'Combina mitología y costumbres japonesas dentro de un mundo de aldeas ninjas para construir una historia accesible y carismática. A través de la aventura y la acción constante, desarrolla vínculos emocionales fuertes que conectan fácilmente con el espectador. Con el tiempo se consolida como un clásico del entretenimiento shōnen.',
    production_description_en:
      'It blends mythology and Japanese customs within a ninja village world to build an accessible and charismatic story. Through constant adventure and action, it develops strong emotional bonds that easily connect with the viewer. Over time, it becomes a classic of shōnen entertainment.',
    production_number_chapters: 220,
    production_image_path: '/img/tarjeta/202.jpg',
    production_ranking_number: 94,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Drama,Fantasía',
    id: 202,
  },
  {
    production_name: '91 Days',
    production_year: 2016,
    production_description:
      'Ambientada en el realismo crudo de las mafias clásicas, la serie construye un relato sobrio y tenso, sostenido casi por completo en sus personajes y sus motivaciones. La atmósfera es contenida pero envolvente, permitiendo que los conflictos personales y las traiciones marquen el ritmo de la historia. Con giros bien medidos y un cierre coherente, ofrece una experiencia intensa que cuida cada círculo narrativo que abre.',
    production_description_en:
      'Set within the gritty realism of classic mafia stories, the series builds a sober and tense narrative driven almost entirely by its characters and their motivations. The restrained yet immersive atmosphere allows personal conflicts and betrayals to shape the pace of the story. With well-measured twists and a coherent conclusion, it delivers an intense experience that carefully closes every narrative thread it opens.',
    production_number_chapters: 12,
    production_image_path: '/img/tarjeta/399.jpg',
    production_ranking_number: 96,
    demographic_name: 'Seinen',
    genre_names: 'Acción,Drama,Crimen',
    id: 399,
  },
  {
    production_name: 'Haruhi Suzumiya',
    production_year: 2006,
    production_description:
      'Desde su inicio plantea una narrativa llamativa vista desde la mirada de uno de los protagonistas, mientras introduce de forma natural elementos de ciencia ficción, fantasía y fenómenos extraños. Los acontecimientos se van acumulando y conectando entre sí, formando una extraña normalidad cotidiana donde lo inexplicable parece inevitable. Todo termina orbitando alrededor de una figura tan carismática como impredecible: Haruhi Suzumiya.',
    production_description_en:
      'From the very beginning, it presents an engaging narrative seen through the perspective of one of the protagonists, while naturally introducing elements of science fiction, fantasy, and strange phenomena. Events gradually pile up and connect, forming an unusual everyday normality where the inexplicable feels unavoidable. Everything ultimately revolves around a charismatic and unpredictable figure: Haruhi Suzumiya.',
    production_number_chapters: 14,
    production_image_path: '/img/tarjeta/128.jpg',
    production_ranking_number: 100,
    demographic_name: 'Shōnen',
    genre_names: 'Ciencia ficción,Fantasía,Romance,Suspenso,Aventura,Entretenimiento',
    id: 128,
  },
  {
    production_name: 'Cyberpunk: Edgerunners',
    production_year: 2022,
    production_description:
      'Una mezcla intensa de acción, drama y un futuro oscuro de neón define esta historia, donde lo psicodélico y lo estridente se combinan con una narrativa de supervivencia en un entorno distópico. A medida que los protagonistas descienden por las capas de Night City, la trama sostiene una coherencia sorprendentemente humana en un mundo dominado por tecnología y desigualdad, dando forma a un relato vibrante y trágico.',
    production_description_en:
      'An intense blend of action, drama, and neon-drenched futurism shapes this story, where the psychedelic and abrasive merge with a tale of survival in a dystopian setting. As the protagonists sink deeper into Night City’s underbelly, the narrative maintains a striking human core within a world ruled by technology and inequality, unfolding into a vibrant and tragic saga.',
    production_number_chapters: 10,
    production_image_path: '/img/tarjeta/477.jpg',
    production_ranking_number: 109,
    demographic_name: 'Seinen',
    genre_names: 'Drama,Ciencia ficción,Suspenso,Cyberpunk,Neo-noir,Crimen,Misterio',
    id: 477,
  },
];

export default initialData;
