# SACO - Systemic AI Content Orchestrator

<div align="center">

**Transform content once, publish everywhere**

*AI-powered multi-agent content orchestration platform*

[![AI Bharat Hackathon](https://img.shields.io/badge/AI%20Bharat-AWS%20Hackathon-orange)](https://github.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)

</div>

---

## 🎯 Problem Statement

**AI for Media, Content & Digital Experiences** - SACO addresses the "permacrisis" of fragmented AI workflows by implementing **Systemic AI** over cosmetic point solutions.

### Key Features

- 🤖 **Multi-Agent Orchestration** - Hierarchical MAS with specialized agents
- 📝 **COPE Pipeline** - Create Once, Publish Everywhere
- 🧠 **Semantic Intelligence** - Vector DB for brand consistency via RAG
- 📊 **KPI Dashboard** - Hit Rate, Automation Rate, Consistency Score
- 🎨 **Premium UI** - Dark theme with glassmorphism effects

---

## 🏗️ Architecture

```
User → React UI → Express API
           |              |
           v              v
        MongoDB        Pinecone → RAG
                          |
                          v
        Manager Agent → Delegates to:
        ├── Ingest Agent (analyze, embed, retrieve)
        ├── Generator Agent (platform-specific content)
        ├── Reviewer Agent (brand consistency scoring)
        └── Publisher Agent (format, mock publish)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Groq API key (free tier)
- Pinecone account (free tier, optional — has mock fallback)

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/CreateX.git
cd CreateX

# Install root + all project dependencies
npm install
npm run install:all
```

### 2. Configure Environment

```bash
# Copy the backend environment template
cp backend/.env.example backend/.env

# Edit backend/.env with your real credentials:
#   MONGO_URI     — from MongoDB Atlas
#   GROQ_API_KEY  — from console.groq.com
#   JWT_SECRET    — any random string
#   (optional) PINECONE_API_KEY, CLOUDINARY_URL, etc.
```

### 3. Run Development Servers

```bash
# Start both backend & frontend with a single command
npm run dev
```

This runs:
- **Backend** → `http://localhost:5000` (Express API)
- **Frontend** → `http://localhost:3000` (React dev server, proxied to backend)

### 4. Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend + frontend concurrently |
| `npm run dev:backend` | Start backend only |
| `npm run dev:frontend` | Start frontend only |
| `npm run build` | Build frontend for production |
| `npm start` | Start backend only (production) |
| `npm run install:all` | Install all dependencies |

---

## 📁 Project Structure

```
CreateX/
├── package.json               # Root scripts (dev, build, install:all)
│
├── backend/
│   ├── server.js              # Express entry point
│   ├── .env.example           # Environment template (safe to commit)
│   ├── models/
│   │   ├── User.js            # User auth + stats
│   │   ├── Content.js         # Content + variants
│   │   └── BrandDNA.js        # Brand guidelines
│   ├── routes/
│   │   ├── auth.js            # Register/Login/Stats
│   │   ├── content.js         # CRUD + Orchestrate + SSE streaming
│   │   ├── brand.js           # Brand DNA management
│   │   └── manager.js         # Manager agent interaction
│   ├── services/
│   │   ├── agents/
│   │   │   ├── managerAgent.js    # Orchestrator
│   │   │   ├── managerInteract.js # Manager interaction
│   │   │   ├── ingestAgent.js     # Content analysis
│   │   │   ├── generatorAgent.js  # COPE generation
│   │   │   ├── reviewerAgent.js   # Brand audit
│   │   │   └── publisherAgent.js  # Formatting
│   │   ├── vectorStore.js     # Pinecone integration
│   │   ├── contentHandler.js  # Type router
│   │   ├── imageAPI.js        # Image generation
│   │   └── orchestrationEmitter.js # SSE event bus
│   └── middleware/
│       └── auth.js            # JWT verification
│
├── frontend/
│   ├── .env.example           # Frontend env template
│   ├── src/
│   │   ├── App.jsx            # Main app + routing
│   │   ├── index.css          # Design system
│   │   ├── components/
│   │   │   ├── Auth/          # Login/Register
│   │   │   ├── Dashboard/     # KPIs + content list
│   │   │   ├── Upload/        # Content upload + orchestration
│   │   │   ├── Content/       # Detail + variants
│   │   │   ├── Brand/         # Brand DNA settings
│   │   │   ├── Libraries/     # Platform content library
│   │   │   ├── History/       # Activity history
│   │   │   ├── Settings/      # User settings
│   │   │   ├── AgentWorkflow/ # Agent execution UI
│   │   │   ├── AgentWorkspace/# Live agent monitoring
│   │   │   └── common/        # Shared components
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── services/
│   │       └── api.js         # Axios instance + interceptors
│   └── public/
│       └── index.html
│
├── .gitignore
└── README.md
```

---

## 🔧 Environment Variables

Create `backend/.env` from the template:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/saco
JWT_SECRET=your-secret-key-here
GROQ_API_KEY=gsk_your_key
IMAGE_GENERATION_ENABLED=true
IMAGE_STORAGE_PROVIDER=local
PINECONE_API_KEY=your-pinecone-key     # optional
PINECONE_INDEX=saco                     # optional
CLOUDINARY_URL=cloudinary://...         # optional, for production image storage
NEO4J_URI=neo4j+s://...                # optional
```

---

## 📊 Demo Flow

1. **Register** - Create account at `/register`
2. **Set Brand DNA** - Go to `/brand` and define:
   - Brand name, tone, voice statement
   - Core values, keywords to use/avoid
3. **Upload Content** - Go to `/upload`:
   - Paste your article/blog post
   - Select target platforms (Twitter, LinkedIn, Email)
   - Click "Start Orchestration"
4. **Watch Agents Work** - View real-time:
   - Agent workflow log via SSE streaming
   - Generated variants appearing
   - Consistency scores
5. **Review KPIs** - Dashboard shows:
   - Hit Rate (target: 85%)
   - Automation Rate
   - Avg Consistency Score

---

## 🎯 KPIs Tracked

| Metric | Description | Target |
|--------|-------------|--------|
| Hit Rate | % of variants passing review (>80% score) | 85% |
| Automation Rate | % processed without human intervention | 90% |
| Consistency Score | Avg brand alignment score | 80%+ |
| Processing Time | End-to-end orchestration time | <30s |

---

## 🧪 Testing

### Sample Content for Testing

```
Title: Introducing AI-Powered Analytics

Content:
We're excited to announce the launch of our new AI-powered analytics 
platform. After months of development, we've created a solution that 
transforms how businesses understand their data.

Key features include:
- Real-time insights powered by machine learning
- Natural language queries - just ask your data questions
- Automated report generation with actionable recommendations
- Seamless integration with existing tools

Our platform is designed for modern teams who need fast, accurate 
insights without the complexity. Whether you're a startup or enterprise, 
our solution scales with your needs.

Start your free trial today and see why over 500 companies trust us 
with their data intelligence needs.
```

---

## 📝 License

Built for AI Bharat AWS Hackathon 2026

---

<div align="center">

**SACO** - From cosmetic AI to systemic intelligence

*Transforming content workflows, one agent at a time*

</div>
