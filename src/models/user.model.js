import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address.']
    },
    
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 100 // Increased to accommodate bcrypt hash (60 chars)
    },
    refreshToken: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});


//before saving password we can hash it using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

//compare passsword method to compare the hashed password with the plain text password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model('User', userSchema);