import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import session from 'express-session';
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import User from "../modules/schema1.mjs";

dotenv.config();
const app = express();
app.use(express.json());
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
app.get("/register.html", (req, res) => {
    res.sendFile(path.resolve("frontend/html/register.html"));
});
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
}
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
   try{
    let user  = await User.findOne({ googleId: profile.id });
    if (!user) {
        user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value
        });
        await user.save();
    }
    done(null, user);
   }
    catch (error) {
        done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
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
        failureRedirect: "/"
    }),
    (req, res) => {
        res.redirect("/html/main.html");
    }
);

app.get("/auth/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }

            res.redirect("/");
        });
    });
});

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });

                if (!user) {
                    return done(null, false, {
                        message: "User not found"
                    });
                }

                if (!user.password) {
                    return done(null, false, {
                        message: "Please login with Google"
                    });
                }

                const isMatch = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!isMatch) {
                    return done(null, false, {
                        message: "Incorrect password"
                    });
                }

                return done(null, user);

            } catch (error) {
                return done(error);
            }
        }
    )
);
app.post(
    "/auth/login",
    passport.authenticate("local", {
        successRedirect: "/html/main.html",
        failureRedirect: "/"
    })
);
app.post("/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
