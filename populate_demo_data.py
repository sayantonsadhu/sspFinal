#!/usr/bin/env python3
"""
Demo Data Population Script for Sayanton Sadhu Photography Website
"""
import requests
import json
import os
from pathlib import Path

# Configuration
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API = f"{BACKEND_URL}/api"

# Login credentials
USERNAME = "admin"
PASSWORD = "admin123"

# Demo data
HERO_IMAGES = [
    {
        "url": "https://images.unsplash.com/photo-1617724975854-70b5d0cedb0a?w=2000&q=80",
        "alt": "Beach destination wedding couple"
    },
    {
        "url": "https://images.unsplash.com/flagged/photo-1552981941-424aac2b4311?w=2000&q=80",
        "alt": "Romantic couple kissing"
    },
    {
        "url": "https://images.unsplash.com/photo-1573676048035-9c2a72b6a12a?w=2000&q=80",
        "alt": "Editorial black and white ceremony"
    },
    {
        "url": "https://images.unsplash.com/photo-1599142296733-1c1f2073e6de?w=2000&q=80",
        "alt": "Beach bride destination shot"
    },
    {
        "url": "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=2000&q=80",
        "alt": "Classic couple portrait"
    },
    {
        "url": "https://images.unsplash.com/photo-1630526720753-aa4e71acf67d?w=2000&q=80",
        "alt": "Indian wedding couple outdoor"
    }
]

WEDDINGS = [
    {
        "brideName": "Priya",
        "groomName": "Rahul",
        "date": "2024-12-15",
        "location": "Kolkata",
        "coverImage": "https://images.unsplash.com/photo-1533091090875-1ff4acc497dd?w=800&q=80",
        "galleryImages": [
            "https://images.unsplash.com/photo-1573676048035-9c2a72b6a12a?w=1200&q=80",
            "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1200&q=80",
            "https://images.unsplash.com/photo-1533091090875-1ff4acc497dd?w=1200&q=80",
            "https://images.unsplash.com/photo-1599462616558-2b75fd26a283?w=1200&q=80",
            "https://images.unsplash.com/photo-1585241920473-b472eb9ffbae?w=1200&q=80",
            "https://images.pexels.com/photos/949224/pexels-photo-949224.jpeg?w=1200&q=80",
            "https://images.pexels.com/photos/758898/pexels-photo-758898.png?w=1200&q=80",
            "https://images.unsplash.com/photo-1617724975854-70b5d0cedb0a?w=1200&q=80",
            "https://images.unsplash.com/flagged/photo-1552981941-424aac2b4311?w=1200&q=80",
            "https://images.unsplash.com/photo-1630526720753-aa4e71acf67d?w=1200&q=80"
        ]
    },
    {
        "brideName": "Sneha",
        "groomName": "Arjun",
        "date": "2024-11-28",
        "location": "Delhi",
        "coverImage": "https://images.unsplash.com/photo-1599462616558-2b75fd26a283?w=800&q=80",
        "galleryImages": [
            "https://images.unsplash.com/photo-1599462616558-2b75fd26a283?w=1200&q=80",
            "https://images.unsplash.com/photo-1585241920473-b472eb9ffbae?w=1200&q=80",
            "https://images.pexels.com/photos/949224/pexels-photo-949224.jpeg?w=1200&q=80",
            "https://images.pexels.com/photos/758898/pexels-photo-758898.png?w=1200&q=80",
            "https://images.pexels.com/photos/4611741/pexels-photo-4611741.jpeg?w=1200&q=80",
            "https://images.unsplash.com/photo-1617724975854-70b5d0cedb0a?w=1200&q=80",
            "https://images.unsplash.com/photo-1630526720753-aa4e71acf67d?w=1200&q=80",
            "https://images.unsplash.com/photo-1622277430358-f4d134452e2e?w=1200&q=80",
            "https://images.pexels.com/photos/2058070/pexels-photo-2058070.jpeg?w=1200&q=80"
        ]
    },
    {
        "brideName": "Emma",
        "groomName": "James",
        "date": "2024-10-20",
        "location": "Goa",
        "coverImage": "https://images.unsplash.com/photo-1585241920473-b472eb9ffbae?w=800&q=80",
        "galleryImages": [
            "https://images.unsplash.com/photo-1585241920473-b472eb9ffbae?w=1200&q=80",
            "https://images.pexels.com/photos/949224/pexels-photo-949224.jpeg?w=1200&q=80",
            "https://images.unsplash.com/photo-1573676048035-9c2a72b6a12a?w=1200&q=80",
            "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1200&q=80",
            "https://images.unsplash.com/photo-1617724975854-70b5d0cedb0a?w=1200&q=80",
            "https://images.unsplash.com/flagged/photo-1552981941-424aac2b4311?w=1200&q=80",
            "https://images.unsplash.com/photo-1599142296733-1c1f2073e6de?w=1200&q=80",
            "https://images.unsplash.com/photo-1630526720753-aa4e71acf67d?w=1200&q=80"
        ]
    },
    {
        "brideName": "Ananya",
        "groomName": "Vikram",
        "date": "2024-09-15",
        "location": "Mumbai",
        "coverImage": "https://images.pexels.com/photos/949224/pexels-photo-949224.jpeg?w=800&q=80",
        "galleryImages": [
            "https://images.pexels.com/photos/949224/pexels-photo-949224.jpeg?w=1200&q=80",
            "https://images.pexels.com/photos/758898/pexels-photo-758898.png?w=1200&q=80",
            "https://images.pexels.com/photos/4611741/pexels-photo-4611741.jpeg?w=1200&q=80",
            "https://images.unsplash.com/photo-1533091090875-1ff4acc497dd?w=1200&q=80",
            "https://images.unsplash.com/photo-1599462616558-2b75fd26a283?w=1200&q=80",
            "https://images.unsplash.com/photo-1573676048035-9c2a72b6a12a?w=1200&q=80",
            "https://images.unsplash.com/photo-1617724975854-70b5d0cedb0a?w=1200&q=80",
            "https://images.unsplash.com/photo-1630526720753-aa4e71acf67d?w=1200&q=80",
            "https://images.unsplash.com/photo-1622277430358-f4d134452e2e?w=1200&q=80"
        ]
    },
    {
        "brideName": "Sophia",
        "groomName": "Michael",
        "date": "2024-08-10",
        "location": "Jaipur",
        "coverImage": "https://images.pexels.com/photos/758898/pexels-photo-758898.png?w=800&q=80",
        "galleryImages": [
            "https://images.pexels.com/photos/758898/pexels-photo-758898.png?w=1200&q=80",
            "https://images.pexels.com/photos/4611741/pexels-photo-4611741.jpeg?w=1200&q=80",
            "https://images.unsplash.com/photo-1585241920473-b472eb9ffbae?w=1200&q=80",
            "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1200&q=80",
            "https://images.unsplash.com/photo-1599462616558-2b75fd26a283?w=1200&q=80",
            "https://images.unsplash.com/photo-1573676048035-9c2a72b6a12a?w=1200&q=80",
            "https://images.unsplash.com/photo-1617724975854-70b5d0cedb0a?w=1200&q=80",
            "https://images.unsplash.com/photo-1630526720753-aa4e71acf67d?w=1200&q=80"
        ]
    },
    {
        "brideName": "Riya",
        "groomName": "Aditya",
        "date": "2024-07-05",
        "location": "Udaipur",
        "coverImage": "https://images.pexels.com/photos/4611741/pexels-photo-4611741.jpeg?w=800&q=80",
        "galleryImages": [
            "https://images.pexels.com/photos/4611741/pexels-photo-4611741.jpeg?w=1200&q=80",
            "https://images.unsplash.com/photo-1533091090875-1ff4acc497dd?w=1200&q=80",
            "https://images.unsplash.com/photo-1599462616558-2b75fd26a283?w=1200&q=80",
            "https://images.unsplash.com/photo-1585241920473-b472eb9ffbae?w=1200&q=80",
            "https://images.pexels.com/photos/949224/pexels-photo-949224.jpeg?w=1200&q=80",
            "https://images.pexels.com/photos/758898/pexels-photo-758898.png?w=1200&q=80",
            "https://images.unsplash.com/photo-1617724975854-70b5d0cedb0a?w=1200&q=80",
            "https://images.unsplash.com/flagged/photo-1552981941-424aac2b4311?w=1200&q=80",
            "https://images.unsplash.com/photo-1630526720753-aa4e71acf67d?w=1200&q=80"
        ]
    }
]

PACKAGES = [
    {
        "title": "Wedding Photography",
        "description": "Complete wedding day coverage with candid and traditional photography",
        "pricing": "₹80,000 - ₹1,50,000",
        "thumbnail": "https://images.unsplash.com/photo-1521467752200-3bccf80f16ed?w=800&q=80",
        "images": [
            "https://images.unsplash.com/photo-1573676048035-9c2a72b6a12a?w=1200&q=80",
            "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=1200&q=80",
            "https://images.unsplash.com/photo-1533091090875-1ff4acc497dd?w=1200&q=80"
        ]
    },
    {
        "title": "Pre-Wedding Photography",
        "description": "Destination pre-wedding shoots in stunning locations",
        "pricing": "₹40,000 - ₹80,000",
        "thumbnail": "https://images.unsplash.com/photo-1677691256999-45d69a11b197?w=800&q=80",
        "images": [
            "https://images.unsplash.com/photo-1617724975854-70b5d0cedb0a?w=1200&q=80",
            "https://images.unsplash.com/photo-1599142296733-1c1f2073e6de?w=1200&q=80",
            "https://images.unsplash.com/photo-1630526720753-aa4e71acf67d?w=1200&q=80"
        ]
    },
    {
        "title": "Candid Photography",
        "description": "Natural, unposed moments capturing real emotions",
        "pricing": "₹50,000 - ₹1,00,000",
        "thumbnail": "https://images.pexels.com/photos/6198803/pexels-photo-6198803.jpeg?w=800&q=80",
        "images": [
            "https://images.unsplash.com/flagged/photo-1552981941-424aac2b4311?w=1200&q=80",
            "https://images.unsplash.com/photo-1599462616558-2b75fd26a283?w=1200&q=80",
            "https://images.unsplash.com/photo-1585241920473-b472eb9ffbae?w=1200&q=80"
        ]
    }
]

def login():
    """Login and get auth token"""
    print("🔐 Logging in...")
    response = requests.post(f"{API}/admin/login", json={
        "username": USERNAME,
        "password": PASSWORD
    })
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("✅ Login successful!")
        return token
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def download_and_upload_image(url, token, prefix):
    """Download image from URL and prepare for upload"""
    try:
        # Download image
        img_response = requests.get(url, timeout=10)
        if img_response.status_code != 200:
            print(f"❌ Failed to download {url}")
            return None
        
        # Return bytes and filename
        filename = f"{prefix}_{url.split('/')[-1].split('?')[0]}.jpg"
        return (filename, img_response.content)
    except Exception as e:
        print(f"❌ Error downloading {url}: {e}")
        return None

def populate_hero_carousel(token):
    """Populate hero carousel with demo images"""
    print("\n📸 Populating Hero Carousel...")
    headers = {"Authorization": f"Bearer {token}"}
    
    for idx, img_data in enumerate(HERO_IMAGES, 1):
        print(f"  Uploading carousel image {idx}/{len(HERO_IMAGES)}...")
        image_data = download_and_upload_image(img_data["url"], token, "hero")
        if image_data:
            files = {'image': image_data}
            data = {'alt': img_data["alt"]}
            response = requests.post(f"{API}/admin/hero-carousel", headers=headers, files=files, data=data)
            if response.status_code in [200, 201]:
                print(f"  ✅ Uploaded carousel image {idx}")
            else:
                print(f"  ❌ Failed to upload carousel image {idx}: {response.text}")

def populate_weddings(token):
    """Populate weddings with galleries"""
    print("\n💒 Populating Weddings...")
    headers = {"Authorization": f"Bearer {token}"}
    
    for idx, wedding in enumerate(WEDDINGS, 1):
        print(f"  Creating wedding {idx}/{len(WEDDINGS)}: {wedding['brideName']} & {wedding['groomName']}...")
        
        # Download cover image
        cover_img = download_and_upload_image(wedding["coverImage"], token, "wedding")
        if not cover_img:
            continue
        
        # Create wedding
        files = {'coverImage': cover_img}
        data = {
            'brideName': wedding['brideName'],
            'groomName': wedding['groomName'],
            'date': wedding['date'],
            'location': wedding['location']
        }
        response = requests.post(f"{API}/admin/weddings", headers=headers, files=files, data=data)
        
        if response.status_code in [200, 201]:
            wedding_id = response.json()['id']
            print(f"  ✅ Created wedding {idx}")
            
            # Upload gallery images
            print(f"  Uploading {len(wedding['galleryImages'])} gallery images...")
            gallery_files = []
            for gallery_url in wedding['galleryImages']:
                img_data = download_and_upload_image(gallery_url, token, "gallery")
                if img_data:
                    gallery_files.append(('images', img_data))
            
            if gallery_files:
                response = requests.post(f"{API}/admin/weddings/{wedding_id}/images", headers=headers, files=gallery_files)
                if response.status_code in [200, 201]:
                    print(f"  ✅ Uploaded gallery images for wedding {idx}")
                else:
                    print(f"  ❌ Failed to upload gallery images: {response.text}")
        else:
            print(f"  ❌ Failed to create wedding {idx}: {response.text}")

def populate_packages(token):
    """Populate photography packages"""
    print("\n📦 Populating Packages...")
    headers = {"Authorization": f"Bearer {token}"}
    
    for idx, package in enumerate(PACKAGES, 1):
        print(f"  Creating package {idx}/{len(PACKAGES)}: {package['title']}...")
        
        # Download thumbnail
        thumb_img = download_and_upload_image(package["thumbnail"], token, "package")
        if not thumb_img:
            continue
        
        # Create package
        files = {'thumbnail': thumb_img}
        data = {
            'title': package['title'],
            'description': package['description'],
            'pricing': package['pricing']
        }
        response = requests.post(f"{API}/admin/packages", headers=headers, files=files, data=data)
        
        if response.status_code in [200, 201]:
            package_id = response.json()['id']
            print(f"  ✅ Created package {idx}")
            
            # Upload package images
            print(f"  Uploading {len(package['images'])} package images...")
            gallery_files = []
            for img_url in package['images']:
                img_data = download_and_upload_image(img_url, token, "package_img")
                if img_data:
                    gallery_files.append(('images', img_data))
            
            if gallery_files:
                response = requests.post(f"{API}/admin/packages/{package_id}/images", headers=headers, files=gallery_files)
                if response.status_code in [200, 201]:
                    print(f"  ✅ Uploaded package images for package {idx}")
                else:
                    print(f"  ❌ Failed to upload package images: {response.text}")
        else:
            print(f"  ❌ Failed to create package {idx}: {response.text}")

def main():
    print("🚀 Starting Demo Data Population...")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    
    # Login
    token = login()
    if not token:
        print("\n❌ Cannot proceed without authentication")
        return
    
    # Populate data
    populate_hero_carousel(token)
    populate_weddings(token)
    populate_packages(token)
    
    print("\n✅ Demo data population complete!")
    print(f"🌐 Visit: http://localhost:3000")
    print(f"🔐 Admin: http://localhost:3000/admin/login")

if __name__ == "__main__":
    main()
