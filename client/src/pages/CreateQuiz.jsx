// client/src/pages/CreateQuiz.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

const CreateQuiz = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [notify, setNotify] = useState({ message: '', type: '' });

    // --- ASSESSMENT PARAMETERS ---
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [timeLimit, setTimeLimit] = useState(15);
    const [aiCount, setAiCount] = useState(3);

    // --- DYNAMIC QUESTION ARRAY ---
    const [questions, setQuestions] = useState([
        { type: 'text', question: '', expected_answer: '', options: ['', ''], marks: 10 }
    ]);

    useEffect(() => {
        const storedUser = localStorage.getItem('scio_user');
        if (!storedUser) return navigate('/login');
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'teacher') navigate('/dashboard');
        else setUser(parsedUser);
    }, [navigate]);

    // --- AI SYNTHESIS SIMULATOR ---
    const handleAIGenerate = () => {
        if (!topic) {
            return setNotify({ message: 'Topic is required. Please define a classification topic first.', type: 'error' });
        }

        setIsGeneratingAI(true);
        setNotify({ message: `Generating ${aiCount} questions...`, type: 'info' });

        setTimeout(() => {
            const generatedQuestions = Array.from({ length: aiCount }).map((_, i) => {
                const isMCQ = Math.random() > 0.5;

                if (isMCQ) {
                    return {
                        type: 'mcq',
                        question: `[AI_GEN_${i+1}] Which of the following is a core principle of ${topic.toUpperCase()}?`,
                        expected_answer: 'Primary Data Node',
                        options: ['Primary Data Node', 'Secondary Cache Bypass'],
                        marks: 5
                    };
                } else {
                    return {
                        type: 'text',
                        question: `[AI_GEN_${i+1}] Explain the mechanism of ${topic} and its primary use case in system architecture.`,
                        expected_answer: `Keywords: process, memory, efficiency, ${topic.toLowerCase()}`,
                        options: ['', ''],
                        marks: 10
                    };
                }
            });

            setQuestions(generatedQuestions);
            setIsGeneratingAI(false);
            setNotify({ message: `Questions generated successfully.`, type: 'success' });
        }, 2500);
    };

    // --- DYNAMIC FORM HANDLERS ---
    const handleAddQuestion = () => {
        setQuestions([...questions, { type: 'text', question: '', expected_answer: '', options: ['', ''], marks: 10 }]);
    };

    const handleRemoveQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const handleOptionChange = (index, optionIndex, value) => {
        const updated = [...questions];
        updated[index].options[optionIndex] = value;
        setQuestions(updated);
    };

    // --- UPLINK HANDLER ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotify({ message: '', type: '' });
        setIsLoading(true);

        try {
            const payload = { title, topic, timeLimit: Number(timeLimit), teacherId: user._id, questions };

            const response = await fetch('http://localhost:5000/api/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setNotify({ message: 'Assessment created successfully.', type: 'success' });
                setTimeout(() => navigate('/dashboard'), 1500);
            } else {
                setNotify({ message: 'Failed to create assessment.', type: 'error' });
            }
        } catch (error) {
            setNotify({ message: 'Connection error. Please try again.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return <div className="loading-screen">Loading...</div>;

    return (
        <div className="create-quiz-root">
            <div className="create-quiz-container glass-panel">
                <header className="forge-header">
                    <button className="back-btn orbitron" type="button" onClick={() => navigate('/dashboard')}>◀ Cancel</button>
                    <div>
                        <h1 className="orbitron create-quiz-title">Create Assessment</h1>
                        <p className="create-quiz-subtitle orbitron">Assessment Parameters</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="create-quiz-form">

                    {/* --- CORE PARAMETERS --- */}
                    <div className="parameter-grid">
                        <div className="input-field">
                            <label className="orbitron">Assessment Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. OS Midterm" />
                        </div>

                        <div className="input-field ai-topic-zone">
                            <label className="orbitron">Topic & AI Question Count</label>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required placeholder="e.g. CPU Scheduling" style={{flex: 2}}/>
                                <input type="number" value={aiCount} onChange={(e) => setAiCount(Number(e.target.value))} min="1" max="20" style={{flex: 0.8, textAlign: 'center'}} title="Number of AI Questions" />
                                <button type="button" className={`ai-btn orbitron ${isGeneratingAI ? 'pulse-ai' : ''}`} onClick={handleAIGenerate} disabled={isGeneratingAI}>
                                    {isGeneratingAI ? 'Syncing...' : '🤖 Generate Questions'}
                                </button>
                            </div>
                        </div>

                        <div className="input-field time-zone">
                            <label className="orbitron">Time Limit (Minutes)</label>
                            <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} required min="1" />
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* --- DYNAMIC QUESTION UNITS --- */}
                    <div className="questions-section">
                        <h3 className="orbitron section-title">Questions</h3>

                        {questions.map((q, index) => (
                            <div key={index} className="question-module">
                                <div className="q-header orbitron">
                                    <span>Question {index + 1}</span>
                                    <div className="q-actions">
                                        <select
                                            className="type-selector orbitron"
                                            value={q.type}
                                            onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                                        >
                                            <option value="text">Text Answer</option>
                                            <option value="mcq">Multiple Choice</option>
                                        </select>
                                        {questions.length > 1 && (
                                            <button type="button" className="remove-btn" onClick={() => handleRemoveQuestion(index)}>✖ Remove</button>
                                        )}
                                    </div>
                                </div>

                                <div className="q-body">
                                    <div className="input-field full-width">
                                        <label className="orbitron">Question Text</label>
                                        <textarea
                                            value={q.question} onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                            required placeholder="Enter assessment question..." rows="2"
                                        />
                                    </div>

                                    {/* CONDITIONAL RENDERING: MCQ vs TEXT */}
                                    {q.type === 'mcq' ? (
                                        <div className="mcq-zone">
                                            <div className="options-grid">
                                                <div className="input-field">
                                                    <label className="orbitron">Option A</label>
                                                    <input type="text" value={q.options[0]} onChange={(e) => handleOptionChange(index, 0, e.target.value)} required placeholder="True / Concept A" />
                                                </div>
                                                <div className="input-field">
                                                    <label className="orbitron">Option B</label>
                                                    <input type="text" value={q.options[1]} onChange={(e) => handleOptionChange(index, 1, e.target.value)} required placeholder="False / Concept B" />
                                                </div>
                                            </div>
                                            <div className="q-row">
                                                <div className="input-field flex-2">
                                                    <label className="orbitron">Correct Answer</label>
                                                    <select
                                                        className="mcq-correct-selector"
                                                        value={q.expected_answer}
                                                        onChange={(e) => handleQuestionChange(index, 'expected_answer', e.target.value)}
                                                        required
                                                    >
                                                        <option value="" disabled>Select correct option...</option>
                                                        {q.options[0] && <option value={q.options[0]}>{q.options[0]}</option>}
                                                        {q.options[1] && <option value={q.options[1]}>{q.options[1]}</option>}
                                                    </select>
                                                </div>
                                                <div className="input-field flex-1">
                                                    <label className="orbitron">POINTS</label>
                                                    <input type="number" value={q.marks} onChange={(e) => handleQuestionChange(index, 'marks', e.target.value)} required min="1" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="q-row">
                                            <div className="input-field flex-2">
                                                <label className="orbitron">Answer Key</label>
                                                <input type="text" value={q.expected_answer} onChange={(e) => handleQuestionChange(index, 'expected_answer', e.target.value)} required placeholder="Keywords the AI should look for..." />
                                            </div>
                                            <div className="input-field flex-1">
                                                <label className="orbitron">Points</label>
                                                <input type="number" value={q.marks} onChange={(e) => handleQuestionChange(index, 'marks', e.target.value)} required min="1" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button type="button" className="add-q-btn orbitron" onClick={handleAddQuestion}>+ Add Question</button>
                    </div>

                    <button type="submit" disabled={isLoading} className={`submit-forge-btn orbitron ${isLoading ? 'loading' : ''}`}>
                        {isLoading ? 'Creating...' : 'Create Assessment'}
                    </button>
                </form>
            </div>

            <Notification message={notify.message} type={notify.type} onClose={() => setNotify({ message: '', type: '' })} />

            <style>{`
                .create-quiz-root { min-height: 100vh; padding: 40px 20px; background: #ffffff; color: #000000; font-family: 'Inter', sans-serif; display: flex; justify-content: center; }
                .orbitron { font-family: 'Orbitron', sans-serif; letter-spacing: 1px; }

                .create-quiz-container { width: 95vw; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; padding: 60px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08); z-index: 10; height: fit-content; }

                .forge-header { display: flex; align-items: center; gap: 30px; margin-bottom: 40px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }
                .back-btn { background: transparent; border: 1px solid #6b7280; color: #6b7280; padding: 10px 15px; border-radius: 8px; cursor: pointer; transition: 0.3s; }
                .back-btn:hover { border-color: #5B4FFF; color: #5B4FFF; }
                .create-quiz-title { color: #000000; margin: 0; font-size: 28px; }
                .create-quiz-subtitle { color: #6b7280; font-size: 10px; margin: 5px 0 0 0; letter-spacing: 4px; }

                .parameter-grid { display: grid; grid-template-columns: 1fr 2.5fr 0.8fr; gap: 25px; }
                
                .input-field { display: flex; flex-direction: column; text-align: left; margin-bottom: 15px; }
                .input-field label { font-size: 14px; color: #1a1a2e; margin-bottom: 8px; letter-spacing: 0.5px; font-weight: 500; text-transform: none; }
                
                input, textarea, select { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; color: #1a1a2e; padding: 18px 24px; font-family: 'Inter'; font-size: 16px; font-weight: 400; outline: none; transition: 0.3s; resize: vertical; min-height: 56px; width: 100%; }
                input:focus, textarea:focus, select:focus { border-color: #5B4FFF; box-shadow: 0 0 0 3px rgba(91, 79, 255, 0.1); }
                textarea { min-height: 140px; line-height: 1.6; width: 100%; }

                .ai-btn { background: rgba(91, 79, 255, 0.1); border: 1px solid #5B4FFF; color: #5B4FFF; padding: 0 15px; border-radius: 10px; cursor: pointer; transition: 0.3s; font-size: 11px; font-weight: bold; white-space: nowrap; }
                .ai-btn:hover { background: #5B4FFF; color: #ffffff; box-shadow: 0 0 15px rgba(91, 79, 255, 0.25); }
                .pulse-ai { animation: pulseAI 1s infinite alternate; background: #5B4FFF; color: #ffffff; pointer-events: none; }
                @keyframes pulseAI { from { box-shadow: 0 0 5px #5B4FFF; } to { box-shadow: 0 0 20px #5B4FFF; } }

                .divider { height: 1px; background: #e5e7eb; margin: 40px 0; }
                .section-title { color: #000000; font-size: 16px; margin-bottom: 20px; border-left: 4px solid #5B4FFF; padding-left: 15px; }
                
                .question-module { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 15px; padding: 30px; margin-bottom: 25px; transition: 0.3s; border-left: 3px solid #e5e7eb; min-height: 200px; width: 100%; }
                .question-module:hover { border-color: #5B4FFF; border-left-color: #5B4FFF; }
                
                .q-header { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #1a1a2e; margin-bottom: 20px; border-bottom: 1px dashed #e5e7eb; padding-bottom: 10px; }
                .q-actions { display: flex; gap: 15px; align-items: center; }
                .questions-section { margin-top: 30px; width: 100%; }
                .remove-btn { background: transparent; border: none; color: #ef4444; cursor: pointer; font-family: 'Orbitron'; font-size: 10px; transition: 0.3s; }
                .remove-btn:hover { text-shadow: 0 0 10px #ef4444; }

                .q-row { display: flex; gap: 30px; margin-top: 20px; }
                .input-field.flex-2 { flex: 2; }
                .input-field.flex-1 { flex: 1; }
                
                .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px; }
                .mcq-correct-selector { width: 100%; border-color: #5B4FFF; color: #5B4FFF; }

                .add-q-btn { width: 100%; padding: 16px 24px; background: transparent; border: 1px dashed #5B4FFF; color: #5B4FFF; border-radius: 10px; cursor: pointer; transition: 0.3s; margin-bottom: 40px; font-size: 15px; min-height: 52px; }
                .add-q-btn:hover { background: rgba(91, 79, 255, 0.05); }

                .submit-forge-btn { width: 100%; padding: 20px 24px; background: #5B4FFF; border: none; border-radius: 10px; color: #ffffff; font-weight: 600; font-size: 16px; cursor: pointer; box-shadow: 0 4px 24px rgba(91, 79, 255, 0.25); transition: 0.3s; min-height: 56px; }
                .submit-forge-btn:hover { background: #4a3fff; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(91, 79, 255, 0.35); }
                .submit-forge-btn.loading { background: #f5f5f5; color: #5B4FFF; cursor: not-allowed; box-shadow: none; }
            `}</style>
        </div>
    );
};

export default CreateQuiz;