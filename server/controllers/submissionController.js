/**
 * ➲ EduX_SYSTEM_OS v3.0 - ARCHIVE_LOGIC
 * ➲ FUNCTION: Manages Mission Persistence & Analytics Retrieval
 */

const Submission = require('../models/Submission');

// @desc    Save a completed mission log (Exam Submission)
// @route   POST /api/submissions/quiz/:quizId
const submitExam = async (req, res) => {
    try {
        const {
            studentName,
            final_score,
            total_possible,
            percentage,
            detailed_results,
            tabSwitches,
            phoneDetected,        // ➲ NEW: Captured from Python Vision
            multipleFacesDetected, // ➲ NEW: Captured from Python Vision
            faceMissingDetected,   // ➲ NEW: Captured from Python Vision
            security_violations,
            integrity_status
        } = req.body;

        // Extraction Protocol: Priority to Params, fallback to Body
        const quizId = req.params.quizId || req.body.quizId;

        if (!quizId) {
            return res.status(400).json({ message: "PROTOCOL_ERR: Missing Mission ID." });
        }

        const normalizedTabSwitches = Number(tabSwitches || 0);
        const normalizedViolationCount = Number(security_violations || 0);
        const hasAnyViolation = Boolean(
            normalizedTabSwitches > 0 ||
            phoneDetected ||
            multipleFacesDetected ||
            faceMissingDetected ||
            normalizedViolationCount > 0
        );

        const submission = new Submission({
            quiz: quizId,
            studentName,
            tabSwitches: normalizedTabSwitches,
            phoneDetected: Boolean(phoneDetected),
            multipleFacesDetected: Boolean(multipleFacesDetected),
            faceMissingDetected: Boolean(faceMissingDetected),
            security_violations: Math.max(normalizedViolationCount, normalizedTabSwitches + (phoneDetected ? 1 : 0) + (multipleFacesDetected ? 1 : 0) + (faceMissingDetected ? 1 : 0)),
            integrity_status: hasAnyViolation ? 'BREACH_DETECTED' : 'VERIFIED',
            final_score,
            total_possible,
            percentage,
            detailed_results
        });

        const savedSubmission = await submission.save();

        console.log(`➲ [ARCHIVE_CORE]: Log secured for Agent ${studentName}. Status: ${savedSubmission.sync_status}`);

        res.status(201).json(savedSubmission);
    } catch (error) {
        console.error("➲ [ARCHIVE_ERR]: Persistence failed:", error);
        res.status(500).json({ message: "CORE_ARCHIVE_FAILURE", error: error.message });
    }
};

// @desc    Retrieve mission history for a specific Agent
// @route   GET /api/submissions/student/:studentName
const getStudentSubmissions = async (req, res) => {
    try {
        const studentName = req.params.studentName.trim();

        // Populate 'quiz' to get Title and Topic for the Student Dashboard
        const submissions = await Submission.find({ studentName })
            .populate('quiz', 'title topic')
            .sort({ createdAt: -1 });

        res.status(200).json(submissions);
    } catch (error) {
        console.error("➲ [INTEL_ERR]: Student lookup failed:", error);
        res.status(500).json({ message: "DATA_STREAM_FAILURE" });
    }
};

// @desc    Retrieve all Agent logs for a specific Mission
// @route   GET /api/submissions/quiz/:quizId
const getQuizSubmissions = async (req, res) => {
    try {
        const quizId = req.params.quizId.trim();

        // Populate 'quiz' to verify Mission designations
        const submissions = await Submission.find({ quiz: quizId })
            .populate('quiz', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json(submissions);
    } catch (error) {
        console.error("➲ [INTEL_ERR]: Quiz analytics failed:", error);
        res.status(500).json({ message: "ANALYTICS_UPLINK_FAILURE" });
    }
};

// @desc    Purge all submissions for a specific quiz
// @route   DELETE /api/submissions/quiz/:quizId
const purgeQuizSubmissions = async (req, res) => {
    try {
        await Submission.deleteMany({ quiz: req.params.quizId });
        res.status(200).json({ message: "Mission logs purged." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add to module.exports
module.exports = { submitExam, getStudentSubmissions, getQuizSubmissions, purgeQuizSubmissions };