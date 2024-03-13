const express = require("express");
const user_model = require("../models/user_model");
const {RegisterUser, UpdateUser, resetPassword, ChangePassw, LogInUser, LogOut, FetchData, LoginStatus, uploadFile} = require("../controllers/user_controller");
const protect = require("../middleware/AuthMiddleware");
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const uploader = require('../middleware/Upload');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Protect middle ware is used only when we want to start the function IF the user is logged in
router.post("/Register", RegisterUser);
router.post("/Login", LogInUser);
router.get("/Logout", LogOut);
router.get("/FetchData", protect, FetchData);
router.get("/LoggedIn", LoginStatus);
router.patch("/UpdateUser", protect, UpdateUser);
router.patch("/ChangePass", protect, ChangePassw); 
router.put("/ResetPassword/:resetToken", resetPassword);
router.post('/FileUpload', uploadFile, uploader.single('file'))


router.post('/convert-to-wav', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
  
    const inputBuffer = req.file.buffer;
  
    // Create a unique filename for the output MP3 file
    const outputFileName = `${Date.now()}.wav`;
  
    ffmpeg()
      .input(inputBuffer)
      .toFormat('wav')
      .on('end', () => {
        res.status(200).json({ message: 'Conversion successful', mp3FileName: outputFileName });
      })
      .on('error', (err) => {
        console.error('Error converting to WAV:', err);
        res.status(500).json({ error: 'Conversion failed' });
      })
      .pipe(res, { end: true });
  });

module.exports = router;