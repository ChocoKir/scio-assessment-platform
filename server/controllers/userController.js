// server/controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Register a new user (Teacher or Student)
// @route   POST /api/users/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with that email.' });
        }

        // 2. Hash the password for security before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create the user in the database
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student' // Default to student if none provided
        });

        // 4. Send the user data back to the frontend (excluding password)
        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(400).json({ message: 'Invalid user data received.' });
        }
    } catch (error) {
        console.error("Registration error:", error);
        // res.status(500).json({ message: error.message });

        res.status(500).json({ 
      message: 'Registration failed.',
      error: error.message, // Include error details in development
    //   stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by their email
        const user = await User.findOne({ email });

        // 2. Compare the typed password with the hashed password in MongoDB
        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser
};