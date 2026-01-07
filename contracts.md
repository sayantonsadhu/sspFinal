# Photography Portfolio - Backend Integration Contracts

## 1. API Contracts

### Site Settings
**GET** `/api/settings`
- Response: `{ id, siteName, logoUrl, phone, email, address }`

**PUT** `/api/settings`
- Request: `{ siteName, phone, email, address }`
- Response: Updated settings object

**POST** `/api/settings/upload-logo`
- Request: FormData with 'logo' file
- Response: `{ logoUrl }`

### Hero Carousel
**GET** `/api/hero-carousel`
- Response: Array of `{ id, url, alt, order, enabled }`

**POST** `/api/hero-carousel`
- Request: FormData with 'image' file and 'alt' text
- Response: Created carousel item

**PUT** `/api/hero-carousel/:id`
- Request: `{ alt, enabled }`
- Response: Updated carousel item

**DELETE** `/api/hero-carousel/:id`
- Response: Success message

**PUT** `/api/hero-carousel/reorder`
- Request: `{ items: [{ id, order }] }`
- Response: Updated items

### Recent Weddings
**GET** `/api/weddings`
- Query: `?limit=6` (default 6 for homepage)
- Response: Array of `{ id, coverImage, brideName, groomName, date, location }`

**POST** `/api/weddings`
- Request: FormData with 'coverImage' file and wedding details
- Response: Created wedding

**PUT** `/api/weddings/:id`
- Request: Wedding details (coverImage optional as FormData)
- Response: Updated wedding

**DELETE** `/api/weddings/:id`
- Response: Success message

### Wedding Films
**GET** `/api/films/featured`
- Response: `{ id, title, videoUrl, thumbnail }`

**PUT** `/api/films/featured`
- Request: `{ title, videoUrl }`
- Response: Updated film

### About Section
**GET** `/api/about`
- Response: `{ id, image, name, bio }`

**PUT** `/api/about`
- Request: FormData with optional 'image' file, 'name', 'bio'
- Response: Updated about data

### Photography Packages
**GET** `/api/packages`
- Response: Array of `{ id, title, thumbnail, description, images, pricing }`

**POST** `/api/packages`
- Request: FormData with 'thumbnail' file and package details
- Response: Created package

**PUT** `/api/packages/:id`
- Request: FormData with optional 'thumbnail' file and package details
- Response: Updated package

**DELETE** `/api/packages/:id`
- Response: Success message

**POST** `/api/packages/:id/images`
- Request: FormData with 'images' files (multiple)
- Response: Updated package with new images

**DELETE** `/api/packages/:id/images/:imageId`
- Response: Success message

### Contact Inquiries
**POST** `/api/contact`
- Request: `{ name, email, phone, weddingDate, message }`
- Response: `{ id, submittedAt }`

**GET** `/api/contact` (Admin only)
- Response: Array of all contact inquiries

---

## 2. Mock Data to Replace

In `/app/frontend/src/mock.js`:
- `heroCarouselImages` → Fetch from `/api/hero-carousel`
- `recentWeddings` → Fetch from `/api/weddings?limit=6`
- `featuredFilm` → Fetch from `/api/films/featured`
- `aboutData` → Fetch from `/api/about`
- `photographyPackages` → Fetch from `/api/packages`
- `siteSettings` → Fetch from `/api/settings`

---

## 3. Backend Implementation Plan

### Database Models (MongoDB)

**Settings Collection:**
```python
{
  "_id": ObjectId,
  "siteName": str,
  "logoUrl": str | None,
  "phone": str,
  "email": str,
  "address": str
}
```

**HeroCarousel Collection:**
```python
{
  "_id": ObjectId,
  "url": str,
  "alt": str,
  "order": int,
  "enabled": bool,
  "createdAt": datetime
}
```

**Weddings Collection:**
```python
{
  "_id": ObjectId,
  "coverImage": str,
  "brideName": str,
  "groomName": str,
  "date": str,
  "location": str,
  "createdAt": datetime
}
```

**Films Collection:**
```python
{
  "_id": ObjectId,
  "title": str,
  "videoUrl": str,
  "thumbnail": str,
  "isFeatured": bool
}
```

**About Collection:**
```python
{
  "_id": ObjectId,
  "image": str,
  "name": str,
  "bio": str
}
```

**Packages Collection:**
```python
{
  "_id": ObjectId,
  "title": str,
  "thumbnail": str,
  "description": str,
  "images": [str],
  "pricing": str,
  "order": int
}
```

**ContactInquiries Collection:**
```python
{
  "_id": ObjectId,
  "name": str,
  "email": str,
  "phone": str,
  "weddingDate": str,
  "message": str,
  "submittedAt": datetime
}
```

### File Upload Strategy
- Store uploaded files in `/app/backend/uploads/` directory
- Serve via static file endpoint `/api/uploads/:filename`
- Use chunked upload for large files
- Supported formats: JPG, PNG, WEBP for images
- Max file size: 10MB per image

---

## 4. Frontend Integration Changes

### Components to Update:

**Navigation.jsx:**
- Fetch siteSettings from API
- Display logo if logoUrl exists

**HeroCarousel.jsx:**
- Replace mock data with API call to `/api/hero-carousel`
- Filter enabled items and sort by order

**RecentWeddings.jsx:**
- Replace mock data with API call to `/api/weddings?limit=6`
- Sort by date descending

**FilmsSection.jsx:**
- Replace mock data with API call to `/api/films/featured`

**AboutSection.jsx:**
- Replace mock data with API call to `/api/about`

**PackagesSection.jsx:**
- Replace mock data with API call to `/api/packages`
- Modal to show package details

**ContactSection.jsx:**
- POST form data to `/api/contact`
- Show success message on submission

**Footer.jsx:**
- Fetch siteSettings from API for contact info

---

## 5. Admin Panel Structure

**Route:** `/admin` (separate from main site)

**Admin Sections:**
1. **Dashboard** - Overview of inquiries and content
2. **Site Settings** - Edit site name, logo, contact info
3. **Hero Carousel** - Upload, reorder, enable/disable images
4. **Weddings** - Add, edit, delete wedding portfolios
5. **Films** - Edit featured film
6. **About** - Edit bio and image
7. **Packages** - Add, edit, delete packages
8. **Inquiries** - View contact form submissions

**Authentication:**
- Simple admin login (username: admin, password stored in .env)
- JWT token-based authentication
- Protected routes

---

## 6. Implementation Steps

1. **Backend Setup:**
   - Create MongoDB models
   - Build CRUD endpoints for all collections
   - Implement file upload with multer
   - Add static file serving

2. **Admin Panel:**
   - Create admin login page
   - Build admin dashboard layout
   - Implement CRUD interfaces for each section
   - Add image upload components

3. **Frontend Integration:**
   - Update all components to fetch from API
   - Add loading states
   - Handle errors gracefully
   - Remove mock.js after integration

4. **Testing:**
   - Test all CRUD operations
   - Test file uploads
   - Test frontend-backend integration
   - Verify responsive design

---

## 7. Environment Variables

Add to `/app/backend/.env`:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<secure_password>
JWT_SECRET=<random_secret>
UPLOAD_DIR=/app/backend/uploads
```
