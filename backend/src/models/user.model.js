import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lovercase: true,
        trim: true,
        index:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lovercase: true,
        trim: true
    },
    fullname:{
        type: String,
        required: true,
        trim: true,
        index: true
    },
   
    password:{
        type: String,
        required: [true, "Password is required"],
        minlength: 6
    },
    refreshToken: {
        type: String,
    },
},
{
    timestamps: true
})

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) { 
        return next();
    }   
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.IsPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

//genarate access token and refresh token
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        { id: this._id ,
          username: this.username,
          email: this.email,
          fullname: this.fullname,

        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
             expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
        }
    );
}

//same as for refresh token
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        { 
            id: this._id ,
        }, 
        process.env.REFRESH_TOKEN_SECRET,
        {
             expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
        }
    );
}

export const User = mongoose.model("User", userSchema); 