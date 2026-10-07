"""Build web-ready images and video in img/ from the original files in Assets/.

Run from the project folder after adding or changing photos:
    pip install pillow
    python scripts/optimize-images.py
Video needs ffmpeg on PATH (skipped with a warning if missing).
Originals in Assets/ are never changed.
"""
import re
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "Assets"
OUT = ROOT / "img"
QUALITY = 78


def open_rgb(path):
    im = Image.open(path)
    im = ImageOps.exif_transpose(im)
    return im.convert("RGB")


def save_webp(im, dest, width):
    dest.parent.mkdir(parents=True, exist_ok=True)
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dest, "WEBP", quality=QUALITY, method=6)


def project_folders():
    for folder in SRC.iterdir():
        m = re.fullmatch(r"project (\d+)", folder.name, re.IGNORECASE)
        if folder.is_dir() and m:
            yield int(m.group(1)), folder


def build_projects():
    for num, folder in sorted(project_folders()):
        photos = sorted(
            (p for p in folder.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")),
            key=lambda p: int(re.sub(r"\D", "", p.stem) or 0),
        )
        for i, photo in enumerate(photos, 1):
            im = open_rgb(photo)
            base = OUT / "projects" / f"project-{num}" / f"{i:02d}"
            save_webp(im, base.with_name(base.name + "-640.webp"), 640)
            save_webp(im, base.with_name(base.name + "-1280.webp"), 1280)
        print(f"project-{num}: {len(photos)} photos")


def build_before_after():
    folder = SRC / "Before-After Section"
    for photo in folder.iterdir():
        m = re.fullmatch(r"(before|after)\s*(\d+)", photo.stem, re.IGNORECASE)
        if not m:
            continue
        kind, num = m.group(1).lower(), m.group(2)
        im = open_rgb(photo)
        for w in (720, 1280):
            save_webp(im, OUT / "before-after" / f"room-{num}-{kind}-{w}.webp", w)
    print("before-after: done")


def build_brand():
    brand = OUT / "brand"
    brand.mkdir(parents=True, exist_ok=True)
    logo = Image.open(SRC / "logo-icon.png").convert("RGBA")
    for size in (72, 192, 512):
        logo.resize((size, size), Image.LANCZOS).save(brand / f"logo-{size}.png", optimize=True)
    logo.resize((180, 180), Image.LANCZOS).save(brand / "apple-touch-icon.png", optimize=True)
    logo.resize((32, 32), Image.LANCZOS).save(brand / "favicon-32.png", optimize=True)
    shutil.copyfile(SRC / "Company  Brochure.jpeg", brand / "interior-core-brochure.jpg")

    poster = open_rgb(SRC / "hero-poster.jpg")
    for w in (960, 1920):
        save_webp(poster, OUT / "hero" / f"poster-{w}.webp", w)
    print("brand + poster: done")


def build_video():
    if not shutil.which("ffmpeg"):
        print("ffmpeg not found - skipping hero video")
        return
    src = SRC / "hero.mp4"
    for height, crf in ((720, 30), (1080, 27)):
        dest = OUT / "hero" / f"hero-{height}.mp4"
        dest.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-an",
             "-vf", f"scale=-2:{height}", "-c:v", "libx264", "-preset", "slow",
             "-crf", str(crf), "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(dest)],
            check=True,
        )
        print(f"hero-{height}.mp4: {dest.stat().st_size // 1024} KB")


if __name__ == "__main__":
    build_projects()
    build_before_after()
    build_brand()
    build_video()
