/**
 * ➲ SCIO_SYSTEM_OS v3.0 - ARCHIVE_CORE
 * ➲ FUNCTION: Mission Persistence & AI Telemetry Storage
 */

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    // MISSION_LINK: Reference to the forged quiz
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Quiz',
        index: true // ➲ UPGRADE: Optimized for fast teacher analytics
    },
    // AGENT_ID: Name of the candidate
    studentName: {
        type: String,
        required: true,
        trim: true,
        index: true // ➲ UPGRADE: Optimized for fast student record lookups
    },

    // --- 🛡️ PROCTORING_TELEMETRY (AI SENSOR DATA) ---
    tabSwitches: {
        type: Number,
        default: 0,
        min: 0
    },
    phoneDetected: {
        type: Boolean,
        default: false
    }, // ➲ NEW: Directly logs YOLOv8 cell phone detection
    multipleFacesDetected: {
        type: Boolean,
        default: false
    }, // ➲ NEW: Logs if extra entities were detected in the frame
    faceMissingDetected: {
        type: Boolean,
        default: false
    }, // ➲ NEW: Logs if student left the frame

    // --- 🧠 NEURAL_EVALUATION_DATA ---
    final_score: {
        type: Number,
        required: true,
        min: 0
    },
    total_possible: {
        type: Number,
        required: true,
        min: 1
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },

    // Detailed Unit breakdown provided by Gemini
    detailed_results: [
        {
            question_id: { type: String, required: true },
            question: { type: String, required: true },
            student_answer: { type: String, default: "" },
            awarded_marks: { type: Number, default: 0 },
            possible_marks: { type: Number, required: true },
            ai_feedback: { type: String, default: "No AI analysis provided." }
        }
    ]
}, {
    timestamps: true, // Tracks sync_date and update_date
});

// --- ➲ ARCHITECTURAL UPGRADES ---

// [VIRTUAL]: Formatted Date for IntelliJ Debugging & HUD
submissionSchema.virtual('sync_status').get(function() {
    return this.tabSwitches > 3 ? 'CRITICAL_BREACH' : this.tabSwitches > 0 ? 'WARNING' : 'SECURE';
});

// Ensure virtuals are included when sending data to React
submissionSchema.set('toJSON', { virtuals: true });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;