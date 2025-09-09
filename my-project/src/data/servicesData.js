// src/data/servicesData.js
import { serviceImages } from "../assets/services";

export const servicesData = {
  sedan: [
    // DETAILING
    {
      id: "sedan-detail-interior",
      category: "Detailing",
      title: "Interior Only",
      description:
        "Factory reset interior: vacuum, garbage removal, mats restored & conditioned, carpets & seats steam cleaned + shampooed, plastics conditioned, streak-free glass.",
      price: 160,
      duration: "2–3 hours",
      features: [
        "Vacuum & garbage removal",
        "Mats restored & conditioned",
        "Carpets & seats steam cleaned + shampooed",
        "Plastics & upholstery conditioned",
        "Streak-free glass",
      ],
      image: serviceImages.sedan[0],
    },
    {
      id: "sedan-detail-exterior",
      category: "Detailing",
      title: "Exterior Only",
      description:
        "Deep clean exterior: rims & tires deep clean, pre-treatment, foam wash, hand dry, paint protection (sealant/ceramic spray), tire shine, rim polish, streak-free windows.",
      price: 150,
      duration: "2-3 hours",
      features: [
        "Rims & tires deep cleaned",
        "Pre-treatment & foam wash",
        "Hand dry + paint protection",
        "Tire shine & rim polish",
        "Streak-free windows",
      ],
      image: serviceImages.sedan[1],
    },
    {
      id: "sedan-detail-full",
      category: "Detailing",
      title: "Interior + Exterior",
      description:
        "Complete sedan detail inside & out. Includes full interior detail + exterior wash, rim & wheel well cleaning, paint pre-treat, foam + contact wash, hand dry, paint sealant, rims polished, tires dressed, streak-free glass.",
      price: 210,
      duration: "3–5 hours",
      popular: true,
      features: [
        "Interior full detail",
        "Deep clean of rims & wheel wells",
        "Paint pre-treatment (bug, dirt, debris removal)",
        "Foam wash + contact wash",
        "Hand dry + 30–60 day paint sealant",
        "Rims polished + tires dressed",
        "Streak-free windows",
      ],
      image: serviceImages.sedan[2],
    },
    {
      id: "sedan-engine",
      category: "Detailing",
      title: "Engine Bay Wash",
      description: "Degrease & detail engine bay (safe for electronics).",
      price: 55,
      duration: "30-40 mins",
      features: [
        "Engine degreased",
        "Plastics dressed",
        "Safe for electronics",
      ],
      image: serviceImages.sedan[3],
    },

    // PAINT CORRECTION
    {
      id: "sedan-pc-1",
      category: "Paint Correction",
      title: "Stage 1 Paint Correction",
      description: "Removes ~50–60% of swirls with machine polish.",
      duration: "5-7 hours ",
      price: 399,
      features: ["50–60% swirl removal", "Restores gloss"],
      image: serviceImages.sedan[4],
    },
    {
      id: "sedan-pc-2",
      category: "Paint Correction",
      title: "Stage 2 Paint Correction",
      description: "Removes ~60–80% of swirls (Stage 1 + extra correction).",
      duration: "5-7 hours ",
      price: 549,
      features: ["60–80% swirl removal", "Higher gloss finish"],
      image: serviceImages.sedan[5],
    },
    {
      id: "sedan-pc-3",
      category: "Paint Correction",
      title: "Stage 3 Paint Correction",
      description: "Removes ~80–99% of swirls for near-showroom finish.",
      duration: "5-7 hours ",
      price: 699,
      features: ["80–99% swirl removal", "Showroom finish"],
      image: serviceImages.sedan[6],
    },

    // CERAMIC
    {
      id: "sedan-ceramic-1y",
      category: "Ceramic Coating",
      title: "1 Year Ceramic Coating",
      description:
        "Includes: 1 step paint correction, full paint prep (wash, clay bar, iron decontamination), 1 year ceramic coating on all painted areas. Includes 1x maintenance wash. Carfax applicable.",
      price: 399,
      duration: "6-10 hours",
      features: [
        "1 step paint correction",
        "Full paint prep: wash, clay bar, iron decon",
        "1 year ceramic coating applied",
        "Includes 1x maintenance wash",
        "Carfax applicable",
      ],
      image: serviceImages.sedan[7],
    },
    {
      id: "sedan-ceramic-3y",
      category: "Ceramic Coating",
      title: "3 Year Ceramic Coating",
      description:
        "Everything in 1-year ceramic + 3 year ceramic coating applied. Includes 2x maintenance washes. Carfax applicable.",
      price: 715,
      duration: "6-10 hours",

      features: [
        "Includes all 1-year ceramic features",
        "3 year ceramic coating applied",
        "Includes 2x maintenance washes",
        "Carfax applicable",
      ],
      image: serviceImages.sedan[7],
    },
    {
      id: "sedan-ceramic-5y",
      category: "Ceramic Coating",
      title: "5 Year Ceramic Coating",
      description:
        "Everything in 1-year ceramic + 5 year ceramic coating applied. Includes 2x maintenance washes. Carfax applicable.",
      price: 999,
      duration: "6-10 hours",
      features: [
        "Includes all 1-year ceramic features",
        "5 year ceramic coating applied",
        "Includes 2x maintenance washes",
        "Carfax applicable",
      ],
      image: serviceImages.sedan[7],
    },

    // TINT
    {
      id: "sedan-tint",
      category: "Window Tinting",
      title: "Window Tinting",
      description:
        "Professional window tinting - choose tint percentage at checkout.",
      price: 249,
      duration: "2-3 hours",
      features: ["Custom tint shades", "UV protection", "Professional install"],
      image: serviceImages.sedan[8],
    },
  ],

  // SUV
  suv: [
    {
      id: "suv-detail-interior",
      category: "Detailing",
      title: "Interior Only",
      description:
        "Deep clean of SUV interior: vacuum, shampoo, mats conditioned, steam clean seats & carpets, plastics conditioned, streak-free glass.",
      price: 165,
      duration: "2–4 hours",
      features: [
        "Vacuum & shampoo",
        "Mats restored & conditioned",
        "Carpets & seats steam cleaned + shampooed",
        "Plastics conditioned",
        "Streak-free glass",
      ],
      image: serviceImages.suv[0],
    },
    {
      id: "suv-detail-exterior",
      category: "Detailing",
      title: "Exterior Only",
      description:
        "SUV exterior deep clean: rims & tires, pre-treatment, foam wash, hand dry, sealant/ceramic spray, tire shine, streak-free windows.",
      price: 165,
      duration: "2-3 hours",
      features: [
        "Rims & tires deep cleaned",
        "Pre-treatment & foam wash",
        "Hand dry + paint sealant",
        "Tire shine",
        "Streak-free windows",
      ],
      image: serviceImages.suv[1],
    },
    {
      id: "suv-detail-full",
      category: "Detailing",
      title: "Interior + Exterior",
      description:
        "Full SUV detail inside & out. Includes complete interior detail + exterior wash, rim & wheel well cleaning, paint pre-treat, foam + contact wash, hand dry, paint sealant, rims polished, tires dressed, streak-free glass.",
      price: 235,
      duration: "3–5 hours",
      popular: true,
      features: [
        "Interior full detail",
        "Deep clean of rims & wheel wells",
        "Paint pre-treatment",
        "Foam wash + contact wash",
        "Hand dry + 30–60 day paint sealant",
        "Rims polished + tires dressed",
        "Streak-free windows",
      ],
      image: serviceImages.suv[2],
    },
    {
      id: "suv-engine",
      category: "Detailing",
      title: "Engine Bay Wash",
      description: "Engine bay degrease & dressing.",
      price: 65,
      duration: "30-45 mins",
      features: ["Degrease", "Plastics dressed"],
      image: serviceImages.suv[3],
    },

    // Paint Correction
    {
      id: "suv-pc-1",
      category: "Paint Correction",
      title: "Stage 1 Paint Correction",
      description: "Removes ~50–60% of swirls.",
      duration: "6-7 hours ",
      price: 399,
      features: ["50–60% swirl removal", "Restores gloss"],
      image: serviceImages.suv[4],
    },
    {
      id: "suv-pc-2",
      category: "Paint Correction",
      title: "Stage 2 Paint Correction",
      description: "Removes ~60–80% of swirls.",
      duration: "6-7 hours ",
      price: 549,
      features: ["60–80% swirl removal"],
      image: serviceImages.suv[5],
    },
    {
      id: "suv-pc-3",
      category: "Paint Correction",
      title: "Stage 3 Paint Correction",
      description: "Removes ~80–99% of swirls.",
      duration: "6-7 hours ",
      price: 699,
      features: ["80–99% swirl removal"],
      image: serviceImages.suv[6],
    },

    // Ceramic
    {
      id: "suv-ceramic-1y",
      category: "Ceramic Coating",
      title: "1 Year Ceramic Coating",
      description:
        "Includes 1 step paint correction, paint prep, and 1 year ceramic coating. Includes 1x maintenance wash. Carfax applicable.",
      price: 399,
      duration: "8-12 hours",
      features: [
        "1 step paint correction",
        "Full paint prep",
        "1 year ceramic coating",
        "1x maintenance wash",
      ],
      image: serviceImages.suv[7],
    },
    {
      id: "suv-ceramic-3y",
      category: "Ceramic Coating",
      title: "3 Year Ceramic Coating",
      description:
        "Includes everything from 1 year + 3 year ceramic coating. 2x maintenance washes.",
      price: 715,
      duration: "8-12 hours",
      features: [
        "All 1 year ceramic features",
        "3 year ceramic coating applied",
        "2x maintenance washes",
      ],
      image: serviceImages.suv[7],
    },
    {
      id: "suv-ceramic-5y",
      category: "Ceramic Coating",
      title: "5 Year Ceramic Coating",
      description:
        "Includes everything from 1 year + 5 year ceramic coating. 2x maintenance washes.",
      price: 999,
      duration: "8-12 hours",
      features: [
        "All 1 year ceramic features",
        "5 year ceramic coating applied",
        "2x maintenance washes",
      ],
      image: serviceImages.suv[7],
    },

    // Tint
    {
      id: "suv-tint",
      category: "Window Tinting",
      title: "Window Tinting",
      description: "Choose tint percentage for your SUV.",
      price: 300,
      duration: "2-3 hours",
      features: ["Custom shades", "UV protection"],
      image: serviceImages.suv[8],
    },
  ],

  // TRUCK
  truck: [
    {
      id: "truck-detail-interior",
      category: "Detailing",
      title: "Interior Only",
      description:
        "Heavy-duty truck interior detail: vacuum, shampoo, mats conditioned, steam clean carpets & seats, plastics conditioned.",
      price: 175,
      duration: "2–4 hours",
      features: [
        "Vacuum & shampoo",
        "Heavy-duty cleaning",
        "Mats & carpets conditioned",
        "Plastics dressed",
      ],
      image: serviceImages.truck[0],
    },
    {
      id: "truck-detail-exterior",
      category: "Detailing",
      title: "Exterior Only",
      description:
        "Truck exterior deep clean: rims, tires, pre-treatment, foam wash, hand dry, sealant, tire shine.",
      price: 170,
      duration: "2-3 hours",
      features: [
        "Rims & tires deep cleaned",
        "Pre-treatment & foam wash",
        "Hand dry + paint protection",
        "Tire shine & polish",
      ],
      image: serviceImages.truck[1],
    },
    {
      id: "truck-detail-full",
      category: "Detailing",
      title: "Interior + Exterior",
      description:
        "Full truck detail inside & out. Includes complete interior detail + exterior wash, rim & wheel well cleaning, paint pre-treat, foam + contact wash, hand dry, paint sealant, rims polished, tires dressed, streak-free glass.",
      price: 250,
      duration: "4–5 hours",
      popular: true,
      features: [
        "Interior full detail",
        "Exterior deep clean",
        "Rims & wheel wells cleaned",
        "Paint pre-treatment",
        "Foam + contact wash",
        "Paint sealant",
        "Rims polished + tires dressed",
      ],
      image: serviceImages.truck[2],
    },
    {
      id: "truck-engine",
      category: "Detailing",
      title: "Engine Bay Wash",
      description: "Engine bay degrease & dressing.",
      duration: "40-55 mins",
      price: 70,
      features: ["Degrease", "Plastics dressed"],
      image: serviceImages.truck[3],
    },

    // Paint Correction
    {
      id: "truck-pc-1",
      category: "Paint Correction",
      title: "Stage 1 Paint Correction",
      description: "Removes ~50–60% of swirls.",
      duration: "7-8 hours ",
      price: 399,
      features: ["50–60% swirl removal"],
      image: serviceImages.truck[4],
    },
    {
      id: "truck-pc-2",
      category: "Paint Correction",
      title: "Stage 2 Paint Correction",
      description: "Removes ~60–80% of swirls.",
      duration: "7-8 hours ",
      price: 549,
      features: ["60–80% swirl removal"],
      image: serviceImages.truck[5],
    },
    {
      id: "truck-pc-3",
      category: "Paint Correction",
      title: "Stage 3 Paint Correction",
      description: "Removes ~80–99% of swirls.",
      duration: "7-8 hours ",
      price: 699,
      features: ["80–99% swirl removal"],
      image: serviceImages.truck[6],
    },

    // Ceramic
    {
      id: "truck-ceramic-1y",
      category: "Ceramic Coating",
      title: "1 Year Ceramic Coating",
      description:
        "Includes 1 step paint correction, prep, and 1 year ceramic coating. Includes 1x maintenance wash.",
      price: 399,
      duration: "8-12 hours",
      features: [
        "1 step paint correction",
        "Full paint prep",
        "1x maintenance wash",
      ],
      image: serviceImages.truck[7],
    },
    {
      id: "truck-ceramic-3y",
      category: "Ceramic Coating",
      title: "3 Year Ceramic Coating",
      description: "Includes 3 year ceramic coating and 2x maintenance washes.",
      price: 715,
      duration: "8-12 hours",
      features: [
        "All 1 year features",
        "3 year coating",
        "2x maintenance washes",
      ],
      image: serviceImages.truck[7],
    },
    {
      id: "truck-ceramic-5y",
      category: "Ceramic Coating",
      title: "5 Year Ceramic Coating",
      description: "Includes 5 year ceramic coating and 2x maintenance washes.",
      price: 999,
      duration: "8-12 hours",
      features: [
        "All 1 year features",
        "5 year coating",
        "2x maintenance washes",
      ],
      image: serviceImages.truck[7],
    },

    // Tint
    {
      id: "truck-tint",
      category: "Window Tinting",
      title: "Window Tinting",
      description: "Window tinting for trucks - choose percentage.",
      duration: "2-3 hours",
      price: 300,
      features: ["UV protection", "Privacy"],
      image: serviceImages.truck[8],
    },
  ],

  // COUPE
  coupe: [
    {
      id: "coupe-detail-interior",
      category: "Detailing",
      title: "Interior Only",
      description:
        "Luxury coupe interior deep clean: vacuum, shampoo, mats conditioned, steam-clean seats & carpets, plastics conditioned.",
      price: 150,
      duration: "2–4 hours",
      features: [
        "Vacuum & shampoo",
        "Luxury finish",
        "Mats & carpets steam cleaned",
        "Plastics dressed",
      ],
      image: serviceImages.coupe[0],
    },
    {
      id: "coupe-detail-exterior",
      category: "Detailing",
      title: "Exterior Only",
      description:
        "Premium coupe exterior: rims & tires, pre-treatment, foam wash, hand dry, sealant, tire shine, streak-free windows.",
      price: 140,
      duration: "1-2 hours",
      features: ["Pre-treatment", "Foam wash", "Hand dry & sealant"],
      image: serviceImages.coupe[1],
    },
    {
      id: "coupe-detail-full",
      category: "Detailing",
      title: "Interior + Exterior",
      description:
        "Premium coupe full detail inside & out. Includes interior detail + exterior wash, rim & wheel well cleaning, paint pre-treat, foam + contact wash, hand dry, paint sealant, rims polished, tires dressed, streak-free glass.",
      price: 200,
      duration: "3–5 hours",
      popular: true,
      features: [
        "Interior full detail",
        "Exterior premium clean",
        "Rims & wheel wells cleaned",
        "Paint pre-treatment",
        "Foam + contact wash",
        "Paint sealant",
        "Rims polished + tires dressed",
        "Streak-free windows",
      ],
      image: serviceImages.coupe[2],
    },
    {
      id: "coupe-engine",
      category: "Detailing",
      title: "Engine Bay Wash",
      description: "Engine bay degrease & dressing for coupes.",
      duration: "30-45 mins",
      price: 55,
      features: ["Degrease", "Dressing"],
      image: serviceImages.coupe[3],
    },

    // Paint Correction
    {
      id: "coupe-pc-1",
      category: "Paint Correction",
      title: "Stage 1 Paint Correction",
      description: "Removes ~50–60% of swirls.",
      duration: "5-7 hours ",
      price: 380,
      features: ["50–60% swirl removal"],
      image: serviceImages.coupe[4],
    },
    {
      id: "coupe-pc-2",
      category: "Paint Correction",
      title: "Stage 2 Paint Correction",
      description: "Removes ~60–80% of swirls.",
      duration: "5-7 hours ",
      price: 530,
      features: ["60–80% swirl removal"],
      image: serviceImages.coupe[5],
    },
    {
      id: "coupe-pc-3",
      category: "Paint Correction",
      title: "Stage 3 Paint Correction",
      description: "Removes ~80–99% of swirls.",
      duration: "5-7 hours ",
      price: 680,
      features: ["80–99% swirl removal"],
      image: serviceImages.coupe[6],
    },

    // Ceramic
    {
      id: "coupe-ceramic-1y",
      category: "Ceramic Coating",
      title: "1 Year Ceramic Coating",
      description:
        "Includes 1 step paint correction, paint prep, and 1 year ceramic coating. Includes 1x maintenance wash.",
      price: 399,
      duration: "7-9 hours",
      features: [
        "1 step paint correction",
        "Full paint prep",
        "1 year ceramic coating",
      ],
      image: serviceImages.coupe[7],
    },
    {
      id: "coupe-ceramic-3y",
      category: "Ceramic Coating",
      title: "3 Year Ceramic Coating",
      description:
        "Includes everything in 1 year + 3 year ceramic coating applied. Includes 2x maintenance washes.",
      price: 715,
      duration: "7-9 hours",
      features: [
        "All 1 year features",
        "3 year coating",
        "2x maintenance washes",
      ],
      image: serviceImages.coupe[7],
    },
    {
      id: "coupe-ceramic-5y",
      category: "Ceramic Coating",
      title: "5 Year Ceramic Coating",
      description:
        "Includes everything in 1 year + 5 year ceramic coating applied. Includes 2x maintenance washes.",
      price: 999,
      duration: "7-9 hours",
      features: [
        "All 1 year features",
        "5 year coating",
        "2x maintenance washes",
      ],
      image: serviceImages.coupe[7],
    },

    // Tint
    {
      id: "coupe-tint",
      category: "Window Tinting",
      title: "Window Tinting",
      description: "Choose tint percentage for coupe windows.",
      price: 200,
      duration: "1-2 hours",
      features: ["Custom shades", "UV protection"],
      image: serviceImages.coupe[8],
    },
  ],
};

// Add-ons Data
export const addonsData = {
  sedan: [
    {
      id: "sedan-addon-headlight",
      title: "Headlight Restoration",
      duration: "2-3 hours",
      price: 79.99,
    },
    {
      id: "sedan-addon-engine",
      title: "Engine Bay Wash",
      price: 55,
      duration: "30-40 mins",
    },
    {
      id: "sedan-addon-int-ceramic",
      title: "Interior Ceramic Coating",
      price: 299,
      duration: "2-3 hours",
    },
    {
      id: "sedan-addon-wheels",
      title: "Wheels & Calipers Coating",
      price: 99,
      duration: "1 hours",
    },
    {
      id: "sedan-addon-windows",
      title: "Windshield & Windows Coating",
      price: 145,
      duration: "1-2 hours",
    },
  ],
  suv: [
    {
      id: "suv-addon-headlight",
      title: "Headlight Restoration",
      price: 79.99,
      duration: "2-3 hours",
    },
    {
      id: "suv-addon-engine",
      title: "Engine Bay Wash",
      price: 65,
      duration: "30-40 mins",
    },
    {
      id: "suv-addon-int-ceramic",
      title: "Interior Ceramic Coating",
      price: 299,
      duration: "2-3 hours",
    },
    {
      id: "suv-addon-wheels",
      title: "Wheels & Calipers Coating",
      price: 99,
      duration: "1 hours",
    },
    {
      id: "suv-addon-windows",
      title: "Windshield & Windows Coating",
      price: 145,
      duration: "1-2 hours",
    },
  ],
  truck: [
    {
      id: "truck-addon-headlight",
      title: "Headlight Restoration",
      price: 79.99,
      duration: "2-3 hours",
    },
    {
      id: "truck-addon-engine",
      title: "Engine Bay Wash",
      price: 70,
      duration: "30-40 mins",
    },
    {
      id: "truck-addon-int-ceramic",
      title: "Interior Ceramic Coating",
      price: 299,
      duration: "2-3 hours",
    },

    {
      id: "truck-addon-wheels",
      title: "Wheels & Calipers Coating",
      price: 99,
      duration: "1 hours",
    },
    {
      id: "truck-addon-windows",
      title: "Windshield & Windows Coating",
      price: 145,
      duration: "1-2 hours",
    },
  ],
  coupe: [
    {
      id: "coupe-addon-headlight",
      title: "Headlight Restoration",
      price: 70,
      duration: "2-3 hours",
    },
    {
      id: "coupe-addon-engine",
      title: "Engine Bay Wash",
      price: 55,
      duration: "30-40 mins",
    },
    {
      id: "coupe-addon-int-ceramic",
      title: "Interior Ceramic Coating",
      price: 299,
      duration: "2-3 hours",
    },
    {
      id: "coupe-addon-wheels",
      title: "Wheels & Calipers Coating",
      price: 99,
      duration: "1 hours",
    },
    {
      id: "coupe-addon-windows",
      title: "Windshield & Windows Coating",
      price: 145,
      duration: "1-2 hours",
    },
  ],
};
