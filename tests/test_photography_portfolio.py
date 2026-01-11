"""
Photography Portfolio Backend API Tests
Tests for: Admin authentication, credential change, YouTube settings, Section content CMS, Social media links
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"


class TestHealthCheck:
    """Basic API health check tests"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API root returns: {data}")


class TestAdminAuthentication:
    """Admin login and authentication tests"""
    
    def test_login_success(self):
        """Test successful admin login with bcrypt hashed password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0
        print(f"✓ Login successful, token received")
        return data["access_token"]
    
    def test_login_invalid_username(self):
        """Test login with invalid username"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "wronguser",
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ Invalid username rejected: {data['detail']}")
    
    def test_login_invalid_password(self):
        """Test login with invalid password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print(f"✓ Invalid password rejected: {data['detail']}")


class TestAdminCredentials:
    """Admin credential management tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_admin_credentials(self, auth_token):
        """Test getting current admin credentials"""
        response = requests.get(
            f"{BASE_URL}/api/admin/credentials",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "username" in data
        assert "updated_at" in data
        print(f"✓ Current admin username: {data['username']}")
    
    def test_change_credentials_wrong_old_password(self, auth_token):
        """Test credential change with wrong old password"""
        response = requests.put(
            f"{BASE_URL}/api/admin/credentials",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "old_password": "wrongpassword",
                "new_username": "newadmin"
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "incorrect" in data["detail"].lower()
        print(f"✓ Wrong old password rejected: {data['detail']}")
    
    def test_change_credentials_short_password(self, auth_token):
        """Test credential change with too short new password"""
        response = requests.put(
            f"{BASE_URL}/api/admin/credentials",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "old_password": ADMIN_PASSWORD,
                "new_password": "123"  # Too short
            }
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"✓ Short password rejected: {data['detail']}")
    
    def test_change_credentials_success(self, auth_token):
        """Test successful credential change (username only to avoid breaking tests)"""
        # Change username
        response = requests.put(
            f"{BASE_URL}/api/admin/credentials",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "old_password": ADMIN_PASSWORD,
                "new_username": "admin"  # Keep same username
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "username" in data
        assert "updated_at" in data
        print(f"✓ Credentials updated successfully")


class TestYouTubeSettings:
    """YouTube settings API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_youtube_settings_public(self):
        """Test public YouTube settings endpoint"""
        response = requests.get(f"{BASE_URL}/api/youtube/settings")
        assert response.status_code == 200
        data = response.json()
        # Should return enabled status
        assert "enabled" in data
        print(f"✓ Public YouTube settings: enabled={data.get('enabled')}")
    
    def test_get_youtube_videos_public(self):
        """Test public YouTube videos endpoint"""
        response = requests.get(f"{BASE_URL}/api/youtube/videos")
        assert response.status_code == 200
        data = response.json()
        # Should return list (empty if not configured)
        assert isinstance(data, list)
        print(f"✓ YouTube videos endpoint returns {len(data)} videos")
    
    def test_get_youtube_settings_admin(self, auth_token):
        """Test admin YouTube settings endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/youtube/settings",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "channel_id" in data
        assert "api_key" in data
        assert "max_videos" in data
        assert "enabled" in data
        assert "section_title" in data
        assert "section_description" in data
        print(f"✓ Admin YouTube settings retrieved: section_title={data.get('section_title')}")
    
    def test_update_youtube_settings(self, auth_token):
        """Test updating YouTube settings"""
        response = requests.put(
            f"{BASE_URL}/api/admin/youtube/settings",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "section_title": "Test YouTube Stories",
                "section_description": "Test description",
                "max_videos": 8
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["section_title"] == "Test YouTube Stories"
        assert data["max_videos"] == 8
        print(f"✓ YouTube settings updated successfully")
        
        # Restore original
        requests.put(
            f"{BASE_URL}/api/admin/youtube/settings",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "section_title": "YouTube Stories",
                "section_description": "Watch our latest stories and behind-the-scenes",
                "max_videos": 6
            }
        )


class TestSectionContent:
    """Section content CMS API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_films_section_public(self):
        """Test public films section content"""
        response = requests.get(f"{BASE_URL}/api/sections/films")
        assert response.status_code == 200
        data = response.json()
        assert "section_key" in data
        assert data["section_key"] == "films"
        assert "title" in data
        assert "subtitle" in data
        print(f"✓ Films section: title={data.get('title')}")
    
    def test_get_about_section_public(self):
        """Test public about section content"""
        response = requests.get(f"{BASE_URL}/api/sections/about")
        assert response.status_code == 200
        data = response.json()
        assert data["section_key"] == "about"
        print(f"✓ About section: title={data.get('title')}")
    
    def test_get_contact_section_public(self):
        """Test public contact section content"""
        response = requests.get(f"{BASE_URL}/api/sections/contact")
        assert response.status_code == 200
        data = response.json()
        assert data["section_key"] == "contact"
        print(f"✓ Contact section: title={data.get('title')}")
    
    def test_get_weddings_section_public(self):
        """Test public weddings section content"""
        response = requests.get(f"{BASE_URL}/api/sections/weddings")
        assert response.status_code == 200
        data = response.json()
        assert data["section_key"] == "weddings"
        print(f"✓ Weddings section: title={data.get('title')}")
    
    def test_get_packages_section_public(self):
        """Test public packages section content"""
        response = requests.get(f"{BASE_URL}/api/sections/packages")
        assert response.status_code == 200
        data = response.json()
        assert data["section_key"] == "packages"
        print(f"✓ Packages section: title={data.get('title')}")
    
    def test_update_section_content(self, auth_token):
        """Test updating section content"""
        # Update films section
        response = requests.put(
            f"{BASE_URL}/api/admin/sections/films",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "title": "TEST Wedding Films",
                "subtitle": "TEST Cinematic storytelling"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "TEST Wedding Films"
        print(f"✓ Section content updated successfully")
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/sections/films")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["title"] == "TEST Wedding Films"
        print(f"✓ Section content persisted correctly")
        
        # Restore original
        requests.put(
            f"{BASE_URL}/api/admin/sections/films",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "title": "Wedding Films",
                "subtitle": "Cinematic storytelling that brings your special day to life"
            }
        )


class TestSocialMediaLinks:
    """Social media links API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_social_media_public(self):
        """Test public social media links endpoint"""
        response = requests.get(f"{BASE_URL}/api/social-media")
        assert response.status_code == 200
        data = response.json()
        # Should return enabled status
        assert "enabled" in data
        print(f"✓ Social media links: enabled={data.get('enabled')}")
    
    def test_get_social_media_admin(self, auth_token):
        """Test admin social media links endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/social-media",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "facebook" in data
        assert "instagram" in data
        assert "youtube" in data
        assert "enabled" in data
        print(f"✓ Admin social media settings retrieved")
    
    def test_update_social_media_links(self, auth_token):
        """Test updating social media links"""
        response = requests.put(
            f"{BASE_URL}/api/admin/social-media",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "facebook": "https://facebook.com/test",
                "instagram": "https://instagram.com/test",
                "youtube": "https://youtube.com/test",
                "enabled": True
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["facebook"] == "https://facebook.com/test"
        print(f"✓ Social media links updated successfully")


class TestPublicEndpoints:
    """Test public-facing endpoints"""
    
    def test_get_settings(self):
        """Test site settings endpoint"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "siteName" in data
        assert "email" in data
        print(f"✓ Site settings: {data.get('siteName')}")
    
    def test_get_hero_carousel(self):
        """Test hero carousel endpoint"""
        response = requests.get(f"{BASE_URL}/api/hero-carousel")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Hero carousel: {len(data)} items")
    
    def test_get_weddings(self):
        """Test weddings endpoint"""
        response = requests.get(f"{BASE_URL}/api/weddings")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Weddings: {len(data)} items")
    
    def test_get_featured_film(self):
        """Test featured film endpoint"""
        response = requests.get(f"{BASE_URL}/api/films/featured")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "videoUrl" in data
        print(f"✓ Featured film: {data.get('title')}")
    
    def test_get_about(self):
        """Test about endpoint"""
        response = requests.get(f"{BASE_URL}/api/about")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "bio" in data
        print(f"✓ About: {data.get('name')}")
    
    def test_get_packages(self):
        """Test packages endpoint"""
        response = requests.get(f"{BASE_URL}/api/packages")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Packages: {len(data)} items")
    
    def test_get_facebook_settings(self):
        """Test Facebook settings endpoint"""
        response = requests.get(f"{BASE_URL}/api/facebook/settings")
        assert response.status_code == 200
        data = response.json()
        # Should return enabled status
        assert "enabled" in data
        print(f"✓ Facebook settings: enabled={data.get('enabled')}")


class TestProtectedEndpoints:
    """Test that protected endpoints require authentication"""
    
    def test_admin_credentials_requires_auth(self):
        """Test admin credentials endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/admin/credentials")
        assert response.status_code in [401, 403]
        print(f"✓ Admin credentials endpoint protected")
    
    def test_admin_youtube_requires_auth(self):
        """Test admin YouTube endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/admin/youtube/settings")
        assert response.status_code in [401, 403]
        print(f"✓ Admin YouTube endpoint protected")
    
    def test_admin_social_media_requires_auth(self):
        """Test admin social media endpoint requires auth"""
        response = requests.get(f"{BASE_URL}/api/admin/social-media")
        assert response.status_code in [401, 403]
        print(f"✓ Admin social media endpoint protected")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
