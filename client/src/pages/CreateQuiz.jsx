// client/src/pages/CreateQuiz.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';

const CreateQuiz = () => {
    // --- CORE STATE ARCHITECTURE (Unchanged) ---
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [notify, setNotify] = useState({ message: '', type: '' });

    // --- ASSESSMENT PARAMETERS (Unchanged) ---
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [timeLimit, setTimeLimit] = useState(15);
    const [aiCount, setAiCount] = useState(3);

    // --- DYNAMIC QUESTION ARRAY (Unchanged) ---
    const [questions, setQuestions] = useState([
        { type: 'text', question: '', expected_answer: '', options: ['', ''], marks: 10 }
    ]);

    // --- AUTH & VALIDATION (Unchanged) ---
    useEffect(() => {
        const storedUser = localStorage.getItem('EduX_user');
        if (!storedUser) return navigate('/login');
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'teacher') navigate('/dashboard');
        else setUser(parsedUser);
    }, [navigate]);

    // --- AI SYNTHESIS SIMULATOR (Unchanged) ---
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

    // --- DYNAMIC FORM HANDLERS (Unchanged) ---
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

    // --- UPLINK HANDLER (Unchanged) ---
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

    if (!user) return (
        <div className="EduX-loading">
            <div className="spinner"></div>
            <span>Establishing Auth Uplink...</span>
        </div>
    );

    return (
        <div className="EduX-forge-root">
            {/* Structuring as a clean SaaS Card within the main view */}
            <main className="EduX-main-viewport">
                <header className="main-header">
                    <div>
                        <h2 className="header-title">Create <span className="text-blue">Assessment</span></h2>
                        <p className="header-sub">Configure the parameters for your proctored evaluation.</p>
                    </div>
                    <button className="btn-abort mono" type="button" onClick={() => navigate('/dashboard')}>
                        ← ABORT_FORGE
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="forge-form-pane">
                    
                    {/* CORE ASSSESSMENT GLOBAL SETUP */}
                    <div className="saas-card setup-card">
                        <div className="card-badge mono">PARAMETERS</div>
                        
                        <div className="param-layout">
                            <div className="form-group flex-2">
                                <label>Assessment Title</label>
                                <input type="text" className="clean-input" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Distributed Systems Midterm" />
                            </div>

                            <div className="form-group flex-1">
                                <label>Time Limit (Min)</label>
                                <input type="number" className="clean-input" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} required min="1" />
                            </div>
                        </div>

                        <div className="form-group ai-zone">
                            <label>Context Topic & AI Synthesis Heuristics</label>
                            <div className="ai-row">
                                <input type="text" className="clean-input ai-topic-input" value={topic} onChange={(e) => setTopic(e.target.value)} required placeholder="e.g. Heuristic Heuristic Analysis" />
                                <input type="number" className="clean-input ai-count-input mono" value={aiCount} onChange={(e) => setAiCount(Number(e.target.value))} min="1" max="20" title="Quantity to synthesize" />
                                <button type="button" className={`btn-ai ${isGeneratingAI ? 'generating' : ''}`} onClick={handleAIGenerate} disabled={isGeneratingAI}>
                                    <span className="icon">🤖</span>
                                    <span className="text mono">{isGeneratingAI ? 'SYNTHESIZING...' : 'AI_AUTO_GEN'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC QUESTIONS LISTING */}
                    <div className="questions-section">
                        <div className="section-header">
                            <h3 className="section-title">Data Nodes (Questions)</h3>
                        </div>

                        {questions.map((q, index) => (
                            <div key={index} className="question-node saas-card">
                                <header className="node-header">
                                    <div className="node-id mono">NODE_0{index + 1}</div>
                                    <div className="node-actions">
                                        <select
                                            className="type-select clean-select mono"
                                            value={q.type}
                                            onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                                        >
                                            <option value="text">TEXT_ANALYSIS</option>
                                            <option value="mcq">MULTIPLE_CHOICE</option>
                                        </select>
                                        {questions.length > 1 && (
                                            <button type="button" className="btn-remove-node mono" onClick={() => handleRemoveQuestion(index)}>✖ PURGE</button>
                                        )}
                                    </div>
                                </header>

                                <div className="node-body">
                                    <div className="form-group full-width">
                                        <label>Query Input (Question Text)</label>
                                        <textarea
                                            className="clean-input q-textarea"
                                            value={q.question} onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                            required placeholder="Enter assessment question prompt..." rows="2"
                                        />
                                    </div>

                                    {/* MCQ PARAMETERS VS TEXT PARMAMETERS */}
                                    {q.type === 'mcq' ? (
                                        <div className="mcq-pane">
                                            <div className="variant-grid">
                                                <div className="form-group">
                                                    <label>Variant Alpha (A)</label>
                                                    <input type="text" className="clean-input" value={q.options[0]} onChange={(e) => handleOptionChange(index, 0, e.target.value)} required placeholder="Concept A" />
                                                </div>
                                                <div className="form-group">
                                                    <label>Variant Beta (B)</label>
                                                    <input type="text" className="clean-input" value={q.options[1]} onChange={(e) => handleOptionChange(index, 1, e.target.value)} required placeholder="Concept B" />
                                                </div>
                                            </div>
                                            <div className="q-row">
                                                <div className="form-group flex-2">
                                                    <label>Validated Vector (Correct Answer)</label>
                                                    <select
                                                        className="clean-select correct-select mono"
                                                        value={q.expected_answer}
                                                        onChange={(e) => handleQuestionChange(index, 'expected_answer', e.target.value)}
                                                        required
                                                    >
                                                        <option value="" disabled>Select valid target...</option>
                                                        {q.options[0] && <option value={q.options[0]}>{q.options[0]}</option>}
                                                        {q.options[1] && <option value={q.options[1]}>{q.options[1]}</option>}
                                                    </select>
                                                </div>
                                                <div className="form-group flex-1">
                                                    <label>Weight (Pts)</label>
                                                    <input type="number" className="clean-input mono" value={q.marks} onChange={(e) => handleQuestionChange(index, 'marks', e.target.value)} required min="1" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="q-row">
                                            <div className="form-group flex-2">
                                                <label>Validation Heuristics (Answer Key)</label>
                                                <input type="text" className="clean-input" value={q.expected_answer} onChange={(e) => handleQuestionChange(index, 'expected_answer', e.target.value)} required placeholder="Keywords the AI grader should lookup..." />
                                            </div>
                                            <div className="form-group flex-1">
                                                <label>Weight (Pts)</label>
                                                <input type="number" className="clean-input mono" value={q.marks} onChange={(e) => handleQuestionChange(index, 'marks', e.target.value)} required min="1" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button type="button" className="btn-add-node mono" onClick={handleAddQuestion}>+ INITIALIZE_NEW_NODE</button>
                    </div>

                    <button type="submit" disabled={isLoading} className={`btn-deploy mono ${isLoading ? 'loading' : ''}`}>
                        {isLoading ? 'ESTABLISHING_UPLINK...' : 'DEPLOY_ASSESSMENT'}
                    </button>
                </form>
            </main>

            <Notification message={notify.message} type={notify.type} onClose={() => setNotify({ message: '', type: '' })} />

            <style>{`
                /* --- EduX V3 LIGHT THEME CSS FORGE --- */
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,700;0,800;0,900;1,800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');

                .EduX-forge-root {
                    min-height: 100vh; width: 100vw;
                    background-color: #f8fafc; color: #0f172a;
                    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
                    background-size: 32px 32px;
                    font-family: 'Inter', sans-serif;
                    display: flex; flex-direction: column;
                    overflow-x: hidden;
                }

                .mono { font-family: 'JetBrains Mono', monospace; }
                .text-blue { color: #5B4FFF; }

                /* LOADING SCREEN */
                .EduX-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; width: 100vw; background: #f8fafc; color: #5B4FFF; }
                .spinner { width: 30px; height: 30px; border: 3px solid rgba(91, 79, 255, 0.2); border-top-color: #5B4FFF; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* VIEWPORT AREA */
                .EduX-main-viewport { flex: 1; display: flex; flex-direction: column; padding: 40px 60px; max-width: 1400px; margin: 0 auto; width: 100%;}
                
                /* HEADER */
                .main-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; }
                .header-title { font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 36px; margin: 0; letter-spacing: -1.5px; }
                .header-sub { color: #64748b; margin: 8px 0 0 0; font-size: 16px; }
                
                .btn-abort {
                    background: transparent; color: #f87171; border: 2px solid transparent; padding: 12px 20px;
                    border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s;
                    font-size: 11px; letter-spacing: 1px;
                }
                .btn-abort:hover { border-color: #fecaca; background: #fef2f2; }

                /* FORM */
                .forge-form-pane { flex: 1; display: flex; flex-direction: column; gap: 30px;}

                /* CARDS */
                .saas-card {
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;
                    padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                
                .setup-card { position: relative; }
                .card-badge { position: absolute; top: 20px; right: 20px; font-size: 10px; color: #94a3b8; letter-spacing: 2px; }

                /* LAYOUT UTILS */
                .param-layout, .q-row { display: flex; gap: 30px; margin-bottom: 25px; }
                .form-group { flex: 1; display: flex; flex-direction: column;}
                .flex-2 { flex: 2; }
                .full-width { width: 100%; margin-bottom: 25px;}
                
                .form-group label { font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;}
                
                /* INPUTS */
                .clean-input, .clean-select {
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;
                    color: #0f172a; padding: 16px; font-family: 'Inter'; font-size: 15px;
                    outline: none; transition: 0.2s; width: 100%;
                }
                .clean-input:focus, .clean-select:focus { border-color: #5B4FFF; box-shadow: 0 0 0 3px rgba(91, 79, 255, 0.1); }
                .clean-input::placeholder { color: #cbd5e1; }
                
                .q-textarea { min-height: 100px; resize: vertical; line-height: 1.6;}
                
                /* AI ZONE */
                .ai-zone { margin-top: 5px; }
                .ai-row { display: flex; gap: 15px; align-items: center;}
                .ai-topic-input { flex: 2; }
                .ai-count-input { flex: 0.5; text-align: center; color: #5B4FFF; font-weight: 700;}

                .btn-ai {
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px;
                    height: 52px; background: transparent; border: 1px solid #c7d2fe; border-radius: 8px;
                    cursor: pointer; transition: 0.3s; color: #5B4FFF;
                }
                .btn-ai:hover { background: #e0e7ff; }
                .btn-ai.generating { border-color: #5B4FFF; background: #e0e7ff; animation: pulse 1s infinite; pointer-events: none;}
                .btn-ai .icon { font-size: 16px; }
                .btn-ai .text { font-size: 10px; font-weight: 700; letter-spacing: 1px;}

                @keyframes pulse { 0%, 100% { box-shadow: 0 0 10px rgba(91,79,255,0.4); } 50% { box-shadow: 0 0 25px rgba(91,79,255,0.7); } }

                .divider { height: 1px; background: #e2e8f0; margin: 30px 0;}

                /* QUESTIONS LIST */
                .questions-section { flex: 1; display: flex; flex-direction: column; gap: 20px;}
                .section-header { margin-bottom: 20px; }
                .section-title { font-size: 18px; font-weight: 700; margin: 0; color: #0f172a;}
                
                /* QUESTION NODE */
                .question-node { padding: 30px; }
                .question-node:hover { border-color: #5B4FFF;}
                
                .node-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; margin-bottom: 30px;}
                .node-id { font-size: 12px; color: #94a3b8; font-weight: 700; letter-spacing: 2px;}
                .node-actions { display: flex; gap: 15px; align-items: center;}
                
                .type-select { width: auto; font-size: 10px; padding: 10px 15px; height: auto; border-color: #e2e8f0; font-weight: 700;}
                .btn-remove-node { background: transparent; border: none; color: #f87171; font-weight: 700; font-size: 10px; cursor: pointer; letter-spacing: 1px; }
                .btn-remove-node:hover { text-shadow: 0 0 10px #fecaca; }

                /* MCQ */
                .variant-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px; }
                .correct-select { border-color: #c7d2fe; color: #5B4FFF; font-weight: 700; }

                /* ACTION BUTTONS */
                .btn-add-node {
                    width: 100%; padding: 16px; background: #ffffff; border: 1px dashed #c7d2fe;
                    color: #5B4FFF; border-radius: 8px; cursor: pointer; transition: 0.2s;
                    font-weight: 700; font-size: 12px; letter-spacing: 1px; margin-top: 10px; margin-bottom: 40px;
                }
                .btn-add-node:hover { border-style: solid; background: #e0e7ff; }

                .btn-deploy {
                    width: 100%; padding: 22px; background: #0f172a; color: #ffffff;
                    border: none; border-radius: 12px; font-weight: 700; font-size: 16px;
                    cursor: pointer; transition: 0.3s; letter-spacing: 2px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    margin-bottom: 50px;
                }
                .btn-deploy:hover { background: #5B4FFF; transform: translateY(-3px); box-shadow: 0 10px 25px rgba(91, 79, 255, 0.3); }
                .btn-deploy.loading { background: #cbd5e1; color: #64748b; cursor: not-allowed; transform: none; box-shadow: none;}
            `}</style>
        </div>
    );
};

export default CreateQuiz;