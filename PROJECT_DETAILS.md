<<<<<<< HEAD
# SACO - Systemic AI Content Orchestrator
## Complete Project Documentation

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Installation & Setup](#installation--setup)
6. [Project Structure](#project-structure)
7. [API Documentation](#api-documentation)
8. [Database Models](#database-models)
9. [Agent System](#agent-system)
10. [Memory Architecture](#memory-architecture)
11. [Frontend Components](#frontend-components)
12. [Configuration](#configuration)
13. [Deployment](#deployment)
14. [Testing](#testing)

---

## Project Overview

**SACO (Systemic AI Content Orchestrator)** is an AI-powered multi-agent platform that transforms content once and intelligently adapts it for multiple platforms while maintaining perfect brand consistency.

### Problem Statement
Marketing teams spend 60-70% of their time on manual content adaptation rather than strategy. Traditional AI tools suffer from the "amnesia problem" where each request starts from scratch with no memory or context.

### Solution
SACO implements a hierarchical Multi-Agent System (MAS) with 5 specialized AI agents that collaborate to achieve the COPE principle (Create Once, Publish Everywhere).

### Key Innovation
- **Systemic AI over Cosmetic AI**: Coordinated team of specialized agents instead of a single monolithic model
- **Dual Memory Architecture**: Vector DB (Pinecone) + Graph DB (Neo4j) for persistent brand knowledge
- **Human-on-the-Loop (HOTL)**: 80-90% autonomous operation with human intervention only for exceptions
- **Self-Correcting Pipeline**: Reflection loop enables autonomous error recovery

### Target Platforms
- Twitter (280 chars, punchy style)
- LinkedIn (3000 chars, professional tone)
- Email (5000 chars, newsletter format)
- Instagram (2200 chars, visual storytelling)
- Blog (10000 chars, SEO-optimized)


---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE LAYER                       │
│                   (React 18 + Real-time SSE)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                     API GATEWAY LAYER                           │
│              (Express.js + JWT Authentication)                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  ORCHESTRATION LAYER                            │
│                                                                 │
│              ┌─────────────────────────────┐                    │
│              │     MANAGER AGENT           │                    │
│              │  (Orchestrator & Planner)   │                    │
│              └──────────┬──────────────────┘                    │
│                         │                                       │
│        ┌────────────────┼────────────────┐                      │
│        │                │                │                      │
│        ▼                ▼                ▼                      │
│   ┌────────┐      ┌─────────┐      ┌─────────┐                 │
│   │ Ingest │      │Generator│      │ Reviewer│                 │
│   │ Agent  │      │  Agent  │      │  Agent  │                 │
│   └────────┘      └─────────┘      └─────────┘                 │
│        │                │                │                      │
│        └────────────────┼────────────────┘                      │
│                         │                                       │
│                         ▼                                       │
│                  ┌─────────────┐                                │
│                  │  Publisher  │                                │
│                  │    Agent    │                                │
│                  └─────────────┘                                │
└─────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   VERIFICATION LAYER                            │
│   ┌──────────────┐              ┌──────────────┐               │
│   │  Verifiers   │              │  Reflector   │               │
│   │ (Deterministic│              │ (Failure     │               │
│   │  Checks)     │              │  Analysis)   │               │
│   └──────────────┘              └──────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                     MEMORY LAYER                                │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │  Vector DB   │  │   Graph DB   │  │   MongoDB    │         │
│   │  (Pinecone)  │  │   (Neo4j)    │  │   (Primary)  │         │
│   │ • Semantic   │  │ • Brand      │  │ • Users      │         │
│   │   Search     │  │   Identity   │  │ • Content    │         │
│   │ • RAG        │  │ • Beliefs    │  │ • Variants   │         │
│   │ • Embeddings │  │ • Relations  │  │ • Stats      │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Hierarchy

**Orchestration Layer:**
- **Manager Agent**: Plans workflow, delegates tasks, handles failures, calculates KPIs

**Worker Layer:**
- **Ingest Agent**: Analyzes content, extracts metadata, retrieves context via RAG
- **Generator Agent**: Creates platform-specific variants with brand voice
- **Reviewer Agent**: Scores brand consistency, enforces 80% threshold
- **Publisher Agent**: Formats for platform APIs, prepares final deliverables

**Governance Layer:**
- **Verifiers**: Deterministic quality checks (length, keywords, structure)
- **Reflector**: Failure analysis and retry strategy generation

### Data Flow

1. **User Input** → Content + Platform Selection + Brand DNA
2. **Manager Planning** → Decomposes goal into execution plan
3. **Memory Query** → Retrieves context from Vector DB + Graph DB
4. **Ingest** → Analyzes content, extracts themes/keywords, enriches with context
5. **Generation Loop** (per platform):
   - Generator creates variant
   - Reviewer scores brand consistency
   - Verifiers run deterministic checks
   - If failed: Reflector analyzes → Retry with new strategy
   - If passed: Proceed to next platform
6. **Publishing** → Format approved variants for platform APIs
7. **Memory Persistence** → Store outcomes in Vector DB + Graph DB
8. **Results** → Return variants + KPIs to user


---

## Technology Stack

### Frontend
- **Framework**: React 18.2.0
- **UI Library**: Chakra UI 2.10.9
- **Animation**: Framer Motion 12.34.0
- **State Management**: React Context API + TanStack Query 5.90.20
- **Routing**: React Router DOM 6.20.0
- **Charts**: Recharts 3.7.0
- **Flow Diagrams**: XYFlow React 12.10.1
- **Icons**: Lucide React 0.575.0, React Icons 5.5.0
- **Forms**: React Hook Form 7.71.1 + Zod 4.3.6
- **HTTP Client**: Axios 1.6.0
- **Notifications**: React Hot Toast 2.6.0
- **Confetti**: React Confetti 6.4.0

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB 8.0.0 (Mongoose ODM)
- **Vector DB**: Pinecone 2.0.0
- **Graph DB**: Neo4j 5.18.0
- **LLM Framework**: LangChain 0.1.0
  - @langchain/groq 0.0.15
  - @langchain/openai 0.0.25
  - @langchain/community 0.2.28
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3
- **Image Generation**: 
  - Stability AI (via axios)
  - HuggingFace Inference 4.13.11
- **Image Storage**: Cloudinary 2.9.0
- **UUID**: uuid 9.0.0

### AI/ML Services
- **LLM Provider**: Groq (Llama 3.3 70B Versatile)
- **Embedding Model**: OpenAI text-embedding-3-small (1536 dimensions)
- **Image Generation**: Stability AI Ultra, HuggingFace Stable Diffusion
- **Vector Search**: Pinecone (cosine similarity)
- **Graph Database**: Neo4j (brand identity relationships)

### Development Tools
- **Package Manager**: npm
- **Dev Server**: nodemon 3.0.2
- **Build Tool**: React Scripts 5.0.1
- **Version Control**: Git

### Deployment
- **Frontend**: Localhost:3000 (development)
- **Backend**: Localhost:5000 (development)
- **Production**: AWS/Vercel (recommended)


---

## Features

### Core Features

#### 1. Multi-Agent Orchestration
- Hierarchical agent system with specialized roles
- Manager agent coordinates workflow and handles failures
- Worker agents (Ingest, Generator, Reviewer, Publisher) execute tasks
- Autonomous error recovery with reflection loop
- Real-time progress tracking via Server-Sent Events (SSE)

#### 2. Brand DNA Management
- Define brand voice, tone, values, and guidelines
- Required keywords and prohibited words enforcement
- Vector embeddings for semantic brand consistency
- Graph database for brand identity relationships
- Persistent brand memory across all content

#### 3. Content Transformation (COPE Pipeline)
- Create Once, Publish Everywhere workflow
- Platform-specific adaptation (Twitter, LinkedIn, Email, Instagram, Blog)
- Semantic understanding of themes, keywords, and sentiment
- Context-aware generation with RAG (Retrieval-Augmented Generation)
- Fact grounding to prevent AI hallucinations

#### 4. Brand Consistency Verification
- Weighted scoring system (tone 30%, values 25%, keywords 15%, prohibited words 15%, audience fit 15%)
- 80% threshold gate for quality assurance
- Deterministic checks before AI scoring
- Fallback scoring mechanism (cosine similarity)
- Actionable feedback for flagged content

#### 5. Live Agent Workspace
- Full-screen mission control interface
- Real-time agent status monitoring
- Animated progress bars with shimmer effects
- Status pulsing (blue → green → gray)
- Terminal logs streaming per agent
- Animated SVG connection lines with flowing particles
- Avatar animations (thinking dots, pulse, checkmark)
- Master progress bar with milestones
- Success confetti on completion
- Auto-redirect to results page

#### 6. Individual Agent Detail Pages
- Dedicated page for each agent showing user-friendly processes
- Stats grid (processing time, tasks completed, success rate)
- Process steps with title, description, status, duration
- Output display with formatted results
- Clickable agent cards from workspace

#### 7. Dashboard & Analytics
- KPI tracking (Hit Rate, Automation Rate, Consistency Score)
- Content performance charts
- Recent activity timeline
- Quick actions for content creation
- User statistics and history

#### 8. Image Generation
- AI-generated images matching brand style
- Platform-specific dimensions
- Multi-provider support (Stability AI, HuggingFace)
- Fallback mechanism for reliability
- Cloudinary storage integration

#### 9. Manager Agent Interaction
- Natural language commands for content modification
- Dry-run preview before execution
- Context-aware understanding of requests
- Confirmation workflow for changes

#### 10. Real-Time Streaming
- Server-Sent Events (SSE) for live updates
- Natural language progress logs
- Variant generation notifications
- KPI updates on completion
- Error notifications with details


---

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- Groq API key (free tier available)
- Pinecone account (free tier)
- Neo4j Aura account (optional, free tier)
- Stability AI API key (optional, for image generation)

### Step 1: Clone Repository
```bash
cd d:\projects\CreateX
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
```

Edit `backend/.env` with your credentials:
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/saco
JWT_SECRET=your-secret-key-here-minimum-32-characters
GROQ_API_KEY=gsk_your_groq_key_here
OPENAI_API_KEY=sk-your-openai-key-here
PINECONE_API_KEY=your-pinecone-key-here
PINECONE_INDEX=saco
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-neo4j-password
STABILITY_API_KEY=sk-your-stability-key (optional)
HUGGINGFACE_API_KEY=hf_your-huggingface-key (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name (optional)
CLOUDINARY_API_KEY=your-api-key (optional)
CLOUDINARY_API_SECRET=your-api-secret (optional)
```

Start backend server:
```bash
npm start
```

Backend will run on `http://localhost:5000`

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

Frontend will run on `http://localhost:3000`

### Step 4: Verify Installation

1. Open browser to `http://localhost:3000`
2. Register a new account
3. Set up Brand DNA in settings
4. Upload test content
5. Watch agents work in real-time

### Troubleshooting

**Port 3000 already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**MongoDB connection failed:**
- Verify MongoDB Atlas IP whitelist includes your IP
- Check connection string format
- Ensure database user has read/write permissions

**Pinecone connection failed:**
- Verify API key is correct
- Ensure index name matches configuration
- Check index dimensions (1536 for OpenAI embeddings)

**LLM API errors:**
- Verify Groq API key is valid
- Check API rate limits
- Ensure sufficient credits/quota


---

## Project Structure

```
CreateX/
├── backend/
│   ├── server.js                      # Express entry point
│   ├── .env                           # Environment variables
│   ├── package.json                   # Backend dependencies
│   │
│   ├── models/
│   │   ├── User.js                    # User schema (auth + stats)
│   │   ├── Content.js                 # Content schema (original + variants)
│   │   └── BrandDNA.js                # Brand guidelines schema
│   │
│   ├── routes/
│   │   ├── auth.js                    # POST /register, /login, GET /stats
│   │   ├── content.js                 # CRUD + POST /orchestrate, GET /stream/:id
│   │   └── brand.js                   # Brand DNA CRUD operations
│   │
│   ├── middleware/
│   │   └── auth.js                    # JWT verification middleware
│   │
│   ├── services/
│   │   ├── agents/
│   │   │   ├── managerAgent.js        # Orchestrator agent
│   │   │   ├── ingestAgent.js         # Content analysis agent
│   │   │   ├── generatorAgent.js      # Platform-specific generation
│   │   │   ├── reviewerAgent.js       # Brand consistency scoring
│   │   │   ├── publisherAgent.js      # Final formatting
│   │   │   ├── reflector.js           # Failure analysis
│   │   │   ├── verifiers.js           # Deterministic checks
│   │   │   ├── agentState.js          # State management
│   │   │   └── managerInteract.js     # Natural language interaction
│   │   │
│   │   ├── memory/
│   │   │   └── graphMemory.js         # Neo4j integration
│   │   │
│   │   ├── vectorStore.js             # Pinecone integration
│   │   ├── contentHandler.js          # Content type routing
│   │   ├── promptConstructor.js       # LLM prompt templates
│   │   ├── orchestrationEmitter.js    # SSE event streaming
│   │   ├── imageAPI.js                # Image generation service
│   │   └── imageStorage.js            # Cloudinary integration
│   │
│   └── test-*.js                      # Test scripts
│
├── frontend/
│   ├── package.json                   # Frontend dependencies
│   ├── public/
│   │   ├── index.html                 # HTML template
│   │   └── favicon.svg                # App icon
│   │
│   └── src/
│       ├── App.jsx                    # Main app + routing
│       ├── index.js                   # React entry point
│       ├── index.css                  # Global styles
│       │
│       ├── components/
│       │   ├── Auth/
│       │   │   ├── Login.jsx          # Login form
│       │   │   └── Register.jsx       # Registration form
│       │   │
│       │   ├── Dashboard/
│       │   │   ├── Dashboard.jsx      # Main dashboard (legacy)
│       │   │   ├── SacoDashboard.jsx  # New SACO dashboard
│       │   │   └── PremiumDashboard.jsx # Premium features
│       │   │
│       │   ├── Brand/
│       │   │   └── BrandSettings.jsx  # Brand DNA configuration
│       │   │
│       │   ├── Upload/
│       │   │   ├── ContentUpload.jsx  # Content upload form
│       │   │   └── StreamingLogs.jsx  # Real-time log viewer
│       │   │
│       │   ├── Content/
│       │   │   └── ContentDetail.jsx  # Content detail view
│       │   │
│       │   ├── History/
│       │   │   └── History.jsx        # Content history list
│       │   │
│       │   ├── AgentWorkflow/
│       │   │   └── AgentWorkflowPage.jsx # Agent workflow visualization
│       │   │
│       │   ├── AgentWorkspace/
│       │   │   ├── LiveAgentWorkspace.jsx # Live mission control
│       │   │   └── AgentDetailPage.jsx    # Individual agent details
│       │   │
│       │   ├── ManagerPanel/
│       │   │   ├── ManagerPanel.jsx   # Manager interaction UI
│       │   │   └── ConfirmationModal.jsx # Confirmation dialog
│       │   │
│       │   ├── PlatformPreviews/
│       │   │   ├── index.jsx          # Preview router
│       │   │   ├── TwitterPreview.jsx # Twitter card preview
│       │   │   ├── LinkedInPreview.jsx # LinkedIn preview
│       │   │   ├── EmailPreview.jsx   # Email preview
│       │   │   ├── InstagramPreview.jsx # Instagram preview
│       │   │   └── BlogPreview.jsx    # Blog preview
│       │   │
│       │   ├── Settings/
│       │   │   ├── Settings.jsx       # User settings
│       │   │   └── index.js           # Settings exports
│       │   │
│       │   ├── Workflow/
│       │   │   └── AgentWorkflow.jsx  # Workflow component
│       │   │
│       │   └── common/
│       │       ├── AnimatedCard.jsx   # Reusable animated card
│       │       ├── EmptyState.jsx     # Empty state component
│       │       ├── HelpTooltip.jsx    # Help tooltip
│       │       ├── KeyboardShortcutsModal.jsx # Shortcuts modal
│       │       ├── LoadingSkeleton.jsx # Loading skeleton
│       │       ├── PageTransition.jsx # Page transition wrapper
│       │       ├── Toast.jsx          # Toast notification
│       │       └── index.js           # Common exports
│       │
│       ├── context/
│       │   └── AuthContext.jsx        # Authentication context
│       │
│       ├── services/
│       │   └── api.js                 # Axios instance + API calls
│       │
│       └── theme/
│           └── index.js               # Chakra UI theme config
│
├── .git/                              # Git repository
├── .gitignore                         # Git ignore rules
├── .vscode/                           # VS Code settings
│
└── Documentation/
    ├── README.md                      # Project overview
    ├── PROJECT_DETAILS.md             # This file
    ├── design.md                      # Architecture design doc
    ├── requirements.md                # Formal requirements
    ├── AGENT_WORKFLOW_FEATURE.md      # Agent workflow feature doc
    ├── AGENT_WORKFLOW_FEATURE_V2.md   # Agent detail pages doc
    ├── LIVE_AGENT_WORKSPACE.md        # Live workspace doc
    ├── DASHBOARD_DOCUMENTATION.md     # Dashboard feature doc
    └── IMPLEMENTED_FEATURES_GUIDE.md  # Features implementation guide
```


---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

#### POST /auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "stats": {
      "totalContent": 15,
      "hitRate": 87.5,
      "automationRate": 92.3
    }
  }
}
```

#### GET /auth/stats
Get user statistics (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalContent": 15,
  "hitRate": 87.5,
  "automationRate": 92.3,
  "avgConsistencyScore": 85.2
}
```

### Brand DNA Endpoints

#### POST /brand
Create or update Brand DNA (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "companyName": "TechCorp",
  "voice": {
    "personality": "professional",
    "statement": "We make complex AI accessible"
  },
  "tone": ["friendly", "authoritative", "innovative"],
  "values": ["Innovation", "Trust", "Simplicity"],
  "guidelines": {
    "keyTerms": ["AI", "innovation", "technology"],
    "avoidWords": ["cheap", "basic", "simple"],
    "styleNotes": "Use active voice, avoid jargon"
  }
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "companyName": "TechCorp",
  "voice": { ... },
  "tone": [ ... ],
  "values": [ ... ],
  "guidelines": { ... },
  "createdAt": "2026-02-27T10:00:00.000Z",
  "updatedAt": "2026-02-27T10:00:00.000Z"
}
```

#### GET /brand
Get user's Brand DNA (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "companyName": "TechCorp",
  "voice": { ... },
  "tone": [ ... ],
  "values": [ ... ],
  "guidelines": { ... }
}
```

### Content Endpoints

#### POST /content
Create new content (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Introducing AI-Powered Analytics",
  "data": "We're excited to announce...",
  "type": "article",
  "platforms": ["twitter", "linkedin", "email"]
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "title": "Introducing AI-Powered Analytics",
  "data": "We're excited to announce...",
  "type": "article",
  "platforms": ["twitter", "linkedin", "email"],
  "status": "processing",
  "variants": [],
  "createdAt": "2026-02-27T10:00:00.000Z"
}
```

#### GET /content
Get all user content (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Introducing AI-Powered Analytics",
    "status": "completed",
    "platforms": ["twitter", "linkedin", "email"],
    "kpis": {
      "hitRate": 100,
      "automationRate": 100,
      "avgConsistencyScore": 87.5,
      "processingTime": 23.4
    },
    "createdAt": "2026-02-27T10:00:00.000Z"
  }
]
```

#### GET /content/:id
Get specific content with variants (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "Introducing AI-Powered Analytics",
  "data": "Original content...",
  "platforms": ["twitter", "linkedin", "email"],
  "variants": [
    {
      "platform": "twitter",
      "content": "🚀 Excited to launch our AI-powered analytics...",
      "metadata": {
        "charCount": 275,
        "hashtags": ["#AI", "#Analytics"]
      },
      "consistencyScore": 87.5,
      "status": "approved",
      "feedback": "Excellent brand alignment"
    }
  ],
  "kpis": { ... },
  "status": "completed"
}
```

#### POST /content/:id/orchestrate
Trigger orchestration workflow (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Orchestration started",
  "contentId": "507f1f77bcf86cd799439013"
}
```

#### GET /content/:id/stream
Get SSE stream for real-time updates (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Server-Sent Events stream
```
event: log
data: {"message": "Manager Agent: Planning workflow..."}

event: step
data: {"agent": "ingest", "platform": "all", "status": "working"}

event: variant
data: {"platform": "twitter", "content": "...", "score": 87.5}

event: complete
data: {"kpis": {...}, "variants": [...]}
```

#### GET /content/:id/agent/:agentId
Get individual agent details (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "agentId": "ingest",
  "agentName": "Ingest Agent",
  "stats": {
    "processingTime": "3.2s",
    "tasksCompleted": 5,
    "successRate": "100%"
  },
  "processSteps": [
    {
      "title": "Content Analysis",
      "description": "Analyzing content structure and themes",
      "status": "completed",
      "duration": "1.2s"
    }
  ],
  "output": {
    "themes": ["AI", "Analytics", "Innovation"],
    "keywords": ["AI", "analytics", "data", "insights"],
    "sentiment": "positive"
  }
}
```

#### POST /content/:id/interact
Interact with Manager Agent (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "command": "Make the Twitter version more casual"
}
```

**Response:**
```json
{
  "preview": "Here's what I'll change...",
  "requiresConfirmation": true
}
```


---

## Database Models

### User Model (MongoDB)

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (bcrypt hashed, required),
  createdAt: Date (default: Date.now),
  stats: {
    totalContent: Number (default: 0),
    hitRate: Number (default: 0),
    automationRate: Number (default: 0)
  }
}
```

**Indexes:**
- `email`: unique index for fast lookup

### Brand DNA Model (MongoDB)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  companyName: String (required),
  voice: {
    personality: String (required),
    statement: String (required)
  },
  tone: [String] (required),
  values: [String] (required),
  guidelines: {
    keyTerms: [String] (default: []),
    avoidWords: [String] (default: []),
    styleNotes: String (default: '')
  },
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `userId`: index for user-specific queries

### Content Model (MongoDB)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  title: String (required),
  data: String (required),
  type: String (enum: ['text', 'article', 'announcement'], default: 'text'),
  platforms: [String] (required),
  variants: [
    {
      platform: String (required),
      content: String (required),
      metadata: {
        charCount: Number,
        hashtags: [String],
        hook: String,
        subjectLine: String
      },
      consistencyScore: Number (required),
      status: String (enum: ['approved', 'flagged'], required),
      feedback: String,
      image: {
        url: String,
        prompt: String,
        provider: String
      }
    }
  ],
  kpis: {
    hitRate: Number (default: 0),
    automationRate: Number (default: 0),
    avgConsistencyScore: Number (default: 0),
    processingTime: Number (default: 0)
  },
  status: String (enum: ['processing', 'completed', 'failed'], default: 'processing'),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `userId`: index for user-specific queries
- `status`: index for filtering by status
- `createdAt`: index for sorting by date

### Vector Store Schema (Pinecone)

```javascript
{
  id: String (UUID),
  values: [Number] (1536 dimensions),
  metadata: {
    type: String ('brand_dna' | 'published' | 'template'),
    platform: String (optional),
    title: String (optional),
    score: Number (optional),
    userId: String (optional),
    timestamp: Date (optional),
    text: String (original text for reference)
  }
}
```

**Index Configuration:**
- Dimensions: 1536
- Metric: cosine similarity
- Pods: 1 (free tier)

### Graph Database Schema (Neo4j)

**Nodes:**
```cypher
// Brand node
(Brand {
  name: String,
  tone: String,
  voice: String,
  userId: String
})

// Value node
(Value {
  name: String,
  description: String
})

// Keyword node
(Keyword {
  term: String,
  category: String ('required' | 'prohibited')
})

// PastWork node
(PastWork {
  title: String,
  platform: String,
  content: String,
  score: Number,
  date: DateTime
})
```

**Relationships:**
```cypher
(Brand)-[:HAS_VALUE]->(Value)
(Brand)-[:USES_KEYWORD]->(Keyword)
(Brand)-[:AVOIDS_KEYWORD]->(Keyword)
(Brand)-[:PUBLISHED]->(PastWork)
(PastWork)-[:COVERS_TOPIC]->(Keyword)
```

**Example Queries:**
```cypher
// Get brand identity
MATCH (b:Brand {name: 'TechCorp'})-[:HAS_VALUE]->(v:Value)
RETURN b, collect(v.name) as values

// Get past works
MATCH (b:Brand {name: 'TechCorp'})-[:PUBLISHED]->(p:PastWork)
WHERE p.score > 80
RETURN p ORDER BY p.date DESC LIMIT 5

// Check keyword coherence
MATCH (b:Brand {name: 'TechCorp'})-[:AVOIDS_KEYWORD]->(k:Keyword)
WHERE k.term IN ['cheap', 'basic']
RETURN k.term
```


---

## Agent System

### Manager Agent

**Role:** Orchestrator and planner for the entire workflow

**Key Responsibilities:**
- Decompose goals into execution plans
- Delegate tasks to worker agents
- Handle failures with reflection loop
- Calculate KPIs (Hit Rate, Automation Rate, Consistency Score)
- Manage agent state across workflow

**LLM Configuration:**
- Model: Groq Llama 3.3 70B Versatile
- Temperature: 0.3 (balanced creativity and consistency)
- Max Tokens: 2000

**Key Methods:**
```javascript
orchestrate(content, brandDNA, platforms)
queryMemory(state)
planStep(state)
executeLoop(state)
reflectAndRetry(state, platform, verification)
buildResults(state, error)
```

**State Management:**
- Tracks: plan, current step, drafts, reviews, published variants, errors, history
- Calculates: hit rate, automation rate, consistency score, processing time

### Ingest Agent

**Role:** Content analysis and context enrichment via RAG

**Key Responsibilities:**
- Extract themes, keywords, sentiment
- Infer target audience
- Generate embeddings
- Retrieve similar content via RAG
- Create enriched content payload

**LLM Configuration:**
- Model: Groq Llama 3.3 70B Versatile
- Temperature: 0.2 (factual analysis)
- Max Tokens: 1500

**Output Structure:**
```javascript
{
  themes: ['AI', 'Analytics', 'Innovation'],
  keywords: ['AI', 'analytics', 'data', 'insights', 'machine learning'],
  sentiment: 'positive',
  targetAudience: 'Tech professionals and business leaders',
  keyMessages: [
    'AI-powered analytics platform launch',
    'Real-time insights with natural language',
    'Trusted by 500+ companies'
  ],
  embeddings: [0.123, -0.456, ...], // 1536 dimensions
  retrievedContext: [
    { title: 'Past Article', similarity: 0.87, content: '...' }
  ]
}
```

**RAG Implementation:**
- Embedding Model: OpenAI text-embedding-3-small
- Vector Store: Pinecone with cosine similarity
- Query: Top 3 semantically similar past content items
- Context: Brand guidelines, past content, templates

### Generator Agent

**Role:** Platform-specific content transformation with brand voice

**Key Responsibilities:**
- Create platform-specific variants
- Apply brand voice and tone
- Include required keywords
- Exclude prohibited words
- Ground facts in source content

**LLM Configuration:**
- Model: Groq Llama 3.3 70B Versatile
- Temperature: 0.7 (creative but controlled)
- Max Tokens: 3000

**Platform Specifications:**
```javascript
{
  twitter: {
    maxChars: 280,
    style: 'punchy, hashtags, threads',
    tone: 'casual, engaging'
  },
  linkedin: {
    maxChars: 3000,
    style: 'professional, thought-leadership',
    tone: 'authoritative, insightful'
  },
  email: {
    maxChars: 5000,
    style: 'newsletter, scannable',
    tone: 'friendly, informative'
  },
  instagram: {
    maxChars: 2200,
    style: 'visual, storytelling, emojis',
    tone: 'emotional, authentic'
  },
  blog: {
    maxChars: 10000,
    style: 'long-form, SEO-optimized, headers',
    tone: 'comprehensive, educational'
  }
}
```

**Fact Grounding:**
- Generator ONLY uses information from enriched input
- Does NOT invent facts or statistics
- Every claim traceable to source content

### Reviewer Agent

**Role:** Brand consistency scoring and quality gate enforcement

**Key Responsibilities:**
- Score brand consistency with weighted criteria
- Enforce 80% threshold gate
- Generate actionable feedback
- Fallback scoring mechanism

**LLM Configuration:**
- Model: Groq Llama 3.3 70B Versatile
- Temperature: 0.1 (objective scoring)
- Max Tokens: 1000

**Scoring Criteria (Weighted):**
```javascript
{
  toneMatch: {
    weight: 0.30,
    description: 'Alignment with brand voice and personality'
  },
  valueAlignment: {
    weight: 0.25,
    description: 'Brand values reflected in content'
  },
  keywordUsage: {
    weight: 0.15,
    description: 'Required keywords present'
  },
  avoidWordsCheck: {
    weight: 0.15,
    description: 'Prohibited words absent'
  },
  audienceFit: {
    weight: 0.15,
    description: 'Appropriate for target audience'
  }
}
```

**Threshold Gate:**
- Pass: Score >= 80% → Variant approved
- Fail: Score < 80% → Variant flagged for review

**Fallback Mechanism:**
- If LLM scoring fails: Use cosine similarity between variant embedding and brand DNA embedding
- Convert similarity (0-1) to percentage score

### Publisher Agent

**Role:** Final formatting and platform API preparation

**Key Responsibilities:**
- Format content for platform APIs
- Generate platform-specific metadata
- Create API-ready payloads
- Log for audit trail

**Platform-Specific Formatting:**

**Twitter:**
- Thread format (1/n) if content exceeds 280 chars
- Hashtag placement optimization (end of tweet)
- Character count validation
- URL shortening consideration

**LinkedIn:**
- Professional hook enhancement
- Visibility settings (PUBLIC)
- Engagement CTA placement
- Line break optimization for readability

**Email:**
- Subject line extraction/generation
- HTML body generation with styling
- Plain text fallback
- Preview text (first 100 chars)

**Instagram:**
- Caption with strategic line breaks
- Hashtag block at end (up to 30)
- Emoji optimization for engagement
- First comment strategy for additional hashtags

**Blog:**
- SEO metadata (title, description, keywords)
- HTML structure (H1, H2, H3 hierarchy)
- Markdown alternative
- Internal linking suggestions

### Verifiers (Deterministic Quality Checks)

**Role:** Code-based verification before AI scoring

**Key Functions:**
```javascript
checkLength(content, platform)
checkKeywords(content, requiredKeywords)
checkForbiddenPhrases(content, forbidden)
checkNoCodeBlocks(content)
checkPlatformStructure(content, platform)
verifyAll(variant, options)
```

**Platform Limits:**
```javascript
{
  twitter: { min: 50, max: 280 },
  linkedin: { min: 100, max: 3000 },
  email: { min: 200, max: 5000 },
  instagram: { min: 50, max: 2200 },
  blog: { min: 500, max: 10000 }
}
```

**Verification Priority:**
- Critical: length, codeBlocks, forbidden phrases, score threshold
- Non-Critical: keywords, structure (warnings only)
- Overall pass requires all critical checks to pass

### Reflector (Failure Analysis)

**Role:** Analyze failures and generate retry strategies

**Key Methods:**
```javascript
reflect(errorSummary, context)
shouldRetry(reflection, retryCount, maxRetries)
enhanceContext(originalContext, reflection)
```

**Reflection Strategies:**
```javascript
[
  'add_more_brand_context',      // Include more brand guidelines
  'simplify_language',           // Reduce complexity
  'adjust_tone',                 // Modify tone direction
  'emphasize_keywords',          // Strengthen keyword usage
  'shorten_content',             // Reduce length
  'restructure_content',         // Change structure
  'escalate_to_human'            // Cannot auto-fix
]
```

**Retry Logic:**
- Max retries: 3 per platform
- Each retry includes reflection strategy in prompt
- After 3 failures: Escalate to human review
- Successful recovery strategies logged for learning


---

## Memory Architecture

### Vector Store (Pinecone)

**Purpose:** Semantic search and memory persistence for RAG

**Configuration:**
- Index Name: `saco`
- Dimensions: 1536 (OpenAI text-embedding-3-small)
- Metric: Cosine similarity
- Namespace: Per-user isolation (optional)

**Key Operations:**

**Initialize:**
```javascript
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index('saco');
```

**Embed Text:**
```javascript
const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small',
  openAIApiKey: process.env.OPENAI_API_KEY
});
const vector = await embeddings.embedQuery(text);
```

**Upsert Vector:**
```javascript
await index.upsert([{
  id: uuid(),
  values: vector,
  metadata: {
    type: 'brand_dna',
    userId: user._id,
    text: originalText,
    timestamp: new Date()
  }
}]);
```

**Query Similar Content:**
```javascript
const results = await index.query({
  vector: queryVector,
  topK: 3,
  includeMetadata: true
});
```

**Use Cases:**
- Store brand DNA embeddings for semantic retrieval
- Store published content for learning
- Retrieve similar past content during generation
- Find templates matching content type

### Graph Database (Neo4j)

**Purpose:** Brand identity relationships and coherence checking

**Configuration:**
- URI: `neo4j+s://your-instance.databases.neo4j.io`
- Database: `neo4j`
- Authentication: Username/Password

**Key Operations:**

**Initialize:**
```javascript
const neo4j = require('neo4j-driver');
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME,
    process.env.NEO4J_PASSWORD
  )
);
```

**Store Brand DNA:**
```cypher
CREATE (b:Brand {
  name: $companyName,
  tone: $tone,
  voice: $voice,
  userId: $userId
})
WITH b
UNWIND $values AS value
CREATE (v:Value {name: value})
CREATE (b)-[:HAS_VALUE]->(v)
WITH b
UNWIND $keyTerms AS term
CREATE (k:Keyword {term: term, category: 'required'})
CREATE (b)-[:USES_KEYWORD]->(k)
```

**Query Brand Identity:**
```cypher
MATCH (b:Brand {name: $companyName})
OPTIONAL MATCH (b)-[:HAS_VALUE]->(v:Value)
OPTIONAL MATCH (b)-[:USES_KEYWORD]->(k:Keyword)
OPTIONAL MATCH (b)-[:AVOIDS_KEYWORD]->(a:Keyword)
RETURN b, collect(DISTINCT v.name) as values,
       collect(DISTINCT k.term) as keywords,
       collect(DISTINCT a.term) as avoidWords
```

**Record Past Work:**
```cypher
MATCH (b:Brand {name: $companyName})
CREATE (p:PastWork {
  title: $title,
  platform: $platform,
  content: $content,
  score: $score,
  date: datetime()
})
CREATE (b)-[:PUBLISHED]->(p)
WITH p
UNWIND $topics AS topic
MATCH (k:Keyword {term: topic})
CREATE (p)-[:COVERS_TOPIC]->(k)
```

**Check Coherence:**
```cypher
MATCH (b:Brand {name: $companyName})-[:AVOIDS_KEYWORD]->(k:Keyword)
WHERE any(word IN $contentWords WHERE word = k.term)
RETURN k.term as violatedWord
```

**Use Cases:**
- Store brand identity as graph structure
- Track relationships between brand values and keywords
- Record past work with topic connections
- Check content coherence with brand guidelines
- Analyze brand evolution over time

### MongoDB (Primary Database)

**Purpose:** Primary data storage for users, content, and brand DNA

**Configuration:**
- URI: `mongodb+srv://username:password@cluster.mongodb.net/saco`
- Database: `saco`
- Collections: `users`, `contents`, `branddnas`

**Connection:**
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

**Indexes:**
```javascript
// User collection
db.users.createIndex({ email: 1 }, { unique: true });

// Content collection
db.contents.createIndex({ userId: 1 });
db.contents.createIndex({ status: 1 });
db.contents.createIndex({ createdAt: -1 });

// BrandDNA collection
db.branddnas.createIndex({ userId: 1 });
```

**Use Cases:**
- Store user accounts and authentication
- Store original content and generated variants
- Store brand DNA configurations
- Track user statistics and KPIs
- Maintain content history

### Memory Integration Flow

1. **Brand DNA Creation:**
   - Store in MongoDB (primary)
   - Generate embeddings → Store in Pinecone (semantic search)
   - Create graph structure → Store in Neo4j (relationships)

2. **Content Processing:**
   - Retrieve Brand DNA from MongoDB
   - Query Pinecone for similar past content (RAG)
   - Query Neo4j for brand identity context
   - Enrich content with retrieved context

3. **Content Completion:**
   - Store variants in MongoDB
   - Generate variant embeddings → Store in Pinecone
   - Record past work → Store in Neo4j with topic connections
   - Update user statistics in MongoDB

4. **Memory Retrieval:**
   - MongoDB: Fast structured queries (user data, content CRUD)
   - Pinecone: Semantic similarity search (RAG, templates)
   - Neo4j: Relationship queries (brand coherence, topic connections)


---

## Frontend Components

### Authentication Components

**Login.jsx**
- Email/password form with validation
- JWT token storage in localStorage
- Redirect to dashboard on success
- Error handling with toast notifications

**Register.jsx**
- User registration form
- Password strength validation
- Automatic login after registration
- Terms of service acceptance

### Dashboard Components

**SacoDashboard.jsx** (Main Dashboard)
- Personalized greeting with time-based message
- KPI cards (Total Content, Hit Rate, Automation Rate, Avg Consistency)
- Activity chart (Recharts line chart)
- Recent content table with status badges
- Quick actions (Upload Content, Brand Settings)
- Responsive grid layout

**PremiumDashboard.jsx**
- Advanced analytics
- Custom date range filtering
- Export functionality
- Premium features showcase

### Brand Components

**BrandSettings.jsx**
- Brand DNA configuration form
- Voice and tone selection
- Values management (add/remove)
- Keywords and prohibited words lists
- Style notes textarea
- Real-time validation
- Save with confirmation

### Upload Components

**ContentUpload.jsx**
- Title and content input
- Platform selection (multi-select checkboxes)
- Content type dropdown
- Character count display
- Drag-and-drop file upload (future)
- Submit triggers orchestration
- Redirect to Live Agent Workspace

**StreamingLogs.jsx**
- Real-time SSE log viewer
- Auto-scroll to latest log
- Color-coded log levels
- Timestamp display
- Connection status indicator

### Content Components

**ContentDetail.jsx**
- Original content display
- Platform variants tabs
- Consistency score badges
- Copy to clipboard functionality
- Platform preview cards
- Edit and regenerate actions
- KPI summary

### Agent Workspace Components

**LiveAgentWorkspace.jsx** (Mission Control)
- Full-screen glassmorphism layout
- 5 agent cards in grid
- Real-time progress bars with shimmer
- Status pulsing (blue → green → gray)
- Terminal logs per agent
- Animated SVG connection lines with particles
- Avatar animations (thinking dots, pulse, checkmark)
- Master progress bar with milestones
- Success confetti on completion
- Auto-redirect to results
- Back to dashboard button

**AgentDetailPage.jsx**
- Individual agent focus view
- Stats grid (processing time, tasks completed, success rate)
- Process steps timeline
- Step status indicators (pending, working, completed, failed)
- Output display with formatted results
- Back to workspace button

### Platform Preview Components

**TwitterPreview.jsx**
- Twitter card mockup
- Character count display
- Hashtag highlighting
- Thread indicator if multi-tweet

**LinkedInPreview.jsx**
- LinkedIn post mockup
- Professional styling
- Engagement buttons (Like, Comment, Share)

**EmailPreview.jsx**
- Email client mockup
- Subject line preview
- HTML body rendering
- Mobile/desktop toggle

**InstagramPreview.jsx**
- Instagram post mockup
- Caption with line breaks
- Hashtag styling
- Like/comment UI

**BlogPreview.jsx**
- Blog article layout
- SEO metadata display
- Table of contents
- Reading time estimate

### Common Components

**AnimatedCard.jsx**
- Reusable card with Framer Motion
- Hover tilt effect
- Glassmorphism styling
- Customizable variants

**EmptyState.jsx**
- Empty state illustrations
- Call-to-action buttons
- Contextual messages

**HelpTooltip.jsx**
- Info icon with tooltip
- Keyboard shortcut hints
- Contextual help text

**LoadingSkeleton.jsx**
- Shimmer loading effect
- Customizable shapes
- Responsive sizing

**PageTransition.jsx**
- Smooth page transitions
- Fade in/out animations
- Route change handling

**Toast.jsx**
- Success/error/info notifications
- Auto-dismiss timer
- Action buttons
- Stack management

### Context Providers

**AuthContext.jsx**
- User authentication state
- Login/logout functions
- Token management
- Protected route wrapper
- User profile data

### Services

**api.js**
- Axios instance configuration
- Request/response interceptors
- JWT token injection
- Error handling
- API endpoint functions:
  - `register(email, password)`
  - `login(email, password)`
  - `getStats()`
  - `getBrandDNA()`
  - `saveBrandDNA(data)`
  - `createContent(data)`
  - `getContent(id)`
  - `getAllContent()`
  - `orchestrateContent(id)`
  - `getContentStream(id)`
  - `getAgentDetail(contentId, agentId)`
  - `interactWithManager(contentId, command)`

### Theme Configuration

**theme/index.js**
- Chakra UI theme customization
- Color palette (indigo primary, dark background)
- Typography scale
- Component style overrides
- Glassmorphism utilities
- Animation variants
- Responsive breakpoints


---

## Configuration

### Environment Variables

**Backend (.env)**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/saco

# Authentication
JWT_SECRET=your-secret-key-minimum-32-characters-long

# LLM Provider (Groq)
GROQ_API_KEY=gsk_your_groq_api_key_here

# OpenAI (for embeddings)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Vector Database (Pinecone)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=saco
PINECONE_ENVIRONMENT=us-east-1-aws

# Graph Database (Neo4j) - Optional
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password_here

# Image Generation - Optional
STABILITY_API_KEY=sk-your_stability_api_key_here
HUGGINGFACE_API_KEY=hf_your_huggingface_api_key_here

# Image Storage (Cloudinary) - Optional
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Feature Flags
ENABLE_IMAGE_GENERATION=false
ENABLE_GRAPH_MEMORY=false
ENABLE_MANAGER_INTERACTION=true

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=60
MAX_CONTENT_SIZE_MB=5

# Logging
LOG_LEVEL=info
```

**Frontend (Environment Variables)**
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_PREMIUM_FEATURES=false
```

### LLM Configuration

**Groq Settings:**
```javascript
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.3-70b-versatile',
  temperature: 0.3,  // Adjust per agent
  maxTokens: 2000,
  streaming: false
});
```

**Temperature Guidelines:**
- Manager Agent: 0.3 (balanced planning)
- Ingest Agent: 0.2 (factual analysis)
- Generator Agent: 0.7 (creative generation)
- Reviewer Agent: 0.1 (objective scoring)

### Pinecone Configuration

**Index Setup:**
```javascript
// Create index (one-time setup)
await pinecone.createIndex({
  name: 'saco',
  dimension: 1536,
  metric: 'cosine',
  spec: {
    serverless: {
      cloud: 'aws',
      region: 'us-east-1'
    }
  }
});
```

**Query Configuration:**
```javascript
const queryConfig = {
  topK: 3,              // Number of results
  includeMetadata: true, // Include metadata
  includeValues: false   // Exclude vectors (save bandwidth)
};
```

### Neo4j Configuration

**Connection Settings:**
```javascript
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME,
    process.env.NEO4J_PASSWORD
  ),
  {
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 60000,
    encrypted: 'ENCRYPTION_ON'
  }
);
```

**Session Configuration:**
```javascript
const session = driver.session({
  database: 'neo4j',
  defaultAccessMode: neo4j.session.WRITE
});
```

### MongoDB Configuration

**Connection Options:**
```javascript
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});
```

### CORS Configuration

**Backend CORS Settings:**
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Rate Limiting

**Express Rate Limiter:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

### Security Configuration

**Helmet.js:**
```javascript
const helmet = require('helmet');
app.use(helmet());
```

**JWT Configuration:**
```javascript
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  algorithm: 'HS256'
};
```

**Password Hashing:**
```javascript
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```


---

## Deployment

### Production Deployment Checklist

#### Pre-Deployment

- [ ] Update environment variables for production
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URIs
- [ ] Set up SSL certificates
- [ ] Configure CDN for static assets
- [ ] Enable production logging
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Test all API endpoints
- [ ] Run security audit

#### Backend Deployment (AWS/Heroku/Railway)

**AWS EC2 Deployment:**

1. Launch EC2 instance (Ubuntu 22.04 LTS)
2. Install Node.js 18+
3. Clone repository
4. Install dependencies: `npm install --production`
5. Set environment variables
6. Install PM2: `npm install -g pm2`
7. Start server: `pm2 start server.js --name saco-backend`
8. Configure Nginx reverse proxy
9. Set up SSL with Let's Encrypt
10. Configure security groups (port 443, 80)

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**PM2 Ecosystem File (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [{
    name: 'saco-backend',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

#### Frontend Deployment (Vercel/Netlify)

**Vercel Deployment:**

1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Build production bundle: `npm run build`
4. Deploy: `vercel --prod`
5. Configure environment variables in Vercel dashboard
6. Set up custom domain
7. Enable automatic deployments from Git

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Netlify Deployment:**

1. Build production bundle: `npm run build`
2. Install Netlify CLI: `npm install -g netlify-cli`
3. Deploy: `netlify deploy --prod --dir=build`
4. Configure redirects for SPA routing

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Database Setup

**MongoDB Atlas:**
- Create production cluster
- Configure IP whitelist (0.0.0.0/0 or specific IPs)
- Set up database users with appropriate permissions
- Enable backup and point-in-time recovery
- Configure monitoring and alerts

**Pinecone:**
- Create production index
- Configure pod type (s1 or p1 for production)
- Set up API key rotation
- Enable monitoring

**Neo4j Aura:**
- Create production instance
- Configure connection limits
- Set up backup schedule
- Enable query logging

#### Monitoring and Logging

**Application Monitoring:**
- Set up New Relic or Datadog
- Configure error tracking (Sentry)
- Set up uptime monitoring (UptimeRobot)
- Configure log aggregation (Loggly, Papertrail)

**Health Check Endpoint:**
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

#### Security Hardening

- Enable HTTPS only
- Set secure HTTP headers (Helmet.js)
- Implement rate limiting
- Enable CORS with specific origins
- Use environment variables for secrets
- Implement API key rotation
- Set up Web Application Firewall (WAF)
- Enable DDoS protection
- Regular security audits
- Dependency vulnerability scanning

#### Backup Strategy

**MongoDB:**
- Automated daily backups
- Point-in-time recovery enabled
- Backup retention: 30 days
- Test restore procedures monthly

**Pinecone:**
- Export vectors periodically
- Store backups in S3
- Document restore procedures

**Neo4j:**
- Automated daily backups
- Export graph data weekly
- Test restore procedures

#### Performance Optimization

- Enable gzip compression
- Implement CDN for static assets
- Use connection pooling for databases
- Implement caching (Redis)
- Optimize database queries
- Enable HTTP/2
- Minify and bundle frontend assets
- Lazy load components
- Implement code splitting

#### Scaling Strategy

**Horizontal Scaling:**
- Use load balancer (AWS ELB, Nginx)
- Deploy multiple backend instances
- Implement session management (Redis)
- Use message queue for async tasks (RabbitMQ, AWS SQS)

**Vertical Scaling:**
- Upgrade server resources as needed
- Monitor resource usage
- Optimize memory usage
- Profile and optimize slow queries


---

## Testing

### Testing Strategy

**Unit Tests:**
- Test individual agent functions
- Test utility functions
- Test API route handlers
- Test database models

**Integration Tests:**
- Test agent orchestration flow
- Test API endpoints end-to-end
- Test database operations
- Test external service integrations

**End-to-End Tests:**
- Test complete user workflows
- Test UI interactions
- Test real-time streaming
- Test error scenarios

### Backend Testing

**Test Framework:**
- Jest for unit tests
- Supertest for API testing
- MongoDB Memory Server for database testing

**Example Test Setup:**
```javascript
// test/setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});
```

**Example Unit Test:**
```javascript
// test/agents/ingestAgent.test.js
const { IngestAgent } = require('../../services/agents/ingestAgent');

describe('IngestAgent', () => {
  test('should extract themes from content', async () => {
    const content = {
      title: 'AI Innovation',
      data: 'We are launching an AI-powered analytics platform...'
    };
    
    const result = await IngestAgent.process(content, mockBrandDNA);
    
    expect(result.themes).toHaveLength(3);
    expect(result.themes).toContain('AI');
    expect(result.sentiment).toBe('positive');
  });
});
```

**Example API Test:**
```javascript
// test/routes/auth.test.js
const request = require('supertest');
const app = require('../../server');

describe('Auth Routes', () => {
  test('POST /auth/register should create new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');
  });
  
  test('POST /auth/login should authenticate user', async () => {
    // First register
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    // Then login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

### Frontend Testing

**Test Framework:**
- React Testing Library
- Jest for unit tests
- Cypress for E2E tests

**Example Component Test:**
```javascript
// src/components/Auth/Login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from './Login';
import { AuthProvider } from '../../context/AuthContext';

describe('Login Component', () => {
  test('should render login form', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  test('should submit login form', async () => {
    const mockLogin = jest.fn();
    
    render(
      <AuthProvider value={{ login: mockLogin }}>
        <Login />
      </AuthProvider>
    );
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
```

**Example E2E Test (Cypress):**
```javascript
// cypress/e2e/content-workflow.cy.js
describe('Content Workflow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.login('test@example.com', 'password123');
  });
  
  it('should create and orchestrate content', () => {
    // Navigate to upload page
    cy.contains('Upload Content').click();
    
    // Fill form
    cy.get('input[name="title"]').type('Test Article');
    cy.get('textarea[name="content"]').type('This is a test article about AI...');
    cy.get('input[value="twitter"]').check();
    cy.get('input[value="linkedin"]').check();
    
    // Submit
    cy.contains('Start Orchestration').click();
    
    // Verify redirect to workspace
    cy.url().should('include', '/workspace/');
    
    // Wait for completion
    cy.contains('All agents completed', { timeout: 60000 });
    
    // Verify results
    cy.contains('Twitter').should('be.visible');
    cy.contains('LinkedIn').should('be.visible');
  });
});
```

### Manual Testing Checklist

**Authentication:**
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] Protected routes redirect to login

**Brand DNA:**
- [ ] Create brand DNA
- [ ] Update brand DNA
- [ ] Retrieve brand DNA
- [ ] Validate required fields

**Content Upload:**
- [ ] Upload content with all platforms
- [ ] Upload content with single platform
- [ ] Validate minimum character count
- [ ] Validate platform selection

**Orchestration:**
- [ ] Watch real-time progress
- [ ] Verify all agents execute
- [ ] Check variant generation
- [ ] Verify consistency scores
- [ ] Test failure scenarios

**Agent Workspace:**
- [ ] View live agent status
- [ ] Click agent cards
- [ ] View agent details
- [ ] Check process steps
- [ ] Verify animations

**Content Detail:**
- [ ] View original content
- [ ] View all variants
- [ ] Copy to clipboard
- [ ] View platform previews
- [ ] Check KPIs

**Dashboard:**
- [ ] View KPI cards
- [ ] Check activity chart
- [ ] View recent content
- [ ] Use quick actions

### Performance Testing

**Load Testing (Artillery):**
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
scenarios:
  - name: "Content orchestration"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "token"
      - post:
          url: "/api/content"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            title: "Test Content"
            data: "Test content body..."
            platforms: ["twitter", "linkedin"]
```

Run: `artillery run artillery-config.yml`

### Test Coverage Goals

- Unit Tests: 80%+ coverage
- Integration Tests: 70%+ coverage
- E2E Tests: Critical user paths
- Performance Tests: All API endpoints

### Continuous Integration

**GitHub Actions Workflow:**
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install backend dependencies
        run: cd backend && npm install
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Install frontend dependencies
        run: cd frontend && npm install
      
      - name: Run frontend tests
        run: cd frontend && npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and commit: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style

- Use ESLint for JavaScript linting
- Follow Airbnb JavaScript Style Guide
- Use Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for functions

### Pull Request Guidelines

- Update documentation for new features
- Add tests for new functionality
- Ensure all tests pass
- Update CHANGELOG.md
- Request review from maintainers

---

## License

Built for AI Bharat AWS Hackathon 2026

---

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/saco/issues)
- Email: support@saco.ai
- Documentation: [docs.saco.ai](https://docs.saco.ai)

---

## Acknowledgments

- AI Bharat for organizing the hackathon
- AWS for cloud infrastructure support
- Groq for LLM API access
- Pinecone for vector database
- Neo4j for graph database
- OpenAI for embedding models
- Stability AI for image generation

---

**SACO** - From cosmetic AI to systemic intelligence

*Transforming content workflows, one agent at a time*

=======
# SACO - Systemic AI Content Orchestrator
## Complete Project Documentation

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Installation & Setup](#installation--setup)
6. [Project Structure](#project-structure)
7. [API Documentation](#api-documentation)
8. [Database Models](#database-models)
9. [Agent System](#agent-system)
10. [Memory Architecture](#memory-architecture)
11. [Frontend Components](#frontend-components)
12. [Configuration](#configuration)
13. [Deployment](#deployment)
14. [Testing](#testing)

---

## Project Overview

**SACO (Systemic AI Content Orchestrator)** is an AI-powered multi-agent platform that transforms content once and intelligently adapts it for multiple platforms while maintaining perfect brand consistency.

### Problem Statement
Marketing teams spend 60-70% of their time on manual content adaptation rather than strategy. Traditional AI tools suffer from the "amnesia problem" where each request starts from scratch with no memory or context.

### Solution
SACO implements a hierarchical Multi-Agent System (MAS) with 5 specialized AI agents that collaborate to achieve the COPE principle (Create Once, Publish Everywhere).

### Key Innovation
- **Systemic AI over Cosmetic AI**: Coordinated team of specialized agents instead of a single monolithic model
- **Dual Memory Architecture**: Vector DB (Pinecone) + Graph DB (Neo4j) for persistent brand knowledge
- **Human-on-the-Loop (HOTL)**: 80-90% autonomous operation with human intervention only for exceptions
- **Self-Correcting Pipeline**: Reflection loop enables autonomous error recovery

### Target Platforms
- Twitter (280 chars, punchy style)
- LinkedIn (3000 chars, professional tone)
- Email (5000 chars, newsletter format)
- Instagram (2200 chars, visual storytelling)
- Blog (10000 chars, SEO-optimized)


---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE LAYER                       │
│                   (React 18 + Real-time SSE)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                     API GATEWAY LAYER                           │
│              (Express.js + JWT Authentication)                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  ORCHESTRATION LAYER                            │
│                                                                 │
│              ┌─────────────────────────────┐                    │
│              │     MANAGER AGENT           │                    │
│              │  (Orchestrator & Planner)   │                    │
│              └──────────┬──────────────────┘                    │
│                         │                                       │
│        ┌────────────────┼────────────────┐                      │
│        │                │                │                      │
│        ▼                ▼                ▼                      │
│   ┌────────┐      ┌─────────┐      ┌─────────┐                 │
│   │ Ingest │      │Generator│      │ Reviewer│                 │
│   │ Agent  │      │  Agent  │      │  Agent  │                 │
│   └────────┘      └─────────┘      └─────────┘                 │
│        │                │                │                      │
│        └────────────────┼────────────────┘                      │
│                         │                                       │
│                         ▼                                       │
│                  ┌─────────────┐                                │
│                  │  Publisher  │                                │
│                  │    Agent    │                                │
│                  └─────────────┘                                │
└─────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   VERIFICATION LAYER                            │
│   ┌──────────────┐              ┌──────────────┐               │
│   │  Verifiers   │              │  Reflector   │               │
│   │ (Deterministic│              │ (Failure     │               │
│   │  Checks)     │              │  Analysis)   │               │
│   └──────────────┘              └──────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                     MEMORY LAYER                                │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │  Vector DB   │  │   Graph DB   │  │   MongoDB    │         │
│   │  (Pinecone)  │  │   (Neo4j)    │  │   (Primary)  │         │
│   │ • Semantic   │  │ • Brand      │  │ • Users      │         │
│   │   Search     │  │   Identity   │  │ • Content    │         │
│   │ • RAG        │  │ • Beliefs    │  │ • Variants   │         │
│   │ • Embeddings │  │ • Relations  │  │ • Stats      │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Agent Hierarchy

**Orchestration Layer:**
- **Manager Agent**: Plans workflow, delegates tasks, handles failures, calculates KPIs

**Worker Layer:**
- **Ingest Agent**: Analyzes content, extracts metadata, retrieves context via RAG
- **Generator Agent**: Creates platform-specific variants with brand voice
- **Reviewer Agent**: Scores brand consistency, enforces 80% threshold
- **Publisher Agent**: Formats for platform APIs, prepares final deliverables

**Governance Layer:**
- **Verifiers**: Deterministic quality checks (length, keywords, structure)
- **Reflector**: Failure analysis and retry strategy generation

### Data Flow

1. **User Input** → Content + Platform Selection + Brand DNA
2. **Manager Planning** → Decomposes goal into execution plan
3. **Memory Query** → Retrieves context from Vector DB + Graph DB
4. **Ingest** → Analyzes content, extracts themes/keywords, enriches with context
5. **Generation Loop** (per platform):
   - Generator creates variant
   - Reviewer scores brand consistency
   - Verifiers run deterministic checks
   - If failed: Reflector analyzes → Retry with new strategy
   - If passed: Proceed to next platform
6. **Publishing** → Format approved variants for platform APIs
7. **Memory Persistence** → Store outcomes in Vector DB + Graph DB
8. **Results** → Return variants + KPIs to user


---

## Technology Stack

### Frontend
- **Framework**: React 18.2.0
- **UI Library**: Chakra UI 2.10.9
- **Animation**: Framer Motion 12.34.0
- **State Management**: React Context API + TanStack Query 5.90.20
- **Routing**: React Router DOM 6.20.0
- **Charts**: Recharts 3.7.0
- **Flow Diagrams**: XYFlow React 12.10.1
- **Icons**: Lucide React 0.575.0, React Icons 5.5.0
- **Forms**: React Hook Form 7.71.1 + Zod 4.3.6
- **HTTP Client**: Axios 1.6.0
- **Notifications**: React Hot Toast 2.6.0
- **Confetti**: React Confetti 6.4.0

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB 8.0.0 (Mongoose ODM)
- **Vector DB**: Pinecone 2.0.0
- **Graph DB**: Neo4j 5.18.0
- **LLM Framework**: LangChain 0.1.0
  - @langchain/groq 0.0.15
  - @langchain/openai 0.0.25
  - @langchain/community 0.2.28
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3
- **Image Generation**: 
  - Stability AI (via axios)
  - HuggingFace Inference 4.13.11
- **Image Storage**: Cloudinary 2.9.0
- **UUID**: uuid 9.0.0

### AI/ML Services
- **LLM Provider**: Groq (Llama 3.3 70B Versatile)
- **Embedding Model**: OpenAI text-embedding-3-small (1536 dimensions)
- **Image Generation**: Stability AI Ultra, HuggingFace Stable Diffusion
- **Vector Search**: Pinecone (cosine similarity)
- **Graph Database**: Neo4j (brand identity relationships)

### Development Tools
- **Package Manager**: npm
- **Dev Server**: nodemon 3.0.2
- **Build Tool**: React Scripts 5.0.1
- **Version Control**: Git

### Deployment
- **Frontend**: Localhost:3000 (development)
- **Backend**: Localhost:5000 (development)
- **Production**: AWS/Vercel (recommended)


---

## Features

### Core Features

#### 1. Multi-Agent Orchestration
- Hierarchical agent system with specialized roles
- Manager agent coordinates workflow and handles failures
- Worker agents (Ingest, Generator, Reviewer, Publisher) execute tasks
- Autonomous error recovery with reflection loop
- Real-time progress tracking via Server-Sent Events (SSE)

#### 2. Brand DNA Management
- Define brand voice, tone, values, and guidelines
- Required keywords and prohibited words enforcement
- Vector embeddings for semantic brand consistency
- Graph database for brand identity relationships
- Persistent brand memory across all content

#### 3. Content Transformation (COPE Pipeline)
- Create Once, Publish Everywhere workflow
- Platform-specific adaptation (Twitter, LinkedIn, Email, Instagram, Blog)
- Semantic understanding of themes, keywords, and sentiment
- Context-aware generation with RAG (Retrieval-Augmented Generation)
- Fact grounding to prevent AI hallucinations

#### 4. Brand Consistency Verification
- Weighted scoring system (tone 30%, values 25%, keywords 15%, prohibited words 15%, audience fit 15%)
- 80% threshold gate for quality assurance
- Deterministic checks before AI scoring
- Fallback scoring mechanism (cosine similarity)
- Actionable feedback for flagged content

#### 5. Live Agent Workspace
- Full-screen mission control interface
- Real-time agent status monitoring
- Animated progress bars with shimmer effects
- Status pulsing (blue → green → gray)
- Terminal logs streaming per agent
- Animated SVG connection lines with flowing particles
- Avatar animations (thinking dots, pulse, checkmark)
- Master progress bar with milestones
- Success confetti on completion
- Auto-redirect to results page

#### 6. Individual Agent Detail Pages
- Dedicated page for each agent showing user-friendly processes
- Stats grid (processing time, tasks completed, success rate)
- Process steps with title, description, status, duration
- Output display with formatted results
- Clickable agent cards from workspace

#### 7. Dashboard & Analytics
- KPI tracking (Hit Rate, Automation Rate, Consistency Score)
- Content performance charts
- Recent activity timeline
- Quick actions for content creation
- User statistics and history

#### 8. Image Generation
- AI-generated images matching brand style
- Platform-specific dimensions
- Multi-provider support (Stability AI, HuggingFace)
- Fallback mechanism for reliability
- Cloudinary storage integration

#### 9. Manager Agent Interaction
- Natural language commands for content modification
- Dry-run preview before execution
- Context-aware understanding of requests
- Confirmation workflow for changes

#### 10. Real-Time Streaming
- Server-Sent Events (SSE) for live updates
- Natural language progress logs
- Variant generation notifications
- KPI updates on completion
- Error notifications with details


---

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- Groq API key (free tier available)
- Pinecone account (free tier)
- Neo4j Aura account (optional, free tier)
- Stability AI API key (optional, for image generation)

### Step 1: Clone Repository
```bash
cd d:\projects\CreateX
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
```

Edit `backend/.env` with your credentials:
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/saco
JWT_SECRET=your-secret-key-here-minimum-32-characters
GROQ_API_KEY=gsk_your_groq_key_here
OPENAI_API_KEY=sk-your-openai-key-here
PINECONE_API_KEY=your-pinecone-key-here
PINECONE_INDEX=saco
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-neo4j-password
STABILITY_API_KEY=sk-your-stability-key (optional)
HUGGINGFACE_API_KEY=hf_your-huggingface-key (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name (optional)
CLOUDINARY_API_KEY=your-api-key (optional)
CLOUDINARY_API_SECRET=your-api-secret (optional)
```

Start backend server:
```bash
npm start
```

Backend will run on `http://localhost:5000`

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

Frontend will run on `http://localhost:3000`

### Step 4: Verify Installation

1. Open browser to `http://localhost:3000`
2. Register a new account
3. Set up Brand DNA in settings
4. Upload test content
5. Watch agents work in real-time

### Troubleshooting

**Port 3000 already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**MongoDB connection failed:**
- Verify MongoDB Atlas IP whitelist includes your IP
- Check connection string format
- Ensure database user has read/write permissions

**Pinecone connection failed:**
- Verify API key is correct
- Ensure index name matches configuration
- Check index dimensions (1536 for OpenAI embeddings)

**LLM API errors:**
- Verify Groq API key is valid
- Check API rate limits
- Ensure sufficient credits/quota


---

## Project Structure

```
CreateX/
├── backend/
│   ├── server.js                      # Express entry point
│   ├── .env                           # Environment variables
│   ├── package.json                   # Backend dependencies
│   │
│   ├── models/
│   │   ├── User.js                    # User schema (auth + stats)
│   │   ├── Content.js                 # Content schema (original + variants)
│   │   └── BrandDNA.js                # Brand guidelines schema
│   │
│   ├── routes/
│   │   ├── auth.js                    # POST /register, /login, GET /stats
│   │   ├── content.js                 # CRUD + POST /orchestrate, GET /stream/:id
│   │   └── brand.js                   # Brand DNA CRUD operations
│   │
│   ├── middleware/
│   │   └── auth.js                    # JWT verification middleware
│   │
│   ├── services/
│   │   ├── agents/
│   │   │   ├── managerAgent.js        # Orchestrator agent
│   │   │   ├── ingestAgent.js         # Content analysis agent
│   │   │   ├── generatorAgent.js      # Platform-specific generation
│   │   │   ├── reviewerAgent.js       # Brand consistency scoring
│   │   │   ├── publisherAgent.js      # Final formatting
│   │   │   ├── reflector.js           # Failure analysis
│   │   │   ├── verifiers.js           # Deterministic checks
│   │   │   ├── agentState.js          # State management
│   │   │   └── managerInteract.js     # Natural language interaction
│   │   │
│   │   ├── memory/
│   │   │   └── graphMemory.js         # Neo4j integration
│   │   │
│   │   ├── vectorStore.js             # Pinecone integration
│   │   ├── contentHandler.js          # Content type routing
│   │   ├── promptConstructor.js       # LLM prompt templates
│   │   ├── orchestrationEmitter.js    # SSE event streaming
│   │   ├── imageAPI.js                # Image generation service
│   │   └── imageStorage.js            # Cloudinary integration
│   │
│   └── test-*.js                      # Test scripts
│
├── frontend/
│   ├── package.json                   # Frontend dependencies
│   ├── public/
│   │   ├── index.html                 # HTML template
│   │   └── favicon.svg                # App icon
│   │
│   └── src/
│       ├── App.jsx                    # Main app + routing
│       ├── index.js                   # React entry point
│       ├── index.css                  # Global styles
│       │
│       ├── components/
│       │   ├── Auth/
│       │   │   ├── Login.jsx          # Login form
│       │   │   └── Register.jsx       # Registration form
│       │   │
│       │   ├── Dashboard/
│       │   │   ├── Dashboard.jsx      # Main dashboard (legacy)
│       │   │   ├── SacoDashboard.jsx  # New SACO dashboard
│       │   │   └── PremiumDashboard.jsx # Premium features
│       │   │
│       │   ├── Brand/
│       │   │   └── BrandSettings.jsx  # Brand DNA configuration
│       │   │
│       │   ├── Upload/
│       │   │   ├── ContentUpload.jsx  # Content upload form
│       │   │   └── StreamingLogs.jsx  # Real-time log viewer
│       │   │
│       │   ├── Content/
│       │   │   └── ContentDetail.jsx  # Content detail view
│       │   │
│       │   ├── History/
│       │   │   └── History.jsx        # Content history list
│       │   │
│       │   ├── AgentWorkflow/
│       │   │   └── AgentWorkflowPage.jsx # Agent workflow visualization
│       │   │
│       │   ├── AgentWorkspace/
│       │   │   ├── LiveAgentWorkspace.jsx # Live mission control
│       │   │   └── AgentDetailPage.jsx    # Individual agent details
│       │   │
│       │   ├── ManagerPanel/
│       │   │   ├── ManagerPanel.jsx   # Manager interaction UI
│       │   │   └── ConfirmationModal.jsx # Confirmation dialog
│       │   │
│       │   ├── PlatformPreviews/
│       │   │   ├── index.jsx          # Preview router
│       │   │   ├── TwitterPreview.jsx # Twitter card preview
│       │   │   ├── LinkedInPreview.jsx # LinkedIn preview
│       │   │   ├── EmailPreview.jsx   # Email preview
│       │   │   ├── InstagramPreview.jsx # Instagram preview
│       │   │   └── BlogPreview.jsx    # Blog preview
│       │   │
│       │   ├── Settings/
│       │   │   ├── Settings.jsx       # User settings
│       │   │   └── index.js           # Settings exports
│       │   │
│       │   ├── Workflow/
│       │   │   └── AgentWorkflow.jsx  # Workflow component
│       │   │
│       │   └── common/
│       │       ├── AnimatedCard.jsx   # Reusable animated card
│       │       ├── EmptyState.jsx     # Empty state component
│       │       ├── HelpTooltip.jsx    # Help tooltip
│       │       ├── KeyboardShortcutsModal.jsx # Shortcuts modal
│       │       ├── LoadingSkeleton.jsx # Loading skeleton
│       │       ├── PageTransition.jsx # Page transition wrapper
│       │       ├── Toast.jsx          # Toast notification
│       │       └── index.js           # Common exports
│       │
│       ├── context/
│       │   └── AuthContext.jsx        # Authentication context
│       │
│       ├── services/
│       │   └── api.js                 # Axios instance + API calls
│       │
│       └── theme/
│           └── index.js               # Chakra UI theme config
│
├── .git/                              # Git repository
├── .gitignore                         # Git ignore rules
├── .vscode/                           # VS Code settings
│
└── Documentation/
    ├── README.md                      # Project overview
    ├── PROJECT_DETAILS.md             # This file
    ├── design.md                      # Architecture design doc
    ├── requirements.md                # Formal requirements
    ├── AGENT_WORKFLOW_FEATURE.md      # Agent workflow feature doc
    ├── AGENT_WORKFLOW_FEATURE_V2.md   # Agent detail pages doc
    ├── LIVE_AGENT_WORKSPACE.md        # Live workspace doc
    ├── DASHBOARD_DOCUMENTATION.md     # Dashboard feature doc
    └── IMPLEMENTED_FEATURES_GUIDE.md  # Features implementation guide
```


---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com"
  }
}
```

#### POST /auth/login
Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "stats": {
      "totalContent": 15,
      "hitRate": 87.5,
      "automationRate": 92.3
    }
  }
}
```

#### GET /auth/stats
Get user statistics (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalContent": 15,
  "hitRate": 87.5,
  "automationRate": 92.3,
  "avgConsistencyScore": 85.2
}
```

### Brand DNA Endpoints

#### POST /brand
Create or update Brand DNA (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "companyName": "TechCorp",
  "voice": {
    "personality": "professional",
    "statement": "We make complex AI accessible"
  },
  "tone": ["friendly", "authoritative", "innovative"],
  "values": ["Innovation", "Trust", "Simplicity"],
  "guidelines": {
    "keyTerms": ["AI", "innovation", "technology"],
    "avoidWords": ["cheap", "basic", "simple"],
    "styleNotes": "Use active voice, avoid jargon"
  }
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "companyName": "TechCorp",
  "voice": { ... },
  "tone": [ ... ],
  "values": [ ... ],
  "guidelines": { ... },
  "createdAt": "2026-02-27T10:00:00.000Z",
  "updatedAt": "2026-02-27T10:00:00.000Z"
}
```

#### GET /brand
Get user's Brand DNA (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "companyName": "TechCorp",
  "voice": { ... },
  "tone": [ ... ],
  "values": [ ... ],
  "guidelines": { ... }
}
```

### Content Endpoints

#### POST /content
Create new content (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Introducing AI-Powered Analytics",
  "data": "We're excited to announce...",
  "type": "article",
  "platforms": ["twitter", "linkedin", "email"]
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "userId": "507f1f77bcf86cd799439011",
  "title": "Introducing AI-Powered Analytics",
  "data": "We're excited to announce...",
  "type": "article",
  "platforms": ["twitter", "linkedin", "email"],
  "status": "processing",
  "variants": [],
  "createdAt": "2026-02-27T10:00:00.000Z"
}
```

#### GET /content
Get all user content (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Introducing AI-Powered Analytics",
    "status": "completed",
    "platforms": ["twitter", "linkedin", "email"],
    "kpis": {
      "hitRate": 100,
      "automationRate": 100,
      "avgConsistencyScore": 87.5,
      "processingTime": 23.4
    },
    "createdAt": "2026-02-27T10:00:00.000Z"
  }
]
```

#### GET /content/:id
Get specific content with variants (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "Introducing AI-Powered Analytics",
  "data": "Original content...",
  "platforms": ["twitter", "linkedin", "email"],
  "variants": [
    {
      "platform": "twitter",
      "content": "🚀 Excited to launch our AI-powered analytics...",
      "metadata": {
        "charCount": 275,
        "hashtags": ["#AI", "#Analytics"]
      },
      "consistencyScore": 87.5,
      "status": "approved",
      "feedback": "Excellent brand alignment"
    }
  ],
  "kpis": { ... },
  "status": "completed"
}
```

#### POST /content/:id/orchestrate
Trigger orchestration workflow (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Orchestration started",
  "contentId": "507f1f77bcf86cd799439013"
}
```

#### GET /content/:id/stream
Get SSE stream for real-time updates (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** Server-Sent Events stream
```
event: log
data: {"message": "Manager Agent: Planning workflow..."}

event: step
data: {"agent": "ingest", "platform": "all", "status": "working"}

event: variant
data: {"platform": "twitter", "content": "...", "score": 87.5}

event: complete
data: {"kpis": {...}, "variants": [...]}
```

#### GET /content/:id/agent/:agentId
Get individual agent details (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "agentId": "ingest",
  "agentName": "Ingest Agent",
  "stats": {
    "processingTime": "3.2s",
    "tasksCompleted": 5,
    "successRate": "100%"
  },
  "processSteps": [
    {
      "title": "Content Analysis",
      "description": "Analyzing content structure and themes",
      "status": "completed",
      "duration": "1.2s"
    }
  ],
  "output": {
    "themes": ["AI", "Analytics", "Innovation"],
    "keywords": ["AI", "analytics", "data", "insights"],
    "sentiment": "positive"
  }
}
```

#### POST /content/:id/interact
Interact with Manager Agent (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "command": "Make the Twitter version more casual"
}
```

**Response:**
```json
{
  "preview": "Here's what I'll change...",
  "requiresConfirmation": true
}
```


---

## Database Models

### User Model (MongoDB)

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (bcrypt hashed, required),
  createdAt: Date (default: Date.now),
  stats: {
    totalContent: Number (default: 0),
    hitRate: Number (default: 0),
    automationRate: Number (default: 0)
  }
}
```

**Indexes:**
- `email`: unique index for fast lookup

### Brand DNA Model (MongoDB)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  companyName: String (required),
  voice: {
    personality: String (required),
    statement: String (required)
  },
  tone: [String] (required),
  values: [String] (required),
  guidelines: {
    keyTerms: [String] (default: []),
    avoidWords: [String] (default: []),
    styleNotes: String (default: '')
  },
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `userId`: index for user-specific queries

### Content Model (MongoDB)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  title: String (required),
  data: String (required),
  type: String (enum: ['text', 'article', 'announcement'], default: 'text'),
  platforms: [String] (required),
  variants: [
    {
      platform: String (required),
      content: String (required),
      metadata: {
        charCount: Number,
        hashtags: [String],
        hook: String,
        subjectLine: String
      },
      consistencyScore: Number (required),
      status: String (enum: ['approved', 'flagged'], required),
      feedback: String,
      image: {
        url: String,
        prompt: String,
        provider: String
      }
    }
  ],
  kpis: {
    hitRate: Number (default: 0),
    automationRate: Number (default: 0),
    avgConsistencyScore: Number (default: 0),
    processingTime: Number (default: 0)
  },
  status: String (enum: ['processing', 'completed', 'failed'], default: 'processing'),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `userId`: index for user-specific queries
- `status`: index for filtering by status
- `createdAt`: index for sorting by date

### Vector Store Schema (Pinecone)

```javascript
{
  id: String (UUID),
  values: [Number] (1536 dimensions),
  metadata: {
    type: String ('brand_dna' | 'published' | 'template'),
    platform: String (optional),
    title: String (optional),
    score: Number (optional),
    userId: String (optional),
    timestamp: Date (optional),
    text: String (original text for reference)
  }
}
```

**Index Configuration:**
- Dimensions: 1536
- Metric: cosine similarity
- Pods: 1 (free tier)

### Graph Database Schema (Neo4j)

**Nodes:**
```cypher
// Brand node
(Brand {
  name: String,
  tone: String,
  voice: String,
  userId: String
})

// Value node
(Value {
  name: String,
  description: String
})

// Keyword node
(Keyword {
  term: String,
  category: String ('required' | 'prohibited')
})

// PastWork node
(PastWork {
  title: String,
  platform: String,
  content: String,
  score: Number,
  date: DateTime
})
```

**Relationships:**
```cypher
(Brand)-[:HAS_VALUE]->(Value)
(Brand)-[:USES_KEYWORD]->(Keyword)
(Brand)-[:AVOIDS_KEYWORD]->(Keyword)
(Brand)-[:PUBLISHED]->(PastWork)
(PastWork)-[:COVERS_TOPIC]->(Keyword)
```

**Example Queries:**
```cypher
// Get brand identity
MATCH (b:Brand {name: 'TechCorp'})-[:HAS_VALUE]->(v:Value)
RETURN b, collect(v.name) as values

// Get past works
MATCH (b:Brand {name: 'TechCorp'})-[:PUBLISHED]->(p:PastWork)
WHERE p.score > 80
RETURN p ORDER BY p.date DESC LIMIT 5

// Check keyword coherence
MATCH (b:Brand {name: 'TechCorp'})-[:AVOIDS_KEYWORD]->(k:Keyword)
WHERE k.term IN ['cheap', 'basic']
RETURN k.term
```


---

## Agent System

### Manager Agent

**Role:** Orchestrator and planner for the entire workflow

**Key Responsibilities:**
- Decompose goals into execution plans
- Delegate tasks to worker agents
- Handle failures with reflection loop
- Calculate KPIs (Hit Rate, Automation Rate, Consistency Score)
- Manage agent state across workflow

**LLM Configuration:**
- Model: Groq Llama 3.3 70B Versatile
- Temperature: 0.3 (balanced creativity and consistency)
- Max Tokens: 2000

**Key Methods:**
```javascript
orchestrate(content, brandDNA, platforms)
queryMemory(state)
planStep(state)
executeLoop(state)
reflectAndRetry(state, platform, verification)
buildResults(state, error)
```

**State Management:**
- Tracks: plan, current step, drafts, reviews, published variants, errors, history
- Calculates: hit rate, automation rate, consistency score, processing time

### Ingest Agent

**Role:** Content analysis and context enrichment via RAG

**Key Responsibilities:**
- Extract themes, keywords, sentiment
- Infer target audience
- Generate embeddings
- Retrieve similar content via RAG
- Create enriched content payload

**LLM Configuration:**
- Model: Groq Llama 3.3 70B Versatile
- Temperature: 0.2 (factual analysis)
- Max Tokens: 1500

**Output Structure:**
```javascript
{
  themes: ['AI', 'Analytics', 'Innovation'],
  keywords: ['AI', 'analytics', 'data', 'insights', 'machine learning'],
  sentiment: 'positive',
  targetAudience: 'Tech professionals and business leaders',
  keyMessages: [
    'AI-powered analytics platform launch',
    'Real-time insights with natural language',
    'Trusted by 500+ companies'
  ],
  embeddings: [0.123, -0.456, ...], // 1536 dimensions
  retrievedContext: [
    { title: 'Past Article', similarity: 0.87, content: '...' }
  ]
}
```

**RAG Implementation:**
- Embedding Model: OpenAI text-embedding-3-small
- Vector Store: Pinecone with cosine similarity
- Query: Top 3 semantically similar past content items
- Context: Brand guidelines, past content, templates

### Generator Agent

**Role:** Platform-specific content transformation with brand voice

**Key Responsibilities:**
- Create platform-specific variants
- Apply brand voice and tone
- Include required keywords
- Exclude prohibited words
- Ground facts in source content

**LLM Configuration:**
- Model: Groq Llama 3.3 70B Versatile
- Temperature: 0.7 (creative but controlled)
- Max Tokens: 3000

**Platform Specifications:**
```javascript
{
  twitter: {
    maxChars: 280,
    style: 'punchy, hashtags, threads',
    tone: 'casual, engaging'
  },
  linkedin: {
    maxChars: 3000,
    style: 'professional, thought-leadership',
    tone: 'authoritative, insightful'
  },
  email: {
    maxChars: 5000,
    style: 'newsletter, scannable',
    tone: 'friendly, informative'
  },
  instagram: {
    maxChars: 2200,
    style: 'visual, storytelling, emojis',
    tone: 'emotional, authentic'
  },
  blog: {
    maxChars: 10000,
    style: 'long-form, SEO-optimized, headers',
    tone: 'comprehensive, educational'
  }
}
```

**Fact Grounding:**
- Generator ONLY uses information from enriched input
- Does NOT invent facts or statistics
- Every claim traceable to source content

### Reviewer Agent

**Role:** Brand consistency scoring and quality gate enforcement

**Key Responsibilities:**
- Score brand consistency with weighted criteria
- Enforce 80% threshold gate
- Generate actionable feedback
- Fallback scoring mechanism

**LLM Configuration:**
- Model: Groq Llama 3.3 70B Versatile
- Temperature: 0.1 (objective scoring)
- Max Tokens: 1000

**Scoring Criteria (Weighted):**
```javascript
{
  toneMatch: {
    weight: 0.30,
    description: 'Alignment with brand voice and personality'
  },
  valueAlignment: {
    weight: 0.25,
    description: 'Brand values reflected in content'
  },
  keywordUsage: {
    weight: 0.15,
    description: 'Required keywords present'
  },
  avoidWordsCheck: {
    weight: 0.15,
    description: 'Prohibited words absent'
  },
  audienceFit: {
    weight: 0.15,
    description: 'Appropriate for target audience'
  }
}
```

**Threshold Gate:**
- Pass: Score >= 80% → Variant approved
- Fail: Score < 80% → Variant flagged for review

**Fallback Mechanism:**
- If LLM scoring fails: Use cosine similarity between variant embedding and brand DNA embedding
- Convert similarity (0-1) to percentage score

### Publisher Agent

**Role:** Final formatting and platform API preparation

**Key Responsibilities:**
- Format content for platform APIs
- Generate platform-specific metadata
- Create API-ready payloads
- Log for audit trail

**Platform-Specific Formatting:**

**Twitter:**
- Thread format (1/n) if content exceeds 280 chars
- Hashtag placement optimization (end of tweet)
- Character count validation
- URL shortening consideration

**LinkedIn:**
- Professional hook enhancement
- Visibility settings (PUBLIC)
- Engagement CTA placement
- Line break optimization for readability

**Email:**
- Subject line extraction/generation
- HTML body generation with styling
- Plain text fallback
- Preview text (first 100 chars)

**Instagram:**
- Caption with strategic line breaks
- Hashtag block at end (up to 30)
- Emoji optimization for engagement
- First comment strategy for additional hashtags

**Blog:**
- SEO metadata (title, description, keywords)
- HTML structure (H1, H2, H3 hierarchy)
- Markdown alternative
- Internal linking suggestions

### Verifiers (Deterministic Quality Checks)

**Role:** Code-based verification before AI scoring

**Key Functions:**
```javascript
checkLength(content, platform)
checkKeywords(content, requiredKeywords)
checkForbiddenPhrases(content, forbidden)
checkNoCodeBlocks(content)
checkPlatformStructure(content, platform)
verifyAll(variant, options)
```

**Platform Limits:**
```javascript
{
  twitter: { min: 50, max: 280 },
  linkedin: { min: 100, max: 3000 },
  email: { min: 200, max: 5000 },
  instagram: { min: 50, max: 2200 },
  blog: { min: 500, max: 10000 }
}
```

**Verification Priority:**
- Critical: length, codeBlocks, forbidden phrases, score threshold
- Non-Critical: keywords, structure (warnings only)
- Overall pass requires all critical checks to pass

### Reflector (Failure Analysis)

**Role:** Analyze failures and generate retry strategies

**Key Methods:**
```javascript
reflect(errorSummary, context)
shouldRetry(reflection, retryCount, maxRetries)
enhanceContext(originalContext, reflection)
```

**Reflection Strategies:**
```javascript
[
  'add_more_brand_context',      // Include more brand guidelines
  'simplify_language',           // Reduce complexity
  'adjust_tone',                 // Modify tone direction
  'emphasize_keywords',          // Strengthen keyword usage
  'shorten_content',             // Reduce length
  'restructure_content',         // Change structure
  'escalate_to_human'            // Cannot auto-fix
]
```

**Retry Logic:**
- Max retries: 3 per platform
- Each retry includes reflection strategy in prompt
- After 3 failures: Escalate to human review
- Successful recovery strategies logged for learning


---

## Memory Architecture

### Vector Store (Pinecone)

**Purpose:** Semantic search and memory persistence for RAG

**Configuration:**
- Index Name: `saco`
- Dimensions: 1536 (OpenAI text-embedding-3-small)
- Metric: Cosine similarity
- Namespace: Per-user isolation (optional)

**Key Operations:**

**Initialize:**
```javascript
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index('saco');
```

**Embed Text:**
```javascript
const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small',
  openAIApiKey: process.env.OPENAI_API_KEY
});
const vector = await embeddings.embedQuery(text);
```

**Upsert Vector:**
```javascript
await index.upsert([{
  id: uuid(),
  values: vector,
  metadata: {
    type: 'brand_dna',
    userId: user._id,
    text: originalText,
    timestamp: new Date()
  }
}]);
```

**Query Similar Content:**
```javascript
const results = await index.query({
  vector: queryVector,
  topK: 3,
  includeMetadata: true
});
```

**Use Cases:**
- Store brand DNA embeddings for semantic retrieval
- Store published content for learning
- Retrieve similar past content during generation
- Find templates matching content type

### Graph Database (Neo4j)

**Purpose:** Brand identity relationships and coherence checking

**Configuration:**
- URI: `neo4j+s://your-instance.databases.neo4j.io`
- Database: `neo4j`
- Authentication: Username/Password

**Key Operations:**

**Initialize:**
```javascript
const neo4j = require('neo4j-driver');
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME,
    process.env.NEO4J_PASSWORD
  )
);
```

**Store Brand DNA:**
```cypher
CREATE (b:Brand {
  name: $companyName,
  tone: $tone,
  voice: $voice,
  userId: $userId
})
WITH b
UNWIND $values AS value
CREATE (v:Value {name: value})
CREATE (b)-[:HAS_VALUE]->(v)
WITH b
UNWIND $keyTerms AS term
CREATE (k:Keyword {term: term, category: 'required'})
CREATE (b)-[:USES_KEYWORD]->(k)
```

**Query Brand Identity:**
```cypher
MATCH (b:Brand {name: $companyName})
OPTIONAL MATCH (b)-[:HAS_VALUE]->(v:Value)
OPTIONAL MATCH (b)-[:USES_KEYWORD]->(k:Keyword)
OPTIONAL MATCH (b)-[:AVOIDS_KEYWORD]->(a:Keyword)
RETURN b, collect(DISTINCT v.name) as values,
       collect(DISTINCT k.term) as keywords,
       collect(DISTINCT a.term) as avoidWords
```

**Record Past Work:**
```cypher
MATCH (b:Brand {name: $companyName})
CREATE (p:PastWork {
  title: $title,
  platform: $platform,
  content: $content,
  score: $score,
  date: datetime()
})
CREATE (b)-[:PUBLISHED]->(p)
WITH p
UNWIND $topics AS topic
MATCH (k:Keyword {term: topic})
CREATE (p)-[:COVERS_TOPIC]->(k)
```

**Check Coherence:**
```cypher
MATCH (b:Brand {name: $companyName})-[:AVOIDS_KEYWORD]->(k:Keyword)
WHERE any(word IN $contentWords WHERE word = k.term)
RETURN k.term as violatedWord
```

**Use Cases:**
- Store brand identity as graph structure
- Track relationships between brand values and keywords
- Record past work with topic connections
- Check content coherence with brand guidelines
- Analyze brand evolution over time

### MongoDB (Primary Database)

**Purpose:** Primary data storage for users, content, and brand DNA

**Configuration:**
- URI: `mongodb+srv://username:password@cluster.mongodb.net/saco`
- Database: `saco`
- Collections: `users`, `contents`, `branddnas`

**Connection:**
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

**Indexes:**
```javascript
// User collection
db.users.createIndex({ email: 1 }, { unique: true });

// Content collection
db.contents.createIndex({ userId: 1 });
db.contents.createIndex({ status: 1 });
db.contents.createIndex({ createdAt: -1 });

// BrandDNA collection
db.branddnas.createIndex({ userId: 1 });
```

**Use Cases:**
- Store user accounts and authentication
- Store original content and generated variants
- Store brand DNA configurations
- Track user statistics and KPIs
- Maintain content history

### Memory Integration Flow

1. **Brand DNA Creation:**
   - Store in MongoDB (primary)
   - Generate embeddings → Store in Pinecone (semantic search)
   - Create graph structure → Store in Neo4j (relationships)

2. **Content Processing:**
   - Retrieve Brand DNA from MongoDB
   - Query Pinecone for similar past content (RAG)
   - Query Neo4j for brand identity context
   - Enrich content with retrieved context

3. **Content Completion:**
   - Store variants in MongoDB
   - Generate variant embeddings → Store in Pinecone
   - Record past work → Store in Neo4j with topic connections
   - Update user statistics in MongoDB

4. **Memory Retrieval:**
   - MongoDB: Fast structured queries (user data, content CRUD)
   - Pinecone: Semantic similarity search (RAG, templates)
   - Neo4j: Relationship queries (brand coherence, topic connections)


---

## Frontend Components

### Authentication Components

**Login.jsx**
- Email/password form with validation
- JWT token storage in localStorage
- Redirect to dashboard on success
- Error handling with toast notifications

**Register.jsx**
- User registration form
- Password strength validation
- Automatic login after registration
- Terms of service acceptance

### Dashboard Components

**SacoDashboard.jsx** (Main Dashboard)
- Personalized greeting with time-based message
- KPI cards (Total Content, Hit Rate, Automation Rate, Avg Consistency)
- Activity chart (Recharts line chart)
- Recent content table with status badges
- Quick actions (Upload Content, Brand Settings)
- Responsive grid layout

**PremiumDashboard.jsx**
- Advanced analytics
- Custom date range filtering
- Export functionality
- Premium features showcase

### Brand Components

**BrandSettings.jsx**
- Brand DNA configuration form
- Voice and tone selection
- Values management (add/remove)
- Keywords and prohibited words lists
- Style notes textarea
- Real-time validation
- Save with confirmation

### Upload Components

**ContentUpload.jsx**
- Title and content input
- Platform selection (multi-select checkboxes)
- Content type dropdown
- Character count display
- Drag-and-drop file upload (future)
- Submit triggers orchestration
- Redirect to Live Agent Workspace

**StreamingLogs.jsx**
- Real-time SSE log viewer
- Auto-scroll to latest log
- Color-coded log levels
- Timestamp display
- Connection status indicator

### Content Components

**ContentDetail.jsx**
- Original content display
- Platform variants tabs
- Consistency score badges
- Copy to clipboard functionality
- Platform preview cards
- Edit and regenerate actions
- KPI summary

### Agent Workspace Components

**LiveAgentWorkspace.jsx** (Mission Control)
- Full-screen glassmorphism layout
- 5 agent cards in grid
- Real-time progress bars with shimmer
- Status pulsing (blue → green → gray)
- Terminal logs per agent
- Animated SVG connection lines with particles
- Avatar animations (thinking dots, pulse, checkmark)
- Master progress bar with milestones
- Success confetti on completion
- Auto-redirect to results
- Back to dashboard button

**AgentDetailPage.jsx**
- Individual agent focus view
- Stats grid (processing time, tasks completed, success rate)
- Process steps timeline
- Step status indicators (pending, working, completed, failed)
- Output display with formatted results
- Back to workspace button

### Platform Preview Components

**TwitterPreview.jsx**
- Twitter card mockup
- Character count display
- Hashtag highlighting
- Thread indicator if multi-tweet

**LinkedInPreview.jsx**
- LinkedIn post mockup
- Professional styling
- Engagement buttons (Like, Comment, Share)

**EmailPreview.jsx**
- Email client mockup
- Subject line preview
- HTML body rendering
- Mobile/desktop toggle

**InstagramPreview.jsx**
- Instagram post mockup
- Caption with line breaks
- Hashtag styling
- Like/comment UI

**BlogPreview.jsx**
- Blog article layout
- SEO metadata display
- Table of contents
- Reading time estimate

### Common Components

**AnimatedCard.jsx**
- Reusable card with Framer Motion
- Hover tilt effect
- Glassmorphism styling
- Customizable variants

**EmptyState.jsx**
- Empty state illustrations
- Call-to-action buttons
- Contextual messages

**HelpTooltip.jsx**
- Info icon with tooltip
- Keyboard shortcut hints
- Contextual help text

**LoadingSkeleton.jsx**
- Shimmer loading effect
- Customizable shapes
- Responsive sizing

**PageTransition.jsx**
- Smooth page transitions
- Fade in/out animations
- Route change handling

**Toast.jsx**
- Success/error/info notifications
- Auto-dismiss timer
- Action buttons
- Stack management

### Context Providers

**AuthContext.jsx**
- User authentication state
- Login/logout functions
- Token management
- Protected route wrapper
- User profile data

### Services

**api.js**
- Axios instance configuration
- Request/response interceptors
- JWT token injection
- Error handling
- API endpoint functions:
  - `register(email, password)`
  - `login(email, password)`
  - `getStats()`
  - `getBrandDNA()`
  - `saveBrandDNA(data)`
  - `createContent(data)`
  - `getContent(id)`
  - `getAllContent()`
  - `orchestrateContent(id)`
  - `getContentStream(id)`
  - `getAgentDetail(contentId, agentId)`
  - `interactWithManager(contentId, command)`

### Theme Configuration

**theme/index.js**
- Chakra UI theme customization
- Color palette (indigo primary, dark background)
- Typography scale
- Component style overrides
- Glassmorphism utilities
- Animation variants
- Responsive breakpoints


---

## Configuration

### Environment Variables

**Backend (.env)**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/saco

# Authentication
JWT_SECRET=your-secret-key-minimum-32-characters-long

# LLM Provider (Groq)
GROQ_API_KEY=gsk_your_groq_api_key_here

# OpenAI (for embeddings)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Vector Database (Pinecone)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=saco
PINECONE_ENVIRONMENT=us-east-1-aws

# Graph Database (Neo4j) - Optional
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password_here

# Image Generation - Optional
STABILITY_API_KEY=sk-your_stability_api_key_here
HUGGINGFACE_API_KEY=hf_your_huggingface_api_key_here

# Image Storage (Cloudinary) - Optional
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Feature Flags
ENABLE_IMAGE_GENERATION=false
ENABLE_GRAPH_MEMORY=false
ENABLE_MANAGER_INTERACTION=true

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=60
MAX_CONTENT_SIZE_MB=5

# Logging
LOG_LEVEL=info
```

**Frontend (Environment Variables)**
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_PREMIUM_FEATURES=false
```

### LLM Configuration

**Groq Settings:**
```javascript
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.3-70b-versatile',
  temperature: 0.3,  // Adjust per agent
  maxTokens: 2000,
  streaming: false
});
```

**Temperature Guidelines:**
- Manager Agent: 0.3 (balanced planning)
- Ingest Agent: 0.2 (factual analysis)
- Generator Agent: 0.7 (creative generation)
- Reviewer Agent: 0.1 (objective scoring)

### Pinecone Configuration

**Index Setup:**
```javascript
// Create index (one-time setup)
await pinecone.createIndex({
  name: 'saco',
  dimension: 1536,
  metric: 'cosine',
  spec: {
    serverless: {
      cloud: 'aws',
      region: 'us-east-1'
    }
  }
});
```

**Query Configuration:**
```javascript
const queryConfig = {
  topK: 3,              // Number of results
  includeMetadata: true, // Include metadata
  includeValues: false   // Exclude vectors (save bandwidth)
};
```

### Neo4j Configuration

**Connection Settings:**
```javascript
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME,
    process.env.NEO4J_PASSWORD
  ),
  {
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 60000,
    encrypted: 'ENCRYPTION_ON'
  }
);
```

**Session Configuration:**
```javascript
const session = driver.session({
  database: 'neo4j',
  defaultAccessMode: neo4j.session.WRITE
});
```

### MongoDB Configuration

**Connection Options:**
```javascript
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});
```

### CORS Configuration

**Backend CORS Settings:**
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Rate Limiting

**Express Rate Limiter:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

### Security Configuration

**Helmet.js:**
```javascript
const helmet = require('helmet');
app.use(helmet());
```

**JWT Configuration:**
```javascript
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  algorithm: 'HS256'
};
```

**Password Hashing:**
```javascript
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```


---

## Deployment

### Production Deployment Checklist

#### Pre-Deployment

- [ ] Update environment variables for production
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URIs
- [ ] Set up SSL certificates
- [ ] Configure CDN for static assets
- [ ] Enable production logging
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Test all API endpoints
- [ ] Run security audit

#### Backend Deployment (AWS/Heroku/Railway)

**AWS EC2 Deployment:**

1. Launch EC2 instance (Ubuntu 22.04 LTS)
2. Install Node.js 18+
3. Clone repository
4. Install dependencies: `npm install --production`
5. Set environment variables
6. Install PM2: `npm install -g pm2`
7. Start server: `pm2 start server.js --name saco-backend`
8. Configure Nginx reverse proxy
9. Set up SSL with Let's Encrypt
10. Configure security groups (port 443, 80)

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**PM2 Ecosystem File (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [{
    name: 'saco-backend',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
```

#### Frontend Deployment (Vercel/Netlify)

**Vercel Deployment:**

1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Build production bundle: `npm run build`
4. Deploy: `vercel --prod`
5. Configure environment variables in Vercel dashboard
6. Set up custom domain
7. Enable automatic deployments from Git

**vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Netlify Deployment:**

1. Build production bundle: `npm run build`
2. Install Netlify CLI: `npm install -g netlify-cli`
3. Deploy: `netlify deploy --prod --dir=build`
4. Configure redirects for SPA routing

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Database Setup

**MongoDB Atlas:**
- Create production cluster
- Configure IP whitelist (0.0.0.0/0 or specific IPs)
- Set up database users with appropriate permissions
- Enable backup and point-in-time recovery
- Configure monitoring and alerts

**Pinecone:**
- Create production index
- Configure pod type (s1 or p1 for production)
- Set up API key rotation
- Enable monitoring

**Neo4j Aura:**
- Create production instance
- Configure connection limits
- Set up backup schedule
- Enable query logging

#### Monitoring and Logging

**Application Monitoring:**
- Set up New Relic or Datadog
- Configure error tracking (Sentry)
- Set up uptime monitoring (UptimeRobot)
- Configure log aggregation (Loggly, Papertrail)

**Health Check Endpoint:**
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

#### Security Hardening

- Enable HTTPS only
- Set secure HTTP headers (Helmet.js)
- Implement rate limiting
- Enable CORS with specific origins
- Use environment variables for secrets
- Implement API key rotation
- Set up Web Application Firewall (WAF)
- Enable DDoS protection
- Regular security audits
- Dependency vulnerability scanning

#### Backup Strategy

**MongoDB:**
- Automated daily backups
- Point-in-time recovery enabled
- Backup retention: 30 days
- Test restore procedures monthly

**Pinecone:**
- Export vectors periodically
- Store backups in S3
- Document restore procedures

**Neo4j:**
- Automated daily backups
- Export graph data weekly
- Test restore procedures

#### Performance Optimization

- Enable gzip compression
- Implement CDN for static assets
- Use connection pooling for databases
- Implement caching (Redis)
- Optimize database queries
- Enable HTTP/2
- Minify and bundle frontend assets
- Lazy load components
- Implement code splitting

#### Scaling Strategy

**Horizontal Scaling:**
- Use load balancer (AWS ELB, Nginx)
- Deploy multiple backend instances
- Implement session management (Redis)
- Use message queue for async tasks (RabbitMQ, AWS SQS)

**Vertical Scaling:**
- Upgrade server resources as needed
- Monitor resource usage
- Optimize memory usage
- Profile and optimize slow queries


---

## Testing

### Testing Strategy

**Unit Tests:**
- Test individual agent functions
- Test utility functions
- Test API route handlers
- Test database models

**Integration Tests:**
- Test agent orchestration flow
- Test API endpoints end-to-end
- Test database operations
- Test external service integrations

**End-to-End Tests:**
- Test complete user workflows
- Test UI interactions
- Test real-time streaming
- Test error scenarios

### Backend Testing

**Test Framework:**
- Jest for unit tests
- Supertest for API testing
- MongoDB Memory Server for database testing

**Example Test Setup:**
```javascript
// test/setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});
```

**Example Unit Test:**
```javascript
// test/agents/ingestAgent.test.js
const { IngestAgent } = require('../../services/agents/ingestAgent');

describe('IngestAgent', () => {
  test('should extract themes from content', async () => {
    const content = {
      title: 'AI Innovation',
      data: 'We are launching an AI-powered analytics platform...'
    };
    
    const result = await IngestAgent.process(content, mockBrandDNA);
    
    expect(result.themes).toHaveLength(3);
    expect(result.themes).toContain('AI');
    expect(result.sentiment).toBe('positive');
  });
});
```

**Example API Test:**
```javascript
// test/routes/auth.test.js
const request = require('supertest');
const app = require('../../server');

describe('Auth Routes', () => {
  test('POST /auth/register should create new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');
  });
  
  test('POST /auth/login should authenticate user', async () => {
    // First register
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    // Then login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

### Frontend Testing

**Test Framework:**
- React Testing Library
- Jest for unit tests
- Cypress for E2E tests

**Example Component Test:**
```javascript
// src/components/Auth/Login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from './Login';
import { AuthProvider } from '../../context/AuthContext';

describe('Login Component', () => {
  test('should render login form', () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  test('should submit login form', async () => {
    const mockLogin = jest.fn();
    
    render(
      <AuthProvider value={{ login: mockLogin }}>
        <Login />
      </AuthProvider>
    );
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
```

**Example E2E Test (Cypress):**
```javascript
// cypress/e2e/content-workflow.cy.js
describe('Content Workflow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.login('test@example.com', 'password123');
  });
  
  it('should create and orchestrate content', () => {
    // Navigate to upload page
    cy.contains('Upload Content').click();
    
    // Fill form
    cy.get('input[name="title"]').type('Test Article');
    cy.get('textarea[name="content"]').type('This is a test article about AI...');
    cy.get('input[value="twitter"]').check();
    cy.get('input[value="linkedin"]').check();
    
    // Submit
    cy.contains('Start Orchestration').click();
    
    // Verify redirect to workspace
    cy.url().should('include', '/workspace/');
    
    // Wait for completion
    cy.contains('All agents completed', { timeout: 60000 });
    
    // Verify results
    cy.contains('Twitter').should('be.visible');
    cy.contains('LinkedIn').should('be.visible');
  });
});
```

### Manual Testing Checklist

**Authentication:**
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] Protected routes redirect to login

**Brand DNA:**
- [ ] Create brand DNA
- [ ] Update brand DNA
- [ ] Retrieve brand DNA
- [ ] Validate required fields

**Content Upload:**
- [ ] Upload content with all platforms
- [ ] Upload content with single platform
- [ ] Validate minimum character count
- [ ] Validate platform selection

**Orchestration:**
- [ ] Watch real-time progress
- [ ] Verify all agents execute
- [ ] Check variant generation
- [ ] Verify consistency scores
- [ ] Test failure scenarios

**Agent Workspace:**
- [ ] View live agent status
- [ ] Click agent cards
- [ ] View agent details
- [ ] Check process steps
- [ ] Verify animations

**Content Detail:**
- [ ] View original content
- [ ] View all variants
- [ ] Copy to clipboard
- [ ] View platform previews
- [ ] Check KPIs

**Dashboard:**
- [ ] View KPI cards
- [ ] Check activity chart
- [ ] View recent content
- [ ] Use quick actions

### Performance Testing

**Load Testing (Artillery):**
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
scenarios:
  - name: "Content orchestration"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "token"
      - post:
          url: "/api/content"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            title: "Test Content"
            data: "Test content body..."
            platforms: ["twitter", "linkedin"]
```

Run: `artillery run artillery-config.yml`

### Test Coverage Goals

- Unit Tests: 80%+ coverage
- Integration Tests: 70%+ coverage
- E2E Tests: Critical user paths
- Performance Tests: All API endpoints

### Continuous Integration

**GitHub Actions Workflow:**
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install backend dependencies
        run: cd backend && npm install
      
      - name: Run backend tests
        run: cd backend && npm test
      
      - name: Install frontend dependencies
        run: cd frontend && npm install
      
      - name: Run frontend tests
        run: cd frontend && npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and commit: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style

- Use ESLint for JavaScript linting
- Follow Airbnb JavaScript Style Guide
- Use Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for functions

### Pull Request Guidelines

- Update documentation for new features
- Add tests for new functionality
- Ensure all tests pass
- Update CHANGELOG.md
- Request review from maintainers

---

## License

Built for AI Bharat AWS Hackathon 2026

---

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/saco/issues)
- Email: support@saco.ai
- Documentation: [docs.saco.ai](https://docs.saco.ai)

---

## Acknowledgments

- AI Bharat for organizing the hackathon
- AWS for cloud infrastructure support
- Groq for LLM API access
- Pinecone for vector database
- Neo4j for graph database
- OpenAI for embedding models
- Stability AI for image generation

---

**SACO** - From cosmetic AI to systemic intelligence

*Transforming content workflows, one agent at a time*

>>>>>>> 79c604a68216a460d79e180e4e15b8ae4824ea39
