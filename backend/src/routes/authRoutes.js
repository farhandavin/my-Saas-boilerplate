const express = require('express');
// Import controller baru
const { register, login, getUser, forgotPassword, resetPassword } = require('../controllers/authController'); 
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/user/:id', getUser);

// Route Baru
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;