/**
 * ➲ SCIO_SYSTEM_OS v1.0 - CORE FOUNDATION
 * ➲ ARCHITECTURE: Node.js // Express // MongoDB
 * ➲ FUNCTION: Secure Auth, Mission Control, Data Archiving
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// --- ➲ 0. SYSTEM MIDDLEWARE ---
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/scio_db";
const SECRET_KEY = process.env.JWT_SECRET || "SCIO_SUPER_SECRET_KEY_2026";

// --- ➲ 1. DATABASE MODELS ---

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher'], default: 'student' }
});

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    topic: { type: String, default: "General" },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Replace the old questions array inside quizSchema with this:
    questions: [{
        type: { type: String, enum: ['text', 'mcq'], default: 'text' }, // NEW: 'text' or 'mcq'
        question: { type: String, required: true },
        expected_answer: { type: String, required: true },
        options: [{ type: String }], // NEW: Stores the 2 options for MCQs
        marks: { type: Number, default: 10 }
    }],
    timeLimit: { type: Number, default: 15 },
    createdAt: { type: Date, default: Date.now }
});

const submissionSchema = new mongoose.Schema({
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    studentName: { type: String, required: true },
    final_score: { type: Number, required: true },
    total_possible: { type: Number, required: true },
    percentage: { type: Number, required: true },
    tabSwitches: { type: Number, default: 0 },
    detailed_results: [{
        question: String,
        student_answer: String,
        ai_feedback: String,
        awarded_marks: Number,
        possible_marks: Number
    }],
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Quiz = mongoose.model('Quiz', quizSchema);
const Submission = mongoose.model('Submission', submissionSchema);

// --- ➲ 2. CORE API ROUTES ---

// [AUTH] Register
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
        res.status(201).json({ _id: user._id, name: user.name, role: user.role, token });
    } catch (error) {
        res.status(500).json({ message: "Registration failed." });
    }
});

// [AUTH] Login
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });
            res.json({ _id: user._id, name: user.name, role: user.role, token });
        } else {
            res.status(401).json({ message: "Invalid credentials." });
        }
    } catch (error) {
        res.status(500).json({ message: "Login failed." });
    }
});

// [QUIZZES] Create
app.post('/api/quizzes', async (req, res) => {
    try {
        const quiz = new Quiz(req.body);
        await quiz.save();
        res.status(201).json(quiz);
    } catch (error) {
        res.status(400).json({ message: "Failed to create quiz." });
    }
});


// [QUIZZES] Get by Teacher
app.get('/api/quizzes/teacher/:teacherId', async (req, res) => {
    try {
        const quizzes = await Quiz.find({ teacherId: req.params.teacherId }).sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch quizzes." });
    }
});

// [QUIZZES] Get Single Quiz (WITH SPACE-SWEEP FIX)
app.get('/api/quizzes/:id', async (req, res) => {
    try {
        const cleanId = req.params.id.trim();
        const quiz = await Quiz.findById(cleanId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });
        res.json(quiz);
    } catch (error) {
        if (error.name === 'CastError') return res.status(400).json({ message: "Invalid ID format" });
        res.status(500).json({ message: "Server error" });
    }
});

// [SUBMISSIONS] Submit Exam
app.post('/api/submissions/quiz/:quizId', async (req, res) => {
    try {
        const submission = new Submission({ ...req.body, quizId: req.params.quizId });
        await submission.save();
        res.status(201).json({ message: "Submission saved." });
    } catch (error) {
        res.status(400).json({ message: "Failed to save submission." });
    }
});

// [SUBMISSIONS] Get Results by Quiz
app.get('/api/submissions/quiz/:quizId', async (req, res) => {
    try {
        const results = await Submission.find({ quizId: req.params.quizId }).populate('quizId', 'title').sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch results." });
    }
});

// [SUBMISSIONS] Get Results by Student Name
app.get('/api/submissions/student/:name', async (req, res) => {
    try {
        const cleanName = req.params.name.trim();
        const results = await Submission.find({ studentName: cleanName }).populate('quizId', 'title').sort({ createdAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch student history." });
    }
});

// ➲ PURGE_PROTOCOL: Authorized Mission Deletion
app.delete('/api/quizzes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Locate and Terminate the Quiz document
        const deletedQuiz = await Quiz.findByIdAndDelete(id.trim());

        if (!deletedQuiz) {
            return res.status(404).json({
                success: false,
                message: "MISSION_NOT_FOUND: Target ID does not exist in the archive."
            });
        }

        // 2. Cascade Wipe: Clear all candidate submissions linked to this mission
        // If your submission model uses 'quizId', use that. If it uses 'quiz', use that.
        await Submission.deleteMany({ quiz: id.trim() });

        console.log(`➲ [MAINFRAME]: Mission ${id} and all telemetry purged successfully.`);

        res.status(200).json({
            success: true,
            message: "MISSION_PURGED: Data neutralized."
        });

    } catch (error) {
        console.error("➲ [PURGE_ERR]:", error);
        res.status(500).json({
            success: false,
            message: "CORE_FAILURE: Internal mainframe error during purge."
        });
    }
});

// --- ➲ 3. SYSTEM BOOT ---
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("➲ [V1_DB]: MongoDB Connected successfully.");
        app.listen(PORT, () => {
            console.log(`➲ [V1_SERVER]: Core Backend running on port ${PORT}`);
        });
    })
    .catch(err => console.error("➲ [V1_DB]: Connection Error:", err));