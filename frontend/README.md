# Frontend

Beautiful, modern React UI for Match-Line.

## Setup

```bash
npm install
npm run dev
```

App runs on http://localhost:3001

## Architecture

- **React 18** with TypeScript for type safety
- **Tailwind CSS** for elegant, gradient-free design
- **Zustand** for state management
- **React Router** for navigation
- **Axios** for API calls

## Design Principles

- ✨ **Clean** - No gradients, simple color palette (blues & slates)
- 🎨 **Consistent** - Reusable components, unified spacing/typography
- ⚡ **Fast** - Optimized rendering, efficient state management
- ♿ **Accessible** - ARIA labels, keyboard navigation, focus states
- 📱 **Responsive** - Mobile-first design

## Key Components

- `Button` - Primary, secondary, ghost variants
- `Card` - Header, body, footer sections
- `Input/TextArea` - With validation and error states
- `Badge` - Color-coded variants
- `Modal` - Lightweight overlay dialogs
- `Alert` - Success/error/warning notifications
- `MatchScoreDisplay` - Visual score representation

## Pages

- **Dashboard** - Overview with stats and recent matches
- **Resumes** - Upload and manage resumes
- **Jobs** - Create and manage job listings
- **Matches** - View and filter scoring results

## File Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Full page components
├── hooks/         # Custom React hooks
├── stores/        # Zustand state stores
├── utils/         # Formatting & helpers
├── lib/           # API client
└── types/         # TypeScript definitions
```
