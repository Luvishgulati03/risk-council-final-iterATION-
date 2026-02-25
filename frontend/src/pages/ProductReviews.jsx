import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Section from '../components/Section';
import { useAuth } from '../context/AuthContext';
import { Star, ArrowLeft, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

const StarRating = ({ rating, size = 16 }) => (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={size} fill={i <= Math.round(rating) ? '#F59E0B' : 'none'} color={i <= Math.round(rating) ? '#F59E0B' : '#CBD5E1'} />
        ))}
    </div>
);

const ProductReviews = () => {
    const { API } = useAuth();
    const [searchParams] = useSearchParams();
    const highlightId = searchParams.get('product');
    const [products, setProducts] = useState([]);
    const [expandedId, setExpandedId] = useState(highlightId ? parseInt(highlightId) : null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API}/products`);
                if (!res.ok) return;
                const list = await res.json();
                // For each product, fetch full details with reviews
                const detailed = await Promise.all(
                    list.map(async (p) => {
                        const r = await fetch(`${API}/products/${p.id}`);
                        return r.ok ? await r.json() : p;
                    })
                );
                setProducts(detailed);
            } catch (err) { console.error(err); }
        };
        fetchProducts();
    }, [API]);

    // Scroll to highlighted product
    useEffect(() => {
        if (highlightId && products.length > 0) {
            const el = document.getElementById(`product-${highlightId}`);
            if (el) {
                setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
            }
        }
    }, [highlightId, products]);

    return (
        <>
            <Section style={{ backgroundColor: 'var(--bg-dark)', color: 'white' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <Link to="/services" style={{ color: '#93C5FD', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '0.9rem' }}>
                        <ArrowLeft size={16} /> Back to Services
                    </Link>
                    <h1 style={{ color: 'white', marginBottom: '10px' }}>Product Reviews</h1>
                    <p style={{ fontSize: '1.15rem', color: '#CBD5E0', maxWidth: '700px', margin: '0 auto' }}>
                        Independent security assessments from our expert council members. Each product has been reviewed by paid members, executives, and product companies for real-world effectiveness.
                    </p>
                </div>
            </Section>

            <Section>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
                    {products.map(p => {
                        const isExpanded = expandedId === p.id;
                        const isHighlighted = parseInt(highlightId) === p.id;
                        return (
                            <div key={p.id} id={`product-${p.id}`} style={{
                                border: isHighlighted ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                                borderRadius: '14px', overflow: 'hidden',
                                boxShadow: isHighlighted ? '0 0 20px rgba(0,51,102,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                                transition: 'all 0.3s'
                            }}>
                                {/* Product Header */}
                                <div onClick={() => setExpandedId(isExpanded ? null : p.id)} style={{
                                    padding: '20px 24px', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: isExpanded ? '#F8FAFC' : 'white',
                                    transition: 'background 0.2s'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <ShieldCheck size={20} color="var(--primary)" />
                                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>{p.name}</h3>
                                            <span style={{ backgroundColor: '#EFF6FF', color: 'var(--primary)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>{p.company}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', marginLeft: '20px', minWidth: '120px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <StarRating rating={p.avg_rating} size={16} />
                                            <span style={{ fontSize: '1rem', fontWeight: '700', color: '#F59E0B' }}>{p.avg_rating || 0}</span>
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{p.review_count || 0} reviews</span>
                                        {isExpanded ? <ChevronUp size={18} color="var(--text-light)" /> : <ChevronDown size={18} color="var(--text-light)" />}
                                    </div>
                                </div>

                                {/* Expanded Reviews */}
                                {isExpanded && (
                                    <div style={{ padding: '0 24px 24px', background: 'white', borderTop: '1px solid #E2E8F0' }}>
                                        {p.download_link && (
                                            <a href={p.download_link} target="_blank" rel="noopener noreferrer" style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                                backgroundColor: 'var(--primary)', color: 'white',
                                                padding: '10px 20px', borderRadius: '8px', textDecoration: 'none',
                                                fontWeight: 'bold', fontSize: '0.9rem', marginTop: '15px', marginBottom: '20px'
                                            }}>
                                                Visit Product Page →
                                            </a>
                                        )}

                                        <h4 style={{ fontSize: '1rem', marginBottom: '12px', marginTop: '15px', color: 'var(--text-main)' }}>All Reviews</h4>
                                        {(p.reviews && p.reviews.length > 0) ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {p.reviews.map(r => (
                                                    <div key={r.id} style={{ background: '#FAFAFA', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{r.reviewer_name}</span>
                                                                <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'white', background: 'var(--primary)', padding: '2px 7px', borderRadius: '4px' }}>{r.reviewer_role}</span>
                                                            </div>
                                                            <StarRating rating={r.stars} size={14} />
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{r.review_text}</p>
                                                        <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                                            {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No reviews yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Section>
        </>
    );
};

export default ProductReviews;
