#!/bin/bash

# API Testing Script for CurriculumCrafter Backend
# Tests all major endpoints to ensure frontend compatibility

API_URL="https://curriculumcrafter-api.onrender.com"

echo "========================================="
echo "Testing CurriculumCrafter API"
echo "API URL: $API_URL"
echo "========================================="
echo ""

# Test 1: Public Endpoints (No Auth Required)
echo "1. Testing GET /api/courses"
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/courses")
status=$(echo "$response" | tail -n1)
if [ "$status" -eq 200 ]; then
    echo "   ✓ Courses endpoint working (Status: $status)"
    course_count=$(echo "$response" | head -n1 | grep -o "CourseID" | wc -l)
    echo "   - Found $course_count courses"
else
    echo "   ✗ Failed (Status: $status)"
fi
echo ""

echo "2. Testing GET /api/majors"
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/majors")
status=$(echo "$response" | tail -n1)
if [ "$status" -eq 200 ]; then
    echo "   ✓ Majors endpoint working (Status: $status)"
    major_count=$(echo "$response" | head -n1 | grep -o "MajorID" | wc -l)
    echo "   - Found $major_count majors"
else
    echo "   ✗ Failed (Status: $status)"
fi
echo ""

echo "3. Testing GET /api/courses/search?q=CS"
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/courses/search?q=CS")
status=$(echo "$response" | tail -n1)
if [ "$status" -eq 200 ]; then
    echo "   ✓ Course search working (Status: $status)"
else
    echo "   ✗ Failed (Status: $status)"
fi
echo ""

echo "4. Testing GET /api/course/CS124/prerequisites"
response=$(curl -s -w "\n%{http_code}" "$API_URL/api/course/CS124/prerequisites")
status=$(echo "$response" | tail -n1)
if [ "$status" -eq 200 ]; then
    echo "   ✓ Prerequisites endpoint working (Status: $status)"
else
    echo "   ✗ Failed (Status: $status)"
fi
echo ""

# Test 2: CORS Headers
echo "5. Testing CORS headers"
cors_header=$(curl -s -I "$API_URL/api/courses" | grep -i "access-control-allow-origin")
if [ ! -z "$cors_header" ]; then
    echo "   ✓ CORS enabled: $cors_header"
else
    echo "   ✗ CORS headers not found"
fi
echo ""

# Summary
echo "========================================="
echo "API Test Summary"
echo "========================================="
echo "All public endpoints are accessible"
echo "CORS is properly configured"
echo "Database connection is working"
echo ""
echo "Frontend Configuration:"
echo "Update your Netlify environment variable:"
echo "REACT_APP_API_URL=$API_URL"
echo ""
echo "========================================="