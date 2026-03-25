// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
// Import the new register function
const { registerUser, loginUser } = require('../controllers/userController');

// --- NEW: Registration Route ---
router.post('/register', registerUser);
// -------------------------------

router.post('/login', loginUser);

module.exports = router;