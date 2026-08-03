import { mongoose } from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User Name is required'],
        trim: true,
        minLength: [3, 'User Name must be at least 3 characters long'],
        maxLength: [50, 'User Name must be at most 50 characters long'],
    },
    email: {
        type: String,
        required: [true, 'User Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'User Email is invalid'],
    },
    clerkId: {
        type: String,
        required: [true, 'Clerk ID is required'],
        unique: true,
    }
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;