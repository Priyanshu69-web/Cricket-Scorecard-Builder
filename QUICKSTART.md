# ⚡ Quick Start - 5 Minute Setup

## Prerequisites
- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account

## Step 1: Clone & Install (2 min)
```bash
git clone <repo-url>
cd scorecard-builder
npm install
```

## Step 2: Environment Setup (1 min)
Create `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/scorecard-builder
NEXTAUTH_SECRET=any-random-string-change-later
NEXTAUTH_URL=http://localhost:3000
```

**Need NEXTAUTH_SECRET?** Run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Start MongoDB (If Using Local)
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
mongod.exe
```

## Step 4: Run Dev Server (1 min)
```bash
npm run dev
```

## Step 5: Open Browser (1 min)
Go to [http://localhost:3000](http://localhost:3000)

## Try It Out

1. **Sign Up** - Create an account
2. **Create Scorecard** - Try Cricket template
3. **Add Fields** - See live preview
4. **Export** - Download as PDF/Image
5. **Share** - Get public link

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed setup
- Check [README.md](./README.md) for all features
- Setup Google OAuth (optional)

## Common Issues

### "Cannot connect to MongoDB"
- Make sure MongoDB is running
- Check MONGODB_URI in .env.local
- Try: `mongosh` in terminal

### Port 3000 already in use
```bash
npm run dev -- -p 3001
# App runs on http://localhost:3001
```

### "NEXTAUTH_SECRET is missing"
- Add any random string to .env.local
- Or use the generated command above

## Deploy to Production

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

**All set! Happy building! 🚀**
