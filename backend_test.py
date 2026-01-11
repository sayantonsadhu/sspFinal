#!/usr/bin/env python3
"""
Backend API Testing Script for Photography Portfolio Website
Tests all public and admin endpoints with authentication, CRUD operations, file uploads, and error handling.
"""

import requests
import json
import os
from pathlib import Path
import tempfile
from PIL import Image
import io

# Configuration
BASE_URL = "https://lensmasters-14.preview.emergentagent.com/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

class PhotoPortfolioTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.auth_token = None
        self.test_results = []
        self.created_items = {
            'weddings': [],
            'packages': [],
            'carousel_items': []
        }
    
    def log_result(self, test_name, success, message, status_code=None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'status_code': status_code
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if status_code:
            print(f"    Status Code: {status_code}")
    
    def create_test_image(self, filename="test_image.jpg"):
        """Create a test image file"""
        img = Image.new('RGB', (800, 600), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        return img_bytes
    
    def test_admin_login(self):
        """Test admin login endpoint"""
        try:
            response = requests.post(f"{self.base_url}/admin/login", 
                json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD})
            
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data and 'token_type' in data:
                    self.auth_token = data['access_token']
                    self.log_result("Admin Login", True, "Successfully logged in", response.status_code)
                    return True
                else:
                    self.log_result("Admin Login", False, "Missing token in response", response.status_code)
            else:
                self.log_result("Admin Login", False, f"Login failed: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Admin Login", False, f"Exception: {str(e)}")
        return False
    
    def get_auth_headers(self):
        """Get authorization headers"""
        if not self.auth_token:
            return {}
        return {"Authorization": f"Bearer {self.auth_token}"}
    
    def test_get_settings(self):
        """Test GET /api/settings"""
        try:
            response = requests.get(f"{self.base_url}/settings")
            if response.status_code == 200:
                data = response.json()
                required_fields = ['siteName', 'phone', 'email', 'address']
                if all(field in data for field in required_fields):
                    self.log_result("GET Settings", True, "Settings retrieved successfully", response.status_code)
                else:
                    self.log_result("GET Settings", False, "Missing required fields in response", response.status_code)
            else:
                self.log_result("GET Settings", False, f"Failed to get settings: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("GET Settings", False, f"Exception: {str(e)}")
    
    def test_update_settings(self):
        """Test PUT /api/settings (requires auth)"""
        try:
            update_data = {
                "siteName": "Updated Photography Studio",
                "phone": "+91 99999 88888"
            }
            response = requests.put(f"{self.base_url}/settings", 
                json=update_data, headers=self.get_auth_headers())
            
            if response.status_code == 200:
                data = response.json()
                if data.get('siteName') == update_data['siteName']:
                    self.log_result("PUT Settings", True, "Settings updated successfully", response.status_code)
                else:
                    self.log_result("PUT Settings", False, "Settings not updated properly", response.status_code)
            else:
                self.log_result("PUT Settings", False, f"Failed to update settings: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("PUT Settings", False, f"Exception: {str(e)}")
    
    def test_upload_logo(self):
        """Test POST /api/settings/upload-logo (requires auth, multipart)"""
        try:
            img_data = self.create_test_image("logo.jpg")
            files = {'logo': ('logo.jpg', img_data, 'image/jpeg')}
            
            response = requests.post(f"{self.base_url}/settings/upload-logo",
                files=files, headers=self.get_auth_headers())
            
            if response.status_code == 200:
                data = response.json()
                if 'logoUrl' in data:
                    self.log_result("Upload Logo", True, "Logo uploaded successfully", response.status_code)
                else:
                    self.log_result("Upload Logo", False, "No logoUrl in response", response.status_code)
            else:
                self.log_result("Upload Logo", False, f"Failed to upload logo: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Upload Logo", False, f"Exception: {str(e)}")
    
    def test_get_hero_carousel(self):
        """Test GET /api/hero-carousel"""
        try:
            response = requests.get(f"{self.base_url}/hero-carousel")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET Hero Carousel", True, f"Retrieved {len(data)} carousel items", response.status_code)
                else:
                    self.log_result("GET Hero Carousel", False, "Response is not a list", response.status_code)
            else:
                self.log_result("GET Hero Carousel", False, f"Failed to get carousel: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("GET Hero Carousel", False, f"Exception: {str(e)}")
    
    def test_create_hero_carousel(self):
        """Test POST /api/admin/hero-carousel (requires auth, multipart)"""
        try:
            img_data = self.create_test_image("carousel.jpg")
            files = {'image': ('carousel.jpg', img_data, 'image/jpeg')}
            data = {'alt': 'Test carousel image'}
            
            response = requests.post(f"{self.base_url}/admin/hero-carousel",
                files=files, data=data, headers=self.get_auth_headers())
            
            if response.status_code == 200:
                item_data = response.json()
                if 'id' in item_data:
                    self.created_items['carousel_items'].append(item_data['id'])
                    self.log_result("Create Hero Carousel", True, "Carousel item created successfully", response.status_code)
                else:
                    self.log_result("Create Hero Carousel", False, "No ID in response", response.status_code)
            else:
                self.log_result("Create Hero Carousel", False, f"Failed to create carousel: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Create Hero Carousel", False, f"Exception: {str(e)}")
    
    def test_update_hero_carousel(self):
        """Test PUT /api/admin/hero-carousel/{id} (requires auth)"""
        if not self.created_items['carousel_items']:
            self.log_result("Update Hero Carousel", False, "No carousel items to update")
            return
        
        try:
            item_id = self.created_items['carousel_items'][0]
            update_data = {"alt": "Updated carousel image", "enabled": False}
            
            response = requests.put(f"{self.base_url}/admin/hero-carousel/{item_id}",
                json=update_data, headers=self.get_auth_headers())
            
            if response.status_code == 200:
                data = response.json()
                if data.get('alt') == update_data['alt']:
                    self.log_result("Update Hero Carousel", True, "Carousel item updated successfully", response.status_code)
                else:
                    self.log_result("Update Hero Carousel", False, "Carousel item not updated properly", response.status_code)
            else:
                self.log_result("Update Hero Carousel", False, f"Failed to update carousel: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Update Hero Carousel", False, f"Exception: {str(e)}")
    
    def test_delete_hero_carousel(self):
        """Test DELETE /api/admin/hero-carousel/{id} (requires auth)"""
        if not self.created_items['carousel_items']:
            self.log_result("Delete Hero Carousel", False, "No carousel items to delete")
            return
        
        try:
            item_id = self.created_items['carousel_items'].pop()
            response = requests.delete(f"{self.base_url}/admin/hero-carousel/{item_id}",
                headers=self.get_auth_headers())
            
            if response.status_code == 200:
                self.log_result("Delete Hero Carousel", True, "Carousel item deleted successfully", response.status_code)
            else:
                self.log_result("Delete Hero Carousel", False, f"Failed to delete carousel: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Delete Hero Carousel", False, f"Exception: {str(e)}")
    
    def test_get_weddings(self):
        """Test GET /api/weddings"""
        try:
            response = requests.get(f"{self.base_url}/weddings")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET Weddings", True, f"Retrieved {len(data)} weddings", response.status_code)
                else:
                    self.log_result("GET Weddings", False, "Response is not a list", response.status_code)
            else:
                self.log_result("GET Weddings", False, f"Failed to get weddings: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("GET Weddings", False, f"Exception: {str(e)}")
    
    def test_get_weddings_with_limit(self):
        """Test GET /api/weddings with limit=6 query param"""
        try:
            response = requests.get(f"{self.base_url}/weddings?limit=6")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET Weddings (limit=6)", True, f"Retrieved {len(data)} weddings with limit", response.status_code)
                else:
                    self.log_result("GET Weddings (limit=6)", False, "Response is not a list", response.status_code)
            else:
                self.log_result("GET Weddings (limit=6)", False, f"Failed to get weddings: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("GET Weddings (limit=6)", False, f"Exception: {str(e)}")
    
    def test_create_wedding(self):
        """Test POST /api/admin/weddings (requires auth, multipart)"""
        try:
            img_data = self.create_test_image("wedding_cover.jpg")
            files = {'coverImage': ('wedding_cover.jpg', img_data, 'image/jpeg')}
            data = {
                'brideName': 'Priya Sharma',
                'groomName': 'Rahul Kumar',
                'date': '2024-02-14',
                'location': 'Mumbai, Maharashtra'
            }
            
            response = requests.post(f"{self.base_url}/admin/weddings",
                files=files, data=data, headers=self.get_auth_headers())
            
            if response.status_code == 200:
                wedding_data = response.json()
                if 'id' in wedding_data:
                    self.created_items['weddings'].append(wedding_data['id'])
                    self.log_result("Create Wedding", True, "Wedding created successfully", response.status_code)
                else:
                    self.log_result("Create Wedding", False, "No ID in response", response.status_code)
            else:
                self.log_result("Create Wedding", False, f"Failed to create wedding: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Create Wedding", False, f"Exception: {str(e)}")
    
    def test_get_wedding_by_id(self):
        """Test GET /api/weddings/{wedding_id}"""
        if not self.created_items['weddings']:
            self.log_result("GET Wedding by ID", False, "No weddings to retrieve")
            return
        
        try:
            wedding_id = self.created_items['weddings'][0]
            response = requests.get(f"{self.base_url}/weddings/{wedding_id}")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['brideName', 'groomName', 'date', 'location', 'coverImage']
                if all(field in data for field in required_fields):
                    self.log_result("GET Wedding by ID", True, "Wedding retrieved successfully", response.status_code)
                else:
                    self.log_result("GET Wedding by ID", False, "Missing required fields", response.status_code)
            else:
                self.log_result("GET Wedding by ID", False, f"Failed to get wedding: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("GET Wedding by ID", False, f"Exception: {str(e)}")
    
    def test_update_wedding(self):
        """Test PUT /api/admin/weddings/{id} (requires auth)"""
        if not self.created_items['weddings']:
            self.log_result("Update Wedding", False, "No weddings to update")
            return
        
        try:
            wedding_id = self.created_items['weddings'][0]
            data = {
                'brideName': 'Priya Updated',
                'location': 'Delhi, India'
            }
            
            response = requests.put(f"{self.base_url}/admin/weddings/{wedding_id}",
                data=data, headers=self.get_auth_headers())
            
            if response.status_code == 200:
                wedding_data = response.json()
                if wedding_data.get('brideName') == data['brideName']:
                    self.log_result("Update Wedding", True, "Wedding updated successfully", response.status_code)
                else:
                    self.log_result("Update Wedding", False, "Wedding not updated properly", response.status_code)
            else:
                self.log_result("Update Wedding", False, f"Failed to update wedding: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Update Wedding", False, f"Exception: {str(e)}")
    
    def test_add_wedding_images(self):
        """Test POST /api/admin/weddings/{id}/images (requires auth, multipart)"""
        if not self.created_items['weddings']:
            self.log_result("Add Wedding Images", False, "No weddings to add images to")
            return
        
        try:
            wedding_id = self.created_items['weddings'][0]
            img_data1 = self.create_test_image("wedding_img1.jpg")
            img_data2 = self.create_test_image("wedding_img2.jpg")
            
            files = [
                ('images', ('wedding_img1.jpg', img_data1, 'image/jpeg')),
                ('images', ('wedding_img2.jpg', img_data2, 'image/jpeg'))
            ]
            
            response = requests.post(f"{self.base_url}/admin/weddings/{wedding_id}/images",
                files=files, headers=self.get_auth_headers())
            
            if response.status_code == 200:
                data = response.json()
                if 'images' in data and len(data['images']) > 0:
                    self.log_result("Add Wedding Images", True, f"Added {len(data['images'])} images", response.status_code)
                else:
                    self.log_result("Add Wedding Images", False, "No images added", response.status_code)
            else:
                self.log_result("Add Wedding Images", False, f"Failed to add images: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Add Wedding Images", False, f"Exception: {str(e)}")
    
    def test_delete_wedding(self):
        """Test DELETE /api/admin/weddings/{id} (requires auth)"""
        if not self.created_items['weddings']:
            self.log_result("Delete Wedding", False, "No weddings to delete")
            return
        
        try:
            wedding_id = self.created_items['weddings'].pop()
            response = requests.delete(f"{self.base_url}/admin/weddings/{wedding_id}",
                headers=self.get_auth_headers())
            
            if response.status_code == 200:
                self.log_result("Delete Wedding", True, "Wedding deleted successfully", response.status_code)
            else:
                self.log_result("Delete Wedding", False, f"Failed to delete wedding: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Delete Wedding", False, f"Exception: {str(e)}")
    
    def test_get_featured_film(self):
        """Test GET /api/films/featured"""
        try:
            response = requests.get(f"{self.base_url}/films/featured")
            if response.status_code == 200:
                data = response.json()
                required_fields = ['title', 'videoUrl', 'thumbnail']
                if all(field in data for field in required_fields):
                    self.log_result("GET Featured Film", True, "Featured film retrieved successfully", response.status_code)
                else:
                    self.log_result("GET Featured Film", False, "Missing required fields", response.status_code)
            else:
                self.log_result("GET Featured Film", False, f"Failed to get featured film: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("GET Featured Film", False, f"Exception: {str(e)}")
    
    def test_update_featured_film(self):
        """Test PUT /api/admin/films/featured (requires auth)"""
        try:
            update_data = {
                "title": "Updated Wedding Film",
                "videoUrl": "https://www.youtube.com/embed/updated_video"
            }
            
            response = requests.put(f"{self.base_url}/admin/films/featured",
                json=update_data, headers=self.get_auth_headers())
            
            if response.status_code == 200:
                data = response.json()
                if data.get('title') == update_data['title']:
                    self.log_result("Update Featured Film", True, "Featured film updated successfully", response.status_code)
                else:
                    self.log_result("Update Featured Film", False, "Film not updated properly", response.status_code)
            else:
                self.log_result("Update Featured Film", False, f"Failed to update film: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Update Featured Film", False, f"Exception: {str(e)}")
    
    def test_get_about(self):
        """Test GET /api/about"""
        try:
            response = requests.get(f"{self.base_url}/about")
            if response.status_code == 200:
                data = response.json()
                required_fields = ['name', 'bio', 'image']
                if all(field in data for field in required_fields):
                    self.log_result("GET About", True, "About section retrieved successfully", response.status_code)
                else:
                    self.log_result("GET About", False, "Missing required fields", response.status_code)
            else:
                self.log_result("GET About", False, f"Failed to get about: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("GET About", False, f"Exception: {str(e)}")
    
    def test_update_about(self):
        """Test PUT /api/admin/about (requires auth, multipart)"""
        try:
            img_data = self.create_test_image("about_image.jpg")
            files = {'image': ('about_image.jpg', img_data, 'image/jpeg')}
            data = {
                'name': 'Updated Photographer Name',
                'bio': 'Updated bio with new information about the photographer.'
            }
            
            response = requests.put(f"{self.base_url}/admin/about",
                files=files, data=data, headers=self.get_auth_headers())
            
            if response.status_code == 200:
                about_data = response.json()
                if about_data.get('name') == data['name']:
                    self.log_result("Update About", True, "About section updated successfully", response.status_code)
                else:
                    self.log_result("Update About", False, "About not updated properly", response.status_code)
            else:
                self.log_result("Update About", False, f"Failed to update about: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Update About", False, f"Exception: {str(e)}")
    
    def test_get_packages(self):
        """Test GET /api/packages"""
        try:
            response = requests.get(f"{self.base_url}/packages")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET Packages", True, f"Retrieved {len(data)} packages", response.status_code)
                else:
                    self.log_result("GET Packages", False, "Response is not a list", response.status_code)
            else:
                self.log_result("GET Packages", False, f"Failed to get packages: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("GET Packages", False, f"Exception: {str(e)}")
    
    def test_create_package(self):
        """Test POST /api/admin/packages (requires auth, multipart)"""
        try:
            img_data = self.create_test_image("package_thumb.jpg")
            files = {'thumbnail': ('package_thumb.jpg', img_data, 'image/jpeg')}
            data = {
                'title': 'Premium Wedding Package',
                'description': 'Complete wedding photography and videography package',
                'pricing': '₹1,50,000'
            }
            
            response = requests.post(f"{self.base_url}/admin/packages",
                files=files, data=data, headers=self.get_auth_headers())
            
            if response.status_code == 200:
                package_data = response.json()
                if 'id' in package_data:
                    self.created_items['packages'].append(package_data['id'])
                    self.log_result("Create Package", True, "Package created successfully", response.status_code)
                else:
                    self.log_result("Create Package", False, "No ID in response", response.status_code)
            else:
                self.log_result("Create Package", False, f"Failed to create package: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Create Package", False, f"Exception: {str(e)}")
    
    def test_update_package(self):
        """Test PUT /api/admin/packages/{id} (requires auth)"""
        if not self.created_items['packages']:
            self.log_result("Update Package", False, "No packages to update")
            return
        
        try:
            package_id = self.created_items['packages'][0]
            data = {
                'title': 'Updated Premium Package',
                'pricing': '₹1,75,000'
            }
            
            response = requests.put(f"{self.base_url}/admin/packages/{package_id}",
                data=data, headers=self.get_auth_headers())
            
            if response.status_code == 200:
                package_data = response.json()
                if package_data.get('title') == data['title']:
                    self.log_result("Update Package", True, "Package updated successfully", response.status_code)
                else:
                    self.log_result("Update Package", False, "Package not updated properly", response.status_code)
            else:
                self.log_result("Update Package", False, f"Failed to update package: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Update Package", False, f"Exception: {str(e)}")
    
    def test_add_package_images(self):
        """Test POST /api/admin/packages/{id}/images (requires auth, multipart)"""
        if not self.created_items['packages']:
            self.log_result("Add Package Images", False, "No packages to add images to")
            return
        
        try:
            package_id = self.created_items['packages'][0]
            img_data1 = self.create_test_image("package_img1.jpg")
            img_data2 = self.create_test_image("package_img2.jpg")
            
            files = [
                ('images', ('package_img1.jpg', img_data1, 'image/jpeg')),
                ('images', ('package_img2.jpg', img_data2, 'image/jpeg'))
            ]
            
            response = requests.post(f"{self.base_url}/admin/packages/{package_id}/images",
                files=files, headers=self.get_auth_headers())
            
            if response.status_code == 200:
                data = response.json()
                if 'images' in data and len(data['images']) > 0:
                    self.log_result("Add Package Images", True, f"Added {len(data['images'])} images", response.status_code)
                else:
                    self.log_result("Add Package Images", False, "No images added", response.status_code)
            else:
                self.log_result("Add Package Images", False, f"Failed to add images: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Add Package Images", False, f"Exception: {str(e)}")
    
    def test_delete_package(self):
        """Test DELETE /api/admin/packages/{id} (requires auth)"""
        if not self.created_items['packages']:
            self.log_result("Delete Package", False, "No packages to delete")
            return
        
        try:
            package_id = self.created_items['packages'].pop()
            response = requests.delete(f"{self.base_url}/admin/packages/{package_id}",
                headers=self.get_auth_headers())
            
            if response.status_code == 200:
                self.log_result("Delete Package", True, "Package deleted successfully", response.status_code)
            else:
                self.log_result("Delete Package", False, f"Failed to delete package: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Delete Package", False, f"Exception: {str(e)}")
    
    def test_create_contact_inquiry(self):
        """Test POST /api/contact"""
        try:
            inquiry_data = {
                "name": "Anjali Patel",
                "email": "anjali.patel@example.com",
                "phone": "+91 98765 43210",
                "weddingDate": "2024-12-15",
                "message": "I would like to inquire about your wedding photography packages for my December wedding."
            }
            
            response = requests.post(f"{self.base_url}/contact", json=inquiry_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data.get('name') == inquiry_data['name']:
                    self.log_result("Create Contact Inquiry", True, "Contact inquiry created successfully", response.status_code)
                else:
                    self.log_result("Create Contact Inquiry", False, "Contact inquiry not created properly", response.status_code)
            else:
                self.log_result("Create Contact Inquiry", False, f"Failed to create inquiry: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("Create Contact Inquiry", False, f"Exception: {str(e)}")
    
    def test_get_contact_inquiries(self):
        """Test GET /api/admin/contact (requires auth)"""
        try:
            response = requests.get(f"{self.base_url}/admin/contact", headers=self.get_auth_headers())
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("GET Contact Inquiries", True, f"Retrieved {len(data)} inquiries", response.status_code)
                else:
                    self.log_result("GET Contact Inquiries", False, "Response is not a list", response.status_code)
            else:
                self.log_result("GET Contact Inquiries", False, f"Failed to get inquiries: {response.text}", response.status_code)
        except Exception as e:
            self.log_result("GET Contact Inquiries", False, f"Exception: {str(e)}")
    
    def test_unauthorized_access(self):
        """Test that admin endpoints require authentication"""
        try:
            # Test without auth token
            response = requests.put(f"{self.base_url}/settings", json={"siteName": "Test"})
            if response.status_code == 401:
                self.log_result("Unauthorized Access Test", True, "Properly rejected unauthorized request", response.status_code)
            else:
                self.log_result("Unauthorized Access Test", False, f"Should have returned 401, got {response.status_code}", response.status_code)
        except Exception as e:
            self.log_result("Unauthorized Access Test", False, f"Exception: {str(e)}")
    
    def test_invalid_endpoints(self):
        """Test invalid endpoints return 404"""
        try:
            response = requests.get(f"{self.base_url}/nonexistent")
            if response.status_code == 404:
                self.log_result("Invalid Endpoint Test", True, "Properly returned 404 for invalid endpoint", response.status_code)
            else:
                self.log_result("Invalid Endpoint Test", False, f"Should have returned 404, got {response.status_code}", response.status_code)
        except Exception as e:
            self.log_result("Invalid Endpoint Test", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting API tests for Photography Portfolio")
        print(f"Base URL: {self.base_url}")
        print("=" * 80)
        
        # Authentication test (must be first)
        if not self.test_admin_login():
            print("❌ Authentication failed - skipping admin tests")
            return
        
        # Public endpoints
        print("\n📋 Testing Public Endpoints...")
        self.test_get_settings()
        self.test_get_hero_carousel()
        self.test_get_weddings()
        self.test_get_weddings_with_limit()
        self.test_get_featured_film()
        self.test_get_about()
        self.test_get_packages()
        self.test_create_contact_inquiry()
        
        # Admin endpoints
        print("\n🔐 Testing Admin Endpoints...")
        self.test_update_settings()
        self.test_upload_logo()
        self.test_create_hero_carousel()
        self.test_update_hero_carousel()
        self.test_delete_hero_carousel()
        self.test_create_wedding()
        self.test_get_wedding_by_id()
        self.test_update_wedding()
        self.test_add_wedding_images()
        self.test_delete_wedding()
        self.test_update_featured_film()
        self.test_update_about()
        self.test_create_package()
        self.test_update_package()
        self.test_add_package_images()
        self.test_delete_package()
        self.test_get_contact_inquiries()
        
        # Security tests
        print("\n🔒 Testing Security...")
        self.test_unauthorized_access()
        self.test_invalid_endpoints()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        return self.test_results

if __name__ == "__main__":
    tester = PhotoPortfolioTester()
    results = tester.run_all_tests()