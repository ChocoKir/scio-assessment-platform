// server/routes/submissionRoutes.js
const express = require('express');
const router = express.Router();

// 1. Import the EXACT function names we just set up in the controller
const {
    submitExam,
    getStudentSubmissions,
    getQuizSubmissions
} = require('../controllers/submissionController');

// 2. Student submits an exam
router.post('/:quizId', submitExam);

// 3. Get all submissions for a specific student (Student Dashboard)
router.get('/student/:studentName', getStudentSubmissions);

// 4. Get all submissions for a specific quiz (Teacher Analytics)
router.get('/quiz/:quizId', getQuizSubmissions);

router.delete('/quiz/:quizId', purgeQuizSubmissions);

module.exports = router;