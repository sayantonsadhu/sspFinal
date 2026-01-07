import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
import shutil

UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()

def is_allowed_image(filename: str) -> bool:
    return get_file_extension(filename) in ALLOWED_IMAGE_EXTENSIONS

async def save_upload_file(upload_file: UploadFile, prefix: str = "") -> str:
    """
    Save uploaded file and return the URL path
    """
    if not is_allowed_image(upload_file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    # Generate unique filename
    file_extension = get_file_extension(upload_file.filename)
    unique_filename = f"{prefix}_{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Return URL path
    return f"/api/uploads/{unique_filename}"

def delete_file(file_url: str) -> bool:
    """
    Delete file from uploads directory
    """
    try:
        if file_url and file_url.startswith("/api/uploads/"):
            filename = file_url.split("/")[-1]
            file_path = UPLOAD_DIR / filename
            if file_path.exists():
                file_path.unlink()
                return True
    except Exception:
        pass
    return False