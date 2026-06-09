from PIL import Image, ImageDraw, ImageFont
import requests
import io
import os

def add_watermark(image_url: str, text: str) -> bytes:
    """Download image and add watermark text, return bytes"""
    response = requests.get(image_url, timeout=15)
    response.raise_for_status()

    img = Image.open(io.BytesIO(response.content)).convert("RGBA")
    width, height = img.size

    # Create transparent overlay
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Font size based on image size
    font_size = max(20, width // 40)
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()

    # Watermark text position — bottom right
    margin = 20
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = width - text_width - margin
    y = height - text_height - margin

    # Shadow
    draw.text((x + 2, y + 2), text, font=font, fill=(0, 0, 0, 140))
    # Main text
    draw.text((x, y), text, font=font, fill=(255, 255, 255, 200))

    # Also add diagonal watermark in center
    center_font_size = max(30, width // 20)
    try:
        center_font = ImageFont.truetype("arial.ttf", center_font_size)
    except Exception:
        center_font = ImageFont.load_default()

    diag_overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    diag_draw = ImageDraw.Draw(diag_overlay)
    diag_draw.text(
        (width // 2 - 100, height // 2),
        "CIG Media",
        font=center_font,
        fill=(255, 255, 255, 25)
    )

    # Merge layers
    combined = Image.alpha_composite(img, overlay)
    combined = Image.alpha_composite(combined, diag_overlay)
    final = combined.convert("RGB")

    output = io.BytesIO()
    final.save(output, format="JPEG", quality=92)
    return output.getvalue()