import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
         name: {
            type: String,
            required: true,
            trim: true
        },
        bloodGroup: {
            type: String,
            required: true,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
        },

        dateOfBirth: {
            type: Date,
            required: true
        },

        gender: {
            type: String,
            required: true,
            enum: ["Male", "Female", "Other"]
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        state: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        area: {
            type: String,
            required: true,
            trim: true
        },

        available: {
            type: Boolean,
            default: true
        },

        consent: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Donor = mongoose.model("Donor", donorSchema);

export default Donor;