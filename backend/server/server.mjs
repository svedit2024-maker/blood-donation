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
import Donor from "../modules/schema_donar.mjs";

dotenv.config();

const app = express();


// =========================
// MIDDLEWARE
// =========================

app.use(express.json());

app.use(express.static(path.resolve("frontend")));


// =========================
// MONGODB CONNECTION
// =========================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });


// =========================
// BASIC ROUTES
// =========================

app.get("/", (req, res) => {
    res.sendFile(path.resolve("frontend/html/login.html"));
});

app.get("/register.html", (req, res) => {
    res.sendFile(path.resolve("frontend/html/register.html"));
});


// =========================
// SESSION
// =========================

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,

        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            sameSite: "lax"
        }
    })
);


// =========================
// PASSPORT
// =========================

app.use(passport.initialize());
app.use(passport.session());


// =========================
// GOOGLE LOGIN
// =========================

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },

        async (accessToken, refreshToken, profile, done) => {

            try {

                let user = await User.findOne({
                    googleId: profile.id
                });

                if (!user) {

                    user = new User({
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value
                    });

                    await user.save();
                }

                done(null, user);

            } catch (error) {

                done(error, null);

            }
        }
    )
);


// =========================
// PASSPORT SESSION
// =========================

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


// =========================
// GOOGLE AUTH ROUTES
// =========================

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


// =========================
// LOGOUT
// =========================

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


// =========================
// LOCAL LOGIN
// =========================

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },

        async (email, password, done) => {

            try {

                const user = await User.findOne({
                    email
                });

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


// =========================
// USER REGISTRATION
// =========================

app.post("/auth/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        const existingUser = await User.findOne({
            email
        });


        if (existingUser) {

            return res.status(400).json({
                message: "Email already registered"
            });

        }


        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


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


// =========================
// DONOR REGISTRATION
// =========================

app.post("/donors", async (req, res) => {

    try {

        // Check whether user is logged in

        if (!req.isAuthenticated()) {

            return res.status(401).json({
                message: "Please login first"
            });

        }


        const {
            name,
            bloodGroup,
            dateOfBirth,
            gender,
            phone,
            state,
            city,
            area,
            consent
        } = req.body;


        // Check required fields

        if (
            !name ||
            !bloodGroup ||
            !dateOfBirth ||
            !gender ||
            !phone ||
            !state ||
            !city ||
            !area
        ) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }


        // =========================
        // PHONE VALIDATION
        // =========================

        if (!/^[0-9]{10}$/.test(phone)) {

            return res.status(400).json({
                message: "Phone number must contain exactly 10 digits"
            });

        }


        // =========================
        // BLOOD GROUP VALIDATION
        // =========================

        const validBloodGroups = [
            "A+",
            "A-",
            "B+",
            "B-",
            "AB+",
            "AB-",
            "O+",
            "O-"
        ];


        if (!validBloodGroups.includes(bloodGroup)) {

            return res.status(400).json({
                message: "Invalid blood group"
            });

        }


        // Check consent

        if (consent !== true) {

            return res.status(400).json({
                message: "You must give consent to register as a donor"
            });

        }


        // Check whether user already has donor profile

        const existingDonor = await Donor.findOne({
            userId: req.user._id
        });


        if (existingDonor) {

            return res.status(409).json({
                message: "You are already registered as a donor"
            });

        }


        // Create donor

        const donor = new Donor({

            userId: req.user._id,

            name,
            bloodGroup,
            dateOfBirth,
            gender,
            phone,
            state,
            city,
            area,
            consent

        });


        await donor.save();


        res.status(201).json({

            message: "Donor registered successfully",

            donor

        });


    } catch (error) {

        console.error(
            "Donor registration error:",
            error
        );


        res.status(500).json({
            message: "Server error"
        });

    }

});


// =========================
// SEARCH DONORS
// =========================

app.get("/donors/search", async (req, res) => {

    try {

        const {
            bloodGroup,
            location
        } = req.query;


        const filter = {

            available: true,

            consent: true

        };


        // Filter by blood group

        if (bloodGroup) {

            filter.bloodGroup = bloodGroup;

        }


        // Search state, city or area

        if (location) {

            // Escape special regex characters
            // so user input is treated as normal text

            const escapedLocation = location.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );


            const locationRegex = new RegExp(
                escapedLocation,
                "i"
            );


            filter.$or = [

                {
                    state: locationRegex
                },

                {
                    city: locationRegex
                },

                {
                    area: locationRegex
                }

            ];

        }


        const donors = await Donor.find(filter)

            .select(
                "name bloodGroup state city area available"
            );


        res.status(200).json({

            success: true,

            count: donors.length,

            donors: donors

        });


    } catch (error) {

        console.error(
            "Search donors error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to search donors"

        });

    }

});


// =========================
// REGISTERED DONOR COUNT
// =========================

app.get("/donors/count", async (req, res) => {

    try {

        const count = await Donor.countDocuments({

            consent: true

        });


        res.status(200).json({

            success: true,

            count: count

        });


    } catch (error) {

        console.error(
            "Donor count error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to get donor count"

        });

    }

});


// =========================
// RECENT DONOR ACTIVITY
// =========================

app.get("/donors/recent", async (req, res) => {

    try {

        const donors = await Donor.find({

            consent: true

        })

        // Newest donors first

        .sort({
            createdAt: -1
        })

        // Only latest 5

        .limit(5)

        // Only send required fields

        .select(
            "name bloodGroup city createdAt"
        );


        res.status(200).json({

            success: true,

            donors: donors

        });


    } catch (error) {

        console.error(
            "Recent donors error:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to load recent activity"

        });

    }

});


// =========================
// MY PROFILE
// =========================

app.get("/donors/my-profile", async (req, res) => {

    try {

        // Check login

        if (!req.isAuthenticated()) {

            return res.status(401).json({

                message: "Please login first"

            });

        }


        // Find donor profile belonging
        // to the logged-in user

        const donor = await Donor.findOne({

            userId: req.user._id

        });


        // User is not a donor

        if (!donor) {

            return res.status(404).json({

                isDonor: false,

                message: "You are not registered as a donor"

            });

        }


        // User is a donor

        res.status(200).json({

            isDonor: true,

            donor: donor

        });


    } catch (error) {

        console.error(
            "My profile error:",
            error
        );


        res.status(500).json({

            message: "Failed to load profile"

        });

    }

});


// =========================
// START SERVER
// =========================

app.listen(process.env.PORT , () => {

    console.log(
        "Server running on http://localhost:3000"
    );

});