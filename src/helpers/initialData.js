/**
 * Datos semilla para SEO y carga instantánea.
 * Contiene una muestra representativa para que los buscadores
 * encuentren contenido real antes de la respuesta del API.
 */
const initialData = [
  {
    production_name: 'Judo Boy',
    production_year: 1969,
    production_description:
      'Por excelencia es la saga fuera de serie de la década de los 60, aunque compartía su característica animación muy limitada con toques algo infantiles sobresalía por sus toques y pinceladas de crudeza acción y aún más por los parajes y nuevos destinos del protagonista en busca de su venganza algo descabellado, y al mismo tiempo le dan ese respaldo de héroe infantil.',
    production_description_en:
      'Par excellence it is the outstanding saga of the 60s, although it shared its very limited animation with somewhat childish touches, it stood out for its touches and brushstrokes of crudeness action and even more for the landscapes and new destinations of the protagonist in search of his somewhat far-fetched revenge, and at the same time they give him that backing of a child hero.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/381_1768757036949.jpg',
    production_ranking_number: 412,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Drama,Entretenimiento,Crimen',
    id: 381,
  },
  {
    production_name: 'Ashita no Joe',
    production_year: 1970,
    production_description:
      'Una historia dramática que mezcla la pasión por el boxeo e intensos sentimientos, los nuevos sueños y deseos para el futuro en función de personajes humanos que se hacen a pulso, en medio de contrastes sociales y el insaciable valor de sobrevivir y alcanzar una nueva victoria. Aderezado con rivalidades e historias humanas muy intensas y algo crudas.',
    production_description_en:
      'A dramatic story that mixes passion for boxing and intense feelings, new dreams and desires for the future based on human characters who make their way through effort, amid social contrasts and the insatiable value of surviving and achieving a new victory. Seasoned with rivalries and very intense and somewhat crude human stories.',
    production_number_chapters: 79,
    production_image_path: '/img/tarjeta/138.jpg',
    production_ranking_number: 122,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Drama,Deporte,Entretenimiento',
    id: 138,
  },
  {
    production_name: 'Lupin III',
    production_year: 1971,
    production_description:
      'Lupin es descendiente de una dinastía de ladrones, por eso es perseguido mientras intenta escapar de la policía. Reúne nuevos amigos para formar un grupo invencible. El toque picaresco está a cargo de la problemática Fujiko, que termina metiendo a Lupin en más problemas de los que ya tiene.',
    production_description_en:
      'Lupin is a descendant of a dynasty of thieves, which is why he is pursued while trying to escape the police. He gathers new friends to form an invincible group. The picaresque touch is provided by the problematic Fujiko, who ends up getting Lupin into more trouble than he already has.',
    production_number_chapters: 23,
    production_image_path: '/img/tarjeta/41_1783047914352.jpg',
    production_ranking_number: 450,
    demographic_name: 'Seinen',
    genre_names: 'Acción,Aventura,Entretenimiento',
    id: 41,
  },
  {
    production_name: 'Mazinger Z',
    production_year: 1972,
    production_description:
      'Uno de los más grandes representantes de la tendencia del Super robot, la principal cara de la invasión del anime a occidente y los animes mas recordados de la infancia, uno de los animes qué proyectó el potencial de la animación japonesa en esta parte del continente, contando la fórmula de aventuras y luchas entre el protagonista contra monstruos mecánicos.',
    production_description_en:
      'One of the greatest representatives of the Super robot trend, the main face of the anime invasion to the West and the most remembered childhood anime, one of the anime that projected the potential of Japanese animation in this part of the continent, telling the formula of adventures and fights between the protagonist against mechanical monsters.',
    production_number_chapters: 92,
    production_image_path: '/img/tarjeta/59.jpg',
    production_ranking_number: 477,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Ciencia ficción,Mecha,Entretenimiento',
    id: 59,
  },
  {
    production_name: 'Doraemon 1973',
    production_year: 1973,
    production_description:
      'Posiblemente el más grande clásico del entretenimiento a nivel mundial, cuenta las aventuras de Nobita y Doraemon en un sinfín de eventos y problemas al cual Doraemon busca una solución que generalmente termina agrandando los inconvenientes pero siempre terminando con un final carismático y acogedor, un excelente clásico a nivel mundial.',
    production_description_en:
      'Possibly the greatest classic of entertainment worldwide, it tells the adventures of Nobita and Doraemon in countless events and problems for which Doraemon seeks a solution that generally ends up enlarging the inconveniences but always ending with a charismatic and welcoming ending, an excellent classic worldwide.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/60.jpg',
    production_ranking_number: 337,
    demographic_name: 'Kodomo',
    genre_names: 'Magia,Aventura,Entretenimiento',
    id: 60,
  },
  {
    production_name: 'Space Battleship Yamato',
    production_year: 1974,
    production_description:
      'La tierra está agonizando, una raza de extraterrestres ha atacado el planeta y se encuentra rodeado de una ola radioactiva, esto obliga a la tripulación del buque insignia Yamato a recorrer el universo para traer un artefacto purificador de planetas y evitar la extinción humana, exponiéndose a una gran cantidad de conflictos y persecuciones a lo largo del universo.',
    production_description_en:
      'The Earth is agonizing, a race of aliens has attacked the planet and it is surrounded by a radioactive wave, this forces the crew of the flagship Yamato to travel through the universe to bring a planet purifying artifact and prevent human extinction, exposing themselves to a large number of conflicts and pursuits throughout the universe.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/61.jpg',
    production_ranking_number: 211,
    demographic_name: 'Shōnen',
    genre_names: 'Drama,Ciencia ficción,Romance,Aventura,Space ópera,Post Apocalíptico',
    id: 61,
  },
  {
    production_name: 'A Dog of Flandes',
    production_year: 1975,
    production_description:
      'Es un pobre pero feliz huérfano que vive con su abuelo en un pequeño pueblo cerca de Antwerp. El niño tiene talento para dibujar y ha estado fascinado por el dibujo desde pequeño. Un día, mientras ayuda a su abuelo con el reparto de leche, se encuentra con un perro que ha sido abandonado.',
    production_description_en:
      'He is a poor but happy orphan who lives with his grandfather in a small village near Antwerp. The boy has a talent for drawing and has been fascinated by drawing since he was a child. One day, while helping his grandfather with the milk delivery, he comes across a dog that has been abandoned.',
    production_number_chapters: 52,
    production_image_path: '/img/tarjeta/133.jpg',
    production_ranking_number: 490,
    demographic_name: 'Kodomo',
    genre_names: 'Drama',
    id: 133,
  },
  {
    production_name: 'Candy Candy',
    production_year: 1976,
    production_description:
      'Un clásico del entretenimiento occidental, narra la vida de Candy, una huérfana que atraviesa aventuras, dramas, pérdidas y romances. La serie combina emoción y sentimientos humanos al límite, con varios arcos centrados en personajes bien construidos y bandas sonoras melodramáticas que envuelven al espectador.',
    production_description_en:
      'A classic of Western entertainment, it tells the life of Candy, an orphan girl who goes through adventures, dramas, losses, and romances. The series combines emotion and human feelings to the limit, with several arcs focused on well-developed characters and melodramatic soundtracks that envelop the viewer.',
    production_number_chapters: 115,
    production_image_path: '/img/tarjeta/62_1783480561958.jpg',
    production_ranking_number: 266,
    demographic_name: 'Shōjo',
    genre_names: 'Drama,Romance',
    id: 62,
  },
  {
    production_name: "Remi the Nobody's Boy",
    production_year: 1977,
    production_description:
      'Es una de las historias más bonitas que se han creado, cuenta la historia de crecimiento de un niño que ha sido abandonado por su familia adoptiva, sus historias de aventuras y experiencias a lo largo de un viaje adornado con personajes interesantes mientras busca a su verdadera familia, una muy inspiradora visión de la realidad de época.',
    production_description_en:
      'It is one of the most beautiful stories ever created, it tells the growth story of a boy who has been abandoned by his adoptive family, his adventure stories and experiences throughout a journey adorned with interesting characters while he searches for his true family, a very inspiring vision of the reality of the era.',
    production_number_chapters: 51,
    production_image_path: '/img/tarjeta/63.jpg',
    production_ranking_number: 178,
    demographic_name: 'Kodomo',
    genre_names: 'Drama,Aventura',
    id: 63,
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
    production_name: 'Urusei Yatsura',
    production_year: 1981,
    production_description:
      'Lum es una chica ogro extraterrestre invasora que por cosas del destino se ve involucrada con Ataru, un típico chico japonés mediocre y la deshonra para su familia, su pueblo y su nación, rodeado por un desfile de mujeres, asediado por un triángulo amoroso, y precisamente que el protagonista sea un perdedor sin límites rodeado de un harén exótico lo hizo muy adictivo en Japón.',
    production_description_en:
      'Lum is an alien ogre invader girl who by fate gets involved with Ataru, a typical mediocre Japanese boy and the dishonor for his family, his town, and his nation, surrounded by a parade of women, besieged by a love triangle, and precisely the fact that the protagonist is a limitless loser surrounded by an exotic harem made it very addictive in Japan.',
    production_number_chapters: 195,
    production_image_path: '/img/tarjeta/67.jpg',
    production_ranking_number: 188,
    demographic_name: 'Shōnen',
    genre_names: 'Comedia,Fantasía,Romance',
    id: 67,
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
    production_name: 'Hokuto no Ken',
    production_year: 1984,
    production_description:
      'La premisa se desarrolla en un mundo post apocalíptico, donde los pocos recursos restantes son dominados por aquellos que posean un poder mayor, al mismo tiempo se trata de una historia adyacente sobre los herederos del arte marcial milenario más poderoso, como consecuencia una revolución y una cruzada que decidirá el futuro de esta era.',
    production_description_en:
      'The premise takes place in a post-apocalyptic world, where the few remaining resources are dominated by those who possess greater power, at the same time it is an adjacent story about the heirs of the most powerful ancient martial art, as a consequence a revolution and a crusade that will decide the future of this era.',
    production_number_chapters: 109,
    production_image_path: '/img/tarjeta/69.jpg',
    production_ranking_number: 469,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Ciencia ficción,Post Apocalíptico',
    id: 69,
  },
  {
    production_name: 'Touch',
    production_year: 1985,
    production_description:
      'El diseño es muy llamativo teniendo como base un triángulo amoroso entre dos hermanos gemelos y su amiga de la infancia, en un entorno con temáticas muy colegiales, donde el ámbito deportivo juega un papel muy importante, proporcionando eventos y situaciones propias de estas obras proclamándose como un gran clásico del entretenimiento.',
    production_description_en:
      'The design is very striking based on a love triangle between two twin brothers and their childhood friend, in an environment with very school-themed themes, where the sports field plays a very important role, providing events and situations typical of these works proclaiming itself as a great classic of entertainment.',
    production_number_chapters: 101,
    production_image_path: '/img/tarjeta/70_1778722223458.jpg',
    production_ranking_number: 58,
    demographic_name: 'Shōnen',
    genre_names: 'Romance,Deporte',
    id: 70,
  },
  {
    production_name: 'Dragon Ball',
    production_year: 1986,
    production_description:
      'Las inmortales aventuras de Gokú y Bulma en busca de las esferas del dragón, en medio de luchas, torneos de artes marciales y un sinfín de personajes que adornarían una de las más grandes historias del entretenimiento a nivel mundial, y crearía una robusta fórmula que se explotaría a lo largo del tiempo.',
    production_description_en:
      'The immortal adventures of Goku and Bulma in search of the dragon balls, amid fights, martial arts tournaments, and countless characters that would adorn one of the greatest entertainment stories worldwide, and would create a robust formula that would be exploited over time.',
    production_number_chapters: 153,
    production_image_path: '/img/tarjeta/45.jpg',
    production_ranking_number: 204,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Fantasía,Aventura,Entretenimiento',
    id: 45,
  },
  {
    production_name: 'Kimagure Orange Road',
    production_year: 1987,
    production_description:
      'Una mezcla bastante inusual y extraña, posiblemente el anime más ridículo que se haya creado, con las connotaciones típicas del anime cancerígeno moderno pero al mismo tiempo incluyendo una fórmula de narrativa impecable, una de las mejores de este tipo, contando las historias en función de uno de los mejores prototipos de waifus y el protagonista en sus años de juventud.',
    production_description_en:
      'A rather unusual and strange mix, possibly the most ridiculous anime ever created, with the typical connotations of modern "cancerous" anime but at the same time including an impeccable narrative formula, one of the best of its kind, telling stories based on one of the best waifu prototypes and the protagonist in his youth years.',
    production_number_chapters: 48,
    production_image_path: '/img/tarjeta/33_1778722006690.jpg',
    production_ranking_number: 65,
    demographic_name: 'Seinen',
    genre_names: 'Romance',
    id: 33,
  },
  {
    production_name: 'Gunbuster',
    production_year: 1988,
    production_description:
      'En un entorno de ciencia ficción blanda apropiado para contar historias de súper robots, se cuenta la historia de la protagonista cuyo sueño es llegar al espacio siguiendo la sombra de su padre y se ve envuelta en un entorno de facciones militares, conflictos contra monstruos espaciales y saltos espacio temporales, propiciando uno de los finales más épicos de la historia.',
    production_description_en:
      "In a soft science fiction setting appropriate for telling super robot stories, the story of the protagonist is told, whose dream is to reach space following in her father's shadow and she becomes involved in an environment of military factions, conflicts against space monsters, and space-time jumps, leading to one of the most epic endings in history.",
    production_number_chapters: 6,
    production_image_path: '/img/tarjeta/49_1766550415498.jpg',
    production_ranking_number: 47,
    demographic_name: 'Seinen',
    genre_names: 'Ciencia ficción,Mecha',
    id: 49,
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
    production_name: "City Hunter '91",
    production_year: 1991,
    production_description:
      'Esta obra fue capaz de pulir lo mejor de las sagas de City Hunter, ofreciendo un combo magnífico de 13 OVAs empezando esta nueva década, inmortalizando personajes memorables, historias versátiles y muy robustas, con el inusual toque de acción aventura y esa particular parodia que hacen a City Hunter una de las obras más grandes del entretenimiento.',
    production_description_en:
      'This work was able to polish the best of the City Hunter sagas, offering a magnificent combo of 13 OVAs starting this new decade, immortalizing memorable characters, versatile and very robust stories, with the unusual touch of action adventure and that particular parody that make City Hunter one of the greatest works of entertainment.',
    production_number_chapters: 13,
    production_image_path: '/img/tarjeta/78.jpg',
    production_ranking_number: 61,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Comedia',
    id: 78,
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
    production_name: 'Black Jack Ovas',
    production_year: 1993,
    production_description:
      'Uno de los más grandes referentes de Osamu Tezuka que de forma muy personal se reflejaban los deseos, anhelos y las fantasías de este autor que no pudo cumplir, en una magistral obra con temáticas desde lo científico hasta lo paranormal, abriendo nuevas perspectivas y enfoque al mundo de esta ciencia.',
    production_description_en:
      'One of the greatest references of Osamu Tezuka that in a very personal way reflected the desires, longings, and fantasies of this author that he could not fulfill, in a masterful work with themes from the scientific to the paranormal, opening new perspectives and approaches to the world of this science.',
    production_number_chapters: 12,
    production_image_path: '/img/tarjeta/84_1768774529602.jpg',
    production_ranking_number: 60,
    demographic_name: 'Shōnen',
    genre_names: 'Drama',
    id: 84,
  },
  {
    production_name: 'Future GPX Cyber Formula Zero',
    production_year: 1994,
    production_description:
      'Después de muchos cambios personales y el aterrador encuentro con la Zona cero, Hayato se prepara para regresar de nuevo a la acción en un mar de sentimientos, emociones, adrenalina y la aterradora Zona cero, intentando superar sus temores mientras competía en una efervescente carrera en la que todos se jugaban sus destinos.',
    production_description_en:
      'After many personal changes and the terrifying encounter with Zone Zero, Hayato prepares to return to action in a sea of feelings, emotions, adrenaline, and the terrifying Zone Zero, trying to overcome his fears while competing in a bubbling race where everyone was playing for their destinies.',
    production_number_chapters: 8,
    production_image_path: '/img/tarjeta/52_1778868050306.jpg',
    production_ranking_number: 105,
    demographic_name: 'Shōnen',
    genre_names: 'Ciencia ficción,Deporte',
    id: 52,
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
    production_name: 'Martian Successor Nadesico',
    production_year: 1996,
    production_description:
      'Es una obra magistral de la comedia parodia. Plantean un universo donde contrastan las dos tendencias de mechas más populares: el súper y el real robot, al mismo tiempo incluyendo elementos del anime cancerígeno, girando en función de una poderosa fórmula de entretenimiento y trasfondos muy interesantes. Un anime que puede ser disfrutado por cualquier público.',
    production_description_en:
      'It\'s a masterful parody comedy work. It presents a universe that contrasts the two most popular mecha trends: super and real robots, while including elements of "cancerous" anime, revolving around a powerful formula of entertainment and very interesting backgrounds. An anime that can be enjoyed by any audience.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/11.jpg',
    production_ranking_number: 20,
    demographic_name: 'Shōnen',
    genre_names: 'Comedia,Ciencia ficción,Romance,Mecha,Otaku,Entretenimiento',
    id: 11,
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
    production_name: 'FLCL',
    production_year: 2000,
    production_description:
      'En un universo de aparente ridiculez inconsecuente, Haruko Haruhara llega a la tranquila ciudad de Mabase en busca de quien tenga el poder de emular al rey de los piratas, capaz de abrir portales espaciales y teletransportar incluso planetas enteros, generando conflictos con la Medical Mechanica y la Fraternidad Espacial, envolviendo a los protagonistas en un aparente sin sentido.',
    production_description_en:
      'In a universe of seemingly inconsequential absurdity, Haruko Haruhara arrives in the peaceful town of Mabase searching for someone with the power to emulate the Pirate King, capable of opening spatial portals and teleporting entire planets, creating conflicts with Medical Mechanica and the Space Brotherhood, dragging the protagonists into apparent nonsense.',
    production_number_chapters: 6,
    production_image_path: '/img/tarjeta/5_1778723098709.jpg',
    production_ranking_number: 3,
    demographic_name: 'Seinen',
    genre_names: 'Ciencia ficción,Musical,Otaku,Misterio',
    id: 5,
  },
  {
    production_name: 'Hikaru no go',
    production_year: 2001,
    production_description:
      'Otro anime de la década del 2000 que pasa casi desapercibido, el contexto central es este emblemático juego de mesa oriental, introduciéndole una pizca de misterio al mejor estilo de las maldiciones antiguas Pero le dan la vuelta y lo hacen un acontecimiento muy conveniente, mientras van creando una secuencia de crecimiento y rivalidades intensas.',
    production_description_en:
      'Another anime from the 2000s that goes almost unnoticed, the central context is this emblematic Eastern board game, introducing a pinch of mystery in the best style of ancient curses But they turn it around and make it a very convenient event, while creating a sequence of growth and intense rivalries.',
    production_number_chapters: 75,
    production_image_path: '/img/tarjeta/436.jpg',
    production_ranking_number: 136,
    demographic_name: 'Shōnen',
    genre_names: 'Drama,Fantasía,Deporte,Entretenimiento',
    id: 436,
  },
  {
    production_name: 'The Twelve Kingdoms',
    production_year: 2002,
    production_description:
      'El valor de esta historia es enorme ya que plantean una inserción en un mundo casi fantástico, pero al mismo tiempo son capaces de crear una historia de ficción tan sólida con una cosmovisión tan intrigante y robusta que simplemente se convierte en una de las más grandes obras de inserción en mundos fantásticos, planteando diferentes vértices y líneas temporales de varias historias.',
    production_description_en:
      'The value of this story is enormous since they propose an insertion into an almost fantastic world, but at the same time they are capable of creating such a solid fiction story with such an intriguing and robust worldview that it simply becomes one of the greatest works of insertion into fantastic worlds, proposing different angles and timelines of various stories.',
    production_number_chapters: 45,
    production_image_path: '/img/tarjeta/351.jpg',
    production_ranking_number: 28,
    demographic_name: 'Josei',
    genre_names: 'Acción,Magia,Fantasía,Aventura,Sobrenatural',
    id: 351,
  },
  {
    production_name: 'Gungrave',
    production_year: 2003,
    production_description:
      'En un extraño mundo distópico con ambiente de mafias clásicas, se desarrolla la historia de los protagonistas que luchan por la libertad escapando de la mafia, irónicamente haciendo parte de ella para alcanzar ese anhelado sueño, donde los amigos y la familia es lo más importante y son aquellos a los que deseas proteger, pero inesperadamente todo se sale de control.',
    production_description_en:
      'In a strange dystopian world with a classic mafia atmosphere, the story of the protagonists unfolds as they fight for freedom by escaping the mafia, ironically being part of it to achieve that longed-for dream, where friends and family are the most important and are those you want to protect, but unexpectedly everything spirals out of control.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/18.jpg',
    production_ranking_number: 17,
    demographic_name: 'Seinen',
    genre_names: 'Acción,Drama,Ciencia ficción,Crimen',
    id: 18,
  },
  {
    production_name: 'Monster',
    production_year: 2004,
    production_description:
      'Los monstruos son aquellos que se encuban de forma silenciosa esperando para emerger y devorar a su contenedor. Esta obra nos plantea de forma brillante un argumento policíaco detectivesco, en un entorno muy realista con un trasfondo psicológico impecable, en función de un set de personajes impresionantes donde cada uno persigue a un monstruo en particular.',
    production_description_en:
      'Monsters are those that incubate silently waiting to emerge and devour their container. This work brilliantly presents a detective police argument, in a very realistic environment with an impeccable psychological background, based on an impressive set of characters where each one pursues a particular monster.',
    production_number_chapters: 74,
    production_image_path: '/img/tarjeta/19.jpg',
    production_ranking_number: 5,
    demographic_name: 'Seinen',
    genre_names: 'Psicologico,Drama,Suspenso,Realismo,Triller Psicológico',
    id: 19,
  },
  {
    production_name: 'Mushishi',
    production_year: 2005,
    production_description:
      'Una historia llena de misterio sobrenatural contada a través de la vida de muchos personajes interesantes, llevando al protagonista en un viaje interminable, presentando un mundo lleno de fantasía, belleza y al mismo tiempo irreal, peligroso, desbordante de sentimientos de nostalgia y melancolía.',
    production_description_en:
      'A story full of supernatural mystery told through the life of many interesting characters, taking the protagonist on an endless journey, presenting a world full of fantasy, beauty and at the same time unreal, dangerous, overflowing with feelings of nostalgia and melancholy.',
    production_number_chapters: 26,
    production_image_path: '/img/tarjeta/161_1766550690552.jpg',
    production_ranking_number: 46,
    demographic_name: 'Shōnen-Seinen',
    genre_names: 'Fantasía,Sobrenatural,Misterio',
    id: 161,
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
    production_name: 'Code Geass R2',
    production_year: 2008,
    production_description:
      'En una brillante mezcla entre mechas, dictaduras y opresión con un singular toque de fantasía, cuentan una historia intrigante de estrategia bélica entre facciones militares rebeldes y ambición política, en entornos de misterios como el Geass, el poder de los reyes, el cual tiene la potestad de cambiar el rumbo de esta revolución a nivel mundial.',
    production_description_en:
      'In a brilliant blend of mechas, dictatorships, and oppression with a unique touch of fantasy, it tells an intriguing story of military strategy between rebel factions and political ambition, in settings of mysteries like Geass, the power of kings, which has the authority to change the course of this worldwide revolution.',
    production_number_chapters: 25,
    production_image_path: '/img/tarjeta/12_1783046132495.jpg',
    production_ranking_number: 33,
    demographic_name: 'Seinen',
    genre_names: 'Ciencia ficción,Mecha,Triller Psicológico',
    id: 12,
  },
  {
    production_name: 'Eden of the East',
    production_year: 2009,
    production_description:
      'Es una historia que está muy a la vanguardia, tocando muchos elementos sociales japoneses muy interesantes. De forma atractiva, crea un grupo de personajes muy acordes para contar una trama muy realista apegada a dichas problemáticas y un juego dudoso, generando un entorno y una trama muy adictiva.',
    production_description_en:
      "It's a story that is very avant-garde, touching on many interesting Japanese social elements. In an attractive way, it creates a very fitting group of characters to tell a highly realistic plot attached to these issues and a dubious game, generating a very addictive environment and storyline.",
    production_number_chapters: 11,
    production_image_path: '/img/tarjeta/9_1781182455430.jpg',
    production_ranking_number: 21,
    demographic_name: 'Josei',
    genre_names: 'Romance,Suspenso,Aventura,Otaku,Realismo,Misterio,Triller Psicológico',
    id: 9,
  },
  {
    production_name: 'The Tatami Galaxy',
    production_year: 2010,
    production_description:
      'Las aventuras de un estudiante en un ambiente universitario muy surreal. El entorno de colores y matices brillantes casi psicodélicos, con un toque sobrenatural y personajes sacados casi que de un viaje ácido, envuelve al protagonista en un sinfín de paradojas temporales encerrando a todos los personajes en un universo con fronteras hechas de tatami.',
    production_description_en:
      'The adventures of a student in a very surreal university environment. The setting of bright, almost psychedelic colors and shades, with a supernatural touch and characters seemingly taken from an acid trip, wraps the protagonist in endless temporal paradoxes, trapping all the characters in a universe with borders made of tatami.',
    production_number_chapters: 11,
    production_image_path: '/img/tarjeta/26.jpg',
    production_ranking_number: 22,
    demographic_name: 'Seinen',
    genre_names: 'Psicologico,Romance',
    id: 26,
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
    production_name: 'From the New World',
    production_year: 2012,
    production_description:
      'El antiguo mundo ha terminado y como remanente ha dejado uno nuevo lleno de misterios, planteando una construcción de entornos fantásticos y un nuevo renacer para la humanidad, pero precisamente en el fondo de esta, se encuentra aquella misma semilla que en cualquier momento puede salirse de control y volver a llevar a la humanidad a un caos apocalíptico inminente.',
    production_description_en:
      'The ancient world has ended and as a remnant has left a new one full of mysteries, proposing a construction of fantastic environments and a new rebirth for humanity, but precisely at its foundation lies that same seed that at any moment can get out of control and lead humanity back to imminent apocalyptic chaos.',
    production_number_chapters: 25,
    production_image_path: '/img/tarjeta/25.jpg',
    production_ranking_number: 9,
    demographic_name: 'Josei',
    genre_names: 'Fantasía,Suspenso,Post Apocalíptico',
    id: 25,
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
    production_name: 'Parasyte: The Maxim',
    production_year: 2014,
    production_description:
      'Utilizando un extraño suceso de ciencia ficción que afecta directamente al protagonista, proponiendo quizás la historia mas robusta de evolución y crecimiento personal incremental, planteando muchas incertidumbres humanas y realidades posibles abordada desde los diferentes actores de esta entrega y sus particulares puntos de vista.',
    production_description_en:
      'Using a strange science fiction event that directly affects the protagonist, proposing perhaps the most robust story of incremental evolution and personal growth, posing many human uncertainties and possible realities addressed from the different actors of this installment and their particular points of view.',
    production_number_chapters: 24,
    production_image_path: '/img/tarjeta/204.jpg',
    production_ranking_number: 49,
    demographic_name: 'Seinen',
    genre_names: 'Acción,Psicologico,Drama,Ciencia ficción,Romance,Triller Psicológico',
    id: 204,
  },
  {
    production_name: 'Overlord',
    production_year: 2015,
    production_description:
      'Una mezcla inusual pero llamativa dentro del isekai, combinando elementos tecnológicos con un mundo fantástico. Parte de una premisa que puede parecer absurda, pero que poco a poco se transforma en la construcción de un entorno más sólido y coherente, mostrando la adaptación del protagonista y el crecimiento de este mundo en su primera saga, adornado con dosis de humor e ironía que lo vuelven atractivo.',
    production_description_en:
      "An unusual yet appealing mix within the isekai genre, combining technological elements with a fantasy world. It starts from a premise that may seem absurd, but gradually turns into the construction of a more solid and coherent setting, showing the protagonist's adaptation and the growth of this world in its first saga, adorned with touches of humor and irony that make it engaging.",
    production_number_chapters: 13,
    production_image_path: '/img/tarjeta/334.jpg',
    production_ranking_number: 141,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Magia,Ciencia ficción,H',
    id: 334,
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
    production_name: 'Attack on Titan Season 2',
    production_year: 2017,
    production_description:
      'Continuando con la historia inconclusa, utilizando recursos brillantes en la narrativa y en el desarrollo de la trama, presentan esta segunda intrigante temporada revelando otros secretos que habían dejado sin concluir en la primera, siendo una de las sagas más adictivas y apoteósicas de los últimos tiempos.',
    production_description_en:
      'Continuing with the unfinished story, using brilliant resources in the narrative and in the development of the plot, they present this second intriguing season revealing other secrets that had been left unfinished in the first, being one of the most addictive and apotheotic sagas of recent times.',
    production_number_chapters: 12,
    production_image_path: '/img/tarjeta/131_1783097745857.jpg',
    production_ranking_number: 29,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Drama,Ciencia ficción,Suspenso,Post Apocalíptico,Misterio',
    id: 131,
  },
  {
    production_name: 'Attack on Titan Season 3',
    production_year: 2018,
    production_description:
      'La tercera temporada continúa la historia manteniendo el ritmo y la intensidad que la serie ya había construido. Poco a poco se empiezan a responder preguntas importantes, mientras surgen nuevos conflictos que elevan la tensión. La acción gana peso, los personajes evolucionan y la trama se expande, logrando que esta etapa se sienta firme, emocionante y clave dentro del desarrollo general de la saga.',
    production_description_en:
      'The third season carries the story forward while maintaining the pace and intensity the series had already established. Important questions begin to find answers, even as new conflicts raise the tension. Action takes on a stronger role, characters evolve, and the plot expands, making this season feel solid, engaging, and essential to the overall saga.',
    production_number_chapters: 22,
    production_image_path: '/img/tarjeta/340_1783116074505.jpg',
    production_ranking_number: 97,
    demographic_name: 'Shōnen',
    genre_names: 'Acción,Psicologico,Drama,Suspenso,Gore,Post Apocalíptico',
    id: 340,
  },
  {
    production_name: 'Dororo',
    production_year: 2019,
    production_description:
      'Se presenta como una poderosa fantasía oscura que hace uso de mitología y relatos de época para construir un mundo crudo y atractivo. Sus personajes resultan carismáticos y están bien integrados a la narrativa, reforzada por sólidas escenas de acción que elevan la calidad de la producción. El recorrido concluye con un cierre abierto que deja espacio para la reflexión y una posible continuación.',
    production_description_en:
      'It presents itself as a powerful dark fantasy that draws on mythology and period tales to build a harsh yet compelling world. Its characters are charismatic and well integrated into the narrative, reinforced by strong action scenes that elevate the overall production quality. The journey ends with an open conclusion that leaves room for reflection and a possible continuation.',
    production_number_chapters: 24,
    production_image_path: '/img/tarjeta/395_1765234855998.jpg',
    production_ranking_number: 108,
    demographic_name: 'Shōnen',
    genre_names: 'Drama,Fantasía,Sobrenatural',
    id: 395,
  },
  {
    production_name: 'Attack on Titan: The Final Season',
    production_year: 2020,
    production_description:
      'Se presenta como una poderosa antítesis del concepto tradicional de la guerra, cuestionando la figura de héroes y villanos y la historia narrada por los vencedores. A través de múltiples puntos de vista, expone los errores recurrentes de la humanidad en una obra que combina acción intensa, carga emocional y un uso simbólico profundo, alcanzando un resultado tan devastador como apoteósico.',
    production_description_en:
      'It presents itself as a powerful antithesis to the traditional concept of war, questioning the roles of heroes and villains and the history written by the victors. Through multiple perspectives, it exposes humanity’s recurring mistakes in a work that blends intense action, emotional weight, and rich symbolism, achieving a result that is both devastating and apotheotic.',
    production_number_chapters: 16,
    production_image_path: '/img/tarjeta/474_1783169312384.jpg',
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
    production_name: 'Orb: On the Movements of the Earth',
    production_year: 2024,
    production_description:
      'Dividida a través de varios protagonistas, la obra construye una reflexión sobre una idea que se transmite de una generación a otra, mostrando la evolución del conocimiento humano y lo limitada que puede ser una sola vida para alcanzarlo. Apoyándose en conceptos científicos y religiosos marcados por la persecución y el dogma, presenta múltiples visiones del pasado con un enfoque serio, denso y estimulante.',
    production_description_en:
      'Structured around multiple protagonists, the series reflects on an idea passed from one generation to the next, portraying the evolution of human knowledge and how limited a single life can be to achieve it. Drawing from scientific and religious concepts shaped by persecution and dogma, it presents multiple perspectives of the past with a serious, dense, and thought-provoking approach.',
    production_number_chapters: 25,
    production_image_path: '/img/tarjeta/489_1766554532552.jpg',
    production_ranking_number: 112,
    demographic_name: 'Seinen',
    genre_names: 'Drama,Ciencia ficción,Suspenso,Histórico,Misterio',
    id: 489,
  },
  {
    production_name: 'Lazarus',
    production_year: 2025,
    production_description:
      'En un futuro no tan lejano, un fármaco que prometía eliminar todo dolor se convierte en una condena para la humanidad. A partir de esta cuenta regresiva, la serie reúne a un grupo de personajes relegados del sistema que, pese a su aparente irrelevancia, logran articular una historia sólida y entretenida, apoyada en secuencias de acción envolventes y un trasfondo de ciencia ficción inquietante.',
    production_description_en:
      'In a not-so-distant future, a drug that once promised to eliminate all pain turns into a death sentence for humanity. From this ticking countdown, the series brings together a group of characters pushed to the margins of society who, despite their apparent insignificance, form a cohesive and engaging story supported by immersive action sequences and an unsettling science fiction backdrop.',
    production_number_chapters: 13,
    production_image_path: '/img/tarjeta/475_1778442428783.jpg',
    production_ranking_number: 101,
    demographic_name: 'Seinen',
    genre_names: 'Psicologico,Ciencia ficción,Suspenso,Neo-noir,Misterio',
    id: 475,
  },
  {
    production_name: 'Witch Hat Atelier',
    production_year: 2026,
    production_description:
      'En un mundo donde la magia se oculta tras el arte del dibujo, Coco descubre accidentalmente el secreto que los magos protegen con recelo. Su ingreso al atelier como aprendiz desencadena una aventura llena de maravilla técnica y peligros éticos sobre el uso del poder. A través de una atmósfera de fantasía pura, la trama explora el peso del conocimiento y las consecuencias de intentar alterar el destino con artes prohibidas.',
    production_description_en:
      'In a world where magic is hidden behind the art of drawing, Coco accidentally discovers the secret that witches jealously guard. Her entry into the atelier as an apprentice triggers an adventure full of technical wonder and ethical dangers regarding the use of power. Through an atmosphere of pure fantasy, the plot explores the weight of knowledge and the consequences of trying to alter destiny with forbidden arts.',
    production_number_chapters: 12,
    production_image_path: '/img/tarjeta/504_1778040191511.jpg',
    production_ranking_number: 256,
    demographic_name: 'Seinen',
    genre_names: 'Fantasía,Aventura,Misterio',
    id: 504,
  },
  {
    production_name: "Romeo's Blue Sky",
    production_year: 1995,
    production_description:
      'Es una adaptación literaria de Occidente del segmento World Masterpiece Theater, animación de alta calidad, grandes bandas sonoras y una historia muy bien adaptada, siguiendo la pista de Romeo y los dramas y aventuras que le deparaba la vida de esa época, posiblemente uno de los mejores clásicos de esta saga.',
    production_description_en:
      "It's a Western literary adaptation from the World Masterpiece Theater segment, high-quality animation, great soundtracks, and a very well-adapted story, following the trail of Romeo and the dramas and adventures that life had in store for him in that era, possibly one of the best classics of this saga.",
    production_number_chapters: 33,
    production_image_path: '/img/tarjeta/57.jpg',
    production_ranking_number: 130,
    demographic_name: 'Kodomo',
    genre_names: 'Drama,Aventura',
    id: 57,
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
    production_image_path: '/img/tarjeta/83_1784566984734.jpg',
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
];

export default initialData;
