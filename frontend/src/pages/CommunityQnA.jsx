import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, ThumbsUp, PlusCircle, CheckCircle } from 'lucide-react';
import Section from '../components/Section';

const CommunityQnA = () => {
    const { token, isLoggedIn } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [formParams, setFormParams] = useState({ title: '', details: '' });
    const [isAsking, setIsAsking] = useState(false);

    // Answers mapping config: question_id -> answers[]
    const [answersMap, setAnswersMap] = useState({});
    const [replyingTo, setReplyingTo] = useState(null); // question_id
    const [replyContent, setReplyContent] = useState('');

    const API = 'http://localhost:5000/api';

    const fetchQuestions = async () => {
        try {
            const res = await fetch(`${API}/questions`);
            if (res.ok) {
                const data = await res.json();
                setQuestions(data);
            }
        } catch (err) {
            console.error('Failed to fetch questions:', err);
        }
    };

    const fetchAnswers = async (questionId) => {
        try {
            const res = await fetch(`${API}/questions/${questionId}/answers`);
            if (res.ok) {
                const data = await res.json();
                setAnswersMap(prev => ({ ...prev, [questionId]: data }));
            }
        } catch (err) {
            console.error('Failed to fetch answers for Q:', questionId);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    // Also proactively fetch answers for the first few questions or we can fetch them securely later
    useEffect(() => {
        questions.forEach(q => {
            if (!answersMap[q.id]) {
                fetchAnswers(q.id);
            }
        });
    }, [questions]);

    const handleAskQuestion = async (e) => {
        e.preventDefault();
        if (!isLoggedIn) return alert("You must be logged in to ask a question.");

        try {
            const res = await fetch(`${API}/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formParams)
            });
            if (res.ok) {
                setFormParams({ title: '', details: '' });
                setIsAsking(false);
                fetchQuestions();
            } else {
                alert("Error submitting question.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReply = async (questionId) => {
        if (!replyContent) return;
        try {
            const res = await fetch(`${API}/questions/${questionId}/answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: replyContent })
            });

            if (res.ok) {
                setReplyContent('');
                setReplyingTo(null);
                fetchAnswers(questionId); // refresh answers
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-light)', minHeight: '100vh', padding: '40px 0' }}>
            <Section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ color: 'var(--primary)', fontSize: '2.5rem', marginBottom: '10px' }}>Community Q&A</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Ask questions, share knowledge, and connect with global risk professionals.</p>
                    </div>
                    {isLoggedIn && (
                        <button
                            onClick={() => setIsAsking(!isAsking)}
                            style={{
                                backgroundColor: 'var(--primary)', color: 'white', padding: '12px 24px',
                                border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem',
                                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                        >
                            <PlusCircle size={20} />
                            {isAsking ? 'Cancel' : 'Ask Question'}
                        </button>
                    )}
                </div>

                {!isLoggedIn && (
                    <div style={{ backgroundColor: '#DBEAFE', border: '1px solid #93C5FD', padding: '1rem', borderRadius: '8px', color: '#1E40AF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MessageSquare size={18} />
                        You must sign in to ask questions or reply to discussions.
                    </div>
                )}

                {/* Question Form */}
                {isAsking && (
                    <form onSubmit={handleAskQuestion} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>What's on your mind?</h3>
                        <input
                            type="text"
                            placeholder="Briefly summarize your question..."
                            required
                            value={formParams.title}
                            onChange={(e) => setFormParams({ ...formParams, title: e.target.value })}
                            style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '15px', fontSize: '1rem', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}
                        />
                        <textarea
                            placeholder="Provide additional details..."
                            rows="4"
                            value={formParams.details}
                            onChange={(e) => setFormParams({ ...formParams, details: e.target.value })}
                            style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '15px', fontSize: '1rem', fontFamily: 'var(--font-sans)', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                        <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Submit Question
                        </button>
                    </form>
                )}

                {/* Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {questions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No questions yet. Be the first to start a discussion!</p>
                        </div>
                    ) : (
                        questions.map(q => (
                            <div key={q.id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{q.title}</h2>
                                    <span style={{ fontSize: '0.85rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                                        {new Date(q.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '20px' }}>{q.details}</p>

                                {/* Answers Section */}
                                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                                        <MessageSquare size={18} color="var(--primary)" />
                                        Answers {(answersMap[q.id]?.length || 0) > 0 ? `(${answersMap[q.id].length})` : ''}
                                    </h4>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                                        {answersMap[q.id] && answersMap[q.id].map(ans => (
                                            <div key={ans.id} style={{ backgroundColor: ans.is_official ? '#EFF6FF' : '#F8FAFC', padding: '15px', borderRadius: '8px', borderLeft: ans.is_official ? '4px solid #3B82F6' : '4px solid #CBD5E1' }}>
                                                <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.5' }}>{ans.content}</p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748B' }}>
                                                    <span style={{ fontWeight: '600', color: ans.is_official ? '#1E40AF' : 'inherit' }}>
                                                        {ans.author_name} {ans.is_official && <CheckCircle size={12} style={{ display: 'inline', marginLeft: '4px' }} />}
                                                    </span>
                                                    <span>{new Date(ans.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Reply Box */}
                                    {isLoggedIn && replyingTo !== q.id && (
                                        <button
                                            onClick={() => setReplyingTo(q.id)}
                                            style={{ background: 'none', border: '1px solid #CBD5E1', color: '#64748B', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                                        >
                                            Add an Answer
                                        </button>
                                    )}

                                    {replyingTo === q.id && (
                                        <div style={{ marginTop: '15px' }}>
                                            <textarea
                                                rows="3"
                                                placeholder="Write your answer..."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', marginBottom: '10px', fontFamily: 'var(--font-sans)', resize: 'vertical', boxSizing: 'border-box' }}
                                            />
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => handleReply(q.id)} style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Post Answer</button>
                                                <button onClick={() => { setReplyingTo(null); setReplyContent(''); }} style={{ backgroundColor: 'transparent', color: '#64748B', border: 'none', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Section>
        </div>
    );
};

export default CommunityQnA;
