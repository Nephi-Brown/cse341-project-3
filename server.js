// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('./data/database');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app
  .use(bodyParser.json())
  .use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: true
    })
  )
  .use(passport.initialize())
  .use(passport.session())
  .use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Z-Key, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, OPTIONS, DELETE');
    next();
  })
  .use(cors({ methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'] }))
  .use(cors({ origin: '*' }))
  .use('/', require('./routes/index.js'));

// --------------------
// Passport GitHub Auth
// --------------------
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL
    },
    async function (accessToken, refreshToken, profile, done) {
      // We store the GitHub profile in the session (same pattern as your original)
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// --------------------
// Basic home route
// --------------------
app.get('/', (req, res) => {
  res.send(req.session.user !== undefined ? `Logged in as ${req.session.user.displayName}` : 'Logged Out');
});

// --------------------
// OAuth Callback
// Creates/updates user record + logs login history
// --------------------
app.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/api-docs', session: false }),
  async (req, res) => {
    req.session.user = req.user;

    try {
      const db = mongodb.getDatabase().db();
      const users = db.collection('users');

      const githubId = String(req.user.id);
      const now = new Date();

      const loginEntry = {
        at: now,
        ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || null,
        userAgent: req.get('user-agent') || null
      };

      await users.updateOne(
        { githubId },
        {
          $setOnInsert: {
            githubId,
            role: 'customer',
            createdAt: now,
            favorites: {
              literature: [],
              videogames: [],
              movies: [],
              music: []
            },
            borrowingHistory: [],
            loginHistory: []
          },
          $set: {
            displayName: req.user.displayName || '',
            username: req.user.username || '',
            profileUrl: req.user.profileUrl || '',
            lastLoginAt: now
          },
          $push: { loginHistory: loginEntry }
        },
        { upsert: true }
      );
    } catch (e) {
      console.error('User upsert/login history failed:', e);
      // Do not block login if DB write fails
    }

    res.redirect('/');
  }
);

mongodb.initDb((err) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(port, () => {
      console.log(`Database is listening and node Running on port ${port}`);
    });
  }
});
