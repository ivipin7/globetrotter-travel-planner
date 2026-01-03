# GlobeTrotter Hackathon Development Plan

**Date:** January 3, 2026  
**Project:** GlobeTrotter  
**Status:** Planning Phase

---

## 📋 Problem Statement Alignment

### Vision Match: ✅ 95% Aligned
Your existing UI perfectly matches the hackathon vision:
- ✅ Explore global destinations (Discover page exists)
- ✅ Visualize journeys (Dashboard structure ready)
- ✅ Cost-effective decisions (Budget components built)
- ✅ Share travel plans (UI structure ready)

### Current vs. Required

| Requirement | Current Status | Action Needed |
|------------|----------------|---------------|
| Multi-city itineraries | UI mockup only | Backend + functionality |
| Travel dates & activities | UI components ready | Connect to database |
| Budget estimation | UI visualization ready | Implement calculation logic |
| Visual calendars | Not implemented | Add calendar view |
| Share plans | UI ready | Implement sharing logic |
| User authentication | UI only | Integrate real auth |
| Database | Not connected | Design & implement schema |

---

## 🎯 Feature Mapping: Existing UI → Requirements

### ✅ Already Built (UI Only)

| Screen # | Required Screen | Existing Component | Status |
|----------|----------------|-------------------|--------|
| 1 | Login/Signup | `Login.tsx`, `Signup.tsx` | ✅ Complete UI |
| 2 | Dashboard/Home | `Dashboard.tsx` | ✅ Complete UI |
| 3 | Create Trip | Not built | ❌ Need to create |
| 4 | My Trips List | `Dashboard.tsx` (partial) | ⚠️ Extend existing |
| 5 | Itinerary Builder | Not built | ❌ Need to create |
| 6 | Itinerary View | Not built | ❌ Need to create |
| 7 | City Search | `Discover.tsx` | ✅ Complete UI |
| 8 | Activity Search | Not built | ⚠️ Similar to Discover |
| 9 | Budget Breakdown | `BudgetCard.tsx` | ✅ Component ready |
| 10 | Trip Calendar/Timeline | Not built | ❌ Need to create |
| 11 | Shared Itinerary View | Not built | ❌ Need to create |
| 12 | User Profile/Settings | Not built | ❌ Need to create |
| 13 | Admin Dashboard | Not built | ⚠️ Optional |

**Summary:**
- ✅ **4 screens complete** (Login, Signup, Dashboard partial, Discover)
- ⚠️ **3 screens need extension** (Dashboard, Activity search, Admin)
- ❌ **6 screens need creation** (Create Trip, Itinerary Builder/View, Calendar, Share, Profile)

---

## 🏗️ Database Schema Design

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  profile_photo_url TEXT,
  language_preference VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Trips Table
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, upcoming, ongoing, completed
  is_public BOOLEAN DEFAULT false,
  public_url VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Cities Table (Master Data)
```sql
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  region VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  cost_index INT, -- 1-4 (budget to luxury)
  popularity_score INT,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Trip Stops Table
```sql
CREATE TABLE trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  city_id UUID REFERENCES cities(id),
  stop_order INT NOT NULL,
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Activities Table (Master Data)
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- sightseeing, adventure, food, culture, etc.
  duration_hours DECIMAL(4, 2),
  estimated_cost DECIMAL(10, 2),
  image_url TEXT,
  popularity_score INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Trip Activities Table
```sql
CREATE TABLE trip_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_stop_id UUID REFERENCES trip_stops(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id),
  scheduled_date DATE,
  scheduled_time TIME,
  activity_order INT,
  custom_cost DECIMAL(10, 2), -- user can override
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Budget Expenses Table
```sql
CREATE TABLE budget_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  category VARCHAR(50), -- transport, accommodation, activities, meals, other
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Saved Destinations Table
```sql
CREATE TABLE saved_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  city_id UUID REFERENCES cities(id),
  saved_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, city_id)
);
```

### Trip Shares Table
```sql
CREATE TABLE trip_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  shared_with_email VARCHAR(255),
  permission VARCHAR(20) DEFAULT 'view', -- view, edit
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Development Phases

### Phase 1: Backend Setup (Priority: HIGH) ⏱️ 6-8 hours

**Goal:** Set up Supabase and connect to frontend

#### Tasks:
1. **Create Supabase Project** (30 mins)
   - Sign up at supabase.com
   - Create new project
   - Save API keys

2. **Run Database Migrations** (1 hour)
   - Create all tables using SQL editor
   - Add indexes for performance
   - Set up Row Level Security (RLS) policies

3. **Implement Authentication** (2 hours)
   - Install `@supabase/supabase-js`
   - Create auth context
   - Connect Login/Signup forms
   - Add protected routes
   - Implement logout functionality

4. **Create API Service Layer** (2 hours)
   - Create `src/services/` folder
   - `authService.ts` - login, signup, logout
   - `tripsService.ts` - CRUD operations
   - `citiesService.ts` - fetch cities
   - `activitiesService.ts` - fetch activities
   - `budgetService.ts` - budget calculations

5. **Configure TanStack Query** (1 hour)
   - Set up query hooks
   - Add error handling
   - Configure cache settings

6. **Environment Setup** (30 mins)
   - Create `.env.local`
   - Add Supabase keys
   - Update `.gitignore`

**Deliverables:**
- ✅ Working authentication
- ✅ Database connected
- ✅ API service layer ready
- ✅ User can login/signup

---

### Phase 2: Core Trip Management (Priority: HIGH) ⏱️ 6-8 hours

**Goal:** Users can create, view, edit, and delete trips

#### Tasks:
1. **Create Trip Form** (2 hours)
   - New page: `src/pages/CreateTrip.tsx`
   - Form with: name, dates, description, image upload
   - Validation with Zod
   - Save to database
   - Navigate to trip details

2. **Trip List Enhancement** (1 hour)
   - Connect `Dashboard.tsx` to real data
   - Fetch user's trips from database
   - Display actual trip data
   - Add loading states

3. **Trip Detail Page** (2 hours)
   - New page: `src/pages/TripDetail.tsx`
   - Display trip overview
   - Show stops and activities
   - Edit/Delete buttons
   - Share button

4. **Update Trip Functionality** (1 hour)
   - Edit trip modal/page
   - Update trip details
   - Save changes to database

5. **Delete Trip Functionality** (30 mins)
   - Confirmation dialog
   - Cascade delete stops/activities
   - Redirect after deletion

**Deliverables:**
- ✅ Users can create trips
- ✅ Users can view all trips
- ✅ Users can edit trips
- ✅ Users can delete trips

---

### Phase 3: Itinerary Builder (Priority: HIGH) ⏱️ 8-10 hours

**Goal:** Users can add cities, dates, and activities to trips

#### Tasks:
1. **Add Stop Interface** (3 hours)
   - New component: `AddStopDialog.tsx`
   - Search cities from database
   - Select arrival/departure dates
   - Add notes
   - Save stop to trip
   - Display in order

2. **Reorder Stops** (2 hours)
   - Drag-and-drop functionality
   - Use `@dnd-kit/core` library
   - Update stop_order in database
   - Visual feedback

3. **Add Activities to Stop** (3 hours)
   - Activity search/browse
   - Filter by category, cost, duration
   - Add to specific stop
   - Schedule time for activity
   - Customize cost

4. **Itinerary View Component** (2 hours)
   - Day-by-day layout
   - City headers
   - Activity cards with time
   - Edit inline
   - Remove activities

**Deliverables:**
- ✅ Users can add cities to trip
- ✅ Users can reorder cities
- ✅ Users can add activities
- ✅ Users can schedule activities
- ✅ Visual itinerary display

---

### Phase 4: Budget Tracking (Priority: MEDIUM) ⏱️ 4-5 hours

**Goal:** Real-time budget calculations and visualizations

#### Tasks:
1. **Budget Calculation Logic** (2 hours)
   - Calculate total from activities
   - Add manual expenses
   - Category breakdown
   - Currency support

2. **Budget UI Enhancement** (2 hours)
   - Connect `BudgetCard.tsx` to real data
   - Add expense form
   - Update charts (use Recharts)
   - Show alerts for over-budget

3. **Budget Dashboard** (1 hour)
   - Cost per day view
   - Category filters
   - Export to CSV

**Deliverables:**
- ✅ Real-time budget tracking
- ✅ Visual cost breakdown
- ✅ Manual expense entry
- ✅ Budget alerts

---

### Phase 5: Calendar/Timeline View (Priority: MEDIUM) ⏱️ 4-5 hours

**Goal:** Visual timeline of the trip

#### Tasks:
1. **Calendar Component** (3 hours)
   - Install `react-big-calendar` or build custom
   - Display trips on calendar
   - Show activities per day
   - Click to edit

2. **Timeline View** (2 hours)
   - Vertical timeline component
   - Day cards with activities
   - Expandable sections
   - Drag to reschedule

**Deliverables:**
- ✅ Calendar view of trips
- ✅ Timeline view of itinerary
- ✅ Visual day planner

---

### Phase 6: Sharing & Collaboration (Priority: MEDIUM) ⏱️ 3-4 hours

**Goal:** Users can share trips publicly or with specific users

#### Tasks:
1. **Generate Public Link** (1 hour)
   - Create unique URL for trip
   - Toggle public/private
   - Copy link button

2. **Public Trip View** (2 hours)
   - Read-only itinerary view
   - Beautiful public page
   - "Copy this trip" functionality
   - Social sharing buttons

3. **Share with Users** (1 hour)
   - Share via email
   - View permissions
   - Edit permissions (optional)

**Deliverables:**
- ✅ Public trip links
- ✅ Share via email
- ✅ Copy trip feature
- ✅ Social media sharing

---

### Phase 7: User Profile & Settings (Priority: LOW) ⏱️ 2-3 hours

**Goal:** User can manage account and preferences

#### Tasks:
1. **Profile Page** (2 hours)
   - Display user info
   - Edit name, email, photo
   - Change password
   - Language preference

2. **Saved Destinations** (1 hour)
   - Bookmark cities
   - View saved list
   - Quick add to trip

**Deliverables:**
- ✅ Profile management
- ✅ Saved destinations
- ✅ Account settings

---

### Phase 8: Polish & Testing (Priority: HIGH) ⏱️ 4-6 hours

**Goal:** Bug-free, polished experience

#### Tasks:
1. **Error Handling** (2 hours)
   - Add error boundaries
   - Toast notifications
   - Fallback UI

2. **Loading States** (1 hour)
   - Skeletons for all pages
   - Progress indicators
   - Optimistic updates

3. **Responsive Testing** (1 hour)
   - Test all screens on mobile
   - Fix layout issues
   - Touch interactions

4. **Performance** (1 hour)
   - Image optimization
   - Lazy loading
   - Code splitting

5. **Testing** (1 hour)
   - Manual testing all flows
   - Fix critical bugs
   - Cross-browser testing

**Deliverables:**
- ✅ Error-free experience
- ✅ Fast loading
- ✅ Mobile optimized
- ✅ Production ready

---

## 📊 Priority Matrix

### Must Have (MVP)
1. ✅ Authentication (Login/Signup)
2. ✅ Create Trip
3. ✅ Add Cities to Trip
4. ✅ Add Activities
5. ✅ View Itinerary
6. ✅ Budget Tracking
7. ✅ My Trips List

### Should Have
8. ✅ Calendar View
9. ✅ Reorder Stops
10. ✅ Share Trip (public link)
11. ✅ Budget Breakdown Charts

### Nice to Have
12. ⚠️ Drag-drop activities
13. ⚠️ Copy trip feature
14. ⚠️ User profile
15. ⚠️ Saved destinations
16. ⚠️ Admin dashboard

---

## 🛠️ Technology Stack Decisions

### Backend: Supabase ✅
**Why:**
- PostgreSQL database (relational)
- Built-in authentication
- Real-time subscriptions
- Row Level Security
- Fast setup for hackathon

**Alternatives Considered:**
- Firebase (NoSQL, less suitable for relational data)
- Node.js + Express (too much setup time)

### State Management: TanStack Query ✅
**Why:**
- Already installed
- Perfect for server state
- Automatic caching
- Optimistic updates

### Additional Libraries Needed:
```json
{
  "@supabase/supabase-js": "^2.39.0",
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "react-big-calendar": "^1.11.0" // or custom calendar
}
```

---

## 📁 New File Structure

```
src/
├── services/
│   ├── supabase.ts           # Supabase client
│   ├── authService.ts        # Auth functions
│   ├── tripsService.ts       # Trip CRUD
│   ├── citiesService.ts      # City queries
│   ├── activitiesService.ts  # Activity queries
│   └── budgetService.ts      # Budget calculations
│
├── contexts/
│   └── AuthContext.tsx       # Auth state management
│
├── types/
│   ├── database.types.ts     # Supabase generated types
│   └── app.types.ts          # Custom types
│
├── pages/
│   ├── CreateTrip.tsx        # NEW
│   ├── TripDetail.tsx        # NEW
│   ├── ItineraryBuilder.tsx  # NEW
│   ├── Calendar.tsx          # NEW
│   ├── PublicTrip.tsx        # NEW
│   └── Profile.tsx           # NEW
│
├── components/
│   ├── trip/
│   │   ├── TripForm.tsx
│   │   ├── AddStopDialog.tsx
│   │   ├── StopCard.tsx
│   │   └── ActivityCard.tsx
│   ├── itinerary/
│   │   ├── DayView.tsx
│   │   ├── TimelineView.tsx
│   │   └── CalendarView.tsx
│   └── shared/
│       ├── ProtectedRoute.tsx
│       └── ErrorBoundary.tsx
│
└── hooks/
    ├── useAuth.tsx
    ├── useTrips.tsx
    ├── useCities.tsx
    └── useActivities.tsx
```

---

## ⏰ Time Estimates Summary

| Phase | Description | Time |
|-------|-------------|------|
| 1 | Backend Setup | 6-8 hours |
| 2 | Trip Management | 6-8 hours |
| 3 | Itinerary Builder | 8-10 hours |
| 4 | Budget Tracking | 4-5 hours |
| 5 | Calendar View | 4-5 hours |
| 6 | Sharing | 3-4 hours |
| 7 | Profile | 2-3 hours |
| 8 | Polish & Testing | 4-6 hours |

**Total: 37-49 hours**

**Recommended for Hackathon:**
- Focus on Phases 1-4 (MVP)
- Total MVP Time: **20-26 hours**
- Add Phase 5 or 6 if time permits

---

## 🎯 Unique Selling Points for Judges

### What Makes This Stand Out:

1. **Beautiful, Modern UI** ✨
   - Professional design system
   - Smooth animations
   - Glassmorphism effects
   - Mobile-first responsive

2. **Complete Relational Database** 🗄️
   - Proper normalization
   - Efficient queries
   - Scalable architecture

3. **Real-time Budget Tracking** 💰
   - Automatic cost calculations
   - Visual breakdown charts
   - Budget alerts

4. **Flexible Itinerary Builder** 🗓️
   - Drag-and-drop interface
   - Multi-city support
   - Activity scheduling

5. **Collaborative Features** 👥
   - Public sharing
   - Trip copying
   - Social integration

### Potential Demo Flow:
1. Sign up new account
2. Create trip "Summer Europe 2026"
3. Add cities: Paris → Rome → Barcelona
4. Add activities to each city
5. View budget breakdown
6. See calendar timeline
7. Generate public link
8. Show mobile responsive view

---

## 📝 Implementation Checklist

### Pre-Development
- [ ] Create Supabase account
- [ ] Set up database schema
- [ ] Install additional packages
- [ ] Create `.env.local` file
- [ ] Review database relationships

### Phase 1: Backend
- [ ] Supabase client setup
- [ ] Auth context
- [ ] Login functionality
- [ ] Signup functionality
- [ ] Protected routes
- [ ] API service layer

### Phase 2: Trips
- [ ] Create trip form
- [ ] Save trip to DB
- [ ] Fetch user trips
- [ ] Trip detail page
- [ ] Edit trip
- [ ] Delete trip

### Phase 3: Itinerary
- [ ] City search
- [ ] Add stop to trip
- [ ] Display stops
- [ ] Reorder stops
- [ ] Activity search
- [ ] Add activity to stop
- [ ] Schedule activities
- [ ] Itinerary view

### Phase 4: Budget
- [ ] Calculate from activities
- [ ] Manual expenses
- [ ] Category breakdown
- [ ] Visual charts
- [ ] Budget alerts

### Phase 5: Calendar
- [ ] Calendar component
- [ ] Display trips
- [ ] Timeline view
- [ ] Day details

### Phase 6: Sharing
- [ ] Generate public URL
- [ ] Public trip view
- [ ] Copy trip
- [ ] Share buttons

### Phase 7: Profile
- [ ] Profile page
- [ ] Edit profile
- [ ] Saved destinations
- [ ] Settings

### Phase 8: Polish
- [ ] Error handling
- [ ] Loading states
- [ ] Mobile testing
- [ ] Performance
- [ ] Bug fixes

### Deployment
- [ ] Build production
- [ ] Deploy to Vercel
- [ ] Test live URL
- [ ] Prepare demo

---

## 🚀 Quick Start Commands

```bash
# Install new dependencies
npm install @supabase/supabase-js @dnd-kit/core @dnd-kit/sortable

# Create environment file
echo "VITE_SUPABASE_URL=your-project-url" > .env.local
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env.local

# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📈 Success Metrics

### Hackathon Judging Criteria (Anticipated)

1. **Functionality** (30%)
   - All core features working
   - Smooth user experience
   - No critical bugs

2. **Technical Implementation** (25%)
   - Proper database design
   - Clean code structure
   - Good practices

3. **Innovation** (20%)
   - Unique features
   - Creative solutions
   - User experience

4. **UI/UX Design** (15%)
   - Visual appeal
   - Ease of use
   - Responsive design

5. **Presentation** (10%)
   - Clear demo
   - Problem understanding
   - Future vision

### Our Strengths:
- ✅ UI/UX: 15/15 (already excellent)
- ✅ Technical: 20/25 (with proper implementation)
- ✅ Functionality: 25/30 (if we complete MVP)
- ⚠️ Innovation: 15/20 (need unique feature)
- ✅ Presentation: 8/10 (with good demo)

**Target Score: 83-88/100**

---

## 💡 Innovation Ideas (Pick One)

### Option 1: AI Trip Assistant 🤖
- Suggest activities based on interests
- Optimize itinerary order
- Budget recommendations

### Option 2: Weather Integration ☀️
- Show weather forecast for dates
- Activity recommendations based on weather
- Packing list suggestions

### Option 3: Social Features 👥
- Friend trip suggestions
- Community itineraries
- Travel matching

### Option 4: Gamification 🎮
- Travel badges
- Destination achievements
- Points system

**Recommendation:** Focus on core features first, add innovation if time permits.

---

## 🎓 Learning Resources

### Supabase
- Docs: https://supabase.com/docs
- Auth: https://supabase.com/docs/guides/auth
- Database: https://supabase.com/docs/guides/database

### React Query
- Docs: https://tanstack.com/query/latest/docs/react

### Drag and Drop
- DND Kit: https://docs.dndkit.com/

---

## 🔥 Day-by-Day Plan (48-hour Hackathon)

### Day 1 (24 hours)
**Morning (8 hours):**
- Phase 1: Backend setup (6 hours)
- Phase 2: Trip CRUD basics (2 hours)

**Afternoon (8 hours):**
- Phase 2: Complete trip management (4 hours)
- Phase 3: Start itinerary builder (4 hours)

**Evening (8 hours):**
- Phase 3: Complete itinerary (4 hours)
- Phase 4: Budget tracking (4 hours)

### Day 2 (24 hours)
**Morning (8 hours):**
- Phase 5: Calendar view (4 hours)
- Phase 6: Sharing features (4 hours)

**Afternoon (8 hours):**
- Phase 8: Testing & bug fixes (4 hours)
- Polish UI/UX (2 hours)
- Deployment (2 hours)

**Evening (8 hours):**
- Prepare presentation (3 hours)
- Final testing (2 hours)
- Demo rehearsal (3 hours)

---

## ✅ Definition of Done

### MVP Complete When:
- ✅ User can signup/login
- ✅ User can create a trip
- ✅ User can add cities to trip
- ✅ User can add activities to cities
- ✅ User can see itinerary view
- ✅ User can see budget breakdown
- ✅ App is deployed and accessible
- ✅ Mobile responsive works
- ✅ No critical bugs

### Bonus Points:
- ✅ Calendar/timeline view
- ✅ Public sharing
- ✅ Drag-drop reordering
- ✅ Beautiful charts

---

## 🎉 Next Steps

1. **Review this plan** ✅
2. **Set up Supabase project**
3. **Start with Phase 1**
4. **Build incrementally**
5. **Test frequently**
6. **Deploy early**
7. **Polish before demo**

---

*Good luck with your hackathon! This plan gives you a clear roadmap from your current state to a winning submission. Focus on completing the MVP first, then add polish and unique features.* 🚀
