/**
 * ➲ EduX_SYSTEM_OS v3.0 - MISSION_CONTROLLER
 * ➲ FUNCTION: Manages Quiz Creation, Retrieval, and Deletion
 */

const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');

// @desc    Forge a new AI Mission
// @route   POST /api/quizzes
const createQuiz = async (req, res) => {
    try {
        const { title, topic, questions, timeLimit, teacherId } = req.body;
        const quiz = await Quiz.create({
            title, topic, questions, timeLimit, teacherId
        });
        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ message: "FORGE_FAILURE", error: error.message });
    }
};

// @desc    Get all missions for a specific Commander
// @route   GET /api/quizzes/teacher/:teacherId
const getTeacherQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ teacherId: req.params.teacherId }).sort({ createdAt: -1 });
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: "DATA_SYNC_FAILURE" });
    }
};

// @desc    Get specific mission parameters for Agents
// @route   GET /api/quizzes/:id
const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (quiz) res.status(200).json(quiz);
        else res.status(404).json({ message: 'MISSION_NOT_FOUND' });
    } catch (error) {
        res.status(500).json({ message: 'CORE_ERROR' });
    }
};

// @desc    Purge a mission and all its archives
// @route   DELETE /api/quizzes/:id
// ➲ UPGRADE: Full cascade delete
const deleteQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;

        // 1. Terminate the Quiz
        const quiz = await Quiz.findByIdAndDelete(quizId);

        if (!quiz) {
            return res.status(404).json({ message: "PURGE_ERR: Mission not found." });
        }

        // 2. Wipe all student submissions associated with this quiz
        await Submission.deleteMany({ quiz: quizId });

        console.log(`➲ [MAINFRAME]: Mission ${quizId} and all associated logs purged.`);
        res.status(200).json({ message: "PURGE_COMPLETE" });
    } catch (error) {
        res.status(500).json({ message: "PURGE_FAILURE", error: error.message });
    }
};

module.exports = {
    createQuiz,
    getTeacherQuizzes,
    getQuizById,
    deleteQuiz
};