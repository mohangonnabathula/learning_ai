# ValueBridge - Financial Analytics Platform

**Production-Ready Consolidated Build**

## 📁 Project Structure

```
valuebridge-production/
├── server/                 # Node.js Express backend
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── ...
├── client/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── DeckersData.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json       # Frontend dependencies
│   └── ...
├── data/                  # Static data files
│   └── structured/        # Structured financial data (production only)
├── config/                # Configuration files
│   └── .env.production    # Environment variables
├── scripts/               # Utility scripts
├── package.json           # Root level scripts
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ 
- npm 6+

### Installation

1. **Install all dependencies:**
```bash
npm run install-all
```

This will install dependencies for root, server, and client in one command.

### Development Mode

Run both backend and frontend concurrently:
```bash
npm run dev
```

This starts:
- Backend on `http://localhost:5001`
- Frontend on `http://localhost:3000`

### Production Mode

1. **Build the frontend:**
```bash
npm run build
```

2. **Start production server:**
```bash
npm start
```

Server runs on `http://localhost:5001`

### Manual Startup

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## 📊 Features

### Dashboard Components
- **Deckers Data** - Comprehensive financial analysis
  - Stock price trends
  - Revenue and EBITDA metrics
  - Cash flow analysis
  - Brand distribution
  - Analyst estimates
  - Company profile

### Available Tabs in App
1. **Dashboard** - Overview and summary
2. **Charts** - Expense analytics
3. **Deckers Data** - Professional financial dashboard

## 📝 Configuration

Configuration file: `config/.env.production`

Key variables:
- `PORT` - Server port (default: 5001)
- `NODE_ENV` - Environment (production/development)
- `REACT_APP_API_URL` - API endpoint for frontend
- `DATA_PATH` - Path to data files

## 📂 Data Files

Located in `data/` directory:
- **structured/** - Processed structured financial metrics (trimmed for production)

## 🔄 API Endpoints

### Backend Routes
- `GET /api/expenses` - Get all expenses
- `GET /api/summary` - Get expense summary

### Frontend Routes
- `/` - Dashboard
- `/charts` - Charts view
- `/deckers-data` - Deckers financial analysis

## 🛠️ Development Notes

### Adding New Features
1. Backend changes: Update `server/`
2. Frontend changes: Update `client/src/`
3. Data updates: Add to `data/` folders

### Building for Deployment
```bash
npm run build
```

Creates optimized production build in `client/build/`

## 📦 Dependencies

### Backend
- express
- cors
- xlsx (for Excel file support)

### Frontend
- react
- recharts (for charts)
- axios (for HTTP requests)
- react-chartjs-2
- chart.js

## 🐛 Troubleshooting

**Port already in use:**
```bash
lsof -i :5001
kill -9 <PID>
```

**Dependencies not installing:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Frontend not connecting to backend:**
- Check `REACT_APP_API_URL` in frontend config
- Verify backend is running on port 5001
- Check CORS settings in server

## 📈 Performance Tips

- Frontend is built with React production build
- Data files are cached on server startup
- Charts use Recharts for optimal performance

## 🔐 Security Considerations

- CORS is configured for localhost only
- Environment variables in `config/.env.production`
- Update CORS_ORIGIN for production domains

## 📞 Support

For issues or questions, refer to individual README files in:
- `server/` - Backend documentation
- `client/` - Frontend documentation

---

**Version:** 1.0.0  
**Last Updated:** January 6, 2026  
**Status:** Production Ready ✅
