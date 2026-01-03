#!/bin/bash
echo "=============================================="
echo "🧪 BACKEND API TESTING"
echo "=============================================="
echo ""

echo "Test 1: Admin #1 Login (Restaurant 1)"
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+966500000001","password":"Admin@123"}' | jq '.'
echo ""

echo "Test 2: Customer #1 Login (Restaurant 1)"
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+966500000002","password":"Customer@123"}' | jq '.'
echo ""

echo "Test 3: Admin #2 Login (Restaurant 2)"
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+966500000010","password":"Admin2@123"}' | jq '.'
echo ""

echo "Test 4: Wrong Password (Should fail with 401)"
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+966500000001","password":"WrongPassword"}' | jq '.'
echo ""

echo "Test 5: Non-existent Phone (Should fail with 401)"
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+966599999999","password":"test"}' | jq '.'

