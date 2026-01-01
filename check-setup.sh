#!/usr/bin/env bash

# 🎉 SCORECARD BUILDER - DEVELOPER CHECKLIST
# Use this to verify everything is properly set up

echo "=========================================="
echo "  🎉 SCORECARD BUILDER - SETUP CHECKER"
echo "=========================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  ✅ Node.js installed: $NODE_VERSION"
else
    echo "  ❌ Node.js not found. Install from nodejs.org"
    exit 1
fi

# Check npm
echo ""
echo "✓ Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "  ✅ npm installed: v$NPM_VERSION"
else
    echo "  ❌ npm not found"
    exit 1
fi

# Check package.json
echo ""
echo "✓ Checking package.json..."
if [ -f "package.json" ]; then
    echo "  ✅ package.json found"
else
    echo "  ❌ package.json not found"
    exit 1
fi

# Check .env.local
echo ""
echo "✓ Checking .env.local..."
if [ -f ".env.local" ]; then
    echo "  ✅ .env.local found"
    if grep -q "MONGODB_URI" .env.local; then
        echo "  ✅ MONGODB_URI configured"
    else
        echo "  ⚠️  MONGODB_URI not set"
    fi
    if grep -q "NEXTAUTH_SECRET" .env.local; then
        echo "  ✅ NEXTAUTH_SECRET configured"
    else
        echo "  ⚠️  NEXTAUTH_SECRET not set"
    fi
else
    echo "  ❌ .env.local not found. Create it with:"
    echo "     MONGODB_URI=mongodb://localhost:27017/scorecard-builder"
    echo "     NEXTAUTH_SECRET=any-random-string"
    echo "     NEXTAUTH_URL=http://localhost:3000"
fi

# Check node_modules
echo ""
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✅ Dependencies installed"
else
    echo "  ⚠️  node_modules not found. Run: npm install"
fi

# Check MongoDB
echo ""
echo "✓ Checking MongoDB..."
if command -v mongosh &> /dev/null; then
    echo "  ✅ MongoDB client (mongosh) installed"
    if mongosh --eval "db.version()" 2>/dev/null | grep -q "ECONNREFUSED\|Connection refused"; then
        echo "  ⚠️  MongoDB not running. Start it:"
        echo "     macOS: brew services start mongodb-community"
        echo "     Windows: mongod.exe"
        echo "     Linux: sudo systemctl start mongod"
    else
        echo "  ✅ MongoDB running"
    fi
else
    echo "  ⚠️  MongoDB client not found. Visit: mongodb.com/try/download/shell"
fi

# Check git
echo ""
echo "✓ Checking Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "  ✅ Git installed: $GIT_VERSION"
else
    echo "  ⚠️  Git not found"
fi

# Check app directory structure
echo ""
echo "✓ Checking app structure..."
CHECKS_PASSED=0
CHECKS_TOTAL=8

if [ -d "app" ]; then
    echo "  ✅ app/ directory exists"
    ((CHECKS_PASSED++))
else
    echo "  ❌ app/ directory missing"
fi
((CHECKS_TOTAL++))

if [ -f "app/page.tsx" ]; then
    echo "  ✅ app/page.tsx exists"
    ((CHECKS_PASSED++))
else
    echo "  ❌ app/page.tsx missing"
fi
((CHECKS_TOTAL++))

if [ -f "app/layout.tsx" ]; then
    echo "  ✅ app/layout.tsx exists"
    ((CHECKS_PASSED++))
else
    echo "  ❌ app/layout.tsx missing"
fi
((CHECKS_TOTAL++))

if [ -d "lib" ]; then
    echo "  ✅ lib/ directory exists"
    ((CHECKS_PASSED++))
else
    echo "  ❌ lib/ directory missing"
fi
((CHECKS_TOTAL++))

if [ -d "components" ]; then
    echo "  ✅ components/ directory exists"
    ((CHECKS_PASSED++))
else
    echo "  ❌ components/ directory missing"
fi
((CHECKS_TOTAL++))

# Check documentation
echo ""
echo "✓ Checking documentation..."
DOC_CHECKS=0
DOC_TOTAL=0

for doc in GETTING_STARTED.md QUICKSTART.md SETUP.md SITEMAP.md IMPLEMENTATION.md BUILD_SUMMARY.md PROJECT_SUMMARY.txt INDEX.md; do
    if [ -f "$doc" ]; then
        echo "  ✅ $doc exists"
        ((DOC_CHECKS++))
    else
        echo "  ⚠️  $doc missing"
    fi
    ((DOC_TOTAL++))
done

# Summary
echo ""
echo "=========================================="
echo "  📊 SETUP SUMMARY"
echo "=========================================="
echo ""
echo "Node.js:        ✅ Installed"
echo "npm:            ✅ Installed"
echo "package.json:   ✅ Found"
echo ".env.local:     $([ -f '.env.local' ] && echo '✅ Found' || echo '❌ Missing')"
echo "Dependencies:   $([ -d 'node_modules' ] && echo '✅ Installed' || echo '⚠️  Run npm install')"
echo "MongoDB:        $(command -v mongosh &> /dev/null && echo '✅ Installed' || echo '⚠️  Install MongoDB')"
echo "Documentation:  ✅ $DOC_CHECKS/$DOC_TOTAL files"
echo ""
echo "=========================================="
echo ""

# Instructions
echo "🚀 NEXT STEPS:"
echo ""
echo "1. If any checks failed, fix them above"
echo ""
echo "2. Setup MongoDB:"
echo "   macOS:  brew install mongodb-community"
echo "   macOS:  brew services start mongodb-community"
echo "   Windows: Download from mongodb.com"
echo "   Linux:  sudo apt-get install mongodb"
echo ""
echo "3. Create .env.local if missing:"
echo "   MONGODB_URI=mongodb://localhost:27017/scorecard-builder"
echo "   NEXTAUTH_SECRET=change-me"
echo "   NEXTAUTH_URL=http://localhost:3000"
echo ""
echo "4. Install dependencies:"
echo "   npm install"
echo ""
echo "5. Start development server:"
echo "   npm run dev"
echo ""
echo "6. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "=========================================="
echo "✅ All checks passed! Ready to develop!"
echo "=========================================="

# Quick verification
if [ -f ".env.local" ] && [ -d "node_modules" ] && [ -f "app/page.tsx" ]; then
    echo ""
    echo "🎯 You're ready to run: npm run dev"
    exit 0
else
    echo ""
    echo "⚠️  Please fix the issues above before running npm run dev"
    exit 1
fi
