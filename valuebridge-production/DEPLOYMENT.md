# ValueBridge Production Deployment Guide

## 📦 What's Consolidated

Your entire project is now organized in a single `valuebridge-production` folder:

```
valuebridge-production/
├── server/          - Backend (Node.js/Express)
├── client/          - Frontend (React)
├── data/            - All data files
├── config/          - Environment configuration
└── scripts/         - Deployment scripts
```

## ✅ Quick Start for Production

### 1. Navigate to Production Folder
```bash
cd /Users/mohangonnabathula/Desktop/learning_ai/valuebridge-production
```

### 2. Install All Dependencies
```bash
npm run install-all
```

This installs:
- Root dependencies
- Server dependencies (`server/package.json`)
- Client dependencies (`client/package.json`)

### 3. Development Mode
```bash
npm run dev
```
Runs both frontend and backend concurrently.

### 4. Production Mode
```bash
npm start
```
Builds frontend and starts backend server.

## 📊 What's Included

### Backend (server/)
- Express.js server
- Excel file reading for expenses
- API endpoints for dashboard
- Data serving capabilities
- Running on port 5001

### Frontend (client/)
- React application
- Dashboard component
- Charts and analytics
- DeckersData component with professional dashboard
- Runs on port 3000 (dev) or served from port 5001 (production)

### Data (data/)
- Production includes only:
   - **structured/** - Structured metrics and analytics
   - Note: Raw text chunks and classified notes have been removed to keep the build lean. Use the source repo for full research artifacts.

### Configuration (config/)
- `.env.production` - Environment variables for production

## 🚀 Deployment Steps

### For Local Development
```bash
cd valuebridge-production
npm run dev
```
Open http://localhost:3000

### For Production Server
```bash
cd valuebridge-production
npm run install-all
npm start
```
Access at http://localhost:5001

### For Cloud Deployment (Heroku, AWS, etc.)

1. **Move to cloud platform:**
```bash
# Heroku example
heroku create your-app-name
git push heroku main
```

2. **Environment Variables:**
   - Update `config/.env.production` with your settings
   - Set cloud provider's environment variables

3. **Port Configuration:**
   - Server uses PORT from environment variable (defaults to 5001)
   - Frontend builds are served from server in production

## 🔧 Configuration

Edit `config/.env.production`:
```env
NODE_ENV=production
PORT=5001
REACT_APP_API_URL=http://your-domain.com
```

## 📋 Folder Size Overview
- **Client:** 546MB (includes node_modules)
- **Server:** 20MB (includes node_modules)
- **Data:** 820KB
- **Total:** ~567MB

## 🧹 Optimizing for Production

### Remove node_modules (optional)
```bash
rm -rf server/node_modules
rm -rf client/node_modules
```
Then reinstall in production environment.

### Build Production Bundle
```bash
cd valuebridge-production/client
npm run build
```
Creates optimized build in `client/build/`

## 🔄 Development Workflow

1. **Make changes:**
   - Backend: Edit `server/server.js`
   - Frontend: Edit `client/src/`
   - Data: Add to `data/` folders

2. **Test locally:**
   ```bash
   npm run dev
   ```

3. **Build and test production:**
   ```bash
   npm start
   ```

4. **Deploy:**
   - Push to git/GitHub
   - Deploy to production platform

## 📈 Features Overview

### Dashboard
- Expense tracking and analytics
- Data visualization with charts
- Category and month filtering

### Deckers Data Page
- Professional financial dashboard
- Stock price trends
- Revenue and profitability metrics
- Cash flow analysis
- Brand performance pie charts
- Company information and analyst estimates

## 🐛 Common Issues & Solutions

**Issue: Port 5001 already in use**
```bash
lsof -i :5001
kill -9 <PID>
```

**Issue: Dependencies not installing**
```bash
cd valuebridge-production
npm run install-all --verbose
```

**Issue: Frontend can't reach backend**
- Check API URL in `client/.env`
- Verify server is running on 5001
- Check CORS configuration

## 📞 Running Servers

### Development (both frontend & backend):
```bash
npm run dev
```

### Production (frontend bundled, backend serves):
```bash
npm start
```

### Backend only:
```bash
npm run server
```

### Frontend only:
```bash
npm run client
```

## ✨ Next Steps

1. Test locally: `npm run dev`
2. Build production: `npm run build`
3. Deploy to your platform
4. Monitor server performance

---

**Status:** ✅ Ready for Production  
**Location:** `/Users/mohangonnabathula/Desktop/learning_ai/valuebridge-production/`  
**Date:** January 6, 2026
