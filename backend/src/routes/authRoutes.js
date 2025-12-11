const express = require('express');
// Tambahkan getUser di dalam kurung kurawal
const { register, login, getUser } = require('../controllers/authController'); 
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Route baru untuk ambil data user terbaru
router.get('/user/:id', getUser);

module.exports = router;