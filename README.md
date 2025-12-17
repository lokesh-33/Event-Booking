# Event Booking Platform 🎟️

Hey there! Welcome to my Event Booking Platform - a full-stack MERN application that makes organizing and booking events super easy. Think of it as your one-stop solution for managing events, complete with email verification, AI-powered descriptions, and rock-solid booking logic that won't let you oversell tickets (even when 100 people click "Book" at the exact same millisecond 😅).

## 📋 What's Inside

- [Features](#features)
- [Technical Highlights](#technical-highlights)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [RSVP Capacity and Concurrency Solution](#rsvp-capacity-and-concurrency-solution)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Technologies Used](#technologies-used)

---

## ✨ Cool Features (aka What Makes This App Awesome)

### Authentication & Authorization
- **User Registration & Login**: Sign up or log in securely with JWT tokens (no passwords stored in plain text, we're not monsters!)
- **Role-Based Access Control**: Choose your adventure - be an `attender` (book all the events!) or a `creator` (organize amazing events!)
- **Protected Routes**: Only logged-in users can access certain pages - security first, always!

### Event Management
- **Create Events**: Creators can whip up events with all the details - title, description, date, time, location, capacity, and even add some eye-catching images
- **Edit Events**: Made a typo? No worries! Update your event details anytime (but only if it's your event, of course)
- **Delete Events**: Changed plans? Delete events easily - but only if nobody's booked yet (we don't want to break hearts!)
- **Image Upload**: Fancy event posters stored on Cloudinary - because stock photos are so last decade
- **Event Categories**: Whether it's a conference, workshop, meetup, webinar, or just a social hangout - we've got you covered
- **Smart Validation**: 
  - Can't create events in the past (no time machines here!)
  - Can't reduce capacity below current bookings (that would be chaos!)
  - Supports up to 10,000 attendees (that's a lot of pizza!)

### Event Discovery & Filtering
- **Search Functionality**: Looking for something specific? Search by title, description, or location
- **Category Filtering**: Only want workshops? Or just social events? Filter away!
- **Date Filtering**: See all events, just upcoming ones, or what's happening today
- **Sorting Options**: Organize events your way - by date, title, or how many people can attend
- **Responsive Event Cards**: Beautiful cards showing all the juicy details and how many spots are left

### RSVP System (The Smart Booking Magic)
- **OTP Verification**: We send a 6-digit code to your email before confirming your booking
  - Fresh code delivered to your inbox
  - Valid for 10 minutes (plenty of time to find that email!)
  - Keeps the bots and fake bookings away
- **Capacity Management**: Real-time tracking so you always know if there's room
- **Concurrency Handling**: Even if 100 people try to grab the last spot at once, only one will succeed (more on this cool tech below!)
- **Email Notifications**:
  - Your verification code
  - A nice confirmation email when you're all set
  - Organizers get notified about new bookings
- **Cancel Registration**: Plans changed? Cancel anytime with one click

### AI-Powered Features (Because We're Living in the Future!)
- **AI-Generated Descriptions**: Not great with words? Let Google's Gemini AI write compelling event descriptions for you
- **AI Description Enhancement**: Got a description but it's kinda... meh? Let AI jazz it up!
- **Context-Aware**: The AI looks at your event details (title, location, date, etc.) to create descriptions that actually make sense

### User Dashboard
- **My Events Page**: View all events created by the user
- **Event Statistics**: See attendee count and available spots
- **Quick Actions**: Edit or delete events from dashboard

### More Goodies
- **Responsive Design**: Looks great on your phone, tablet, or that massive monitor you treat yourself to
- **Toast Notifications**: Friendly little messages that pop up to tell you what's happening
- **Loading States**: Cute spinners so you know the app is working, not frozen
- **Error Handling**: Clear, helpful error messages (no cryptic developer speak here!)
- **Security**:
  - Passwords encrypted with bcrypt (industry standard stuff)
  - JWT for secure authentication
  - All inputs validated (SQL injection who?)
  - API endpoints locked down tight

---

## 🔐 The Nerdy Technical Stuff (For Fellow Developers)

### Concurrency Control
- Using MongoDB's atomic `findOneAndUpdate` to prevent race conditions (no double-bookings even under heavy load!)
- Transaction-like guarantees without the complexity of actual transactions
- It's elegant, efficient, and it just works

### Security
- JWT tokens for authentication (stateless and scalable)
- bcrypt password hashing (12 rounds, because we care)
- Role-based middleware to keep people where they belong
- Input validation on every request (trust no one!)
- Protected routes everywhere they matter

### Performance
- Smart database indexes for lightning-fast queries
- Cloudinary handles images (no bloated databases here)
- Architecture ready for pagination when you need it
- Virtual fields for on-the-fly calculations

---

## 📦 What You'll Need Before Getting Started

Make sure you've got these installed on your machine:

- **Node.js** (v14 or newer) - [Grab it here](https://nodejs.org/)
- **MongoDB** - Either [install locally](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (I recommend Atlas - it's free and you don't have to manage anything)
- **npm** or **yarn** - Don't worry, npm comes with Node.js!

### You'll Also Need These Services

1. **MongoDB Database**: 
   - Go with MongoDB Atlas (it's free and way easier than local setup)
   - Or install MongoDB locally if you're feeling adventurous

2. **Cloudinary Account** (for those pretty event images):
   - Sign up at [cloudinary.com](https://cloudinary.com/) - free tier is more than enough
   - Grab your Cloud Name, API Key, and API Secret from the dashboard

3. **Email Service** (gotta send those verification codes somehow):
   - **SendGrid** is my pick - [Get an API key](https://sendgrid.com/) (free tier works great)
   - Or use **Gmail with Nodemailer** if you prefer

4. **Google Generative AI** (totally optional but super cool):
   - Snag an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Skip this if you don't want AI features - everything else works fine without it

---

## 🚀 Let's Get This Thing Running!

### 1. Clone the Repository

First things first, grab the code:

```bash
git clone <repository-url>
cd MERN_Assignment
```

### 2. Install All The Dependencies

This might take a minute or two (perfect time for a coffee break ☕):

#### Install Root Dependencies
```bash
npm install
```

#### Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

#### Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Set Up Your Environment Variables

This is where the magic configuration happens!

#### Backend Environment Variables

Create a `.env` file in the `backend` folder:

```bash
cd backend
# Create .env file
```

Add the following variables to `backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/event-platform
# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/event-platform?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Event Platform

# OR Email Configuration (Nodemailer with Gmail)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-specific-password

# Google Generative AI (optional)
GEMINI_API_KEY=your_google_ai_api_key
```

#### Frontend Environment Variables

Create a `.env` file in the `frontend` directory (optional):

```bash
cd frontend
# Create .env file
```

Add the following to `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

> **Pro tip**: The frontend already has a proxy set up in `package.json`, so in development mode it automatically talks to the backend. One less thing to worry about!

---

## ▶️ Fire It Up!

### Method 1: Run Backend and Frontend Separately (The Classic Approach)

#### Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm start
```

The backend server will start on `http://localhost:5000`

For development with auto-reload:
```bash
cd backend
npm run dev
```

#### Start the Frontend Application

Open a **new terminal** and run:

```bash
cd frontend
npm start
```

The React application will start on `http://localhost:3000` and automatically open in your browser.

### Method 2: Run Both at Once (For the Impatient)

Want to start everything with one command? Install `concurrently`:

```bash
npm install concurrently --save-dev
```

Add this script to the root `package.json`:

```json
"scripts": {
  "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm start\""
}
```

Then run:
```bash
npm run dev
```

---

## 🌐 Where to Find Everything

Once everything's up and running:

- **Frontend**: Head to `http://localhost:3000` in your browser
- **Backend API**: Humming away at `http://localhost:5000`
- **Health Check**: Visit `http://localhost:5000/api/health` to make sure the backend is alive

### Creating Your First Account

There are no default accounts (security, remember?), so you'll need to sign up:
- Create an **attender** account if you want to book events
- Create a **creator** account if you want to organize events
- Or make both and switch between them to see how everything works!

---

## 🔐 The RSVP Concurrency Challenge (And How I Solved It)

### The Problem

Picture this: Your event has ONE spot left. Ten people click "Book" at the exact same millisecond. What happens? Chaos? Overbooking? Angry users? 

Nope! Here's what we need to guarantee:
1. **No Overbooking**: Only one person gets that last spot, period
2. **Atomicity**: Check availability and book in one indivisible operation
3. **Fairness**: Whoever's request hits the database first wins
4. **Data Integrity**: No weird database states, ever

### The Solution: MongoDB Atomic Operations (It's Cooler Than It Sounds)

#### The Big Idea

I use **MongoDB's `findOneAndUpdate` with atomic operators**. Think of it as a bouncer at an exclusive club - they check the capacity AND let you in (or turn you away) in one smooth motion. No gap for sneaky line-cutters!

This gives us transaction-like guarantees without the complexity of actual database transactions. It's elegant, efficient, and honestly pretty cool.

#### Technical Implementation

**Location**: `backend/routes/events.js` - RSVP verification endpoint

```javascript
// POST /api/events/:id/rsvp/verify - Verify OTP and complete RSVP
router.post('/:id/rsvp/verify', protect, async (req, res) => {
  // ... OTP validation code ...

  // ✅ ATOMIC OPERATION - Prevents race conditions
  const event = await Event.findOneAndUpdate(
    {
      _id: req.params.id,
      // Condition 1: Ensure capacity is not exceeded
      $expr: { $lt: [{ $size: '$attendees' }, '$capacity'] },
      // Condition 2: Ensure user is not already attending
      attendees: { $ne: req.user._id }
    },
    {
      // Only add user if conditions are met
      $addToSet: { attendees: req.user._id }
    },
    {
      new: true,          // Return updated document
      runValidators: true // Run schema validators
    }
  );

  if (!event) {
    // Atomic operation failed - determine why
    const existingEvent = await Event.findById(req.params.id);
    
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (existingEvent.attendees.includes(req.user._id)) {
      return res.status(400).json({ 
        message: 'You are already registered for this event' 
      });
    }

    // Event is full
    return res.status(400).json({ 
      message: 'Event is full. No spots available.',
      availableSpots: 0
    });
  }

  // Success - registration confirmed
  // ... send confirmation emails ...
});
```

#### Breaking Down the Magic

1. **Capacity Check (Built Right In)**: 
   ```javascript
   $expr: { $lt: [{ $size: '$attendees' }, '$capacity'] }
   ```
   This checks if there's room available - but here's the kicker: it happens **at the same instant** as the booking. No time gap = no race condition!

2. **Duplicate Prevention**:
   ```javascript
   attendees: { $ne: req.user._id }
   ```
   Makes sure you're not already registered. Because double-booking yourself would be awkward.

3. **Safe Array Update**:
   ```javascript
   $addToSet: { attendees: req.user._id }
   ```
   Adds you to the attendees list, but only if you're not there already. Belt and suspenders approach!

4. **Why This Works**:
   - Everything happens in ONE database operation
   - MongoDB locks the document while this runs
   - Other requests have to wait their turn
   - No gaps = no race conditions = no overbooking
   - It's like musical chairs but nobody ends up on the floor!

#### The Beauty of It All

1. **Single Database Operation**: Check and update happen together - no sneaky time gap where things can go wrong
2. **Document Locking**: MongoDB says "this event is mine" while processing the request
3. **Conditional Update**: Only succeeds if ALL conditions pass - capacity available AND you're not already registered
4. **Failure Detection**: If the operation returns `null`, we instantly know why it failed and can tell you exactly what went wrong

#### Why Not Just... (Alternative Approaches I Rejected)

1. ❌ **Check-Then-Update** (The Naive Approach):
   ```javascript
   // DON'T DO THIS - Race condition city!
   const event = await Event.findById(eventId);
   if (event.attendees.length < event.capacity) {
     event.attendees.push(userId); // 💥 Another request could slip in here!
     await event.save();
   }
   ```
   **The Problem**: There's a gap between checking and updating. In that tiny window, another request can sneak in and you end up with 11 people in a room that fits 10.

2. ❌ **MongoDB Transactions** (Using a Sledgehammer for a Nail):
   - Requires MongoDB replica set setup (complicated!)
   - More code, more complexity
   - Overkill for this simple use case
   - Slower performance

3. ✅ **Atomic findOneAndUpdate** (The Goldilocks Solution):
   - Simple, elegant, and just right
   - No extra setup needed
   - Built into MongoDB (it's literally made for this)
   - Fast and reliable
   - This is the way! 🎯

#### Want to Test It? (Stress Test Like a Pro)

Here's how you can simulate 100 people fighting for the last spot:

```javascript
// Unleash the chaos: 100 simultaneous booking requests!
const promises = [];
for (let i = 0; i < 100; i++) {
  promises.push(
    axios.post(`/api/events/${eventId}/rsvp/verify`, {
      otp: validOTP
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    })
  );
}

const results = await Promise.all(promises);
// Result: Exactly ONE person gets the spot ✅
// The other 99 get a polite "Event is full" message ❌
// No double bookings, no exceptions, no drama!
```

#### Belt AND Suspenders (Extra Safety Layers)

1. **OTP System**: Even before we hit the database, you need to verify your email. No accidental double-clicks ruining your day!
2. **Database Indexes**: Lightning-fast lookups (because nobody likes waiting)
3. **Schema Validation**: MongoDB itself enforces capacity limits (1 to 10,000 attendees)
4. **Smart Error Handling**: Every failure scenario has a clear, helpful message

### Performance? It's Fast!

- **O(1) Operation**: Checking array size is instant, no matter how many attendees
- **Indexed Queries**: Event lookups use the primary key (doesn't get faster than that)
- **No Network Round-Trips**: Everything happens in one database call
- **Scales Beautifully**: Works just as well with 10 concurrent users or 10,000

---

## 📁 Project Structure

```
MERN_Assignment/
├── backend/                 # Backend Node.js application
│   ├── config/             # Configuration files
│   │   ├── cloudinary.js   # Cloudinary image upload setup
│   │   └── email.js        # Email service configuration
│   ├── middleware/         # Express middleware
│   │   └── auth.js         # JWT authentication middleware
│   ├── models/             # MongoDB Mongoose models
│   │   ├── Event.js        # Event schema
│   │   ├── OTP.js          # OTP verification schema
│   │   └── User.js         # User schema with roles
│   ├── routes/             # API routes
│   │   ├── ai.js           # AI description generation routes
│   │   ├── auth.js         # Authentication routes
│   │   └── events.js       # Event management and RSVP routes
│   ├── services/           # Business logic services
│   │   └── aiService.js    # Google Generative AI integration
│   ├── .env                # Environment variables (create this)
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server entry point
│
├── frontend/               # React frontend application
│   ├── public/             # Static files
│   │   └── index.html      # HTML template
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── EventCard.js      # Event display card
│   │   │   ├── EventCard.css
│   │   │   ├── Navbar.js         # Navigation bar
│   │   │   ├── Navbar.css
│   │   │   ├── OTPModal.js       # OTP verification modal
│   │   │   └── OTPModal.css
│   │   ├── context/        # React Context for state management
│   │   │   └── AuthContext.js    # Authentication context
│   │   ├── pages/          # Page components
│   │   │   ├── Auth.css          # Shared auth styles
│   │   │   ├── CreateEvent.js    # Create event page
│   │   │   ├── EditEvent.js      # Edit event page
│   │   │   ├── EventDetails.js   # Event details and RSVP
│   │   │   ├── EventDetails.css
│   │   │   ├── EventForm.css     # Shared form styles
│   │   │   ├── Home.js           # Event listing page
│   │   │   ├── Home.css
│   │   │   ├── Login.js          # Login page
│   │   │   ├── MyEvents.js       # User's created events
│   │   │   ├── MyEvents.css
│   │   │   └── Register.js       # Registration page
│   │   ├── utils/          # Utility functions
│   │   │   └── api.js            # Axios API configuration
│   │   ├── App.js          # Main application component
│   │   ├── App.css         # Global styles
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Base styles
│   ├── .env                # Frontend env variables (optional)
│   ├── package.json        # Frontend dependencies
│   └── netlify.toml        # Netlify deployment config
│
├── netlify.toml            # Root Netlify config
├── render.yaml             # Render deployment config
├── package.json            # Root package.json
└── README.md               # This file
```

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |

### Event Routes (`/api/events`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/events` | Get all events (with filtering) | Public |
| GET | `/api/events/:id` | Get single event details | Public |
| POST | `/api/events` | Create new event | Private (Creator) |
| PUT | `/api/events/:id` | Update event | Private (Creator/Owner) |
| DELETE | `/api/events/:id` | Delete event | Private (Creator/Owner) |
| POST | `/api/events/:id/rsvp` | Request RSVP (sends OTP) | Private |
| POST | `/api/events/:id/rsvp/verify` | Verify OTP and complete RSVP | Private |
| DELETE | `/api/events/:id/rsvp` | Cancel RSVP | Private |

### AI Routes (`/api/ai`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/ai/generate-description` | Generate event description | Private (Creator) |
| POST | `/api/ai/enhance-description` | Enhance existing description | Private (Creator) |

### Query Parameters for GET `/api/events`

- `search`: Search by title, description, or location
- `category`: Filter by category (conference, workshop, meetup, etc.)
- `dateFrom`: Filter events from this date
- `dateTo`: Filter events until this date
- `sortBy`: Sort order (date-asc, date-desc, title, capacity)

---

## 🛠️ Technologies Used

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Token for authentication
- **bcrypt.js**: Password hashing
- **Cloudinary**: Image storage and management
- **SendGrid/Nodemailer**: Email service
- **Google Generative AI**: AI-powered descriptions
- **express-validator**: Request validation
- **multer**: File upload handling
- **date-fns**: Date formatting

### Frontend
- **React**: UI library
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client
- **React Toastify**: Notifications
- **date-fns**: Date formatting
- **CSS3**: Styling

### Development Tools
- **nodemon**: Auto-restart for development
- **dotenv**: Environment variable management

---

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Push your code to GitHub
2. Connect your repository to Render/Railway
3. Set environment variables in the platform
4. Deploy

### Frontend Deployment (Netlify/Vercel)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `build` folder to Netlify or Vercel
3. Configure environment variables
4. Update API URL in frontend environment variables

---

## 📝 Additional Notes

### Security Best Practices

1. **Never commit `.env` files** - Add them to `.gitignore`
2. **Use strong JWT secrets** - Generate random strings
3. **Enable CORS properly** - Configure allowed origins in production
4. **Validate all inputs** - Use express-validator
5. **Rate limiting** - Consider adding rate limiting for production

### Database Indexes

The application automatically creates indexes for:
- Event date (for efficient date-based queries)
- Event creator (for user's events page)
- Event title and description (text search)
- Event category (for category filtering)

### Email Configuration

#### Using SendGrid (Recommended)
1. Create account at sendgrid.com
2. Verify sender email
3. Get API key
4. Add to `SENDGRID_API_KEY` in `.env`

#### Using Gmail with Nodemailer
1. Enable 2-factor authentication on Gmail
2. Generate App-Specific Password
3. Use in `EMAIL_PASSWORD` environment variable

### AI Features

The AI features are optional. If `GEMINI_API_KEY` is not provided:
- AI buttons will be disabled
- Manual description entry still works
- All other features work normally

---

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally OR
   - Check MongoDB Atlas connection string
   - Verify network access in MongoDB Atlas

2. **Port Already in Use**
   - Change `PORT` in backend `.env`
   - Kill process using port: `npx kill-port 5000`

3. **Email Not Sending**
   - Check email service credentials
   - Verify sender email is verified (SendGrid)
   - Check spam folder
   - Review console logs for email errors

4. **Image Upload Failing**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure proper CORS settings

5. **CORS Errors**
   - Verify backend CORS configuration
   - Check frontend API URL
   - Ensure proxy is configured in development

---

## 📄 License

This project is created for educational purposes as part of a MERN stack assignment.

---

## 👤 Author

Created as part of MERN Stack Development Assignment

---

## 🙏 Acknowledgments

- MongoDB documentation for atomic operations
- React documentation
- Express.js community
- Cloudinary for image hosting
- SendGrid for email services
- Google for Generative AI API

---

**Happy Event Booking! 🎉**
