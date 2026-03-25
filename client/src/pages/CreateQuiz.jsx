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

    // --- MISSION PARAMETERS ---
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [timeLimit, setTimeLimit] = useState(15);
    const [aiCount, setAiCount] = useState(3); // ➲ NEW: Controls how many questions AI makes

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
            return setNotify({ message: 'TOPIC_REQUIRED: Please define a classification topic first.', type: 'error' });
        }

        setIsGeneratingAI(true);
        setNotify({ message: `UPLINK_ESTABLISHED: Synthesizing ${aiCount} mission units...`, type: 'info' });

        // Simulated AI Network Delay (Dynamically loops based on aiCount)
        setTimeout(() => {
            const generatedQuestions = Array.from({ length: aiCount }).map((_, i) => {
                // Randomly assign MCQ or Text to make the generated quiz dynamic
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
            setNotify({ message: `SYNTHESIS_COMPLETE: ${aiCount} units deployed.`, type: 'success' });
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
                setNotify({ message: 'MISSION_FORGED: Exam deployed to the mainframe.', type: 'success' });
                setTimeout(() => navigate('/dashboard'), 1500);
            } else {
                setNotify({ message: 'FORGE_FAILURE: Data rejected by core.', type: 'error' });
            }
        } catch (error) {
            setNotify({ message: 'LINK_FAILURE: Core unreachable.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return <div className="loading-screen">VERIFYING_CLEARANCE...</div>;

    return (
        <div className="forge-root">
            <div className="scanline"></div>

            <div className="forge-container glass-panel">
                <header className="forge-header">
                    <button className="back-btn orbitron" type="button" onClick={() => navigate('/dashboard')}>◀ ABORT</button>
                    <div>
                        <h1 className="orbitron forge-title">MISSION_FORGE</h1>
                        <p className="forge-subtitle orbitron">CONSTRUCT EXAM PARAMETERS</p>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="forge-form">

                    {/* --- CORE PARAMETERS --- */}
                    <div className="parameter-grid">
                        <div className="input-field">
                            <label className="orbitron">MISSION_DESIGNATION (TITLE)</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. OS Midterm" />
                        </div>

                        {/* ➲ UPDATED AI ZONE WITH COUNT CONTROL */}
                        <div className="input-field ai-topic-zone">
                            <label className="orbitron">CLASSIFICATION (TOPIC) & AI_COUNT</label>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required placeholder="e.g. CPU Scheduling" style={{flex: 2}}/>
                                <input type="number" value={aiCount} onChange={(e) => setAiCount(Number(e.target.value))} min="1" max="20" style={{flex: 0.8, textAlign: 'center'}} title="Number of AI Questions" />
                                <button type="button" className={`ai-btn orbitron ${isGeneratingAI ? 'pulse-ai' : ''}`} onClick={handleAIGenerate} disabled={isGeneratingAI}>
                                    {isGeneratingAI ? 'SYNCING...' : '🤖 SYNTHESIZE'}
                                </button>
                            </div>
                        </div>

                        <div className="input-field time-zone">
                            <label className="orbitron">T-MINUS (MINUTES)</label>
                            <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} required min="1" />
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* --- DYNAMIC QUESTION UNITS --- */}
                    <div className="questions-section">
                        <h3 className="orbitron section-title">TACTICAL_UNITS (QUESTIONS)</h3>

                        {questions.map((q, index) => (
                            <div key={index} className="question-module">
                                <div className="q-header orbitron">
                                    <span>UNIT_0{index + 1}</span>
                                    <div className="q-actions">
                                        <select
                                            className="type-selector orbitron"
                                            value={q.type}
                                            onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                                        >
                                            <option value="text">TEXT_INPUT</option>
                                            <option value="mcq">MCQ_BINARY (2 OPT)</option>
                                        </select>
                                        {questions.length > 1 && (
                                            <button type="button" className="remove-btn" onClick={() => handleRemoveQuestion(index)}>✖ PURGE</button>
                                        )}
                                    </div>
                                </div>

                                <div className="q-body">
                                    <div className="input-field full-width">
                                        <label className="orbitron">QUERY_STRING</label>
                                        <textarea
                                            value={q.question} onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                            required placeholder="Enter the mission query..." rows="2"
                                        />
                                    </div>

                                    {/* CONDITIONAL RENDERING: MCQ vs TEXT */}
                                    {q.type === 'mcq' ? (
                                        <div className="mcq-zone">
                                            <div className="options-grid">
                                                <div className="input-field">
                                                    <label className="orbitron">OPTION_A</label>
                                                    <input type="text" value={q.options[0]} onChange={(e) => handleOptionChange(index, 0, e.target.value)} required placeholder="True / Concept A" />
                                                </div>
                                                <div className="input-field">
                                                    <label className="orbitron">OPTION_B</label>
                                                    <input type="text" value={q.options[1]} onChange={(e) => handleOptionChange(index, 1, e.target.value)} required placeholder="False / Concept B" />
                                                </div>
                                            </div>
                                            <div className="q-row">
                                                <div className="input-field flex-2">
                                                    <label className="orbitron">EXPECTED_DATA (CORRECT OPTION)</label>
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
                                                    <label className="orbitron">VALUE (MARKS)</label>
                                                    <input type="number" value={q.marks} onChange={(e) => handleQuestionChange(index, 'marks', e.target.value)} required min="1" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="q-row">
                                            <div className="input-field flex-2">
                                                <label className="orbitron">EXPECTED_DATA (ANSWER KEY)</label>
                                                <input type="text" value={q.expected_answer} onChange={(e) => handleQuestionChange(index, 'expected_answer', e.target.value)} required placeholder="Keywords the AI should look for..." />
                                            </div>
                                            <div className="input-field flex-1">
                                                <label className="orbitron">VALUE (MARKS)</label>
                                                <input type="number" value={q.marks} onChange={(e) => handleQuestionChange(index, 'marks', e.target.value)} required min="1" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button type="button" className="add-q-btn orbitron" onClick={handleAddQuestion}>+ DEPLOY_NEW_UNIT</button>
                    </div>

                    <button type="submit" disabled={isLoading} className={`submit-forge-btn orbitron ${isLoading ? 'loading' : ''}`}>
                        {isLoading ? 'UPLINKING...' : 'INITIALIZE_MISSION'}
                    </button>
                </form>
            </div>

            <Notification message={notify.message} type={notify.type} onClose={() => setNotify({ message: '', type: '' })} />

            <style>{`
                .forge-root { min-height: 100vh; padding: 40px 20px; background: #020202; color: #fff; font-family: 'Inter', sans-serif; display: flex; justify-content: center; }
                .orbitron { font-family: 'Orbitron', sans-serif; letter-spacing: 1px; }

                .forge-container { width: 100%; max-width: 900px; background: rgba(10, 10, 10, 0.9); border: 1px solid rgba(0, 210, 255, 0.2); border-radius: 20px; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); z-index: 10; height: fit-content; }

                .forge-header { display: flex; align-items: center; gap: 30px; margin-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 20px; }
                .back-btn { background: transparent; border: 1px solid #444; color: #888; padding: 10px 15px; border-radius: 8px; cursor: pointer; transition: 0.3s; }
                .back-btn:hover { border-color: #00d2ff; color: #00d2ff; }
                .forge-title { color: #00d2ff; margin: 0; font-size: 28px; }
                .forge-subtitle { color: #555; font-size: 10px; margin: 5px 0 0 0; letter-spacing: 4px; }

                .parameter-grid { display: grid; grid-template-columns: 1fr 2.2fr 0.6fr; gap: 20px; }
                
                .input-field { display: flex; flex-direction: column; text-align: left; margin-bottom: 15px; }
                .input-field label { font-size: 9px; color: #00ffa3; margin-bottom: 8px; letter-spacing: 1px; }
                
                input, textarea, select { background: #000; border: 1px solid #333; border-radius: 10px; color: #fff; padding: 15px; font-family: 'monospace'; font-size: 14px; outline: none; transition: 0.3s; resize: vertical; }
                input:focus, textarea:focus, select:focus { border-color: #00ffa3; box-shadow: 0 0 10px rgba(0, 255, 163, 0.2); }

                /* AI Button */
                .ai-btn { background: rgba(157, 80, 187, 0.1); border: 1px solid #9d50bb; color: #9d50bb; padding: 0 15px; border-radius: 10px; cursor: pointer; transition: 0.3s; font-size: 11px; font-weight: bold; white-space: nowrap; }
                .ai-btn:hover { background: #9d50bb; color: #fff; box-shadow: 0 0 15px rgba(157, 80, 187, 0.4); }
                .pulse-ai { animation: pulseAI 1s infinite alternate; background: #9d50bb; color: #fff; pointer-events: none; }
                @keyframes pulseAI { from { box-shadow: 0 0 5px #9d50bb; } to { box-shadow: 0 0 20px #9d50bb; } }

                .divider { height: 1px; background: rgba(255,255,255,0.05); margin: 40px 0; }
                .section-title { color: #fff; font-size: 16px; margin-bottom: 20px; border-left: 4px solid #00d2ff; padding-left: 15px; }
                
                .question-module { background: rgba(255,255,255,0.02); border: 1px solid #222; border-radius: 15px; padding: 25px; margin-bottom: 20px; transition: 0.3s; border-left: 3px solid #333; }
                .question-module:hover { border-color: #444; border-left-color: #00d2ff; }
                
                .q-header { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #888; margin-bottom: 20px; border-bottom: 1px dashed #333; padding-bottom: 10px; }
                .q-actions { display: flex; gap: 15px; align-items: center; }
                .type-selector { padding: 5px 10px; font-size: 10px; background: #111; border: 1px solid #444; color: #00d2ff; border-radius: 5px; cursor: pointer; }
                .remove-btn { background: transparent; border: none; color: #ff4d4d; cursor: pointer; font-family: 'Orbitron'; font-size: 10px; transition: 0.3s; }
                .remove-btn:hover { text-shadow: 0 0 10px #ff4d4d; }

                .q-row { display: flex; gap: 20px; margin-top: 5px; }
                .flex-2 { flex: 2; } .flex-1 { flex: 1; }
                
                /* MCQ Specifics */
                .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px; }
                .mcq-correct-selector { width: 100%; border-color: #00ffa3; color: #00ffa3; }

                .add-q-btn { width: 100%; padding: 15px; background: transparent; border: 1px dashed #00d2ff; color: #00d2ff; border-radius: 10px; cursor: pointer; transition: 0.3s; margin-bottom: 40px; }
                .add-q-btn:hover { background: rgba(0, 210, 255, 0.05); }

                .submit-forge-btn { width: 100%; padding: 20px; background: linear-gradient(45deg, #00ffa3, #00d2ff); border: none; border-radius: 12px; color: #000; font-weight: 900; font-size: 16px; cursor: pointer; box-shadow: 0 10px 30px rgba(0, 255, 163, 0.3); transition: 0.3s; }
                .submit-forge-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(0, 255, 163, 0.5); }
                .submit-forge-btn.loading { background: #333; color: #888; cursor: not-allowed; box-shadow: none; }

                .scanline { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02)); background-size: 100% 4px, 3px 100%; pointer-events: none; z-index: 100; }
            `}</style>
        </div>
    );
};

export default CreateQuiz;