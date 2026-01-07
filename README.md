# 🎵 MusicStreamz

A modern, full-stack music streaming web application built with React, Node.js, and Firebase. Experience seamless audio playback with a beautiful, Spotify-inspired UI.

![MusicStreamz](https://placehold.co/1200x400/1a1a2e/e94560?text=MusicStreamz+-+Your+Music,+Your+Way)

## ✨ Features

### 🎧 Music Player
- **Universal Playback Queue** - Next/previous track navigation works across all contexts
- **Persistent Playback** - Resume where you left off
- **Real-time Audio Visualizer** - Dynamic wave animations synced to music
- **Volume Control** - Smooth audio control with visual feedback

### 📚 Content Organization
- **15 Music Categories** - Pop, Rock, Hip Hop, Electronic, R&B, Jazz, Classical, Country, Metal, Folk, Blues, Reggae, Latin, Indie, K-Pop
- **Custom Playlists** - Create, edit, and delete personal playlists
- **Liked Songs** - Quick access to your favorite tracks
- **Recently Played** - Jump back into your listening history

### 🔍 Discovery
- **Smart Search** - Search by title, artist, or category
- **Browse Categories** - Explore music by genre
- **Podcast Support** - Listen to podcasts and episodes

### 👤 User Features
- **Firebase Authentication** - Secure login/signup
- **User Profiles** - Personalized experience
- **Admin Panel** - Upload and manage tracks

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| TailwindCSS | Styling |
| React Router | Navigation |
| Web Audio API | Audio Visualization |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | API Framework |
| Firebase Admin | Database & Auth |
| Firebase Storage | File Storage |

## 📁 Project Structure

```
MusicStreamz/
├── Frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context (Audio, Auth)
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom hooks
│   │   └── services/         # Firebase config
│   └── ...
├── Backend/                  # Express API server
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── routes/           # API routes
│   │   ├── middlewares/      # Auth middleware
│   │   └── config/           # Firebase config
│   └── ...
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project with Firestore and Storage enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kanukuntlaanubhav450/MusicZ.git
   cd MusicStreamz
   ```

2. **Setup Backend**
   ```bash
   cd Backend
   npm install
   ```
   
   Create `.env` file:
   ```env
   PORT=5000
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   ```

3. **Setup Frontend**
   ```bash
   cd ../Frontend
   npm install
   ```
   
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Running Locally

1. **Start Backend**
   ```bash
   cd Backend
   node src/server.js
   ```

2. **Start Frontend**
   ```bash
   cd Frontend
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173)

## 🌐 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Backend | Render | `https://musicz-nued.onrender.com` |
| Frontend | Netlify | *Your Netlify URL* |

### Deploy to Render (Backend)
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy with `npm start` as start command

### Deploy to Netlify (Frontend)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## 📱 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tracks` | Get all tracks |
| POST | `/api/tracks` | Upload new track (Admin) |
| GET | `/api/categories` | Get all categories |
| GET | `/api/search?q=` | Search tracks & podcasts |
| GET | `/api/playlists` | Get user playlists |
| POST | `/api/playlists` | Create playlist |
| GET | `/api/podcasts` | Get all podcasts |
| POST | `/api/playlists/like/:trackId` | Like/unlike a track |

## 🎨 Screenshots

| Home Page | Player | Search |
|-----------|--------|--------|
| Browse categories & featured tracks | Full audio controls with visualizer | Search by title, artist, or genre |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Anubhav Kanukuntla**
- GitHub: [@kanukuntlaanubhav450](https://github.com/kanukuntlaanubhav450)

---

<p align="center">
  Made with ❤️ and 🎵
</p>
