# SACO - Systemic AI Content Orchestrator

<div align="center">

![SACO Logo](https://via.placeholder.com/120x120/6366f1/ffffff?text=SACO)

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
- OpenAI API key (gpt-4o-mini)
- Pinecone account (free tier)

### 1. Clone & Setup

```bash
cd d:\project\AI_BHARAT\CREATEX
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
copy .env.example .env

# Edit .env with your credentials:
# - MONGO_URI (from MongoDB Atlas)
# - OPENAI_API_KEY
# - PINECONE_API_KEY
# - JWT_SECRET (any random string)

# Start server
npm start
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React app
npm start
```

### 4. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## 📁 Project Structure

```
CREATEX/
├── backend/
│   ├── server.js              # Express entry point
│   ├── models/
│   │   ├── User.js            # User auth + stats
│   │   ├── Content.js         # Content + variants
│   │   └── BrandDNA.js        # Brand guidelines
│   ├── routes/
│   │   ├── auth.js            # Register/Login/Stats
│   │   ├── content.js         # CRUD + Orchestrate
│   │   └── brand.js           # Brand DNA mgmt
│   ├── services/
│   │   ├── agents/
│   │   │   ├── managerAgent.js    # Orchestrator
│   │   │   ├── ingestAgent.js     # Content analysis
│   │   │   ├── generatorAgent.js  # COPE generation
│   │   │   ├── reviewerAgent.js   # Brand audit
│   │   │   └── publisherAgent.js  # Formatting
│   │   ├── vectorStore.js     # Pinecone integration
│   │   └── contentHandler.js  # Type router
│   └── middleware/
│       └── auth.js            # JWT verification
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app + routing
│   │   ├── index.css          # Design system
│   │   ├── components/
│   │   │   ├── Auth/          # Login/Register
│   │   │   ├── Dashboard/     # KPIs + content list
│   │   │   ├── Upload/        # Content upload
│   │   │   ├── Content/       # Detail + variants
│   │   │   └── Brand/         # Brand settings
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── services/
│   │       └── api.js         # Axios instance
│   └── public/
│       └── index.html
│
└── README.md
```

---

## 🔧 Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/saco
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-your-key
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX=saco
```

---

## 📊 Demo Flow

1. **Register** - Create account at `/register`
2. **Set Brand DNA** - Go to `/brand` and define:
   - Brand name
   - Tone (professional, casual, etc.)
   - Voice statement
   - Core values
   - Keywords to use/avoid
3. **Upload Content** - Go to `/upload`:
   - Paste your article/blog post
   - Select target platforms (Twitter, LinkedIn, Email)
   - Click "Start Orchestration"
4. **Watch Agents Work** - View real-time:
   - Agent workflow log
   - Generated variants appearing
   - Consistency scores
5. **Review KPIs** - Dashboard shows:
   - Hit Rate (target: 85%)
   - Automation Rate
   - Avg Consistency Score

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

## 🎯 KPIs Tracked

| Metric | Description | Target |
|--------|-------------|--------|
| Hit Rate | % of variants passing review (>80% score) | 85% |
| Automation Rate | % processed without human intervention | 90% |
| Consistency Score | Avg brand alignment score | 80%+ |
| Processing Time | End-to-end orchestration time | <30s |

---

## 🔮 Extensibility

The platform is designed for future expansion:

### Adding Image Support
```javascript
// In contentHandler.js, add:
async handleImage(content) {
  // Integrate Stable Diffusion API
  const StableDiffusion = require('stable-diffusion-api');
  // Process image generation...
}
```

### Adding Video/NeRF Support
```javascript
// In contentHandler.js, add:
async handleVideo(content) {
  // Integrate NeRF or Gaussian Splatting tools
  // Process volumetric content...
}
```

---

## 📝 License

Built for AI Bharat AWS Hackathon 2026

---

<div align="center">

**SACO** - From cosmetic AI to systemic intelligence

*Transforming content workflows, one agent at a time*

</div>
