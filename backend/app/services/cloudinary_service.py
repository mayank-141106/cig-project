import cloudinary
import cloudinary.uploader
from config import CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

def upload_image(file_bytes: bytes, folder: str = "cig-media") -> dict:
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=folder,
        resource_type="auto",
        transformation=[{"quality": "auto", "fetch_format": "auto"}]
    )
    return {
        "public_id": result["public_id"],
        "url": result["secure_url"],
        "thumbnail_url": generate_thumbnail_url(result["public_id"]),
        "width": result.get("width"),
        "height": result.get("height"),
        "file_size": result.get("bytes"),
        "resource_type": result.get("resource_type")
    }

def generate_thumbnail_url(public_id: str) -> str:
    return cloudinary.CloudinaryImage(public_id).build_url(
        width=400,
        height=400,
        crop="fill",
        quality="auto"
    )

def delete_image(public_id: str) -> bool:
    result = cloudinary.uploader.destroy(public_id)
    return result.get("result") == "ok"