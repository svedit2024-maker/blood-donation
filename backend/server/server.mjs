import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

dotenv.config();
const app = express();
app.use(express.static(path.resolve("frontend")));

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });

app.get("/", (req, res) => {
    res.sendFile(path.resolve("frontend/html/login.html"));
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy(
{
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},

async (accessToken, refreshToken, profile, done) => {
    // Here you would typically find or create a user in your database
    // For now, we'll just log the profile and call done
    console.log(profile);
    done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // Here you would typically fetch the user from your database by ID
    // For now, we'll just call done with a mock user
    done(null, { id });
});
app.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);

app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/login.html"
    }),
    (req, res) => {
        res.redirect("/html/main.html");
    }
);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});