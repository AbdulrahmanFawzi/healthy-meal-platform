/**
 * ============================================
 * SEED RESTAURANT #2 - DEV TESTING ONLY
 * ============================================
 * 
 * Purpose:
 * --------
 * Creates a second restaurant with admin user for multi-tenant testing.
 * This verifies that:
 * - Multiple restaurants can coexist
 * - Each restaurant has separate admin
 * - Phone numbers are globally unique (different phones required)
 * - JWT includes correct restaurantId for each user
 * 
 * Usage:
 * ------
 * npm run seed:restaurant2
 * 
 * Test Data Created:
 * ------------------
 * Restaurant #2:
 * - Name: مطعم التجربة 2
 * - Admin Phone: +966500000010
 * - Admin Password: Admin2@123
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../models/restaurant.model');
const User = require('../models/user.model');
const connectDB = require('../config/db');

const RESTAURANT_2_DATA = {
  restaurant: {
    name: 'مطعم التجربة 2',
    logoUrl: null
  },
  admin: {
    name: 'سارة المديرة',
    phone: '+966500000010',
    password: 'Admin2@123',
    email: 'admin2@test.com',
    role: 'admin'
  }
};

const seedRestaurant2 = async () => {
  try {
    console.log('🌱 Seeding Restaurant #2 (Test Data)...\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');
    
    // Check if Restaurant #2 already exists
    console.log('🏪 Checking Restaurant #2...');
    let restaurant = await Restaurant.findOne({ name: RESTAURANT_2_DATA.restaurant.name });
    
    if (restaurant) {
      console.log(`   ℹ️  Restaurant "${restaurant.name}" already exists`);
      console.log(`   📍 Restaurant ID: ${restaurant._id}\n`);
    } else {
      restaurant = new Restaurant(RESTAURANT_2_DATA.restaurant);
      await restaurant.save();
      console.log(`   ✅ Created: "${restaurant.name}"`);
      console.log(`   📍 Restaurant ID: ${restaurant._id}\n`);
    }
    
    // Check if Admin #2 already exists
    console.log('👤 Checking Admin #2...');
    let admin = await User.findOne({ phone: RESTAURANT_2_DATA.admin.phone });
    
    if (admin) {
      console.log(`   ℹ️  Admin "${admin.name}" already exists`);
      console.log(`   📞 Phone: ${admin.phone}`);
      console.log(`   📍 User ID: ${admin._id}\n`);
    } else {
      admin = new User({
        restaurantId: restaurant._id,
        name: RESTAURANT_2_DATA.admin.name,
        phone: RESTAURANT_2_DATA.admin.phone,
        email: RESTAURANT_2_DATA.admin.email,
        passwordHash: RESTAURANT_2_DATA.admin.password,
        role: RESTAURANT_2_DATA.admin.role
      });
      
      await admin.save();
      console.log(`   ✅ Created: "${admin.name}"`);
      console.log(`   📞 Phone: ${admin.phone}`);
      console.log(`   🔑 Password: ${RESTAURANT_2_DATA.admin.password}`);
      console.log(`   📍 User ID: ${admin._id}\n`);
    }
    
    // Summary
    console.log('='.repeat(60));
    console.log('🎉 Restaurant #2 Seed Complete!');
    console.log('='.repeat(60));
    console.log('\n📊 Created Data:');
    console.log(`   Restaurant: ${restaurant.name}`);
    console.log(`   Restaurant ID: ${restaurant._id}`);
    console.log('\n👤 Admin Login:');
    console.log(`   Phone: ${RESTAURANT_2_DATA.admin.phone}`);
    console.log(`   Password: ${RESTAURANT_2_DATA.admin.password}`);
    console.log('\n💡 Test Multi-Tenancy:');
    console.log('   - Login with Admin #1 (+966500000001)');
    console.log('   - Login with Admin #2 (+966500000010)');
    console.log('   - Verify each JWT has different restaurantId');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    
    if (error.code === 11000) {
      console.error('\n💡 Duplicate Key Error: Phone number already exists');
      console.error('   This confirms phone global uniqueness is working!');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    process.exit(0);
  }
};

seedRestaurant2();
