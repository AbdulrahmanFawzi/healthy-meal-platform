/**
 * Create Super Admin User
 * 
 * Run this script to create a super_admin user for testing.
 * Usage: node src/scripts/create-super-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const connectDB = require('../config/db');

const SUPER_ADMIN_DATA = {
  name: 'Super Admin',
  phone: '+966500000000', // Change this if needed
  passwordHash: 'superadmin123', // Will be hashed by pre-save hook
  role: 'super_admin',
  restaurantId: null
};

async function createSuperAdmin() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ 
      role: 'super_admin',
      phone: SUPER_ADMIN_DATA.phone 
    });

    if (existingSuperAdmin) {
      console.log('⚠️  Super admin already exists with this phone number');
      console.log('Phone:', existingSuperAdmin.phone);
      console.log('Name:', existingSuperAdmin.name);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await User.create(SUPER_ADMIN_DATA);
    
    console.log('\n🎉 Super Admin created successfully!\n');
    console.log('📋 Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Phone:', superAdmin.phone);
    console.log('Password: superadmin123');
    console.log('Role:', superAdmin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ You can now login at http://localhost:4200/login');
    console.log('✅ Then navigate to /platform/restaurants to create restaurants\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    process.exit(1);
  }
}

createSuperAdmin();
