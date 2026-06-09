 CIG Media Platform

> AI-powered Event & Media Management Platform for clubs, photographers, and members.

![Platform](https://img.shields.io/badge/Status-Production%20Ready-10B981?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-000000?style=for-the-badge&logo=nextdotjs)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)
![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-3448C5?style=for-the-badge)

---

## Overview

CIG Media Platform is a centralized event and media management system where clubs can upload, organize, and interact with event photos and videos. It combines the best of Instagram, Google Photos, and Pinterest into one premium AI-native experience.

---

## Live Demo

- **Frontend:** [https://cig-project.vercel.app](https://cig-project.vercel.app)
- **Backend API:** [https://cig-media-api.railway.app](https://cig-media-api.railway.app)
- **API Docs:** [https://cig-media-api.railway.app/docs](https://cig-media-api.railway.app/docs)

---

## Features

### Core Features
| Feature | Description |
|---|---|
| Event Management | Create and manage events with albums, categories, and metadata |
| Media Upload | Drag-and-drop bulk upload with preview, compression, and Cloudinary storage |
| Access Control | Role-based access — Admin, Photographer, Club Member, Viewer |
| Social Features | Like, comment, favourite, share, download |
| Real-time Notifications | Instant alerts for likes, comments, and tags |
| AI Auto-Tagging | Automatic tag generation for every uploaded photo |
| Facial Recognition | Upload a selfie — AI finds you in all event photos |
| Watermarked Downloads | Every download gets club name, event name, and user role watermarked |
| Analytics Dashboard | Charts for events, categories, visibility, and club activity |

### Bonus Features
- Pinterest-style masonry gallery with infinite scroll
- Lightbox viewer with keyboard navigation
- Skeleton loading states throughout
- Collapsible sidebar with active state tracking
- QR code album sharing
- Cinematic dark UI with glassmorphism

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| FastAPI (Python) | REST API server |
| SQLAlchemy | ORM for database models |
| PostgreSQL (Supabase) | Primary database |
| Cloudinary | Media storage and transformations |
| DeepFace | Facial recognition |
| Pillow (PIL) | Watermark generation |
| python-jose | JWT authentication |
| passlib + bcrypt | Password hashing |
| uvicorn | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework |
| TypeScript | Type safety |
| Framer Motion | Animations |
| Tailwind CSS | Utility styling |
| Recharts | Analytics charts |
| React Dropzone | Drag-and-drop uploads |
| Axios | HTTP client |
| React Hot Toast | Notifications |
| Lucide React | Icons |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│              Next.js 14 + Framer Motion                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API calls
┌──────────────────────▼──────────────────────────────────────┐
│                    FASTAPI BACKEND                          │
│   Auth │ Clubs │ Events │ Media │ Upload │ AI │ Social      │
└──────┬──────────────┬──────────────────┬────────────────────┘
       │              │                  │
┌──────▼──────┐ ┌─────▼──────┐ ┌────────▼────────┐
│ PostgreSQL  │ │ Cloudinary │ │   DeepFace AI   │
│  Supabase   │ │  Storage   │ │ Facial Recog.   │
└─────────────┘ └────────────┘ └─────────────────┘
```

---

## Database Schema

### Tables
- `users` — accounts with roles and avatar (selfie) URL
- `clubs` — organizations that host events
- `club_members` — user-club membership with role (ADMIN / PHOTOGRAPHER / CLUB_MEMBER / VIEWER)
- `events` — club events with category, date, and visibility
- `albums` — media collections inside events
- `media` — uploaded photos and videos with Cloudinary URLs
- `tags` — AI-generated labels
- `media_tags` — many-to-many between media and tags with confidence score
- `likes` — user likes on media
- `comments` — user comments on media
- `favourites` — saved media items per user
- `notifications` — real-time activity alerts
- `facial_index` — matched faces between users and media

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase account (free)
- Cloudinary account (free)

---

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/cig-media-platform.git
cd cig-media-platform/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres

SECRET_KEY=your-random-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:3000
```

```bash
# Run the backend
uvicorn main:app --reload
```

API runs at `http://127.0.0.1:8000`
Interactive docs at `http://127.0.0.1:8000/docs`

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local

# Run the frontend
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create new account |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user profile |

### Clubs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/clubs/` | List all clubs |
| POST | `/clubs/` | Create a club |
| POST | `/clubs/{id}/join` | Join a club |
| GET | `/clubs/{id}/members` | Get club members |

### Events
| Method | Endpoint | Description |
|---|---|---|
| GET | `/events/` | List public events |
| POST | `/events/{club_id}` | Create event under club |
| GET | `/events/{id}` | Get event details |
| GET | `/events/{id}/albums` | Get event albums |

### Media
| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload/{album_id}` | Upload media files |
| GET | `/media/album/{album_id}` | Get paginated media |
| GET | `/media/{id}` | Get single media detail |
| GET | `/media/{id}/download` | Download with watermark |
| DELETE | `/media/{id}` | Delete media |

### Social
| Method | Endpoint | Description |
|---|---|---|
| POST | `/social/like/{media_id}` | Toggle like |
| POST | `/social/comment/{media_id}` | Add comment |
| GET | `/social/comments/{media_id}` | Get comments |
| POST | `/social/favourite/{media_id}` | Toggle favourite |
| GET | `/social/favourites` | Get my favourites |
| GET | `/social/notifications` | Get notifications |
| POST | `/social/notifications/read` | Mark all as read |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/tag/{media_id}` | Tag a media item |
| POST | `/ai/tag-all` | Tag all untagged media |
| POST | `/ai/selfie` | Upload reference selfie |
| POST | `/ai/find-my-photos` | Scan photos for your face |
| GET | `/ai/my-photos` | Get matched photos |
| GET | `/ai/search?q=query` | Search by tag or uploader |

---

## Project Structure

```
cig-media-platform/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── models.py          # All SQLAlchemy models
│   │   ├── routes/
│   │   │   ├── auth.py            # Authentication
│   │   │   ├── clubs.py           # Club management
│   │   │   ├── events.py          # Event management
│   │   │   ├── upload.py          # Media upload
│   │   │   ├── media.py           # Media CRUD + download
│   │   │   ├── social.py          # Likes, comments, notifications
│   │   │   └── ai.py              # AI tagging + facial recognition
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── clubs.py
│   │   │   └── events.py
│   │   └── services/
│   │       ├── auth_service.py    # JWT + password hashing
│   │       ├── cloudinary_service.py  # Upload + thumbnails
│   │       ├── ai_service.py      # Tagging + DeepFace
│   │       ├── watermark_service.py   # PIL watermarking
│   │       └── dependencies.py    # Auth middleware
│   ├── main.py                    # FastAPI app + CORS
│   ├── database.py                # SQLAlchemy engine
│   ├── config.py                  # Environment variables
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── app/
        │   ├── (auth)/
        │   │   ├── login/         # Login page
        │   │   └── register/      # Register page
        │   └── (dashboard)/
        │       ├── layout.tsx     # Protected layout + sidebar
        │       ├── dashboard/     # Bento grid dashboard
        │       ├── events/        # Event management
        │       ├── gallery/       # Masonry gallery + lightbox
        │       ├── upload/        # Drag-and-drop uploader
        │       ├── clubs/         # Club management
        │       ├── my-photos/     # Facial recognition page
        │       ├── notifications/ # Notification center
        │       └── admin/         # Analytics dashboard
        ├── components/
        │   └── layout/
        │       └── Sidebar.tsx    # Collapsible sidebar
        └── lib/
            ├── api.js             # Axios instance + interceptors
            └── auth.ts            # Auth service
```

---

## Evaluation Criteria Coverage

| Criteria | Weight | Implementation |
|---|---|---|
| UI/UX & Design | 15% | Cinematic dark UI, glassmorphism, Framer Motion animations, masonry gallery, bento grid |
| Backend Architecture | 15% | FastAPI with clean separation — routes, services, schemas, models |
| Auth & Access Control | 10% | JWT tokens, role-based middleware, presigned access for private media |
| Cloud Integration | 15% | Cloudinary for all media storage with auto-thumbnails and transformations |
| Media Management | 15% | Bulk upload, drag-drop, preview, pagination, watermarked download |
| AI/ML Features | 15% | DeepFace facial recognition, auto-tagging, AI-powered search |
| Real-time Notifications | 5% | DB-backed notifications on like, comment, and tag events |
| Code Quality | 5% | Modular structure, typed schemas, clean service layer |
| Innovation & Bonus | 5% | Infinite scroll, skeleton loaders, lightbox, analytics dashboard |

---

## Team

Built for the CIG Development Problem Statement.

---
