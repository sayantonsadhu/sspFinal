from fastapi import FastAPI, APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from typing import List, Optional
from datetime import timedelta, datetime

from models import (
    SiteSettings, SiteSettingsUpdate,
    HeroCarouselItem, HeroCarouselUpdate, HeroCarouselReorder,
    Wedding, WeddingCreate, WeddingUpdate,
    Film, FilmUpdate,
    About, AboutUpdate, AboutFeaturesUpdate, AboutFeature,
    Package, PackageCreate, PackageUpdate,
    ContactInquiry, ContactInquiryCreate,
    AdminLogin, AdminToken, AdminChangeCredentials, AdminCredentialsResponse,
    FacebookSettings, FacebookSettingsCreate, FacebookSettingsUpdate,
    SocialMediaLinks, SocialMediaLinksUpdate,
    YouTubeSettings, YouTubeSettingsUpdate, YouTubeVideo,
    SectionContent, SectionContentUpdate
)
from file_upload import save_upload_file, delete_file, UPLOAD_DIR
from auth import create_access_token, verify_token, hash_password, verify_password, DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ AUTHENTICATION ============

async def get_or_create_admin():
    """Get admin credentials from DB or create default"""
    admin = await db.admin_credentials.find_one()
    if not admin:
        # Create default admin with hashed password
        admin_data = {
            "id": str(uuid.uuid4()),
            "username": DEFAULT_ADMIN_USERNAME,
            "password_hash": hash_password(DEFAULT_ADMIN_PASSWORD),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.admin_credentials.insert_one(admin_data)
        admin = admin_data
    return admin

@api_router.post("/admin/login", response_model=AdminToken)
async def admin_login(credentials: AdminLogin):
    admin = await get_or_create_admin()
    
    if credentials.username != admin["username"]:
        logger.warning(f"Login attempt with invalid username: {credentials.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, admin["password_hash"]):
        logger.warning(f"Login attempt with invalid password for user: {credentials.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(
        data={"sub": credentials.username},
        expires_delta=timedelta(hours=24)
    )
    logger.info(f"Successful login for user: {credentials.username}")
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/admin/credentials", response_model=AdminCredentialsResponse)
async def get_admin_credentials(_: dict = Depends(verify_token)):
    """Get current admin username"""
    admin = await get_or_create_admin()
    return {"username": admin["username"], "updated_at": admin["updated_at"]}

@api_router.put("/admin/credentials", response_model=AdminCredentialsResponse)
async def change_admin_credentials(
    credentials: AdminChangeCredentials,
    _: dict = Depends(verify_token)
):
    """Change admin username and/or password"""
    admin = await get_or_create_admin()
    
    # Verify old password
    if not verify_password(credentials.old_password, admin["password_hash"]):
        logger.warning("Failed credential change attempt - invalid old password")
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    update_data = {"updated_at": datetime.utcnow()}
    
    if credentials.new_username:
        update_data["username"] = credentials.new_username
    
    if credentials.new_password:
        if len(credentials.new_password) < 6:
            raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
        update_data["password_hash"] = hash_password(credentials.new_password)
    
    await db.admin_credentials.update_one(
        {"id": admin["id"]},
        {"$set": update_data}
    )
    
    updated_admin = await db.admin_credentials.find_one({"id": admin["id"]})
    logger.info(f"Admin credentials updated successfully")
    return {"username": updated_admin["username"], "updated_at": updated_admin["updated_at"]}

# ============ SITE SETTINGS ============

@api_router.get("/settings", response_model=SiteSettings)
async def get_settings():
    settings = await db.settings.find_one()
    if not settings:
        # Create default settings
        default_settings = SiteSettings(
            siteName="Sayanton Sadhu Photography",
            logoUrl=None,
            phone="+91 98765 43210",
            email="hello@sayantonsadhu.com",
            address="Kolkata, West Bengal, India"
        )
        await db.settings.insert_one(default_settings.dict())
        settings = default_settings.dict()
    return SiteSettings(**settings)

@api_router.put("/settings", response_model=SiteSettings)
async def update_settings(
    settings_update: SiteSettingsUpdate,
    _: dict = Depends(verify_token)
):
    settings = await db.settings.find_one()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    update_data = {k: v for k, v in settings_update.dict().items() if v is not None}
    await db.settings.update_one({"id": settings["id"]}, {"$set": update_data})
    
    updated_settings = await db.settings.find_one({"id": settings["id"]})
    return SiteSettings(**updated_settings)

@api_router.post("/settings/upload-logo")
async def upload_logo(
    logo: UploadFile = File(...),
    _: dict = Depends(verify_token)
):
    settings = await db.settings.find_one()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    # Delete old logo if exists
    if settings.get("logoUrl"):
        delete_file(settings["logoUrl"])
    
    # Save new logo
    logo_url = await save_upload_file(logo, "logo")
    await db.settings.update_one({"id": settings["id"]}, {"$set": {"logoUrl": logo_url}})
    
    return {"logoUrl": logo_url}

# ============ HERO CAROUSEL ============

@api_router.get("/hero-carousel", response_model=List[HeroCarouselItem])
async def get_hero_carousel():
    items = await db.hero_carousel.find({"enabled": True}).sort("order", 1).to_list(100)
    return [HeroCarouselItem(**item) for item in items]

@api_router.get("/admin/hero-carousel", response_model=List[HeroCarouselItem])
async def get_all_hero_carousel(_: dict = Depends(verify_token)):
    items = await db.hero_carousel.find().sort("order", 1).to_list(100)
    return [HeroCarouselItem(**item) for item in items]

@api_router.post("/admin/hero-carousel", response_model=HeroCarouselItem)
async def create_hero_carousel(
    image: UploadFile = File(...),
    alt: str = Form(...),
    _: dict = Depends(verify_token)
):
    image_url = await save_upload_file(image, "hero")
    
    # Get max order
    items = await db.hero_carousel.find().to_list(100)
    max_order = max([item.get("order", 0) for item in items], default=0)
    
    carousel_item = HeroCarouselItem(
        url=image_url,
        alt=alt,
        order=max_order + 1
    )
    await db.hero_carousel.insert_one(carousel_item.dict())
    return carousel_item

@api_router.put("/admin/hero-carousel/{item_id}", response_model=HeroCarouselItem)
async def update_hero_carousel(
    item_id: str,
    update: HeroCarouselUpdate,
    _: dict = Depends(verify_token)
):
    item = await db.hero_carousel.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    await db.hero_carousel.update_one({"id": item_id}, {"$set": update_data})
    
    updated_item = await db.hero_carousel.find_one({"id": item_id})
    return HeroCarouselItem(**updated_item)

@api_router.delete("/admin/hero-carousel/{item_id}")
async def delete_hero_carousel(
    item_id: str,
    _: dict = Depends(verify_token)
):
    item = await db.hero_carousel.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    delete_file(item["url"])
    await db.hero_carousel.delete_one({"id": item_id})
    return {"message": "Item deleted successfully"}

@api_router.put("/admin/hero-carousel/reorder")
async def reorder_hero_carousel(
    reorder: HeroCarouselReorder,
    _: dict = Depends(verify_token)
):
    for item in reorder.items:
        await db.hero_carousel.update_one(
            {"id": item["id"]},
            {"$set": {"order": item["order"]}}
        )
    return {"message": "Reordered successfully"}

# ============ WEDDINGS ============

@api_router.get("/weddings", response_model=List[Wedding])
async def get_weddings(limit: int = 100):
    weddings = await db.weddings.find().sort("date", -1).limit(limit).to_list(limit)
    return [Wedding(**wedding) for wedding in weddings]

@api_router.get("/weddings/{wedding_id}", response_model=Wedding)
async def get_wedding(wedding_id: str):
    wedding = await db.weddings.find_one({"id": wedding_id})
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    return Wedding(**wedding)

@api_router.post("/admin/weddings", response_model=Wedding)
async def create_wedding(
    coverImage: UploadFile = File(...),
    brideName: str = Form(...),
    groomName: str = Form(...),
    date: str = Form(...),
    location: str = Form(...),
    _: dict = Depends(verify_token)
):
    image_url = await save_upload_file(coverImage, "wedding")
    
    wedding = Wedding(
        coverImage=image_url,
        brideName=brideName,
        groomName=groomName,
        date=date,
        location=location
    )
    await db.weddings.insert_one(wedding.dict())
    return wedding

@api_router.put("/admin/weddings/{wedding_id}", response_model=Wedding)
async def update_wedding(
    wedding_id: str,
    brideName: Optional[str] = Form(None),
    groomName: Optional[str] = Form(None),
    date: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    coverImage: Optional[UploadFile] = File(None),
    _: dict = Depends(verify_token)
):
    wedding = await db.weddings.find_one({"id": wedding_id})
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    update_data = {}
    if brideName:
        update_data["brideName"] = brideName
    if groomName:
        update_data["groomName"] = groomName
    if date:
        update_data["date"] = date
    if location:
        update_data["location"] = location
    if coverImage:
        delete_file(wedding["coverImage"])
        update_data["coverImage"] = await save_upload_file(coverImage, "wedding")
    
    await db.weddings.update_one({"id": wedding_id}, {"$set": update_data})
    updated_wedding = await db.weddings.find_one({"id": wedding_id})
    return Wedding(**updated_wedding)

@api_router.delete("/admin/weddings/{wedding_id}")
async def delete_wedding(
    wedding_id: str,
    _: dict = Depends(verify_token)
):
    wedding = await db.weddings.find_one({"id": wedding_id})
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    delete_file(wedding["coverImage"])
    for image_url in wedding.get("images", []):
        delete_file(image_url)
    await db.weddings.delete_one({"id": wedding_id})
    return {"message": "Wedding deleted successfully"}

@api_router.post("/admin/weddings/{wedding_id}/images", response_model=Wedding)
async def add_wedding_images(
    wedding_id: str,
    images: List[UploadFile] = File(...),
    _: dict = Depends(verify_token)
):
    wedding = await db.weddings.find_one({"id": wedding_id})
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    image_urls = []
    for image in images:
        image_url = await save_upload_file(image, "wedding")
        image_urls.append(image_url)
    
    current_images = wedding.get("images", [])
    current_images.extend(image_urls)
    
    await db.weddings.update_one({"id": wedding_id}, {"$set": {"images": current_images}})
    updated_wedding = await db.weddings.find_one({"id": wedding_id})
    return Wedding(**updated_wedding)

@api_router.delete("/admin/weddings/{wedding_id}/images/{image_index}")
async def delete_wedding_image(
    wedding_id: str,
    image_index: int,
    _: dict = Depends(verify_token)
):
    wedding = await db.weddings.find_one({"id": wedding_id})
    if not wedding:
        raise HTTPException(status_code=404, detail="Wedding not found")
    
    images = wedding.get("images", [])
    if image_index < 0 or image_index >= len(images):
        raise HTTPException(status_code=404, detail="Image not found")
    
    image_url = images[image_index]
    delete_file(image_url)
    images.pop(image_index)
    
    await db.weddings.update_one({"id": wedding_id}, {"$set": {"images": images}})
    return {"message": "Image deleted successfully"}

# ============ FILMS ============

def extract_youtube_video_id(url: str) -> Optional[str]:
    """Extract video ID from various YouTube URL formats"""
    import re
    patterns = [
        r'(?:youtube\.com/embed/)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com/watch\?v=)([a-zA-Z0-9_-]{11})',
        r'(?:youtu\.be/)([a-zA-Z0-9_-]{11})',
        r'(?:youtube\.com/v/)([a-zA-Z0-9_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_youtube_thumbnail(video_id: str) -> str:
    """Get YouTube thumbnail URL from video ID"""
    # Use maxresdefault first, fallback to hqdefault
    return f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"

@api_router.get("/films/featured", response_model=Film)
async def get_featured_film():
    film = await db.films.find_one({"isFeatured": True})
    if not film:
        # Create default film
        default_film = Film(
            title="Wedding Film",
            videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ",
            thumbnail="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
            isFeatured=True
        )
        await db.films.insert_one(default_film.dict())
        film = default_film.dict()
    return Film(**film)

@api_router.put("/admin/films/featured", response_model=Film)
async def update_featured_film(
    film_update: FilmUpdate,
    _: dict = Depends(verify_token)
):
    film = await db.films.find_one({"isFeatured": True})
    if not film:
        raise HTTPException(status_code=404, detail="Featured film not found")
    
    update_data = {"title": film_update.title, "videoUrl": film_update.videoUrl}
    
    # Auto-extract thumbnail from YouTube URL
    video_id = extract_youtube_video_id(film_update.videoUrl)
    if video_id:
        update_data["thumbnail"] = get_youtube_thumbnail(video_id)
    
    await db.films.update_one(
        {"id": film["id"]},
        {"$set": update_data}
    )
    
    updated_film = await db.films.find_one({"id": film["id"]})
    return Film(**updated_film)

# ============ ABOUT ============

DEFAULT_ABOUT_FEATURES = [
    {"title": "Award Winning", "description": "Recognized for excellence in wedding photography across prestigious platforms"},
    {"title": "Passion Driven", "description": "Every wedding is unique, and we pour our heart into capturing your special moments"},
    {"title": "Expert Team", "description": "Years of experience with state-of-the-art equipment and creative storytelling"}
]

@api_router.get("/about", response_model=About)
async def get_about():
    about = await db.about.find_one()
    if not about:
        # Create default about
        default_about = About(
            image="https://images.pexels.com/photos/3775262/pexels-photo-3775262.jpeg?w=800&q=80",
            name="Sayanton Sadhu Photography",
            bio="Capturing genuine emotions and once-in-a-lifetime moments with utmost care and professionalism. From pre-wedding shoots to post-wedding celebrations, we create timeless memories that tell your unique love story. Our editorial style combines candid moments with artistic composition, ensuring every frame reflects the beauty and emotion of your special day.",
            features=DEFAULT_ABOUT_FEATURES
        )
        await db.about.insert_one(default_about.dict())
        about = default_about.dict()
    
    # Ensure features exist (for backward compatibility)
    if "features" not in about or not about["features"]:
        about["features"] = DEFAULT_ABOUT_FEATURES
        await db.about.update_one({"id": about["id"]}, {"$set": {"features": DEFAULT_ABOUT_FEATURES}})
    
    return About(**about)

@api_router.put("/admin/about", response_model=About)
async def update_about(
    name: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    _: dict = Depends(verify_token)
):
    about = await db.about.find_one()
    if not about:
        raise HTTPException(status_code=404, detail="About section not found")
    
    update_data = {}
    if name:
        update_data["name"] = name
    if bio:
        update_data["bio"] = bio
    if image:
        if about.get("image") and about["image"].startswith("/api/uploads/"):
            delete_file(about["image"])
        update_data["image"] = await save_upload_file(image, "about")
    
    await db.about.update_one({"id": about["id"]}, {"$set": update_data})
    updated_about = await db.about.find_one({"id": about["id"]})
    return About(**updated_about)

# ============ PACKAGES ============

@api_router.get("/packages", response_model=List[Package])
async def get_packages():
    packages = await db.packages.find().sort("order", 1).to_list(100)
    return [Package(**package) for package in packages]

@api_router.post("/admin/packages", response_model=Package)
async def create_package(
    thumbnail: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    pricing: str = Form(...),
    _: dict = Depends(verify_token)
):
    thumbnail_url = await save_upload_file(thumbnail, "package")
    
    # Get max order
    packages = await db.packages.find().to_list(100)
    max_order = max([pkg.get("order", 0) for pkg in packages], default=0)
    
    package = Package(
        thumbnail=thumbnail_url,
        title=title,
        description=description,
        pricing=pricing,
        order=max_order + 1
    )
    await db.packages.insert_one(package.dict())
    return package

@api_router.put("/admin/packages/{package_id}", response_model=Package)
async def update_package(
    package_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    pricing: Optional[str] = Form(None),
    thumbnail: Optional[UploadFile] = File(None),
    _: dict = Depends(verify_token)
):
    package = await db.packages.find_one({"id": package_id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    update_data = {}
    if title:
        update_data["title"] = title
    if description:
        update_data["description"] = description
    if pricing:
        update_data["pricing"] = pricing
    if thumbnail:
        delete_file(package["thumbnail"])
        update_data["thumbnail"] = await save_upload_file(thumbnail, "package")
    
    await db.packages.update_one({"id": package_id}, {"$set": update_data})
    updated_package = await db.packages.find_one({"id": package_id})
    return Package(**updated_package)

@api_router.delete("/admin/packages/{package_id}")
async def delete_package(
    package_id: str,
    _: dict = Depends(verify_token)
):
    package = await db.packages.find_one({"id": package_id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    delete_file(package["thumbnail"])
    for image_url in package.get("images", []):
        delete_file(image_url)
    
    await db.packages.delete_one({"id": package_id})
    return {"message": "Package deleted successfully"}

@api_router.post("/admin/packages/{package_id}/images", response_model=Package)
async def add_package_images(
    package_id: str,
    images: List[UploadFile] = File(...),
    _: dict = Depends(verify_token)
):
    package = await db.packages.find_one({"id": package_id})
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    image_urls = []
    for image in images:
        image_url = await save_upload_file(image, "package")
        image_urls.append(image_url)
    
    current_images = package.get("images", [])
    current_images.extend(image_urls)
    
    await db.packages.update_one({"id": package_id}, {"$set": {"images": current_images}})
    updated_package = await db.packages.find_one({"id": package_id})
    return Package(**updated_package)

# ============ CONTACT ============

@api_router.post("/contact", response_model=ContactInquiry)
async def create_contact_inquiry(inquiry: ContactInquiryCreate):
    contact_inquiry = ContactInquiry(**inquiry.dict())
    await db.contact_inquiries.insert_one(contact_inquiry.dict())
    return contact_inquiry

@api_router.get("/admin/contact", response_model=List[ContactInquiry])
async def get_contact_inquiries(_: dict = Depends(verify_token)):
    inquiries = await db.contact_inquiries.find().sort("submittedAt", -1).to_list(100)
    return [ContactInquiry(**inquiry) for inquiry in inquiries]

# ============ FACEBOOK INTEGRATION ============

@api_router.get("/facebook/settings")
async def get_facebook_settings():
    settings = await db.facebook_settings.find_one()
    if settings and settings.get('enabled'):
        # Return public data only (no access token)
        return {
            "pageId": settings.get("pageId"),
            "enabled": settings.get("enabled", True),
            "postsLimit": settings.get("postsLimit", 6)
        }
    return {"enabled": False}

@api_router.get("/facebook/posts")
async def get_facebook_posts():
    """Fetch recent posts from Facebook page"""
    settings = await db.facebook_settings.find_one()
    
    if not settings or not settings.get('enabled'):
        return []
    
    page_id = settings.get('pageId')
    access_token = settings.get('accessToken')
    posts_limit = settings.get('postsLimit', 6)
    
    if not page_id or not access_token:
        return []
    
    try:
        # Fetch posts from Facebook Graph API
        url = f"https://graph.facebook.com/v18.0/{page_id}/posts"
        params = {
            'fields': 'id,message,created_time,full_picture,permalink_url,attachments{media,description,url}',
            'limit': posts_limit,
            'access_token': access_token
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            posts = []
            
            for post in data.get('data', []):
                post_data = {
                    'id': post.get('id'),
                    'message': post.get('message', ''),
                    'created_time': post.get('created_time'),
                    'image': post.get('full_picture'),
                    'link': post.get('permalink_url'),
                }
                
                # Try to get better image from attachments
                if post.get('attachments'):
                    attachments = post['attachments'].get('data', [])
                    if attachments:
                        media = attachments[0].get('media')
                        if media and media.get('image'):
                            post_data['image'] = media['image'].get('src')
                
                posts.append(post_data)
            
            return posts
        else:
            logger.error(f"Facebook API error: {response.text}")
            return []
            
    except Exception as e:
        logger.error(f"Error fetching Facebook posts: {str(e)}")
        return []

@api_router.get("/admin/facebook/settings", response_model=FacebookSettings)
async def get_facebook_settings_admin(_: dict = Depends(verify_token)):
    settings = await db.facebook_settings.find_one()
    if not settings:
        # Create default settings
        default_settings = FacebookSettings(
            pageId="",
            accessToken="",
            postsLimit=6,
            enabled=False
        )
        await db.facebook_settings.insert_one(default_settings.dict())
        settings = default_settings.dict()
    return FacebookSettings(**settings)

@api_router.put("/admin/facebook/settings", response_model=FacebookSettings)
async def update_facebook_settings(
    settings_update: FacebookSettingsUpdate,
    _: dict = Depends(verify_token)
):
    settings = await db.facebook_settings.find_one()
    if not settings:
        raise HTTPException(status_code=404, detail="Facebook settings not found")
    
    update_data = {k: v for k, v in settings_update.dict().items() if v is not None}
    await db.facebook_settings.update_one({"id": settings["id"]}, {"$set": update_data})
    
    updated_settings = await db.facebook_settings.find_one({"id": settings["id"]})
    return FacebookSettings(**updated_settings)

@api_router.post("/admin/facebook/test")
async def test_facebook_connection(
    settings: FacebookSettingsCreate,
    _: dict = Depends(verify_token)
):
    """Test Facebook API connection"""
    try:
        url = f"https://graph.facebook.com/v18.0/{settings.pageId}"
        params = {
            'fields': 'name,fan_count,picture',
            'access_token': settings.accessToken
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "pageName": data.get('name'),
                "followers": data.get('fan_count'),
                "message": "Connection successful!"
            }
        else:
            return {
                "success": False,
                "message": f"Failed to connect: {response.json().get('error', {}).get('message', 'Unknown error')}"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error: {str(e)}"
        }

# ============ SOCIAL MEDIA LINKS ============

@api_router.get("/social-media")
async def get_social_media_links():
    """Get social media links for public display"""
    links = await db.social_media_links.find_one()
    if links and links.get('enabled'):
        # Return only non-empty links
        result = {}
        for platform in ['facebook', 'instagram', 'youtube', 'twitter', 'linkedin', 'pinterest', 'tiktok']:
            if links.get(platform):
                result[platform] = links[platform]
        result['enabled'] = True
        return result
    return {"enabled": False}

@api_router.get("/admin/social-media", response_model=SocialMediaLinks)
async def get_social_media_links_admin(_: dict = Depends(verify_token)):
    links = await db.social_media_links.find_one()
    if not links:
        # Create default settings
        default_links = SocialMediaLinks(
            facebook="",
            instagram="",
            youtube="",
            twitter="",
            linkedin="",
            pinterest="",
            tiktok="",
            enabled=True
        )
        await db.social_media_links.insert_one(default_links.dict())
        links = default_links.dict()
    return SocialMediaLinks(**links)

@api_router.put("/admin/social-media", response_model=SocialMediaLinks)
async def update_social_media_links(
    links_update: SocialMediaLinksUpdate,
    _: dict = Depends(verify_token)
):
    links = await db.social_media_links.find_one()
    if not links:
        raise HTTPException(status_code=404, detail="Social media links not found")
    
    update_data = {k: v for k, v in links_update.dict().items() if v is not None}
    await db.social_media_links.update_one({"id": links["id"]}, {"$set": update_data})
    
    updated_links = await db.social_media_links.find_one({"id": links["id"]})
    return SocialMediaLinks(**updated_links)

# ============ FILE SERVING ============

@api_router.get("/uploads/{filename}")
async def serve_upload(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# ============ YOUTUBE STORIES ============

@api_router.get("/youtube/settings")
async def get_youtube_settings_public():
    """Get YouTube settings for public display"""
    settings = await db.youtube_settings.find_one()
    if settings and settings.get('enabled'):
        return {
            "enabled": True,
            "section_title": settings.get("section_title", "YouTube Stories"),
            "section_description": settings.get("section_description", "")
        }
    return {"enabled": False}

@api_router.get("/youtube/videos", response_model=List[YouTubeVideo])
async def get_youtube_videos():
    """Fetch videos from YouTube channel"""
    settings = await db.youtube_settings.find_one()
    
    if not settings or not settings.get('enabled'):
        return []
    
    channel_id = settings.get('channel_id')
    api_key = settings.get('api_key')
    max_videos = settings.get('max_videos', 6)
    
    if not channel_id or not api_key:
        return []
    
    try:
        # Fetch videos from YouTube Data API
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            'part': 'snippet',
            'channelId': channel_id,
            'maxResults': max_videos,
            'order': 'date',
            'type': 'video',
            'key': api_key
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            videos = []
            
            for item in data.get('items', []):
                snippet = item.get('snippet', {})
                video_data = YouTubeVideo(
                    video_id=item['id']['videoId'],
                    title=snippet.get('title', ''),
                    description=snippet.get('description', ''),
                    thumbnail=snippet.get('thumbnails', {}).get('high', {}).get('url', ''),
                    published_at=snippet.get('publishedAt', '')
                )
                videos.append(video_data)
            
            return videos
        else:
            logger.error(f"YouTube API error: {response.text}")
            return []
            
    except Exception as e:
        logger.error(f"Error fetching YouTube videos: {str(e)}")
        return []

@api_router.get("/admin/youtube/settings", response_model=YouTubeSettings)
async def get_youtube_settings_admin(_: dict = Depends(verify_token)):
    settings = await db.youtube_settings.find_one()
    if not settings:
        # Create default settings
        default_settings = YouTubeSettings()
        await db.youtube_settings.insert_one(default_settings.dict())
        settings = default_settings.dict()
    return YouTubeSettings(**settings)

@api_router.put("/admin/youtube/settings", response_model=YouTubeSettings)
async def update_youtube_settings(
    settings_update: YouTubeSettingsUpdate,
    _: dict = Depends(verify_token)
):
    settings = await db.youtube_settings.find_one()
    if not settings:
        # Create default settings first
        default_settings = YouTubeSettings()
        await db.youtube_settings.insert_one(default_settings.dict())
        settings = default_settings.dict()
    
    update_data = {k: v for k, v in settings_update.dict().items() if v is not None}
    await db.youtube_settings.update_one({"id": settings["id"]}, {"$set": update_data})
    
    updated_settings = await db.youtube_settings.find_one({"id": settings["id"]})
    return YouTubeSettings(**updated_settings)

@api_router.post("/admin/youtube/test")
async def test_youtube_connection(
    channel_id: str = Form(...),
    api_key: str = Form(...),
    _: dict = Depends(verify_token)
):
    """Test YouTube API connection"""
    try:
        url = "https://www.googleapis.com/youtube/v3/channels"
        params = {
            'part': 'snippet,statistics',
            'id': channel_id,
            'key': api_key
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            items = data.get('items', [])
            if items:
                channel = items[0]
                snippet = channel.get('snippet', {})
                stats = channel.get('statistics', {})
                return {
                    "success": True,
                    "channelName": snippet.get('title'),
                    "subscribers": stats.get('subscriberCount'),
                    "videoCount": stats.get('videoCount'),
                    "message": "Connection successful!"
                }
            else:
                return {
                    "success": False,
                    "message": "Channel not found. Please check your Channel ID."
                }
        else:
            error_msg = response.json().get('error', {}).get('message', 'Unknown error')
            return {
                "success": False,
                "message": f"Failed to connect: {error_msg}"
            }
    except Exception as e:
        logger.error(f"YouTube test connection error: {str(e)}")
        return {
            "success": False,
            "message": f"Error: {str(e)}"
        }

# ============ SECTION CONTENT (CMS) ============

@api_router.get("/sections/{section_key}")
async def get_section_content(section_key: str):
    """Get content for a specific section"""
    content = await db.section_content.find_one({"section_key": section_key})
    if content:
        return {
            "section_key": content["section_key"],
            "title": content.get("title", ""),
            "subtitle": content.get("subtitle", ""),
            "description": content.get("description", "")
        }
    
    # Return defaults based on section
    defaults = {
        "films": {
            "title": "Wedding Films",
            "subtitle": "Cinematic storytelling that brings your special day to life",
            "description": "Every wedding film is a unique masterpiece. We capture the emotions, the laughter, and the tears, weaving them into a cinematic narrative that you'll cherish forever."
        },
        "about": {
            "title": "About Me",
            "subtitle": "The photographer behind the lens",
            "description": ""
        },
        "contact": {
            "title": "Let's Create Magic Together",
            "subtitle": "Ready to capture your special moments? Get in touch and let's discuss your dream wedding photography",
            "description": ""
        },
        "weddings": {
            "title": "Recent Weddings",
            "subtitle": "A glimpse into the beautiful moments we've captured",
            "description": ""
        },
        "packages": {
            "title": "Photography Packages",
            "subtitle": "Choose the perfect package for your special day",
            "description": ""
        }
    }
    
    return {
        "section_key": section_key,
        **defaults.get(section_key, {"title": "", "subtitle": "", "description": ""})
    }

@api_router.get("/admin/sections/{section_key}")
async def get_section_content_admin(section_key: str, _: dict = Depends(verify_token)):
    """Get section content for admin"""
    return await get_section_content(section_key)

@api_router.put("/admin/sections/{section_key}")
async def update_section_content(
    section_key: str,
    update: SectionContentUpdate,
    _: dict = Depends(verify_token)
):
    """Update section content"""
    content = await db.section_content.find_one({"section_key": section_key})
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    update_data["section_key"] = section_key
    
    if content:
        await db.section_content.update_one(
            {"section_key": section_key},
            {"$set": update_data}
        )
    else:
        update_data["id"] = str(uuid.uuid4())
        await db.section_content.insert_one(update_data)
    
    updated_content = await db.section_content.find_one({"section_key": section_key})
    return {
        "section_key": updated_content["section_key"],
        "title": updated_content.get("title", ""),
        "subtitle": updated_content.get("subtitle", ""),
        "description": updated_content.get("description", "")
    }

# ============ HEALTH CHECK ============

@api_router.get("/")
async def root():
    return {"message": "Photography Portfolio API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
