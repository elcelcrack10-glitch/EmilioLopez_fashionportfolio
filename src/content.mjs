export const bi = (es, en) => ({ es, en });
const picture = (id, source, es, en) => ({ id, source, alt: bi(es, en) });
const document = (id, source, page, es, en) => ({
  ...picture(id, source, es, en),
  page,
});
const photos = (slug, folder, entries) =>
  entries.map(([file, es, en], i) =>
    picture(`${slug}-photo-${i + 1}`, `${folder}/${file}`, es, en),
  );
const pd = "PESCADILLA/EmilioLopez.Dossier.ordinaria3B.pdf";
const md = "MANUELA/PRESENTACIONFINALIDEACION.pdf";
const rd = "MARNI/PRESENTACIONFINAL_EMILIOLOPEZ2B.pdf";
const cd = 'LEON LEVINSTEIN/PRESENTACION_fede"final" 2.pdf';

export const projects = [
  {
    slug: "pescadilla",
    title: "Pescadilla",
    subtitle: bi(
      "Una colección en torno al mar",
      "A collection shaped by the sea",
    ),
    year: "2026",
    category: bi("Diseño de moda · Editorial", "Fashion design · Editorial"),
    lead: bi("Del mar a la prenda.", "From sea to garment."),
    description: bi(
      "Pescadilla es una colección desarrollada en un proyecto de sostenibilidad junto a UNIQLO. Las culturas pesqueras, sus prendas de trabajo y su relación con el entorno dan forma a la investigación, las siluetas y los estampados.",
      "Pescadilla is a collection developed through a sustainability project with UNIQLO. Fishing cultures, their workwear and their relationship with the environment inform the research, silhouettes and prints.",
    ),
    note: bi(
      "La colección incluye propuestas dibujadas de upcycling. Las prendas de la editorial fueron confeccionadas por mí; el upcycling no se aplica a todos los diseños.",
      "The collection includes illustrated upcycling proposals. I made the garments in the editorial; upcycling does not apply to every design.",
    ),
    credits: [
      [
        bi(
          "Concepto, diseño, patronaje y confección",
          "Concept, design, pattern cutting & garment making",
        ),
        "Emilio Lopez",
      ],
      [
        bi(
          "Dirección creativa, editorial y maquetación",
          "Creative direction, editorial direction & layout",
        ),
        "Emilio Lopez",
      ],
      [bi("Fotografía", "Photography"), "Adrian Simon"],
      [bi("Modelo", "Model"), "Manuela Silveira"],
    ],
    photos: photos("pescadilla", "PESCADILLA/FOTOS", [
      [
        "I79A7626.jpg",
        "Manuela con el conjunto de Pescadilla y un carrito azul en el mercado",
        "Manuela wearing Pescadilla with a blue trolley at the market",
      ],
      [
        "I79A7553.jpg",
        "Vista de la espalda y la capucha de la chaqueta",
        "Back and hood of the jacket",
      ],
      [
        "I79A7755.jpg",
        "Retrato editorial con un pez frente al rostro",
        "Editorial portrait with a fish in front of the face",
      ],
      [
        "I79A7749.jpg",
        "Vista posterior de la chaqueta y la falda estampada",
        "Back view of the jacket and printed skirt",
      ],
      [
        "I79A7828.jpg",
        "Conjunto en exterior con chaqueta abierta y camiseta de rayas",
        "Outdoor look with an open jacket and striped top",
      ],
      [
        "I79A7810.jpg",
        "Detalle de las capas y los estampados de Pescadilla",
        "Details of Pescadilla’s layers and prints",
      ],
      [
        "I79A7802.jpg",
        "Retrato frontal de Manuela Silveira",
        "Front-facing portrait of Manuela Silveira",
      ],
      [
        "I79A7833.jpg",
        "Las prendas en movimiento junto a cajas de mercado",
        "The garments in motion beside market crates",
      ],
    ]),
    process: [
      {
        title: bi("01 / Investigación", "01 / Research"),
        text: bi(
          "El punto de partida está en las culturas pesqueras y en la ropa que acompaña su trabajo. La investigación reúne referencias de las Ama de Japón y de Escandinavia, junto a colores, materiales y formas vinculadas al mar.",
          "The starting point is fishing culture and the clothes worn at work. The research brings together references to Japan’s Ama divers and Scandinavia, alongside colours, materials and shapes connected to the sea.",
        ),
        images: [
          document(
            "pescadilla-research-1",
            pd,
            24,
            "Moodboard de la colección",
            "Collection moodboard",
          ),
          document(
            "pescadilla-research-2",
            pd,
            25,
            "Referencias visuales y materiales",
            "Visual and material references",
          ),
        ],
      },
      {
        title: bi(
          "02 / Dibujo y experimentación",
          "02 / Drawing & experimentation",
        ),
        text: bi(
          "Los figurines permiten explorar la colección y sus propuestas de upcycling. Las muestras de Gyotaku fueron una investigación paralela sobre técnicas de estampación, realizada en una clase relacionada.",
          "The fashion illustrations explore the collection and its upcycling proposals. Gyotaku samples were a parallel exploration of printing techniques, made in a related class.",
        ),
        images: [
          document(
            "pescadilla-design-1",
            pd,
            36,
            "Figurines de Pescadilla",
            "Pescadilla fashion illustrations",
          ),
          document(
            "pescadilla-design-2",
            pd,
            40,
            "Desarrollo de diseños de la colección",
            "Development of collection designs",
          ),
          document(
            "pescadilla-samples",
            pd,
            18,
            "Investigación de estampación Gyotaku",
            "Gyotaku print research",
          ),
        ],
      },
      {
        title: bi("03 / De la toile al tejido", "03 / From toile to fabric"),
        text: bi(
          "Pruebas de volumen, pantallas de serigrafía, piezas estampadas y ajustes de la chaqueta. Un recorrido por la construcción de las prendas y el trabajo de taller.",
          "Volume studies, screen-printing frames, printed pieces and jacket fittings. A view of garment construction and work in the studio.",
        ),
        images: photos(
          "pescadilla-process",
          "review/pescadilla/proceso pescadilla",
          [
            [
              "IMG_8554 2.HEIC",
              "Toile de la chaqueta, vista lateral",
              "Jacket toile, side view",
            ],
            [
              "IMG_8555 2.HEIC",
              "Toile de la chaqueta, vista frontal",
              "Jacket toile, front view",
            ],
            [
              "IMG_8556 2.HEIC",
              "Toile de la chaqueta, espalda",
              "Jacket toile, back view",
            ],
            ["IMG_8620.HEIC", "Pantalla de estampación", "Printing screen"],
            [
              "IMG_8447 2.HEIC",
              "Trabajo con pantallas en el taller",
              "Working with screens in the studio",
            ],
            [
              "IMG_8443.HEIC",
              "Pruebas de estampado sobre tejido gris",
              "Print tests on grey fabric",
            ],
            [
              "IMG_8449 2.HEIC",
              "Motivos sobre el tejido gris",
              "Motifs on grey fabric",
            ],
            [
              "1A6802BE-5005-4B77-B71D-A47868DF219D.JPG",
              "Pieza verde estampada y cortada",
              "Printed and cut green fabric piece",
            ],
            [
              "IMG_8548 2.heic",
              "Pieza de tejido verde extendida",
              "Green fabric piece laid flat",
            ],
            [
              "IMG_8661.HEIC",
              "Prueba de la chaqueta con capucha",
              "Hooded jacket fitting",
            ],
            [
              "IMG_8655.HEIC",
              "Prueba de la chaqueta con la capucha bajada",
              "Jacket fitting with the hood down",
            ],
          ],
        ),
      },
    ],
  },
  {
    slug: "manuela",
    title: "Manuela",
    subtitle: bi("Hombres hiena", "Hyena men"),
    year: "2024",
    category: bi("Diseño de moda · Editorial", "Fashion design · Editorial"),
    lead: bi("Magia y transformación.", "Magic & transformation."),
    description: bi(
      "Una investigación que conecta la referencia visual de los hombres hiena con El sueño de una noche de verano de Shakespeare. Puck y la transformación de la realidad sirven como punto de partida para explorar volúmenes amplios, superposiciones y siluetas geométricas.",
      "A study connecting the visual reference of the hyena men with Shakespeare’s A Midsummer Night’s Dream. Puck and the transformation of reality become a starting point for exploring generous volumes, layering and geometric silhouettes.",
    ),
    note: bi(
      "Confeccioné los pantalones y el suéter gris que aparecen en la editorial. Las demás prendas y accesorios forman parte del estilismo.",
      "I made the trousers and grey sweater featured in the editorial. The other garments and accessories are part of the styling.",
    ),
    credits: [
      [
        bi(
          "Concepto, diseño, patronaje y confección",
          "Concept, design, pattern cutting & garment making",
        ),
        "Emilio Lopez",
      ],
      [
        bi("Dirección creativa y estilismo", "Creative direction & styling"),
        "Emilio Lopez",
      ],
      [
        bi("Colaboración en fotografía", "Photography collaboration"),
        "Luda Pellat",
      ],
      [bi("Modelo", "Model"), "Manuela Silveira"],
    ],
    photos: photos("manuela", "MANUELA/FOTOS MANUELA", [
      [
        "Sin título-3.PNG",
        "Manuela con pantalones de gran volumen, en blanco y negro",
        "Manuela wearing voluminous trousers, in black and white",
      ],
      [
        "Sin título-4.PNG",
        "Volumen y pliegues de los pantalones",
        "Volume and folds of the trousers",
      ],
      [
        "Sin título-8.PNG",
        "Vista desde arriba sobre una rejilla",
        "View from above on a metal grid",
      ],
      [
        "Sin título-1.PNG",
        "Los pantalones en movimiento",
        "The trousers in motion",
      ],
      [
        "Sin título-33.PNG",
        "Vista frontal del estilismo con suéter gris",
        "Front view of the look with the grey sweater",
      ],
      [
        "IMG_3285 2.jpg",
        "Detalle del suéter gris en color",
        "Colour detail of the grey sweater",
      ],
      [
        "Sin título-22.PNG",
        "Espalda del suéter gris",
        "Back of the grey sweater",
      ],
      [
        "emilio-30 2.JPG",
        "Retrato de Manuela con gorro",
        "Portrait of Manuela wearing a hat",
      ],
    ]),
    process: [
      {
        title: bi("01 / Conexiones", "01 / Connections"),
        text: bi(
          "El cuaderno de artista reúne referencias, asociaciones y las primeras ideas. La magia y la transformación conectan los dos puntos de partida del proyecto.",
          "The artist’s notebook brings together references, associations and initial ideas. Magic and transformation connect the two starting points of the project.",
        ),
        images: [
          document(
            "manuela-research-1",
            md,
            3,
            "Cuaderno de artista con referencias",
            "Artist’s notebook with references",
          ),
          document(
            "manuela-research-2",
            md,
            5,
            "Investigación de formas y movimiento",
            "Research into shapes and movement",
          ),
          document(
            "manuela-moodboard",
            md,
            15,
            "Moodboard de la colección",
            "Collection moodboard",
          ),
        ],
      },
      {
        title: bi(
          "02 / La colección dibujada",
          "02 / The collection in drawings",
        ),
        text: bi(
          "Los figurines exploran proporciones, capas y variaciones de color. La investigación pasa del collage a una familia de siluetas.",
          "The illustrations explore proportions, layers and colour variations. The research moves from collage to a family of silhouettes.",
        ),
        images: [
          picture(
            "manuela-design-1",
            "MANUELA/FigurinesIdeacion/figurinescompletos.png",
            "Primer grupo de figurines",
            "First group of fashion illustrations",
          ),
          picture(
            "manuela-design-2",
            "MANUELA/FigurinesIdeacion/figurinesideacion2completos.png",
            "Segundo grupo de figurines",
            "Second group of fashion illustrations",
          ),
        ],
      },
      {
        title: bi("03 / Pruebas de la prenda", "03 / Garment studies"),
        text: bi(
          "El pantalón extendido y las pruebas sobre el cuerpo permiten observar el volumen y cómo se comporta la pieza al llevarla.",
          "The trousers laid flat and fitted on the body show their volume and how the garment behaves when worn.",
        ),
        images: photos("manuela-process", "MANUELA/FOTOS MANUELA", [
          [
            "IMG_3130 2.HEIC",
            "Pantalón extendido sobre el suelo",
            "Trousers laid flat on the floor",
          ],
          [
            "IMG_3168 2.HEIC",
            "Prueba frontal de los pantalones",
            "Front fitting of the trousers",
          ],
          [
            "IMG_3170 2.HEIC",
            "Prueba de los pantalones en posición sentada",
            "Trousers fitting while seated",
          ],
        ]),
      },
    ],
  },
  {
    slug: "feel-marni",
    title: "Feel Marni",
    subtitle: bi("El movimiento como emoción", "Movement as emotion"),
    year: "2025",
    category: bi("Running · Fashion film", "Running · Fashion film"),
    lead: bi("La sensación de correr.", "The feeling of running."),
    description: bi(
      "Una colección de running que interpreta el lenguaje de Marni desde la alegría y el movimiento. Nació en una clase en la que se me asignó la marca como referencia. La propuesta se desarrolla en prendas, una editorial y un fashion film.",
      "A running collection interpreting Marni’s visual language through joy and movement. It began as a class project in which I was assigned the brand as a reference. The proposal unfolds through garments, an editorial and a fashion film.",
    ),
    note: bi(
      "Proyecto académico de interpretación de marca. Confeccioné las prendas de la sesión de fotos; en el fashion film trabajé el estilismo y compartí la dirección de arte con Adrian Valero.",
      "An academic brand-interpretation project. I made the garments for the photo shoot; for the fashion film, I worked on styling and shared art direction with Adrian Valero.",
    ),
    credits: [
      [bi("Confección", "Garment making"), "Emilio Lopez"],
      [bi("Fotografía", "Photography"), "Luda Pellat"],
      [bi("Modelo de la editorial", "Editorial model"), "Bruno Constantino"],
    ],
    photos: photos("marni", "MARNI", [
      [
        "IMG_8337 4.jpg",
        "Bruno corriendo de perfil, con barrido en blanco y negro",
        "Bruno running in profile, with motion blur in black and white",
      ],
      [
        "FOTOS BURNO MARNI/IMG_8308 3.JPG",
        "Retrato frontal y detalle de la chaqueta",
        "Front portrait and jacket detail",
      ],
      [
        "cambio.JPG",
        "Perfil de Bruno con la mano en la gorra",
        "Bruno in profile with his hand on his cap",
      ],
      [
        "FOTOS BURNO MARNI/IMG_8315 2.jpg",
        "Gesto con la capucha en blanco y negro",
        "Gesture with the hood in black and white",
      ],
      [
        "FOTOS BURNO MARNI/IMG_8316 2.JPG",
        "Retrato sonriente con las prendas de running",
        "Smiling portrait wearing the running garments",
      ],
      [
        "FOTOS BURNO MARNI/IMG_8334 2.jpg",
        "Retrato nocturno en blanco y negro",
        "Night-time portrait in black and white",
      ],
      [
        "FOTOS BURNO MARNI/IMG_8336 2.JPG",
        "Silueta completa corriendo con barrido",
        "Full silhouette running with motion blur",
      ],
      [
        "FOTOS BURNO MARNI/IMG_8338 2.JPG",
        "Detalle de las prendas en movimiento",
        "Garment detail in motion",
      ],
    ]),
    film: {
      title: "Feel Marni",
      text: bi(
        "Una mirada a la experiencia de correr: el ritmo, la pausa y el entorno. El fashion film amplía el proyecto a través del movimiento y el sonido.",
        "A look at the experience of running: rhythm, pauses and surroundings. The fashion film expands the project through movement and sound.",
      ),
      credits: [
        [
          bi("Dirección de arte y estilismo", "Art direction & styling"),
          "Emilio Lopez",
        ],
        [
          bi(
            "Dirección de arte, videografía y edición",
            "Art direction, videography & editing",
          ),
          "Adrian Valero",
        ],
        [bi("Modelo", "Model"), "Bammelik"],
      ],
    },
    process: [
      {
        title: bi("01 / Interpretar una marca", "01 / Interpreting a brand"),
        text: bi(
          "Las referencias de Marni se encuentran con el universo del running. Los moodboards reúnen contrastes, texturas y una paleta que guía la colección.",
          "Marni references meet the world of running. The moodboards bring together contrasts, textures and a palette that guides the collection.",
        ),
        images: [
          document(
            "marni-mood-1",
            rd,
            5,
            "Moodboard de running y referencias visuales",
            "Running moodboard and visual references",
          ),
          document(
            "marni-mood-2",
            rd,
            6,
            "Referencias de tejidos y texturas",
            "Fabric and texture references",
          ),
          document(
            "marni-palette",
            rd,
            7,
            "Paleta de color de Feel Marni",
            "Feel Marni colour palette",
          ),
        ],
      },
      {
        title: bi("02 / Siluetas en movimiento", "02 / Silhouettes in motion"),
        text: bi(
          "Los dibujos desarrollan variaciones de capas, proporciones y combinaciones de color para una colección de otoño/invierno.",
          "The drawings develop variations in layering, proportions and colour combinations for an autumn/winter collection.",
        ),
        images: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((page, i) =>
          document(
            `marni-design-${i + 1}`,
            rd,
            page,
            `Figurines de Feel Marni, lámina ${i + 1}`,
            `Feel Marni illustrations, sheet ${i + 1}`,
          ),
        ),
      },
    ],
  },
  {
    slug: "colores",
    title: "COLORES",
    subtitle: bi("leon levinstein", "leon levinstein"),
    year: "2025–2026",
    category: bi("Confección · Estampación", "Garment making · Printing"),
    lead: bi("Una fotografía sobre la prenda.", "A photograph on a garment."),
    description: bi(
      "La fotografía de Leon Levinstein fue una fuente de inspiración para este proyecto. Confeccioné una gabardina que incorpora el estampado de una de sus imágenes, llevando esa referencia al tejido y al cuerpo.",
      "Leon Levinstein’s photography was a source of inspiration for this project. I made a trench coat incorporating a print of one of his images, bringing that reference onto fabric and the body.",
    ),
    note: bi(
      "La investigación reúne estudios de color, referencias visuales y dibujos. La editorial muestra la gabardina en distintos espacios, entre luz, sombra y textura.",
      "The research brings together colour studies, visual references and drawings. The editorial shows the trench coat in different spaces, between light, shadow and texture.",
    ),
    credits: [
      [bi("Confección de la gabardina", "Trench coat making"), "Emilio Lopez"],
      [bi("Fotografía", "Photography"), "Diego Salvador"],
      [bi("Modelo", "Model"), "Nel Varga"],
      [
        bi(
          "Fotografía utilizada en el estampado",
          "Photograph used in the print",
        ),
        "Leon Levinstein",
      ],
    ],
    photos: photos("colores", "LEON LEVINSTEIN/FOTOS NEL - LEON LEVINSTEIN", [
      [
        "DSC01811.JPG",
        "Vista frontal de la gabardina junto a una pared amarilla",
        "Front view of the trench coat by a yellow wall",
      ],
      [
        "DSC01703.JPG",
        "Nel con la gabardina junto a un muro de piedra",
        "Nel wearing the trench coat beside a stone wall",
      ],
      [
        "DSC01727.JPG",
        "Espalda de la gabardina con el estampado fotográfico",
        "Back of the trench coat with the photographic print",
      ],
      [
        "DSC01799.JPG",
        "Retrato con luz y sombra",
        "Portrait in light and shadow",
      ],
      [
        "DSC01840.JPG",
        "Gabardina y arquitectura amarilla",
        "Trench coat and yellow architecture",
      ],
      [
        "DSC02016.JPG",
        "Gabardina vista de frente en interior",
        "Front view of the trench coat indoors",
      ],
      [
        "DSC02043.JPG",
        "Gabardina vista de espalda en interior",
        "Back view of the trench coat indoors",
      ],
      [
        "DSC01842.JPG",
        "Gesto y silueta en blanco y negro",
        "Gesture and silhouette in black and white",
      ],
    ]),
    cover: 1,
    process: [
      {
        title: bi("01 / Color y referencias", "01 / Colour & references"),
        text: bi(
          "Asociaciones de color, formas y texturas. El cuaderno recoge las conexiones visuales que acompañan el proyecto.",
          "Colour associations, shapes and textures. The notebook gathers the visual connections that accompany the project.",
        ),
        images: [
          document(
            "colores-research-1",
            cd,
            4,
            "Mapa de asociaciones entre colores y emociones",
            "Map of associations between colours and emotions",
          ),
          document(
            "colores-research-2",
            cd,
            12,
            "Estudios y selección de color",
            "Colour studies and selection",
          ),
          document(
            "colores-drawings",
            cd,
            16,
            "Dibujos y referencias de siluetas",
            "Drawings and silhouette references",
          ),
        ],
      },
      {
        title: bi(
          "02 / Del material al estampado",
          "02 / From material to print",
        ),
        text: bi(
          "Tejidos y muestrarios, preparación de la imagen, pantalla de estampación y pruebas de la gabardina. La fotografía de referencia se transforma en un detalle de la prenda.",
          "Fabrics and sample books, image preparation, a printing screen and trench coat fittings. The reference photograph becomes a detail of the garment.",
        ),
        images: photos("colores-process", "LEON LEVINSTEIN/proceso Colores", [
          ["IMG_5315.HEIC", "Tienda de tejidos", "Fabric shop"],
          ["IMG_5321.HEIC", "Muestrarios de tejidos", "Fabric sample books"],
          [
            "IMG_5548.JPG",
            "Fotografía de referencia de Leon Levinstein",
            "Reference photograph by Leon Levinstein",
          ],
          [
            "99916259-c6ad-47f9-aab8-799bbf022126 2.JPG",
            "Preparación de la imagen con superposiciones",
            "Image preparation with overlays",
          ],
          [
            "IMG_5547 3.HEIC",
            "Reproducción de la fotografía sobre papel",
            "Photograph reproduced on paper",
          ],
          [
            "27ef3670-3ce3-49b0-b668-7b462ee95312 3.JPG",
            "Pantalla de estampación con la fotografía",
            "Printing screen with the photograph",
          ],
          [
            "IMG_5639.HEIC",
            "Prueba de la gabardina de espalda",
            "Back view of the trench coat fitting",
          ],
          [
            "IMG_5641.HEIC",
            "Detalle del estampado en la gabardina",
            "Detail of the print on the trench coat",
          ],
        ]),
      },
    ],
  },
];

export const biography = bi(
  [
    "Soy Emilio Lopez, diseñador de moda y estudiante en IED Madrid. Mis proyectos normalmente nacen de cosas que me interesan o que tienen algo que ver conmigo. Puede ser una persona, un sentimiento, mi familia, un deporte o simplemente algo que me causa curiosidad. Me gusta investigar, escribir y hablar sobre estos temas hasta encontrar una idea desde la cual pueda empezar a crear.",
    "Una de las partes que más disfruto es cuando toda esa investigación y esas ideas empiezan a convertirse en prendas. Me gusta experimentar con materiales, formas y diferentes maneras de construir una pieza, viendo cómo el concepto se puede llevar a algo físico. Disfruto mucho creando editoriales, porque siento que el proyecto no termina en la prenda. A través del estilismo, la dirección creativa y las imágenes puedo seguir expresando la idea y terminar de contar la historia de cada proyecto.",
  ],
  [
    "I'm Emilio Lopez, a fashion designer and student at IED Madrid. My projects usually start with things that interest me or that I feel connected to. It might be a person, a feeling, my family, a sport, or simply something that sparks my curiosity. I like to research, write, and talk about these subjects until I find an idea I can start creating from.",
    "One of the parts I enjoy most is when all that research and those ideas start turning into garments. I like experimenting with materials, shapes, and different ways of constructing a piece, exploring how a concept can take physical form. I also really enjoy creating fashion editorials, because I feel that a project continues beyond the garment. Through styling, creative direction, and imagery, I can keep expressing the idea and tell the full story of each project.",
  ],
);
export const contact = {
  email: "e.lopezcastillejos@ied.edu",
  instagram: ["ocaassaa", "emiliolpc_"],
};
export const allImages = projects.flatMap((p) => [
  ...p.photos,
  ...p.process.flatMap((s) => s.images),
]);
