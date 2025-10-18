import { drizzle } from "drizzle-orm/mysql2";
import { products } from "../drizzle/schema";
import { v4 as uuidv4 } from "uuid";

async function seedProducts() {
  const db = drizzle(process.env.DATABASE_URL!);

  const productsData = [
    {
      id: uuidv4(),
      name: "Jordan 1 Retro",
      description: "Zapatillas de baloncesto clásicas con diseño retro. Disponibles en múltiples colores.",
      price: 10000, // €100
      image: "/products/jordan-red.jpg",
      colors: ["Rojo", "Azul", "Marrón", "Verde"],
      category: "Zapatillas",
      inStock: true,
      comingSoon: false,
    },
    {
      id: uuidv4(),
      name: "AirPods Pro 2",
      description: "Auriculares inalámbricos premium con cancelación de ruido activa y sonido envolvente.",
      price: 3500, // €35
      image: "/products/airpods-pro.jpg",
      colors: null,
      category: "Audio",
      inStock: true,
      comingSoon: false,
    },
    {
      id: uuidv4(),
      name: "Portátil",
      description: "Computadora portátil de alto rendimiento para profesionales y creadores.",
      price: 56000, // €560
      image: "/products/laptop.jpg",
      colors: null,
      category: "Computadoras",
      inStock: true,
      comingSoon: false,
    },
    {
      id: uuidv4(),
      name: "Smartwatch Pro",
      description: "Reloj inteligente con monitoreo de salud avanzado y conectividad 5G.",
      price: 29900, // €299
      image: "/products/jordan-red.jpg",
      colors: null,
      category: "Accesorios",
      inStock: false,
      comingSoon: true,
    },
    {
      id: uuidv4(),
      name: "Cámara Digital",
      description: "Cámara profesional con sensor de 48MP y grabación en 8K.",
      price: 89900, // €899
      image: "/products/laptop.jpg",
      colors: null,
      category: "Fotografía",
      inStock: false,
      comingSoon: true,
    },
    {
      id: uuidv4(),
      name: "Tablet Ultra",
      description: "Tablet de 12 pulgadas con pantalla OLED y procesador de última generación.",
      price: 79900, // €799
      image: "/products/airpods-pro.jpg",
      colors: null,
      category: "Tablets",
      inStock: false,
      comingSoon: true,
    },
  ];

  try {
    for (const product of productsData) {
      await db.insert(products).values(product);
    }
    console.log("✓ Products seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();

