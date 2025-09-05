// src/data/servicesData.js
import { serviceImages } from "../assets/services";

/**
 * Updated services & addons data.
 * Prices: keep the values you provided where present; otherwise use sensible defaults.
 *
 * Structure:
 * - Detailing: Interior Only, Exterior Only, Interior + Exterior, Engine Bay Wash
 * - Paint Correction: Stage 1 / Stage 2 / Stage 3 (pricing as specified)
 * - Ceramic Coating
 * - Window Tinting
 *
 * Addons: Headlight Restoration, Engine Bay Wash (kept as add-ons too)
 */

export const servicesData = {
  sedan: [
    // DETAILING
    {
      id: "sedan-detail-interior",
      category: "Detailing",
      title: "Interior Only",
      description:
        "Factory reset interior: vacuum, garbage removal, mats restored & conditioned, carpets & seats steam cleaned + shampooed, plastics conditioned, streak-free glass.",
      price: 150,
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
      description: "Complete detail inside & out (interior + exterior).",
      price: 200,
      popular: true,
      features: [
        "Interior full detail",
        "Exterior full detail",
        "Paint sealant / ceramic spray",
      ],
      image: serviceImages.sedan[2],
    },
    {
      id: "sedan-engine",
      category: "Detailing",
      title: "Engine Bay Wash",
      description: "Degrease & detail engine bay (safe for electronics).",
      price: 80,
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
      price: 399,
      features: ["50–60% swirl removal", "Restores gloss"],
      image: serviceImages.sedan[4],
    },
    {
      id: "sedan-pc-2",
      category: "Paint Correction",
      title: "Stage 2 Paint Correction",
      description: "Removes ~60–80% of swirls (Stage 1 + extra correction).",
      price: 399 + 150,
      features: ["60–80% swirl removal", "Higher gloss finish"],
      image: serviceImages.sedan[5],
    },
    {
      id: "sedan-pc-3",
      category: "Paint Correction",
      title: "Stage 3 Paint Correction",
      description: "Removes ~80–99% of swirls for near-showroom finish.",
      price: 399 + 300,
      features: ["80–99% swirl removal", "Showroom finish"],
      image: serviceImages.sedan[6],
    },

    // CERAMIC
    {
      id: "sedan-ceramic",
      category: "Ceramic Coating",
      title: "Ceramic Coating",
      description:
        "Durable ceramic protection. Can be applied with or without paint correction.",
      price: 800,
      features: [
        "Long-lasting protection",
        "Hydrophobic effect",
        "Enhanced gloss",
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
      features: ["Custom tint shades", "UV protection", "Professional install"],
      image: serviceImages.sedan[8],
    },
  ],

  suv: [
    // keep the same structure; use prices you previously had where present
    {
      id: "suv-detail-interior",
      category: "Detailing",
      title: "Interior Only",
      description:
        "Deep clean of SUV interior: vacuum, shampoo, mats conditioned, steam clean seats & carpets, plastics conditioned, streak-free glass.",
      price: 165,
      features: [
        "Vacuum & shampoo",
        "Mats restored & conditioned",
        "Carpets & seats steam cleaned + shampooed",
        "Plastics conditioned",
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
      features: [
        "Rims & tires deep cleaned",
        "Pre-treatment & foam wash",
        "Tire shine",
      ],
      image: serviceImages.suv[1],
    },
    {
      id: "suv-detail-full",
      category: "Detailing",
      title: "Interior + Exterior",
      description: "Full SUV detail inside & out.",
      price: 225,
      popular: true,
      features: [
        "Interior full detail",
        "Exterior full detail",
        "Paint sealant",
      ],
      image: serviceImages.suv[2],
    },
    {
      id: "suv-engine",
      category: "Detailing",
      title: "Engine Bay Wash",
      description: "Engine bay degrease & dressing.",
      price: 90,
      features: ["Degrease", "Plastics dressed"],
      image: serviceImages.suv[3],
    },

    // Paint correction
    {
      id: "suv-pc-1",
      category: "Paint Correction",
      title: "Stage 1 Paint Correction",
      description: "Removes ~50–60% of swirls.",
      price: 399,
      features: ["50–60% swirl removal", "Restores gloss"],
      image: serviceImages.suv[4],
    },
    {
      id: "suv-pc-2",
      category: "Paint Correction",
      title: "Stage 2 Paint Correction",
      description: "Removes ~60–80% of swirls.",
      price: 399 + 150,
      features: ["60–80% swirl removal"],
      image: serviceImages.suv[5],
    },
    {
      id: "suv-pc-3",
      category: "Paint Correction",
      title: "Stage 3 Paint Correction",
      description: "Removes ~80–99% of swirls.",
      price: 399 + 300,
      features: ["80–99% swirl removal"],
      image: serviceImages.suv[6],
    },

    // Ceramic
    {
      id: "suv-ceramic",
      category: "Ceramic Coating",
      title: "Ceramic Coating",
      description: "Durable ceramic protection - with or without correction.",
      price: 800,
      features: ["Hydrophobic", "Long-lasting"],
      image: serviceImages.suv[7],
    },

    // Tint
    {
      id: "suv-tint",
      category: "Window Tinting",
      title: "Window Tinting",
      description: "Choose tint percentage for your SUV.",
      price: 300,
      features: ["Custom shades", "UV protection"],
      image: serviceImages.suv[8],
    },
  ],

  truck: [
    {
      id: "truck-detail-interior",
      category: "Detailing",
      title: "Interior Only",
      description:
        "Heavy-duty truck interior detail: vacuum, shampoo, mats conditioned, steam clean carpets & seats, plastics conditioned.",
      price: 170,
      features: ["Vacuum & shampoo", "Heavy-duty cleaning", "Plastics dressed"],
      image: serviceImages.truck[0],
    },
    {
      id: "truck-detail-exterior",
      category: "Detailing",
      title: "Exterior Only",
      description:
        "Truck exterior deep clean: rims, tires, pre-treatment, foam wash, hand dry, sealant, tire shine.",
      price: 170,
      features: ["Rims & tires deep cleaned", "Pre-treatment & foam wash"],
      image: serviceImages.truck[1],
    },
    {
      id: "truck-detail-full",
      category: "Detailing",
      title: "Interior + Exterior",
      description: "Full truck detail inside & out.",
      price: 250,
      popular: true,
      features: ["Interior detail", "Exterior detail", "Paint protection"],
      image: serviceImages.truck[2],
    },
    {
      id: "truck-engine",
      category: "Detailing",
      title: "Engine Bay Wash",
      description: "Engine bay degrease & dressing.",
      price: 100,
      features: ["Degrease", "Plastics dressed"],
      image: serviceImages.truck[3],
    },

    // Paint Correction
    {
      id: "truck-pc-1",
      category: "Paint Correction",
      title: "Stage 1 Paint Correction",
      description: "Removes ~50–60% of swirls.",
      price: 399,
      features: ["50–60% swirl removal"],
      image: serviceImages.truck[4],
    },
    {
      id: "truck-pc-2",
      category: "Paint Correction",
      title: "Stage 2 Paint Correction",
      description: "Removes ~60–80% of swirls.",
      price: 399 + 150,
      features: ["60–80% swirl removal"],
      image: serviceImages.truck[5],
    },
    {
      id: "truck-pc-3",
      category: "Paint Correction",
      title: "Stage 3 Paint Correction",
      description: "Removes ~80–99% of swirls.",
      price: 399 + 300,
      features: ["80–99% swirl removal"],
      image: serviceImages.truck[6],
    },

    // Ceramic
    {
      id: "truck-ceramic",
      category: "Ceramic Coating",
      title: "Ceramic Coating",
      description: "Ceramic protection for trucks (with/without correction).",
      price: 800,
      features: ["Hydrophobic", "Durable gloss"],
      image: serviceImages.truck[7],
    },

    // Tint
    {
      id: "truck-tint",
      category: "Window Tinting",
      title: "Window Tinting",
      description: "Window tinting for trucks - choose percentage.",
      price: 300,
      features: ["UV protection", "Privacy"],
      image: serviceImages.truck[8],
    },
  ],

  coupe: [
    {
      id: "coupe-detail-interior",
      category: "Detailing",
      title: "Interior Only",
      description:
        "Luxury coupe interior deep clean: vacuum, shampoo, mats conditioned, steam-clean seats & carpets, plastics conditioned.",
      price: 140,
      features: ["Vacuum & shampoo", "Luxury finish", "Plastics dressed"],
      image: serviceImages.coupe[0],
    },
    {
      id: "coupe-detail-exterior",
      category: "Detailing",
      title: "Exterior Only",
      description:
        "Premium coupe exterior: rims & tires, pre-treatment, foam wash, hand dry, sealant, tire shine, streak-free windows.",
      price: 140,
      features: ["Pre-treatment", "Foam wash", "Hand dry & sealant"],
      image: serviceImages.coupe[1],
    },
    {
      id: "coupe-detail-full",
      category: "Detailing",
      title: "Interior + Exterior",
      description: "Premium coupe full detail inside & out.",
      price: 190,
      popular: true,
      features: ["Interior & exterior premium detail", "Sealant/ceramic spray"],
      image: serviceImages.coupe[2],
    },
    {
      id: "coupe-engine",
      category: "Detailing",
      title: "Engine Bay Wash",
      description: "Engine bay degrease & dressing for coupes.",
      price: 75,
      features: ["Degrease", "Dressing"],
      image: serviceImages.coupe[3],
    },

    // Paint correction (note: coupe base stage1 price was 380 in earlier data)
    {
      id: "coupe-pc-1",
      category: "Paint Correction",
      title: "Stage 1 Paint Correction",
      description: "Removes ~50–60% of swirls.",
      price: 380,
      features: ["50–60% swirl removal"],
      image: serviceImages.coupe[4],
    },
    {
      id: "coupe-pc-2",
      category: "Paint Correction",
      title: "Stage 2 Paint Correction",
      description: "Removes ~60–80% of swirls.",
      price: 380 + 150,
      features: ["60–80% swirl removal"],
      image: serviceImages.coupe[5],
    },
    {
      id: "coupe-pc-3",
      category: "Paint Correction",
      title: "Stage 3 Paint Correction",
      description: "Removes ~80–99% of swirls.",
      price: 380 + 300,
      features: ["80–99% swirl removal"],
      image: serviceImages.coupe[6],
    },

    // Ceramic
    {
      id: "coupe-ceramic",
      category: "Ceramic Coating",
      title: "Ceramic Coating",
      description: "Premium ceramic coating (with/without correction).",
      price: 750,
      features: ["Hydrophobic", "Showroom gloss"],
      image: serviceImages.coupe[7],
    },

    // Tint
    {
      id: "coupe-tint",
      category: "Window Tinting",
      title: "Window Tinting",
      description: "Choose tint percentage for coupe windows.",
      price: 200,
      features: ["Custom shades", "UV protection"],
      image: serviceImages.coupe[8],
    },
  ],
};

export const addonsData = {
  sedan: [
    {
      id: "sedan-addon-headlight",
      title: "Headlight Restoration",
      price: 79.99,
    },
    { id: "sedan-addon-engine", title: "Engine Bay Wash", price: 80 },
  ],
  suv: [
    { id: "suv-addon-headlight", title: "Headlight Restoration", price: 79.99 },
    { id: "suv-addon-engine", title: "Engine Bay Wash", price: 90 },
  ],
  truck: [
    {
      id: "truck-addon-headlight",
      title: "Headlight Restoration",
      price: 79.99,
    },
    { id: "truck-addon-engine", title: "Engine Bay Wash", price: 100 },
  ],
  coupe: [
    { id: "coupe-addon-headlight", title: "Headlight Restoration", price: 70 },
    { id: "coupe-addon-engine", title: "Engine Bay Wash", price: 75 },
  ],
};
