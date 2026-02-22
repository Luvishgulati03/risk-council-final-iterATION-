import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Calendar, Users, FileText, CheckCircle, Trash2, Plus } from 'lucide-react';

const AdminDashboard = () => {
    const { token, isAdmin, authFetch, API } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('approvals');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [team, setTeam] = useState([]);

    const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', link: '', type: 'upcoming' });
    const [newTeam, setNewTeam] = useState({ name: '', role: '', description: '', linkedin_url: '', image: null, category: 'leadership' });

    // Admin Auth Guard
    useEffect(() => {
        if (!token || !isAdmin) {
            navigate('/membership', { state: { mode: 'login' } });
        } else {
            fetchData();
        }
    }, [token, isAdmin]);

    const fetchData = async () => {
        try {
            // Fetch users for approvals (fallback to dummy if endpoint missing)
            const uRes = await authFetch(`${API}/admin/users`).catch(() => null);
            if (uRes && uRes.ok) {
                const uData = await uRes.json();
                setPendingUsers(uData.filter(u => u.approval_status === 'pending' || u.status === 'pending' || !u.is_approved));
            }

            // Fetch events
            const eRes = await fetch(`${API}/events`).catch(() => null);
            if (eRes && eRes.ok) setEvents(await eRes.json());

            // Fetch team
            const tRes = await fetch(`${API}/team`).catch(() => null);
            if (tRes && tRes.ok) setTeam(await tRes.json());

        } catch (err) {
            console.error('Error fetching admin data:', err);
        }
    };

    const handleApprove = async (userId) => {
        try {
            // Using a generic approval endpoint, might be different based on exactly how old backend was set up
            await authFetch(`${API}/users/${userId}/approval_status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'approved' })
            }).catch(() => null);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await authFetch(`${API}/events`, {
                method: 'POST',
                body: JSON.stringify(newEvent)
            });
            setNewEvent({ title: '', date: '', location: '', link: '', type: 'upcoming' });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleDeleteEvent = async (id) => {
        try {
            await authFetch(`${API}/events/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', newTeam.name);
        formData.append('role', newTeam.role);
        formData.append('description', newTeam.description);
        formData.append('category', newTeam.category);
        formData.append('linkedin_url', newTeam.linkedin_url);
        if (newTeam.image) formData.append('image', newTeam.image);

        try {
            await fetch(`${API}/team`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }, // FormData, so no Content-Type
                body: formData
            });
            setNewTeam({ name: '', role: '', description: '', linkedin_url: '', image: null, category: 'leadership' });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleDeleteTeam = async (id) => {
        try {
            await authFetch(`${API}/team/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) { console.error(err); }
    };

    if (!isAdmin) return null;

    return (
        <div style={{ padding: '40px 20px', minHeight: '80vh', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-sans)', color: 'var(--text-main)' }}>
            <h1 style={{ marginBottom: '30px', fontSize: '2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={32} /> Admin Dashboard
            </h1>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', overflowX: 'auto' }}>
                <button onClick={() => setActiveTab('approvals')} style={tabStyle(activeTab === 'approvals')}>
                    <CheckCircle size={18} /> Member Approvals
                </button>
                <button onClick={() => setActiveTab('events')} style={tabStyle(activeTab === 'events')}>
                    <Calendar size={18} /> Manage Events
                </button>
                <button onClick={() => setActiveTab('team')} style={tabStyle(activeTab === 'team')}>
                    <Users size={18} /> Manage Team
                </button>
                <button onClick={() => navigate('/resources')} style={tabStyle(false)}>
                    <FileText size={18} /> Manage Resources (Go to Page)
                </button>
            </div>

            {/* APPROVALS TAB */}
            {activeTab === 'approvals' && (
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Pending Member Approvals</h2>
                    {pendingUsers.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <CheckCircle size={40} color="#10B981" style={{ marginBottom: '10px' }} />
                            <p style={{ color: 'var(--text-secondary)' }}>No pending users to approve.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {pendingUsers.map(u => (
                                <div key={u.id} style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{u.name}</h3>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email}</p>
                                        <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '0.8rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
                                            Registered: {new Date(u.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <button onClick={() => handleApprove(u.id)} style={{ padding: '8px 20px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CheckCircle size={16} /> Approve Member
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* EVENTS TAB */}
            {activeTab === 'events' && (
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1 1 350px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={20} /> Add New Event</h3>
                        <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input type="text" placeholder="Event Title *" required value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} style={inputStyle} />
                            <input type="text" placeholder="Date (e.g. 28th Feb, 2026) *" required value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} style={inputStyle} />
                            <input type="text" placeholder="Location (e.g. Virtual) *" required value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} style={inputStyle} />
                            <input type="url" placeholder="Registration Link (Optional)" value={newEvent.link} onChange={e => setNewEvent({ ...newEvent, link: e.target.value })} style={inputStyle} />
                            <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })} style={inputStyle}>
                                <option value="upcoming">Upcoming</option>
                                <option value="past">Past</option>
                            </select>
                            <button type="submit" style={primaryBtnStyle}>Create Event</button>
                        </form>
                    </div>
                    <div style={{ flex: '2 1 400px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Current Events</h3>
                        {events.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No events created yet.</p> : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {events.map(ev => (
                                    <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{ev.title}</h4>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{ev.date} • {ev.location} • <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>{ev.type}</span></p>
                                        </div>
                                        <button onClick={() => handleDeleteEvent(ev.id)} style={deleteBtnStyle}><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TEAM TAB */}
            {activeTab === 'team' && (
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1 1 350px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={20} /> Add Team Member</h3>
                        <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input type="text" placeholder="Name *" required value={newTeam.name} onChange={e => setNewTeam({ ...newTeam, name: e.target.value })} style={inputStyle} />
                            <input type="text" placeholder="Role (e.g. Chief Risk Officer) *" required value={newTeam.role} onChange={e => setNewTeam({ ...newTeam, role: e.target.value })} style={inputStyle} />
                            <select value={newTeam.category} onChange={e => setNewTeam({ ...newTeam, category: e.target.value })} style={{ ...inputStyle, padding: '10px' }}>
                                <option value="leadership">Leadership & Contributors</option>
                                <option value="industrial">Our Industrial AI Experts</option>
                                <option value="security">Security Team</option>
                            </select>
                            <textarea placeholder="Detailed Description / Bio" rows={3} value={newTeam.description} onChange={e => setNewTeam({ ...newTeam, description: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
                            <input type="url" placeholder="LinkedIn URL (Optional)" value={newTeam.linkedin_url} onChange={e => setNewTeam({ ...newTeam, linkedin_url: e.target.value })} style={inputStyle} />
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Profile Image</label>
                                <input type="file" accept="image/*" onChange={e => setNewTeam({ ...newTeam, image: e.target.files[0] })} style={{ ...inputStyle, padding: '8px' }} />
                            </div>
                            <button type="submit" style={primaryBtnStyle}>Add Member</button>
                        </form>
                    </div>
                    <div style={{ flex: '2 1 400px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Current Team Members</h3>
                        {team.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No team members added yet.</p> : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {team.map(member => (
                                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>
                                                {member.image_url ? <img src={`${API.replace('/api', '')}${member.image_url}`} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={24} />}
                                            </div>
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem' }}>{member.name}</h4>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{member.role}</p>
                                                <span style={{ fontSize: '0.75rem', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#475569', display: 'inline-block', marginTop: '4px' }}>
                                                    {member.category === 'industrial' ? 'Industrial' : member.category === 'security' ? 'Security' : 'Leadership'}
                                                </span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteTeam(member.id)} style={deleteBtnStyle}><Trash2 size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles
const tabStyle = (active) => ({
    padding: '12px 24px', border: 'none',
    background: active ? 'var(--primary)' : '#f1f5f9',
    color: active ? 'white' : '#64748b',
    borderRadius: '8px', cursor: 'pointer',
    fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
    transition: 'all 0.2s', whiteSpace: 'nowrap'
});

const inputStyle = {
    padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1',
    fontFamily: 'var(--font-sans)', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box'
};

const primaryBtnStyle = {
    padding: '12px', backgroundColor: 'var(--primary)', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
    fontSize: '1rem', transition: 'background-color 0.2s', marginTop: '10px'
};

const deleteBtnStyle = {
    padding: '8px', background: '#fee2e2', color: '#ef4444', border: 'none',
    borderRadius: '6px', cursor: 'pointer', transition: 'background-color 0.2s'
};

export default AdminDashboard;
