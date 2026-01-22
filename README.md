# GenAI Video Analysis Tool

A production-ready AI-powered video analysis platform designed for sales and marketing teams. This tool processes demo videos to generate transcripts and creates dynamic, domain-specific CSV reports using Google's Gemini AI.

## ✨ Recent Updates

### UI Improvements (Latest)
- ✅ **Tailwind CSS Integration**: Modern utility-first CSS framework for better styling
- ✅ **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- ✅ **Fixed Style Conflicts**: Resolved conflicting CSS that affected layout
- ✅ **Dynamic Color System**: Proper color class implementation for dashboard metrics
- ✅ **Enhanced Animations**: Added fade-in and smooth transition effects
- ✅ **Browser Compatibility**: Added standard CSS properties for cross-browser support
- ✅ **Mobile Navigation**: Optimized navigation bar for smaller screens

## 🚀 Features

### 🧠 Neural Capture
- **Meeting Recording**: Built-in voice recorder with visualization.
- **Upload Support**: Drag-and-drop support for MP4, MOV, and audio files.
- **Real-time Processing**: Visual progress tracking (Synthesizing -> Transcribing -> Enriching).
- **AI Analysis**: Automatic transcription and insight generation using Google Gemini.

### 🗂️ Nexus Archive (Meetings)
- **Smart Search**: Search across transcripts, summaries, topics, and participants.
- **Advanced Filtering**: Filter by meeting type (Strategy, Investor, etc.) and sentiment.
- **Rich Insights**: View key insights, action items, and topic tags for each meeting.
- **Editable Intelligence**: Manually refine properties, summaries, and insights directly in the UI.

### 👥 Rolodex (Relationship Management)
- **Contact Enrichment**: Profiles with roles, companies, and communication styles.
- **Relationship Timeline**: Visual history of interactions, sentiments, and topics over time.
- **Psychometric Profiling**: Tracks communication style and relationship score.
- **Activity Tracking**: Aggregates total meetings and last contact dates.

### 🔍 Search Nexus (Strategic Intelligence)
- **Natural Language Query**: Ask complex questions about your network and meetings (e.g., "What promises did I make to David Kim?").
- **Knowledge Graph**: Queries a graph database (Neo4j) to find hidden connections.
- **Recent Searches**: Quick access to common or past queries.

### 🔌 Protocols & Integration
- **MCP (Model Context Protocol)**: Exposes tools for agent-based workflows.
- **A2A (Agent-to-Agent)**: Communication interface for multi-agent systems.

### Tech Stack
- **Backend**: Python 3.11+, FastAPI, Google GenAI SDK (Gemini)
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons
- **Storage**: ChromaDB (Vector), NetworkX (Graph)
- **Deployment**: Docker, Docker Compose, Nginx

## 📋 Prerequisites

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (optional, for containerized deployment)
- Google API Key (Gemini)

## 🛠️ Setup

### Quick Start (Recommended)

The fastest way to get started is using the development setup:

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd genai-video-analyser
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

**Create `.env` file in the backend directory:**
```bash
GOOGLE_API_KEY=your_gemini_api_key_here
```

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

> **Note**: The frontend now uses Tailwind CSS for styling. All dependencies are included in package.json.

### Running the Application

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

#### Production Mode with Docker

```bash
# From project root
cp backend/.env.example .env
# Edit .env and add your GOOGLE_API_KEY

# Build and run
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

**Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Troubleshooting

#### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'pydantic_settings'`
```bash
cd backend
source venv/bin/activate
pip install pydantic-settings
```

**Problem**: `GOOGLE_API_KEY not found`
- Ensure `.env` file exists in the `backend/` directory
- Verify the API key is correctly set: `GOOGLE_API_KEY=your_key_here`
- Restart the backend server after updating `.env`

### 💾 Data Seeding (SQLite)

The application automatically seeds the database with initial demo data (Meetings and Contacts) on the first run.

**How it works:**
1. On backend startup, it checks if the `local_db.sqlite` exists and if tables are empty.
2. If empty, it loads data from `backend/data/seed_data.json` and populates the database.

**To reset or re-seed the data:**
1. Stop the backend server.
2. Delete the database file:
   ```bash
   rm backend/local_db.sqlite
   ```
3. Restart the backend server. The seed script will run automatically.

**To customize seed data:**
- Edit `backend/data/seed_data.json` before starting the server.

**Problem**: Port 8000 already in use
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

#### Frontend Issues

**Problem**: `npm install` fails
```bash
# Clear npm cache and retry
npm cache clean --force
npm install

# Or use the custom cache directory
npm install --cache ./npm-cache
```

**Problem**: Tailwind CSS not working
- Ensure `tailwind.config.js` and `postcss.config.js` exist in the frontend directory
- Restart the dev server: `Ctrl+C` then `npm run dev`
- Clear browser cache and hard reload

**Problem**: Port 5173 already in use
```bash
# Kill the process
lsof -ti:5173 | xargs kill -9

# Or Vite will automatically use the next available port
```

#### Docker Issues

**Problem**: Permission denied
```bash
# On Linux/Mac, add your user to docker group
sudo usermod -aG docker $USER
# Log out and back in

# Or run with sudo
sudo docker-compose up
```

**Problem**: Container fails to start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Rebuild containers
docker-compose down
docker-compose up --build --force-recreate
```

## 🎯 Usage

### Web Interface
1. Navigate to `http://localhost` (or `http://localhost:5173` in dev mode)
2. Upload a video file (MP4, MOV, AVI)
3. Wait for processing (transcription + analysis)
4. View the generated report on the dashboard

### API Endpoints

#### Upload & Analyze Video
```bash
POST /api/v1/upload
Content-Type: multipart/form-data
Body: file (video file)
```

#### MCP Tools
```bash
GET /mcp/v1/tools          # List available tools
POST /mcp/v1/tools/call    # Execute a tool
```

#### A2A Communication
```bash
GET /a2a/v1/capabilities   # Agent capabilities
POST /a2a/v1/messages      # Send inter-agent messages
```

## 🏗️ Architecture

### Backend Structure
```
backend/
├── app/
│   ├── main.py                 # FastAPI app entry
│   ├── api/                    # API routes
│   │   ├── video.py           # Video upload/processing
│   │   ├── mcp.py             # MCP server
│   │   └── a2a.py             # A2A protocol
│   ├── core/
│   │   └── config.py          # Configuration
│   └── services/
│       ├── video_service.py    # Video handling
│       ├── transcription_service.py  # Gemini transcription
│       ├── llm_service.py      # LLM interactions
│       ├── rag_service.py      # Hybrid RAG
│       └── analysis_service.py # Report generation
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.jsx         # App layout with navigation
│   ├── pages/
│   │   ├── Home.jsx           # Video upload interface
│   │   └── Dashboard.jsx     # Analysis results display
│   ├── App.jsx                # Main app component
│   ├── App.css                # Component styles
│   ├── index.css              # Global styles + Tailwind
│   └── main.jsx               # App entry point
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── vite.config.js             # Vite build configuration
└── package.json               # Dependencies
```

## 🔧 Configuration

### Environment Variables

**Backend (.env in backend/ directory):**
```bash
GOOGLE_API_KEY=your_gemini_api_key_here
```

### Frontend Configuration

The frontend uses Tailwind CSS with a custom theme:
- **Custom Colors**: Neon cyan (`#00f3ff`), Purple (`#bc13fe`)
- **Custom Fonts**: Space Grotesk (headings), Outfit (body)
- **Custom Animations**: Float, pulse-glow, fade-in
- **Responsive Breakpoints**: Mobile-first design with `md:` and `lg:` breakpoints

## 📊 How It Works

1. **Upload**: User uploads a sales/marketing video
2. **Transcription**: Video is sent to Google Gemini for transcription
3. **Domain Detection**: AI analyzes transcript to determine business domain
4. **RAG Processing**:
   - Transcript is chunked and embedded (vector store)
   - Entities and relationships are extracted (knowledge graph)
5. **Report Generation**: LLM creates domain-specific reports with dynamic fields
6. **Display**: Results shown in rich, interactive dashboard

## 🎨 Design Philosophy

The frontend follows modern web design principles with a futuristic, premium aesthetic:

### Visual Design
- **Dark Mode First**: Deep space theme with vibrant neon accents
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Neon Gradients**: Cyan and purple color scheme for a cyberpunk feel
- **Smooth Animations**: Micro-interactions and hover effects throughout
- **Premium Typography**: Space Grotesk for headings, Outfit for body text

### Technical Implementation
- **Tailwind CSS**: Utility-first CSS framework for rapid development
- **Custom CSS Variables**: Consistent theming across components
- **Responsive Design**: Mobile-first approach with breakpoints at 768px (md) and 1024px (lg)
- **Performance**: Optimized with Vite for fast hot module replacement
- **Accessibility**: Semantic HTML and proper ARIA labels

### UI Components
- **Cyber Cards**: Glassmorphic cards with neon borders and glow effects
- **Interactive Upload**: Drag-and-drop with visual feedback
- **Dynamic Dashboard**: Real-time data visualization with color-coded metrics
- **Floating Animations**: Subtle background elements for depth

## 🔐 Security Notes

- Never commit `.env` files
- Restrict CORS origins in production (currently set to `*`)
- Implement authentication for production deployments
- Review file upload size limits and validation

## 🚀 Production Deployment

### Using Docker
```bash
docker-compose up -d
```

### Manual Deployment
1. Set production environment variables
2. Build frontend: `npm run build`
3. Serve frontend with nginx
4. Run backend with gunicorn/uvicorn workers
5. Set up reverse proxy (nginx)
6. Enable HTTPS (Let's Encrypt)

## 📝 API Documentation

Interactive API docs available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## 🙋 Support

For issues and questions, please open a GitHub issue.

---
