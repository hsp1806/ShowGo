# ShowGo

A modern event discovery and management platform built with React, TypeScript, and Supabase. ShowGo connects event organizers with attendees, making it easy to create, discover, and join local events.

**[Live Demo](https://showgo-homepage-ui-u-dyge.bolt.host/)**

---

## Features

- **Browse and discover events** with detailed information and images
- **User authentication** with secure sign-up and sign-in
- **Create and manage events** as an organizer
- **Join events** and track your attendance
- **User profiles** showing organized and attended events
- **Image uploads** for event visuals via Supabase Storage
- **Responsive design** that works seamlessly on desktop and mobile
- **Real-time updates** with Supabase's real-time capabilities

---

## Technologies Used

- **React** with TypeScript for type-safe component development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for modern, responsive styling
- **Supabase** for:
  - PostgreSQL database
  - Authentication
  - Storage (image uploads)
  - Row Level Security (RLS)
- **Lucide React** for icons
- **Netlify** for deployment

---

## Installation & Running

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd showgo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## Usage

1. **Sign up** for an account or **sign in** if you already have one
2. **Browse events** on the home page to discover what's happening
3. **Create an event** by clicking the "Create Event" button (requires authentication)
4. **Join events** you're interested in by clicking the "Join Event" button
5. **Manage your events** through your profile page:
   - View events you've organized
   - See events you're attending
   - Edit or manage your created events

---

## Database Schema

The application uses the following main tables:
- **profiles**: User profile information
- **events**: Event details including title, description, location, and dates
- **event_attendees**: Junction table linking users to events they've joined

All tables are protected with Row Level Security policies to ensure data privacy and security.

---

## Author
**Het Patel** | **GrowFrame**
*First-Year Computer Science Major*
Passionate about building tools that make life easier through code.

GrowFrame is my personal organization for coding projects focused on growth and innovation.
