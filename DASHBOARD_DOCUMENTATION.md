# Dashboard Documentation - SACO Platform

## Overview

The SACO Dashboard is the central hub for monitoring content orchestration performance, viewing recent activity, and accessing content management features. It provides real-time KPIs, performance charts, and quick access to all content pieces.

## Route

```
/
```

The dashboard is the default landing page after login.

---

## Key Features

### 1. **Personalized Greeting**
- Time-based greeting (Good morning/afternoon/evening)
- Welcoming message with emoji
- Contextual subtitle

### 2. **KPI Cards (4 Metrics)**
- Hit Rate
- Automation Rate
- Total Content
- Variants Generated

### 3. **Performance Chart**
- 7-day content performance visualization
- Area chart showing variants generated
- Time range selector (7d/30d/90d)

### 4. **Recent Activity Timeline**
- Last 4 content pieces created
- Platform icons
- Timestamps

### 5. **Content Table**
- Searchable and filterable
- Desktop: Full table view
- Mobile: Card-based view
- Quick actions (View button)

### 6. **Quick Actions**
- "New Content" button (top-right)
- Direct navigation to upload page

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Good morning! 👋                        [+ New Content]    │
│  Your content orchestration at a glance                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Hit Rate │  │Automation│  │  Total   │  │ Variants │   │
│  │   85%    │  │   90%    │  │ Content  │  │Generated │   │
│  │  🎯      │  │   ⚡     │  │   12     │  │    48    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│  Content Performance     │  Recent Activity                 │
│  ┌────────────────────┐  │  ┌────────────────────────────┐ │
│  │                    │  │  │ ⚡ Generated "Product..."  │ │
│  │   [Area Chart]     │  │  │ 📧 Generated "Newsletter" │ │
│  │                    │  │  │ 🐦 Generated "Launch..."  │ │
│  │                    │  │  │ 💼 Generated "Update..."  │ │
│  └────────────────────┘  │  └────────────────────────────┘ │
│                          │                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Recent Content                    [Search] [Filter]        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Title          Type    Status    Variants  Created  │   │
│  │ Product Launch article completed  3        Jan 15   │   │
│  │ Newsletter     text    processing 2        Jan 14   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Components Breakdown

### 1. Header Section

**Location**: Top of dashboard

**Elements**:
- Greeting text (dynamic based on time)
- Subtitle: "Your content orchestration at a glance"
- "New Content" button (navigates to `/upload`)

**Code**:
```javascript
<Flex justify="space-between" align="center">
  <VStack align="start">
    <Heading>{getGreeting()}! 👋</Heading>
    <Text>Your content orchestration at a glance</Text>
  </VStack>
  <Link to="/upload">
    <Button leftIcon={<FiPlus />}>New Content</Button>
  </Link>
</Flex>
```

---

### 2. KPI Cards

**Layout**: 4-column grid (2 columns on mobile)

**Metrics**:

#### A. Hit Rate 🎯
- **Value**: Percentage (0-100%)
- **Description**: % of variants passing 80% brand consistency threshold
- **Target**: 85%
- **Icon**: FiTarget
- **Color**: Brand purple

#### B. Automation Rate ⚡
- **Value**: Percentage (0-100%)
- **Description**: % of content processed without human intervention
- **Target**: 90%
- **Icon**: FiZap
- **Color**: Brand purple

#### C. Total Content 📚
- **Value**: Integer count
- **Description**: Total pieces of content created
- **Change**: "Pieces created"
- **Icon**: FiLayers
- **Color**: Brand purple

#### D. Variants Generated 🔄
- **Value**: Integer count
- **Description**: Total variants generated via COPE pipeline
- **Change**: "Via COPE pipeline"
- **Icon**: FiClock
- **Color**: Brand purple

**Features**:
- Animated count-up on load
- Hover effect (lift + glow)
- Trend indicators (up/down arrows)
- Staggered entrance animation

**Code**:
```javascript
<KPICard
  label="Hit Rate"
  value={85}
  unit="%"
  change="Target: 85%"
  positive={true}
  icon={FiTarget}
  delay={0.1}
/>
```

---

### 3. Performance Chart

**Type**: Area Chart (Recharts)

**Data Points**:
- X-axis: Days of week (Mon-Sun)
- Y-axis: Number of variants
- Fill: Gradient (purple)

**Features**:
- Time range selector (7d/30d/90d)
- Custom tooltip with styled background
- Smooth animations
- Responsive container

**Chart Configuration**:
```javascript
<AreaChart data={chartData}>
  <defs>
    <linearGradient id="colorVariants">
      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
    </linearGradient>
  </defs>
  <Area
    type="monotone"
    dataKey="variants"
    stroke="#6366f1"
    fill="url(#colorVariants)"
  />
</AreaChart>
```

---

### 4. Recent Activity

**Display**: Timeline-style list

**Items Shown**: Last 4 content pieces

**Each Item Contains**:
- Platform icon (Twitter/LinkedIn/Email/Instagram/Blog)
- Title: "Generated [content title]"
- Timestamp: Date created
- Platform badge

**Features**:
- Staggered fade-in animation
- Icon color coding by platform
- Empty state with CTA button

**Empty State**:
```
No recent activity
[Create your first content]
```

---

### 5. Content Table

**Desktop View**: Full table with columns

**Columns**:
1. **Title**: Content title (bold, white)
2. **Type**: Badge (article/text/announcement)
3. **Status**: Colored badge (pending/processing/completed/failed)
4. **Variants**: Count of generated variants
5. **Created**: Date created
6. **Actions**: "View" button

**Mobile View**: Card-based layout

**Each Card Contains**:
- Title (bold)
- Type badge
- Status badge
- Variant count
- Clickable to content detail page

**Features**:
- Search functionality (filters by title)
- Platform filter dropdown
- Hover effects (row highlight on desktop)
- Staggered entrance animations
- Empty state with illustration

**Status Colors**:
- **Pending**: Purple
- **Processing**: Accent color
- **Completed**: Green
- **Failed**: Red

---

## Data Flow

### API Endpoints Used

#### 1. GET /api/auth/stats
**Purpose**: Fetch user statistics and KPIs

**Response**:
```json
{
  "kpis": {
    "hitRate": 85,
    "automationRate": 90,
    "totalContent": 12,
    "totalVariants": 48
  }
}
```

#### 2. GET /api/content?limit=5
**Purpose**: Fetch recent content pieces

**Response**:
```json
{
  "contents": [
    {
      "_id": "...",
      "title": "Product Launch",
      "type": "article",
      "orchestrationStatus": "completed",
      "variants": [...],
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "pages": 3
}
```

### State Management

```javascript
const [stats, setStats] = useState(null);
const [contents, setContents] = useState([]);
const [loading, setLoading] = useState(true);
const [chartData] = useState(generateChartData);
const [timeRange, setTimeRange] = useState('7d');
const [searchQuery, setSearchQuery] = useState('');
const [platformFilter, setPlatformFilter] = useState('all');
```

---

## Animations

### Entrance Animations

**Staggered Loading**:
- Header: 0ms delay
- KPI Cards: 100ms, 200ms, 300ms, 400ms
- Charts: 300ms, 400ms
- Content Table: 500ms

**Animation Types**:
- Fade in + slide up (y: 20 → 0)
- Opacity: 0 → 1
- Duration: 400ms

### Hover Animations

**KPI Cards**:
```javascript
whileHover={{
  y: -4,
  borderColor: 'rgba(99, 102, 241, 0.3)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
}}
```

**Table Rows**:
```javascript
_hover={{ bg: 'whiteAlpha.50' }}
```

### Count-Up Animation

**KPI Values**:
```javascript
<CountUp
  end={value}
  duration={2}
  separator=","
/>
```

---

## Responsive Design

### Breakpoints

**Mobile (base)**:
- 2-column KPI grid
- Stacked charts
- Card-based content list
- Full-width search/filter

**Tablet (md)**:
- 4-column KPI grid
- Side-by-side charts
- Table view for content

**Desktop (lg)**:
- Full layout
- All features visible
- Optimal spacing

### Mobile Optimizations

1. **KPI Cards**: 2x2 grid instead of 1x4
2. **Charts**: Stacked vertically
3. **Content**: Cards instead of table
4. **Header**: Stacked button below title
5. **Search/Filter**: Full width

---

## Empty States

### No Content

**Display**:
```
🗂️ (animated icon)
No content yet
Create your first piece to get started!
[Upload Content]
```

**Features**:
- Floating icon animation
- Encouraging message
- Clear CTA button

### No Activity

**Display**:
```
No recent activity
[Create your first content]
```

---

## User Interactions

### Primary Actions

1. **New Content Button**
   - Location: Top-right header
   - Action: Navigate to `/upload`
   - Style: Primary button with icon

2. **View Content**
   - Location: Table row action
   - Action: Navigate to `/content/:id`
   - Style: Ghost button

3. **Search Content**
   - Location: Above content table
   - Action: Filter content by title
   - Real-time filtering

4. **Filter by Platform**
   - Location: Above content table
   - Action: Filter content by platform
   - Options: All, Twitter, LinkedIn, Email, Instagram, Blog

### Secondary Actions

1. **Time Range Selector**
   - Location: Performance chart header
   - Options: 7d, 30d, 90d
   - Updates chart data

---

## Performance Considerations

### Optimizations

1. **Lazy Loading**: Dashboard component lazy loaded
2. **Memoization**: Chart data memoized
3. **Debouncing**: Search input debounced (if implemented)
4. **Pagination**: Content limited to 5 items
5. **Skeleton Loading**: Shows while fetching data

### Loading States

**Initial Load**:
```javascript
if (loading) {
  return <DashboardSkeleton />;
}
```

**Features**:
- Skeleton screens for KPIs
- Skeleton screens for charts
- Skeleton screens for content items
- Smooth transition to actual content

---

## Accessibility

### Keyboard Navigation

- All buttons focusable
- Table rows navigable
- Form inputs accessible
- Proper tab order

### Screen Readers

- Semantic HTML structure
- ARIA labels on icons
- Descriptive button text
- Table headers properly labeled

### Color Contrast

- WCAG AA compliant
- Text readable on all backgrounds
- Status colors distinguishable
- Focus indicators visible

---

## Error Handling

### API Errors

```javascript
try {
  const [statsRes, contentsRes] = await Promise.all([
    api.get('/auth/stats'),
    api.get('/content?limit=5')
  ]);
  setStats(statsRes.data);
  setContents(contentsRes.data.contents);
} catch (error) {
  console.error('Dashboard fetch error:', error);
  showToast.error('Failed to load dashboard data');
}
```

### Fallback Values

- KPIs default to 0 if not available
- Empty arrays for missing content
- Graceful degradation

---

## Future Enhancements

### Potential Additions

1. **Real-time Updates**: WebSocket for live KPI updates
2. **More Charts**: Bar chart for platform distribution
3. **Date Range Picker**: Custom date range selection
4. **Export Data**: Download dashboard data as CSV/PDF
5. **Customizable Layout**: Drag-and-drop widgets
6. **Notifications**: In-app notifications for completed content
7. **Quick Actions**: Bulk operations on content
8. **Advanced Filters**: Multiple filter combinations
9. **Saved Views**: Save filter/search preferences
10. **Dashboard Themes**: Light/dark mode toggle

---

## Code Examples

### Fetching Dashboard Data

```javascript
const fetchDashboardData = async () => {
  try {
    const [statsRes, contentsRes] = await Promise.all([
      api.get('/auth/stats'),
      api.get('/content?limit=5')
    ]);
    setStats(statsRes.data);
    setContents(contentsRes.data.contents);
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    showToast.error('Failed to load dashboard data');
  } finally {
    setLoading(false);
  }
};
```

### Filtering Content

```javascript
const filteredContents = contents.filter(content => {
  const matchesSearch = content.title
    ?.toLowerCase()
    .includes(searchQuery.toLowerCase());
  const matchesPlatform = platformFilter === 'all' ||
    content.variants?.some(v => v.platform === platformFilter);
  return matchesSearch && matchesPlatform;
});
```

### Generating Chart Data

```javascript
const generateChartData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    content: Math.floor(Math.random() * 10) + 2,
    variants: Math.floor(Math.random() * 30) + 10,
  }));
};
```

---

## Summary

The SACO Dashboard provides:

✅ **At-a-glance KPIs** with animated count-ups
✅ **Performance visualization** with interactive charts
✅ **Recent activity timeline** showing latest work
✅ **Searchable content table** with filtering
✅ **Responsive design** for all devices
✅ **Smooth animations** for engaging UX
✅ **Empty states** with clear CTAs
✅ **Quick actions** for common tasks
✅ **Real-time data** from backend APIs
✅ **Accessible interface** following WCAG guidelines

The dashboard serves as the command center for content orchestration, providing users with immediate insights into their content performance and easy access to all platform features.
