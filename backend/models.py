from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

# Site Settings Model
class SiteSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    siteName: str
    logoUrl: Optional[str] = None
    phone: str
    email: str
    address: str

class SiteSettingsUpdate(BaseModel):
    siteName: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

# Hero Carousel Model
class HeroCarouselItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    alt: str
    order: int = 0
    enabled: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class HeroCarouselUpdate(BaseModel):
    alt: Optional[str] = None
    enabled: Optional[bool] = None

class HeroCarouselReorder(BaseModel):
    items: List[dict]

# Wedding Model
class Wedding(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    coverImage: str
    brideName: str
    groomName: str
    date: str
    location: str
    images: List[str] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class WeddingCreate(BaseModel):
    brideName: str
    groomName: str
    date: str
    location: str

class WeddingUpdate(BaseModel):
    brideName: Optional[str] = None
    groomName: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None

# Film Model
class Film(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    videoUrl: str
    thumbnail: str
    isFeatured: bool = True

class FilmUpdate(BaseModel):
    title: str
    videoUrl: str

# About Model
class About(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image: str
    name: str
    bio: str

class AboutUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None

# Package Model
class Package(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    thumbnail: str
    description: str
    images: List[str] = []
    pricing: str
    order: int = 0

class PackageCreate(BaseModel):
    title: str
    description: str
    pricing: str

class PackageUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    pricing: Optional[str] = None

# Contact Inquiry Model
class ContactInquiry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    weddingDate: str
    message: str
    submittedAt: datetime = Field(default_factory=datetime.utcnow)

class ContactInquiryCreate(BaseModel):
    name: str
    email: str
    phone: str
    weddingDate: str
    message: str

# Admin Login
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Admin Credentials (stored in DB)
class AdminCredentials(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AdminChangeCredentials(BaseModel):
    old_password: str
    new_username: Optional[str] = None
    new_password: Optional[str] = None

class AdminCredentialsResponse(BaseModel):
    username: str
    updated_at: datetime

# YouTube Settings
class YouTubeSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    channel_id: str = ""
    api_key: str = ""
    max_videos: int = 6
    enabled: bool = False
    section_title: str = "YouTube Stories"
    section_description: str = "Watch our latest stories and behind-the-scenes"

class YouTubeSettingsUpdate(BaseModel):
    channel_id: Optional[str] = None
    api_key: Optional[str] = None
    max_videos: Optional[int] = None
    enabled: Optional[bool] = None
    section_title: Optional[str] = None
    section_description: Optional[str] = None

class YouTubeVideo(BaseModel):
    video_id: str
    title: str
    description: str
    thumbnail: str
    published_at: str

# Section Content Settings (for CMS-editable titles/descriptions)
class SectionContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section_key: str  # films, about, contact, etc.
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None

class SectionContentUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None

# Facebook Settings
class FacebookSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pageId: str
    accessToken: str
    postsLimit: int = 6
    enabled: bool = True

class FacebookSettingsCreate(BaseModel):
    pageId: str
    accessToken: str
    postsLimit: int = 6
    enabled: bool = True

class FacebookSettingsUpdate(BaseModel):
    pageId: Optional[str] = None
    accessToken: Optional[str] = None
    postsLimit: Optional[int] = None
    enabled: Optional[bool] = None

# Social Media Links
class SocialMediaLinks(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    pinterest: Optional[str] = None
    tiktok: Optional[str] = None
    enabled: bool = True

class SocialMediaLinksUpdate(BaseModel):
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    pinterest: Optional[str] = None
    tiktok: Optional[str] = None
    enabled: Optional[bool] = None