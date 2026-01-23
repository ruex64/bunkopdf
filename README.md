# BunkoPDF

A minimal PDF book sharing platform built with Next.js, following the BunkoPDF design system.

## Features

- **Public Book Library**: Browse and read PDF books without login
- **Admin Dashboard**: Secure panel to manage your book collection
- **Dark/Light Mode**: Follows system preference with manual toggle
- **Firebase Integration**: Store book metadata in Firestore
- **GitHub PDF Hosting**: Link to PDFs hosted on GitHub

## Getting Started

### Prerequisites

- Node.js 18+ 
- Firebase project with Firestore enabled

### 1. Install Dependencies

```bash
cd bunkopdf
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Firestore Database** in test mode
4. Go to Project Settings > General > Your apps
5. Click "Add app" and select Web
6. Copy the Firebase config values

### 3. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public library.

Visit [http://localhost:3000/admin](http://localhost:3000/admin) to access the admin panel.

## Adding Books

1. Upload your PDF files to a GitHub repository
2. Get the **raw** URL for each PDF:
   - Navigate to the PDF file in GitHub
   - Click "Raw" or use format: `https://raw.githubusercontent.com/username/repo/branch/path/to/file.pdf`
3. Log in to the admin panel
4. Click "Add Book" and fill in the details

## Project Structure

```
bunkopdf/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx        # Admin dashboard
│   │   ├── api/
│   │   │   └── auth/           # Auth endpoints
│   │   ├── globals.css         # Design system CSS
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Public library page
│   ├── components/
│   │   ├── admin/              # Admin-specific components
│   │   ├── BookCard.tsx        # Book display card
│   │   ├── Header.tsx          # App header
│   │   ├── SearchBar.tsx       # Search input
│   │   └── ThemeToggle.tsx     # Dark/light mode toggle
│   ├── context/
│   │   └── ThemeContext.tsx    # Theme state management
│   └── lib/
│       └── firebase.ts         # Firebase config & helpers
├── .env.example                # Environment template
├── tailwind.config.ts          # Tailwind configuration
└── package.json
```

## Design System

This app follows the BunkoPDF design system with:

- **Minimal, calm aesthetic** - No bright colors or animations
- **CSS Custom Properties** - Easy theming with CSS variables
- **Dark & Light modes** - Smooth theme switching
- **Lucide icons** - Consistent iconography

See [DESIGN.md](../DESIGN.md) for the complete design system documentation.

## Security Notes

- The current admin auth is a simple username/password check
- **2FA will be implemented in a future update**
- Session is stored in an HTTP-only cookie
- For production, ensure you use a strong password and HTTPS

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Firebase Hosting

```bash
npm run build
firebase init hosting
firebase deploy
```

## License

MIT
