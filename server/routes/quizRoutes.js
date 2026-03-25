const express = require('express');
const router = express.Router();
const {
    createQuiz,
    getTeacherQuizzes,
    getQuizById,
    deleteQuiz // <-- Import the new function
} = require('../controllers/quizController');

router.post('/', createQuiz);
router.get('/teacher/:teacherId', getTeacherQuizzes);
router.get('/:id', getQuizById);
router.delete('/:id', deleteQuiz); // ➲ NEW: Authorized DELETE route

module.exports = router;