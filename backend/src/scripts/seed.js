/**
 * ============================================
 * DATABASE SEED SCRIPT
 * ============================================
 * 
 * Educational Overview:
 * ---------------------
 * This script populates the database with test data for development.
 * It creates:
 * - 1 Restaurant (tenant)
 * - 1 Admin user (restaurant owner)
 * - 1 Customer user (meal subscriber)
 * 
 * Why Seed Scripts:
 * -----------------
 * 1. Consistent test environment across developers
 * 2. Quick setup without manual data entry
 * 3. Repeatable - can reset database to known state
 * 4. Educational - shows valid data structure examples
 * 
 * Safety Features:
 * ----------------
 * - Checks if data already exists (won't duplicate)
 * - Can be run multiple times safely (idempotent)
 * - Provides clear feedback about what was created
 * 
 * Usage:
 * ------
 * npm run seed
 * 
 * Database State After:
 * ---------------------
 * Restaurant:
 * - Name: مطعم الصحة
 * - Logo: (none, null)
 * 
 * Admin User:
 * - Phone: +966500000001
 * - Password: Admin@123
 * - Role: admin
 * 
 * Customer User:
 * - Phone: +966500000002
 * - Password: Customer@123
 * - Role: customer
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../models/restaurant.model');
const User = require('../models/user.model');
const connectDB = require('../config/db');

/**
 * ============================================
 * SEED DATA CONFIGURATION
 * ============================================
 * 
 * Centralized test data configuration.
 * Modify these values to change seed data.
 */
const SEED_DATA = {
  restaurant: {
    name: 'مطعم الصحة',
    logoUrl: null // Will be added later when image upload is implemented
  },
  admin: {
    name: 'أحمد المدير',
    phone: '+966500000001',
    password: 'Admin@123', // Will be hashed automatically by User model
    email: 'admin@healthymeal.com',
    role: 'admin'
  },
  customer: {
    name: 'فاطمة العميلة',
    phone: '+966500000002',
    password: 'Customer@123', // Will be hashed automatically by User model
    email: 'customer@healthymeal.com',
    role: 'customer'
  }
};

/**
 * ============================================
 * SEED FUNCTION
 * ============================================
 * 
 * Main function that orchestrates database seeding.
 * 
 * Process:
 * --------
 * 1. Connect to MongoDB
 * 2. Check if restaurant already exists (prevent duplicates)
 * 3. Create restaurant if needed
 * 4. Create admin user if needed
 * 5. Create customer user if needed
 * 6. Display summary
 * 7. Close connection
 * 
 * Educational Notes:
 * ------------------
 * - Uses async/await for clean async code
 * - Uses findOne() to check existence before creating
 * - Uses try/catch for error handling
 * - Provides detailed console output for learning
 */
const seed = async () => {
  try {
    console.log('🌱 Starting database seed...\n');
    
    // ===========================
    // Step 1: Connect to Database
    // ===========================
    console.log('📡 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');
    
    // ===========================
    // Step 2: Seed Restaurant
    // ===========================
    console.log('🏪 Checking restaurant...');
    
    /**
     * Check if restaurant already exists
     * ----------------------------------
     * findOne() returns first matching document or null.
     * We search by name to avoid creating duplicate test restaurant.
     */
    let restaurant = await Restaurant.findOne({ name: SEED_DATA.restaurant.name });
    
    if (restaurant) {
      console.log(`   ℹ️  Restaurant "${restaurant.name}" already exists (ID: ${restaurant._id})`);
    } else {
      /**
       * Create Restaurant
       * -----------------
       * new Restaurant() creates model instance
       * .save() persists to database
       * 
       * Mongoose automatically:
       * - Validates against schema
       * - Sets createdAt timestamp
       * - Generates _id
       */
      restaurant = new Restaurant(SEED_DATA.restaurant);
      await restaurant.save();
      console.log(`   ✅ Created restaurant: "${restaurant.name}" (ID: ${restaurant._id})`);
    }
    
    console.log('');
    
    // ===========================
    // Step 3: Seed Admin User
    // ===========================
    console.log('👤 Checking admin user...');
    
    /**
     * Check if admin user already exists
     * -----------------------------------
     * Search by phone AND restaurantId (compound unique index).
     * This ensures we don't create duplicate admin for this restaurant.
     */
    let adminUser = await User.findOne({
      phone: SEED_DATA.admin.phone,
      restaurantId: restaurant._id
    });
    
    if (adminUser) {
      console.log(`   ℹ️  Admin user "${adminUser.name}" already exists (Phone: ${adminUser.phone})`);
    } else {
      /**
       * Create Admin User
       * -----------------
       * Important: We pass plain password in passwordHash field.
       * User model's pre-save hook will automatically hash it with bcrypt.
       * 
       * See user.model.js line ~180 for hashing logic.
       */
      adminUser = new User({
        restaurantId: restaurant._id,
        name: SEED_DATA.admin.name,
        phone: SEED_DATA.admin.phone,
        email: SEED_DATA.admin.email,
        passwordHash: SEED_DATA.admin.password, // Will be hashed by pre-save hook
        role: SEED_DATA.admin.role
      });
      
      await adminUser.save();
      console.log(`   ✅ Created admin: "${adminUser.name}" (Phone: ${adminUser.phone})`);
      console.log(`      🔑 Login with: ${SEED_DATA.admin.phone} / ${SEED_DATA.admin.password}`);
    }
    
    console.log('');
    
    // ===========================
    // Step 4: Seed Customer User
    // ===========================
    console.log('👤 Checking customer user...');
    
    let customerUser = await User.findOne({
      phone: SEED_DATA.customer.phone,
      restaurantId: restaurant._id
    });
    
    if (customerUser) {
      console.log(`   ℹ️  Customer user "${customerUser.name}" already exists (Phone: ${customerUser.phone})`);
    } else {
      customerUser = new User({
        restaurantId: restaurant._id,
        name: SEED_DATA.customer.name,
        phone: SEED_DATA.customer.phone,
        email: SEED_DATA.customer.email,
        passwordHash: SEED_DATA.customer.password, // Will be hashed by pre-save hook
        role: SEED_DATA.customer.role
      });
      
      await customerUser.save();
      console.log(`   ✅ Created customer: "${customerUser.name}" (Phone: ${customerUser.phone})`);
      console.log(`      🔑 Login with: ${SEED_DATA.customer.phone} / ${SEED_DATA.customer.password}`);
    }
    
    // ===========================
    // Step 5: Display Summary
    // ===========================
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Database Seed Complete!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   Restaurant: ${restaurant.name}`);
    console.log(`   Restaurant ID: ${restaurant._id}`);
    console.log('\n👥 Test Users:');
    console.log('\n   Admin Login:');
    console.log(`   Phone: ${SEED_DATA.admin.phone}`);
    console.log(`   Password: ${SEED_DATA.admin.password}`);
    console.log('\n   Customer Login:');
    console.log(`   Phone: ${SEED_DATA.customer.phone}`);
    console.log(`   Password: ${SEED_DATA.customer.password}`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Start backend: npm run dev');
    console.log('   2. Test login endpoint: POST http://localhost:5000/api/auth/login');
    console.log('   3. Use credentials above to authenticate');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    /**
     * Error Handling
     * --------------
     * Log full error for debugging.
     * Common errors:
     * - MongoDB connection failed (check MONGODB_URI)
     * - Validation error (data doesn't match schema)
     * - Duplicate key error (unique constraint violation)
     */
    console.error('❌ Seed failed:', error);
    
    // Provide helpful error messages for common issues
    if (error.name === 'ValidationError') {
      console.error('\n💡 Validation Error: Check that seed data matches schema requirements');
    } else if (error.code === 11000) {
      console.error('\n💡 Duplicate Key Error: Data already exists in database');
    } else if (error.name === 'MongoNetworkError') {
      console.error('\n💡 MongoDB Connection Error: Check MONGODB_URI in .env file');
    }
    
    process.exit(1);
  } finally {
    /**
     * Cleanup
     * -------
     * Always close MongoDB connection, even if error occurs.
     * This allows the script to exit gracefully.
     */
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
    process.exit(0);
  }
};

/**
 * ============================================
 * EXECUTE SEED
 * ============================================
 * 
 * Run seed function when script is executed directly.
 * 
 * Usage:
 * ------
 * node src/scripts/seed.js
 * OR
 * npm run seed (defined in package.json)
 */
seed();

/**
 * ============================================
 * EDUCATIONAL NOTES
 * ============================================
 * 
 * Phone Number Uniqueness (MVP Simplification):
 * ----------------------------------------------
 * Phone numbers are GLOBALLY UNIQUE across the entire platform.
 * You CANNOT reuse the same phone number for different restaurants.
 * 
 * This seed creates ONE restaurant with TWO users:
 * - Admin: +966500000001
 * - Customer: +966500000002
 * 
 * Multi-Tenancy with Multiple Restaurants:
 * -----------------------------------------
 * To test multi-tenancy, create additional restaurants with DIFFERENT phone numbers:
 * 
 * Restaurant A: مطعم الصحة
 * - Admin: +966500000001 ✅ (Unique)
 * - Customer: +966500000002 ✅ (Unique)
 * 
 * Restaurant B: مطبخ الحياة
 * - Admin: +966500000003 ✅ (Unique - MUST use different phone)
 * - Customer: +966500000004 ✅ (Unique - MUST use different phone)
 * - Admin: +966500000001 ❌ (REJECTED - phone already exists in Restaurant A)
 * 
 * Why This Design:
 * ----------------
 * - Simplifies login: just { phone, password }, no restaurantSlug needed
 * - Prevents ambiguity: one phone = one user
 * - Multi-tenancy still enforced via restaurantId on data operations
 * 
 * Password Security:
 * ------------------
 * Plain passwords are only in this seed script (for testing).
 * User model pre-save hook hashes them before storing.
 * 
 * You can verify hashing worked by checking database:
 * db.users.findOne({ phone: "+966500000001" })
 * 
 * You'll see passwordHash looks like:
 * "$2a$12$K1XzE.../..." (60 characters, bcrypt hash)
 * 
 * JWT Testing:
 * ------------
 * After seeding, test login:
 * 
 * curl -X POST http://localhost:5000/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"phone":"+966500000001","password":"Admin@123"}'
 * 
 * Should return:
 * {
 *   "success": true,
 *   "data": {
 *     "accessToken": "eyJhbGc...",
 *     "user": { ... },
 *     "restaurant": { ... }
 *   }
 * }
 */
