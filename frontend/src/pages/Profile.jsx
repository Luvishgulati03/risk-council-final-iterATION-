import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Section from '../components/Section';
import { User, Mail, Building2, Phone, Globe, Linkedin, Twitter, Camera, Save, ShieldCheck } from 'lucide-react';

const ROLE_LABELS = {
    user: 'Free Member',
    member: 'Paid Member',
    admin: 'Administrator',
    executive: 'Executive Member',
    university: 'University',
    company: 'Product Company'
};

const ROLE_COLORS = {
    user: '#64748B',
    member: '#16A34A',
    admin: '#DC2626',
    executive: '#7C3AED',
    university: '#0284C7',
    company: '#D97706'
};

const Profile = () => {
    const { token, user, API, loading } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (loading) return;
        if (!token) { navigate('/membership', { state: { mode: 'login' } }); return; }
        fetchProfile();
    }, [token, loading]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API}/users/me/profile`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to fetch profile');
            const data = await res.json();
            setProfile(data);
            setForm({
                name: data.name || '',
                bio: data.bio || '',
                linkedin_url: data.linkedin_url || '',
                twitter_url: data.twitter_url || '',
                website_url: data.website_url || '',
                organization_name: data.organization_name || '',
                phone: data.phone || ''
            });
        } catch (err) { console.error(err); }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            if (imageFile) formData.append('profile_image', imageFile);

            const res = await fetch(`${API}/users/me/profile`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            if (!res.ok) throw new Error('Failed to update profile');
            const updated = await res.json();
            setProfile(updated);
            setEditing(false);
            setImageFile(null);
            setImagePreview(null);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error updating profile.');
        }
        setSaving(false);
    };

    if (loading || !profile) return <div style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>Loading profile...</div>;

    const baseUrl = API.replace('/api', '');
    const avatarSrc = imagePreview || (profile.profile_image ? `${baseUrl}${profile.profile_image}` : null);
    const roleColor = ROLE_COLORS[profile.role] || '#64748B';

    const inputStyle = {
        padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1',
        fontSize: '0.95rem', width: '100%', boxSizing: 'border-box',
        fontFamily: 'var(--font-sans)', transition: 'border-color 0.2s',
        outline: 'none'
    };

    return (
        <>
            <Section style={{ backgroundColor: 'var(--bg-dark)', color: 'white' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 style={{ color: 'white', marginBottom: '8px' }}>My Profile</h1>
                    <p style={{ color: '#CBD5E0', fontSize: '1.05rem' }}>Manage your account information, bio, and social links.</p>
                </div>
            </Section>

            <Section>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {message && (
                        <div style={{ padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', background: message.includes('Error') ? '#FEE2E2' : '#D1FAE5', color: message.includes('Error') ? '#DC2626' : '#059669', fontWeight: '600', fontSize: '0.9rem' }}>
                            {message}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                        {/* Left: Avatar + Role */}
                        <div style={{ flex: '0 0 220px', textAlign: 'center' }}>
                            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 16px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${roleColor}`, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {avatarSrc ? (
                                    <img src={avatarSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={56} color="#94A3B8" />
                                )}
                                {editing && (
                                    <label style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '8px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                                        <Camera size={14} /> Change
                                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                    </label>
                                )}
                            </div>
                            <h3 style={{ margin: '0 0 6px', color: 'var(--text-main)' }}>{profile.name}</h3>
                            <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', color: 'white', background: roleColor }}>
                                {ROLE_LABELS[profile.role] || profile.role}
                            </span>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '10px' }}>
                                <Mail size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{profile.email}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                        </div>

                        {/* Right: Form */}
                        <div style={{ flex: 1, minWidth: '320px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-main)' }}>
                                    {editing ? 'Edit Profile' : 'Profile Information'}
                                </h2>
                                {!editing ? (
                                    <button onClick={() => setEditing(true)} style={{ padding: '8px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.88rem' }}>Edit</button>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => { setEditing(false); setImageFile(null); setImagePreview(null); }} style={{ padding: '8px 16px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                                        <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px', opacity: saving ? 0.7 : 1 }}>
                                            <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Name */}
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}><User size={13} /> Full Name</label>
                                    {editing ? <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} /> : <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{profile.name}</p>}
                                </div>

                                {/* Bio */}
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}><ShieldCheck size={13} /> Bio</label>
                                    {editing ? <textarea rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Tell us about yourself..." /> : <p style={{ margin: 0, fontSize: '0.9rem', color: profile.bio ? 'var(--text-main)' : '#94A3B8', fontStyle: profile.bio ? 'normal' : 'italic', lineHeight: '1.6' }}>{profile.bio || 'No bio added yet.'}</p>}
                                </div>

                                {/* Org / Phone (company, university, executive) */}
                                {['company', 'university', 'executive'].includes(profile.role) && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}><Building2 size={13} /> Organization</label>
                                            {editing ? <input type="text" value={form.organization_name} onChange={e => setForm({ ...form, organization_name: e.target.value })} style={inputStyle} /> : <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>{profile.organization_name || '—'}</p>}
                                        </div>
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}><Phone size={13} /> Phone</label>
                                            {editing ? <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} /> : <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>{profile.phone || '—'}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Social Links */}
                                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', marginTop: '4px' }}>
                                    <p style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)', marginBottom: '12px' }}>Social Links</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}><Linkedin size={13} color="#0A66C2" /> LinkedIn</label>
                                            {editing ? <input type="url" value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })} style={inputStyle} placeholder="https://linkedin.com/in/..." /> : (profile.linkedin_url ? <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: '#0A66C2', textDecoration: 'none' }}>{profile.linkedin_url}</a> : <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic' }}>Not added</p>)}
                                        </div>
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}><Twitter size={13} color="#1DA1F2" /> Twitter / X</label>
                                            {editing ? <input type="url" value={form.twitter_url} onChange={e => setForm({ ...form, twitter_url: e.target.value })} style={inputStyle} placeholder="https://x.com/..." /> : (profile.twitter_url ? <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: '#1DA1F2', textDecoration: 'none' }}>{profile.twitter_url}</a> : <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic' }}>Not added</p>)}
                                        </div>
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}><Globe size={13} color="#059669" /> Website</label>
                                            {editing ? <input type="url" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} style={inputStyle} placeholder="https://..." /> : (profile.website_url ? <a href={profile.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', color: '#059669', textDecoration: 'none' }}>{profile.website_url}</a> : <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem', fontStyle: 'italic' }}>Not added</p>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </>
    );
};

export default Profile;
