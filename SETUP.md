# 🏆 Scorecard Builder - Complete Setup Guide

A modern, production-ready scorecard builder application for creating, managing, and sharing custom scorecards for any sport or activity.

## ✨ Complete Features

### 🔐 Authentication System
- ✅ Email/Password authentication with bcrypt hashing
- ✅ Google OAuth 2.0 integration
- ✅ NextAuth v5 with JWT sessions
- ✅ Protected routes with role-based access
- ✅ User profile management with avatars
- ✅ Session persistence across tabs

### 📊 Dashboard
- ✅ Modern analytics with stats cards
- ✅ Total scorecards counter
- ✅ Recently created scorecards
- ✅ Quick create button
- ✅ Responsive grid layout
- ✅ Loading states with shimmer effects

### 🎨 Scorecard Builder
- ✅ Multiple templates (Cricket, Football, Custom)
- ✅ Dynamic field management (Add, Edit, Delete)
- ✅ Drag-and-drop field reordering
- ✅ Live preview panel while building
- ✅ Field types: Text, Number, Select, Checkbox
- ✅ Field validation rules
- ✅ Auto-save functionality

### 📝 Scorecard Management
- ✅ Create/Read/Update/Delete operations
- ✅ Edit scorecard values
- ✅ Field reordering
- ✅ Value persistence
- ✅ Timestamp tracking
- ✅ Version history support

### 📤 Export & Sharing Features
- ✅ Export as PDF with custom formatting
- ✅ Export as PNG/Image
- ✅ Print to paper
- ✅ Generate public share links
- ✅ Public view-only pages
- ✅ Share token generation

### 🎯 UI/UX Excellence
- ✅ Fully responsive design (Mobile, Tablet, Desktop)
- ✅ Dark mode with smooth transitions
- ✅ Glassmorphism effects
- ✅ Soft shadows and gradients
- ✅ Framer Motion animations
- ✅ Toast notifications with Sonner
- ✅ Loading states and skeletons
- ✅ Smooth page transitions
- ✅ Professional SaaS styling

## 🛠️ Technology Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety

### Styling
- **Tailwind CSS v4** - Utility-first CSS
- **ShadCN UI** - High-quality component library
- **Framer Motion** - Advanced animations

### Authentication & Database
- **NextAuth v5** - Authentication library
- **MongoDB** - Document database
- **Mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing

### Form & Validation
- **React Hook Form** - Efficient form management
- **Zod** - TypeScript-first validation

### Export Libraries
- **html2canvas** - DOM to image conversion
- **jsPDF** - PDF generation

### Utilities
- **Sonner** - Toast notifications
- **Lucide React** - Icon library
- **uuid** - Unique ID generation
- **clsx** - Classname utility

## 📋 Prerequisites

Before you start, ensure you have:
- **Node.js 18+** installed (check: `node --version`)
- **npm** or **yarn** package manager
- **MongoDB** instance (local or cloud)
- **Git** for version control
- Text editor/IDE (VS Code recommended)

## 🚀 Step-by-Step Installation

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd scorecard-builder
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

This installs all required packages listed in `package.json`.

### Step 3: Environment Configuration

Create `.env.local` file in the root directory:

```env
# ==========================================
# DATABASE CONFIGURATION
# ==========================================
# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/scorecard-builder

# For MongoDB Atlas (Cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/scorecard-builder?retryWrites=true&w=majority

# ==========================================
# NEXTAUTH CONFIGURATION
# ==========================================
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# ==========================================
# GOOGLE OAUTH (Optional - for Google Sign-in)
# ==========================================
# Leave blank if not using Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 4: Generate NextAuth Secret

```bash
# Generate a secure random string
openssl rand -base64 32

# On Windows, use:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste in `.env.local` as `NEXTAUTH_SECRET`.

### Step 5: Setup MongoDB

#### Option A: Local MongoDB Setup

**On macOS (with Homebrew):**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify connection
mongosh
# Exit with: exit()
```

**On Windows:**
1. Download MongoDB installer from [mongodb.com/try/download/community](https://mongodb.com/try/download/community)
2. Run installer and follow prompts
3. MongoDB should start automatically
4. Test: Open Command Prompt and run `mongosh`

**On Linux (Ubuntu/Debian):**
```bash
# Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Option B: MongoDB Atlas (Cloud) Setup

1. **Create MongoDB Atlas Account:**
   - Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Sign up for free account
   - Verify email

2. **Create Cluster:**
   - Click "Create" to create new project
   - Select "M0 Free" tier (free forever)
   - Choose region closest to you
   - Click "Create Cluster"

3. **Setup Database Access:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Enter username and password
   - Select "Built-in Role: Atlas admin"
   - Click "Add User"

4. **Allow Network Access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere"
   - Click "Confirm"

5. **Get Connection String:**
   - Go back to "Clusters"
   - Click "Connect" on your cluster
   - Select "Drivers"
   - Copy connection string
   - Replace `<username>`, `<password>` with your credentials
   - Add to `.env.local` as `MONGODB_URI`

### Step 6: Setup Google OAuth (Optional)

Only follow if you want Google sign-in functionality.

1. **Create Google Cloud Project:**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Click "Select a Project" → "New Project"
   - Enter "Scorecard Builder"
   - Click "Create"

2. **Enable Google+ API:**
   - Go to "APIs & Services" → "Enable APIs and Services"
   - Search for "Google+ API"
   - Click on it and press "Enable"

3. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Under "Authorized redirect URIs" add:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
   - Click "Create"
   - Copy "Client ID" and "Client Secret"

4. **Add to .env.local:**
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### Step 7: Verify Setup

```bash
# Check Node version
node --version  # Should be 18+

# Check npm version
npm --version

# Check MongoDB connection
mongosh
# Type: exit() to quit

# Check .env.local exists
cat .env.local  # Should show your configuration
```

### Step 8: Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 15.5.3
  - Local:        http://localhost:3000
```

### Step 9: Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the landing page with "Get Started Free" button.

## 🔑 Initial Setup Walkthrough

### First Time Using the App:

1. **Landing Page** (http://localhost:3000)
   - View feature overview
   - Click "Get Started Free" or "Sign In"

2. **Sign Up Page** (http://localhost:3000/auth/signup)
   - Enter Name, Email, Password
   - Password must be at least 6 characters
   - Click "Sign Up"

3. **Dashboard Page** (http://localhost:3000/dashboard)
   - See welcome message with your name
   - View statistics (Total Scorecards, etc.)
   - Click "Create New Scorecard"

4. **Create Scorecard Page** (http://localhost:3000/scorecard/create)
   - Enter Scorecard Title
   - Select Template (Cricket/Football/Custom)
   - Edit Fields (add, remove, reorder)
   - See Live Preview on the right
   - Click "Create Scorecard"

5. **Scorecard Detail Page** (http://localhost:3000/scorecard/[id])
   - View/Edit scorecard data
   - Export as PDF or Image
   - Share public link
   - Print scorecard

## 📂 Project Structure Explanation

```
scorecard-builder/
├── app/                              # Next.js App Router
│   ├── api/                         # Backend API Routes
│   │   ├── auth/                    # Authentication
│   │   │   └── [...nextauth]/       # NextAuth handler
│   │   ├── scorecards/              # CRUD endpoints
│   │   │   ├── route.ts             # GET/POST all
│   │   │   ├── [id]/route.ts        # GET/PATCH/DELETE one
│   │   │   └── [id]/share/route.ts  # POST share link
│   │   └── share/[token]/route.ts   # GET public share
│   ├── auth/                        # Auth Pages
│   │   ├── signin/page.tsx          # Login page
│   │   └── signup/page.tsx          # Registration page
│   ├── dashboard/                   # User Dashboard
│   │   └── page.tsx                 # Scorecards list
│   ├── scorecard/                   # Scorecard Pages
│   │   ├── create/page.tsx          # Builder page
│   │   ├── [id]/page.tsx            # Detail page
│   │   └── share/[token]/page.tsx   # Public view
│   ├── layout.tsx                   # Root layout with providers
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Global styles
│
├── components/                      # React Components
│   ├── ui/                         # ShadCN UI Components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── ... more
│   ├── Navbar.tsx                  # Navigation component
│   ├── Toaster.tsx                 # Toast provider
│   └── ... other components
│
├── lib/                            # Utilities & Config
│   ├── mongodb.ts                  # DB connection
│   ├── auth.ts                     # NextAuth config
│   ├── User.ts                     # User model
│   ├── Scorecard.ts                # Scorecard model
│   └── utils.ts                    # Helper functions
│
├── types/                          # TypeScript Types
│   ├── next-auth.d.ts             # NextAuth types
│   └── cricket.ts                 # Custom types
│
├── styles/                         # CSS Files
│   └── globals.css                # Tailwind directives
│
├── public/                         # Static Assets
├── .env.local                      # Environment Variables
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts              # Tailwind config
├── postcss.config.mjs              # PostCSS config
└── next.config.ts                  # Next.js config
```

## 🗄️ Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  image: String (optional),
  emailVerified: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Scorecard Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String (optional),
  type: 'Cricket' | 'Football' | 'Custom',
  fields: [{
    id: String,
    name: String,
    type: 'text' | 'number' | 'select' | 'checkbox',
    required: Boolean,
    order: Number,
    options: String[] (optional)
  }],
  values: [{
    fieldId: String,
    value: Mixed
  }],
  createdBy: ObjectId (User reference),
  isPublic: Boolean,
  shareToken: String (unique, optional),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Authentication Flow

```
User → SignUp Page → Hash Password → Store in DB
  ↓
Login Page → Verify Credentials → Create JWT
  ↓
Middleware → Check Token → Grant Access to Protected Routes
  ↓
Dashboard → Create/Edit/Delete Scorecards
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
# App runs on http://localhost:3000 with hot reload
```

### Build for Production
```bash
npm run build
# Creates optimized build in .next folder
```

### Start Production Server
```bash
npm run start
# Runs the optimized production build
```

### Run Linter
```bash
npm run lint
# Checks code quality and style
```

## 🧪 Testing the Features

### Test Email Authentication:
1. Go to Sign Up page
2. Create account with test email
3. Sign in with credentials
4. Verify you're on Dashboard

### Test Google OAuth:
1. Make sure GOOGLE_CLIENT_ID is set
2. Click "Google" button on Sign In
3. You should be redirected to Google login
4. Grant permissions
5. Redirect back to Dashboard

### Test Scorecard Creation:
1. Click "Create New Scorecard"
2. Enter title and description
3. Select a template
4. Add custom fields
5. Check live preview
6. Click "Create Scorecard"

### Test Export Features:
1. Open a scorecard
2. Click "Export PDF" → File downloads as PDF
3. Click "Export Image" → File downloads as PNG
4. Click "Print" → Print dialog opens

### Test Sharing:
1. Open a scorecard
2. Click "Share" → Get share link
3. Copy the link and open in new private browser
4. Public view shows scorecard without edit option
5. Can still export/print

## 🐛 Troubleshooting

### "Cannot find module 'next-auth'"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "MONGODB_URI is not set"
- Check `.env.local` file exists
- Verify `MONGODB_URI` is correctly set
- Don't use quotes around the URI

### "MongoDB connection failed"
```bash
# Check MongoDB is running
# On Mac: brew services list | grep mongodb
# On Windows: Check Services app
# On Linux: sudo systemctl status mongod

# Check connection string
mongosh "mongodb://localhost:27017/scorecard-builder"
```

### "NextAuth secret is missing"
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy to NEXTAUTH_SECRET in .env.local
```

### Application won't start
1. Check all dependencies: `npm install`
2. Clear cache: `rm -rf .next node_modules`
3. Check ports: Port 3000 must be available
4. Check Node version: Should be 18+

### Pages not loading
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart dev server (Ctrl+C, then `npm run dev`)
3. Check browser console for errors
4. Check terminal for API errors

## 📊 Performance Monitoring

### Development Tools
```bash
# ESLint for code quality
npm run lint

# TypeScript checking
npx tsc --noEmit

# Build analysis
npm run build
```

### Browser DevTools
- Open DevTools (F12)
- Go to Network tab to check requests
- Check Console for errors
- Use React DevTools extension

## 🔒 Security Best Practices

1. **Environment Variables:**
   - Never commit `.env.local`
   - Add to `.gitignore`
   - Keep secrets private

2. **Passwords:**
   - Always hashed with bcryptjs
   - Minimum 6 characters
   - HTTPS only in production

3. **Authentication:**
   - JWT tokens in HTTP-only cookies
   - CSRF protection enabled
   - Session timeout configured

4. **Database:**
   - MongoDB indexes on frequently queried fields
   - User data isolated per user
   - No sensitive data in URLs

## 📈 Scaling & Deployment

### Before Production:
1. Update `NEXTAUTH_SECRET` to secure value
2. Set `NEXTAUTH_URL` to production domain
3. Use MongoDB Atlas for reliability
4. Configure Google OAuth for production domain
5. Enable HTTPS
6. Add SSL certificate

### Deployment Platforms:
- **Vercel** (Recommended - Next.js creators)
- **Netlify**
- **AWS**
- **Google Cloud**
- **Self-hosted**

### Deploy to Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel Dashboard
# Push to main branch for auto-deployment
```

## 📞 Support & Resources

### Documentation Links:
- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [MongoDB Docs](https://docs.mongodb.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [ShadCN UI Docs](https://ui.shadcn.com)

### Community:
- GitHub Discussions
- Stack Overflow
- Reddit (r/nextjs, r/mongodb)

## 📄 License

MIT License - See LICENSE file for details

---

**Happy Scorecard Building! 🎉**
