import { serviceImages } from "../assets/services";

export const servicesData = {
  sedan: [
    {
      title: "Interior Only",
      description: "Deep clean of all interior surfaces.",
      price: 150,
      features: ["Vacuum & shampoo", "Dashboard detail", "Windows"],
      image: serviceImages.sedan[0],
    },
    {
      title: "Interior + Exterior",
      description: "Complete detail inside & out.",
      price: 200,
      features: ["Interior detail", "Full exterior wash", "Wax protection"],
      popular: true,
      image: serviceImages.sedan[1],
    },
    {
      title: "Stage 1 Paint Correction",
      description: "Machine polish & correction.",
      price: 399,
      features: ["Removes light swirls", "Restores gloss"],
      image: serviceImages.sedan[2],
    },
  ],
  suv: [
    {
      title: "Interior Only",
      description: "Deep clean of SUV interior.",
      price: 165,
      features: ["Vacuum & shampoo", "Dashboard detail", "Windows"],
      image: serviceImages.suv[0],
    },
    {
      title: "Interior + Exterior",
      description: "Full SUV inside & out.",
      price: 225,
      features: ["Deep clean interior", "Full exterior wash", "Wax protection"],
      popular: true,
      image: serviceImages.suv[1],
    },
    {
      title: "Stage 1 Paint Correction",
      description: "Machine polish for SUV.",
      price: 399,
      features: ["Removes light swirls", "Restores gloss"],
      image: serviceImages.suv[2],
    },
  ],
  truck: [
    {
      title: "Interior Only",
      description: "Heavy-duty truck interior detail.",
      price: 170,
      features: ["Vacuum & shampoo", "Dashboard detail", "Windows"],
      image: serviceImages.truck[0],
    },
    {
      title: "Interior + Exterior",
      description: "Full truck interior & exterior.",
      price: 250,
      features: ["Deep clean interior", "Full exterior wash", "Wax protection"],
      popular: true,
      image: serviceImages.truck[1],
    },
    {
      title: "Stage 1 Paint Correction",
      description: "Machine polish for trucks.",
      price: 399,
      features: ["Removes light swirls", "Restores gloss"],
      image: serviceImages.truck[2],
    },
  ],
  coupe: [
    {
      title: "Interior Only",
      description: "Luxury coupe interior deep clean.",
      price: 140,
      features: ["Vacuum & shampoo", "Dashboard detail", "Windows"],
      image: serviceImages.coupe[0],
    },
    {
      title: "Interior + Exterior",
      description: "Premium coupe full detail.",
      price: 190,
      features: ["Interior detail", "Hand wash", "Wax protection"],
      popular: true,
      image: serviceImages.coupe[1],
    },
    {
      title: "Stage 1 Paint Correction",
      description: "Polish & paint correction for coupes.",
      price: 380,
      features: ["Removes light swirls", "Restores gloss"],
      image: serviceImages.coupe[2],
    },
  ],
};

export const addonsData = {
  sedan: [
    { title: "Extra Paint Correction Stage", price: 150 },
    { title: "Ceramic Coating", price: 800 },
    { title: "Window Tinting", price: 249 },
    { title: "Headlight Restoration", price: 79.99 },
  ],
  suv: [
    { title: "Extra Paint Correction Stage", price: 150 },
    { title: "Ceramic Coating", price: 800 },
    { title: "Window Tinting", price: 300 },
    { title: "Headlight Restoration", price: 79.99 },
  ],
  truck: [
    { title: "Extra Paint Correction Stage", price: 150 },
    { title: "Ceramic Coating", price: 800 },
    { title: "Headlight Restoration", price: 79.99 },
  ],
  coupe: [
    { title: "Extra Paint Correction Stage", price: 120 },
    { title: "Ceramic Coating", price: 750 },
    { title: "Window Tinting", price: 200 },
    { title: "Headlight Restoration", price: 70 },
  ],
};
