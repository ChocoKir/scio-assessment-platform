// server/utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // Creates a token that expires in 30 days
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = generateToken;