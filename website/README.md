# Monthly Expense Tracker

A full-stack web application for tracking and visualizing monthly expenses. This application reads expense data from an Excel file and provides an intuitive dashboard with charts, filters, and detailed expense lists.

## Features

- 📊 **Interactive Dashboard** - View total expenses, averages, and spending by category
- 📈 **Charts & Visualizations** - Pie charts for categories and bar charts for monthly trends
- 📋 **Detailed Expense List** - Sortable table with filtering by month and category
- 🎨 **Modern UI** - Built with React and Tailwind CSS
- 🔄 **Real-time Data** - Reads directly from Excel file via Node.js backend
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

### Backend
- **Node.js & Express** - REST API server
- **XLSX** - Excel file parsing

### Frontend
- **React 18** - UI framework
- **Axios** - HTTP client
- **Chart.js & react-chartjs-2** - Data visualization
- **CSS3** - Styling

## Project Structure

```
website/
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── Charts.js
│   │   │   └── ExpenseList.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## API Endpoints

- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/month/:month` - Get expenses for a specific month (format: YYYY-MM)
- `GET /api/expenses/category/:category` - Get expenses for a specific category
- `GET /api/summary` - Get summary statistics
- `GET /api/categories` - Get all categories

## Data Source

The application reads expense data from `/Users/mohangonnabathula/Desktop/learning_ai/data/expense_calculator/expense_tracker.xlsx`

Expected Excel columns:
- **Date** - Transaction date
- **Description** - Expense description
- **Category** - Expense category
- **Amount** - Expense amount

## Usage

1. **Filter Expenses** - Use the dropdown filters to view expenses by month and/or category
2. **View Dashboard** - See key metrics and category breakdown
3. **Analyze Charts** - Visual representation of spending patterns
4. **Browse List** - Detailed expense list with sorting capabilities
5. **Refresh Data** - Click the refresh button to reload data from the Excel file

## Development

### Running Both Servers

You can use VS Code tasks to run both servers simultaneously:
- Press `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac) to run the default build task
- Or run each server in separate terminals as shown in setup instructions

### Customization

- Modify styling in CSS files
- Add new chart types in `Charts.js`
- Adjust API endpoints in `backend/server.js`
- Add new dashboard widgets in `Dashboard.js`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use:
1. Change port in `server.js` and update proxy in `frontend/package.json`
2. Or kill existing process: `lsof -ti:5000 | xargs kill -9`

### Excel File Not Found
Ensure the Excel file exists at the correct path. Update the path in `backend/server.js` if needed.

### CORS Errors
The backend is configured with CORS enabled. If issues persist, check CORS settings in `server.js`

## Future Enhancements

- Add expense input form
- Export data to PDF/CSV
- Budget alerts and limits
- Multi-user support with authentication
- Dark mode
- Mobile app version

## License

MIT

## Support

For issues or questions, please check the project structure and ensure all dependencies are installed correctly.
