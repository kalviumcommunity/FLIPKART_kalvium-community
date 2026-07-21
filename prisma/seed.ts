import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const products = [
  {
    name: 'boAt Rockerz 450 Bluetooth Headphone',
    description: 'Wireless on-ear headphones with up to 15 hours of playback, padded ear cushions, and HD sound drivers.',
    price: 1299,
    originalPrice: 3490,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    rating: 4.2,
    reviewCount: 184213,
    stock: 42,
    inStock: true
  },
  {
    name: 'Samsung Galaxy M14 5G (Smoky Teal, 128GB)',
    description: '6000mAh battery, 50MP triple camera, 5000nits display, Exynos 1330 processor.',
    price: 12990,
    originalPrice: 17990,
    category: 'Mobiles',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
    rating: 4.3,
    reviewCount: 89345,
    stock: 0,
    inStock: false
  },
  {
    name: 'Fastrack Analog Watch for Men',
    description: 'Stainless steel strap, water resistant up to 30m, 2-year warranty.',
    price: 895,
    originalPrice: 1995,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500',
    rating: 4.0,
    reviewCount: 22190,
    stock: 15,
    inStock: true
  },
  {
    name: 'Prestige Electric Kettle 1.5L',
    description: 'Stainless steel body, auto shut-off, cool-touch handle.',
    price: 799,
    originalPrice: 1450,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1594213392477-a691b53a4231?w=500',
    rating: 4.1,
    reviewCount: 51023,
    stock: 8,
    inStock: true
  },
  {
    name: 'HP Pavilion 15 Laptop (Ryzen 5, 16GB, 512GB SSD)',
    description: 'FHD display, backlit keyboard, Windows 11, 1 year onsite warranty.',
    price: 54990,
    originalPrice: 72990,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
    rating: 4.4,
    reviewCount: 9876,
    stock: 0,
    inStock: false
  },
  {
    name: 'Nike Revolution 6 Running Shoes',
    description: 'Lightweight foam midsole, breathable mesh upper, rubber outsole.',
    price: 2249,
    originalPrice: 3495,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    rating: 4.3,
    reviewCount: 34521,
    stock: 25,
    inStock: true
  }
];

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@flipkart.test' },
    update: {},
    create: {
      name: 'Rahul Sharma',
      email: 'demo@flipkart.test',
      password: passwordHash,
      role: 'CUSTOMER'
    }
  });

  await prisma.user.upsert({
    where: { email: 'admin@flipkart.test' },
    update: {},
    create: {
      name: 'Priya Nair',
      email: 'admin@flipkart.test',
      password: passwordHash,
      role: 'ADMIN'
    }
  });

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.name.slice(0, 20) },
      update: {},
      create: { id: p.name.slice(0, 20), ...p }
    });
  }

  console.log('Seed complete. Demo login: demo@flipkart.test / password123');
  console.log('Admin login: admin@flipkart.test / password123');
  void user;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
