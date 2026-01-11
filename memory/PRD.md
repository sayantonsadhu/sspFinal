# Sayanton Sadhu Photography - Product Requirements Document

## Original Problem Statement
Create a modern photography portfolio website inspired by `rigbiswas.com` for a professional wedding photographer. The website should be premium, editorial, and feature a comprehensive admin panel for content management.

## User Personas
- **Primary User**: Sayanton Sadhu - Wedding photographer who needs to showcase work and manage content
- **Secondary User**: Potential clients browsing the portfolio and submitting inquiries

## Branding
- **Site Name**: Sayanton Sadhu Photography
- **Primary Color**: #e30909 (Vermillion Red)
- **Typography**: Montserrat for headings and site name
- **Design Style**: Premium, editorial, high white-space ratio

---

## Core Features & Implementation Status

### ✅ COMPLETED

#### 1. Admin Authentication & Security (P0)
- **Implemented**: 2026-01-11
- Bcrypt password hashing for secure credential storage
- Admin credential change functionality (username + password)
- JWT-based authentication with 24-hour token expiry
- Admin Security page at `/admin/security`
- API Endpoints:
  - `POST /api/admin/login` - Login with hashed password verification
  - `GET /api/admin/credentials` - Get current admin info
  - `PUT /api/admin/credentials` - Change credentials (requires old password)

#### 2. Hero Carousel with Auto-Rotation
- Full-width dynamic photo carousel
- 5-second auto-rotation interval
- Manual navigation (arrows + dots)
- Admin management at `/admin/hero-carousel`

#### 3. Recent Weddings Section
- Grid display of latest 6 weddings
- Individual wedding gallery pages
- Multi-image upload support per wedding
- Admin management at `/admin/weddings`

#### 4. Wedding Films Section
- Embedded YouTube video player
- CMS-editable title, subtitle, and description
- Admin management at `/admin/films`

#### 5. YouTube Stories Section (NEW)
- **Implemented**: 2026-01-11
- Display latest 6 videos from YouTube channel
- Configurable Channel ID and API Key
- Custom section title and description
- Admin management at `/admin/youtube`
- API Endpoints:
  - `GET /api/youtube/settings` - Public settings
  - `GET /api/youtube/videos` - Fetch videos
  - `GET/PUT /api/admin/youtube/settings` - Admin settings
  - `POST /api/admin/youtube/test` - Test API connection

#### 6. About Me Section
- Photographer photo and bio
- CMS-editable content
- Admin management at `/admin/about`

#### 7. Photography Packages Section
- Thumbnail-based package display
- Detailed package information
- Admin management at `/admin/packages`

#### 8. Social Media Section
- **Fixed**: 2026-01-11
- Modern gradient icon cards (Facebook, Instagram, YouTube, Twitter, LinkedIn, Pinterest, TikTok)
- Only displays platforms with configured URLs
- Admin management at `/admin/social-media`

#### 9. Facebook Integration
- **Status**: Implemented but requires user API credentials
- Display recent posts from Facebook page
- Test connection feature
- Admin management at `/admin/facebook`
- Requires: Facebook Page ID + Access Token

#### 10. Contact/Enquiry Form
- Functional form with validation
- CMS-editable title and subtitle
- Inquiries viewable at `/admin/inquiries`

#### 11. Section Content CMS (NEW)
- **Implemented**: 2026-01-11
- Editable titles and subtitles for all sections
- Sections: Weddings, Films, About, Packages, Contact
- Admin management at `/admin/section-content`
- API Endpoint: `GET/PUT /api/sections/{section_key}`

#### 12. Site Settings
- Logo upload
- Site name customization
- Contact information (phone, email, address)
- Admin management at `/admin/settings`

---

## Technical Architecture

### Frontend
- **Framework**: React 18+
- **Routing**: react-router-dom v6
- **Styling**: Tailwind CSS
- **Components**: Shadcn/UI
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: Sonner

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB (motor async driver)
- **Authentication**: JWT (python-jose) + Bcrypt
- **File Uploads**: python-multipart

### Database Collections
- `admin_credentials` - Admin username and hashed password
- `settings` - Site-wide settings
- `hero_carousel` - Hero images
- `weddings` - Wedding data with galleries
- `films` - Featured film settings
- `about` - About section content
- `packages` - Photography packages
- `contact_inquiries` - Form submissions
- `facebook_settings` - Facebook integration config
- `social_media_links` - Social media URLs
- `youtube_settings` - YouTube integration config
- `section_content` - CMS content for section titles

---

## API Endpoints Summary

### Public Endpoints
- `GET /api/` - Health check
- `GET /api/settings` - Site settings
- `GET /api/hero-carousel` - Hero images
- `GET /api/weddings` - Wedding list
- `GET /api/weddings/{id}` - Wedding detail
- `GET /api/films/featured` - Featured film
- `GET /api/about` - About content
- `GET /api/packages` - Package list
- `GET /api/sections/{key}` - Section content
- `GET /api/social-media` - Social links
- `GET /api/facebook/settings` - Facebook settings
- `GET /api/facebook/posts` - Facebook posts
- `GET /api/youtube/settings` - YouTube settings
- `GET /api/youtube/videos` - YouTube videos
- `POST /api/contact` - Submit inquiry

### Admin Endpoints (Require Auth)
- `POST /api/admin/login` - Login
- `GET /api/admin/credentials` - Get credentials
- `PUT /api/admin/credentials` - Change credentials
- All CRUD operations for content management

---

## Admin Credentials
- **URL**: `/admin/login`
- **Username**: admin
- **Password**: admin123

---

## Pending/Future Features

### P1 - High Priority
- None currently

### P2 - Medium Priority
- Implement caching for YouTube API responses
- Add loading states and error boundaries for better UX

### P3 - Nice to Have
- Image optimization/lazy loading improvements
- SEO metadata management
- Analytics integration
- Email notifications for inquiries

---

## Notes
- **Deployment**: User explicitly requested NOT to deploy. Application runs locally.
- **Facebook Integration**: Requires valid Facebook Page Access Token from user
- **YouTube Integration**: Requires valid YouTube Data API v3 key from user

---

*Last Updated: 2026-01-11*
