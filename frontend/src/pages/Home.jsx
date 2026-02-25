import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Section from '../components/Section';
import Button from '../components/Button';
import Card from '../components/Card';
import { heroContent, riskDomains } from '../mockData';
import { ArrowRight, Globe, Lock, CheckCircle, ChevronLeft, ChevronRight, X, Star, Download, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { API } = useAuth();
    const [videoUrl, setVideoUrl] = useState('');
    const [news, setNews] = useState([]);
    const [expandedNews, setExpandedNews] = useState(null);
    const carouselRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const productCarouselRef = useRef(null);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    useEffect(() => {
        const fetchHomepageData = async () => {
            try {
                const res = await fetch(`${API}/resources`);
                if (res.ok) {
                    const data = await res.json();

                    const hpVideos = data.filter(r => r.type === 'homepage video');
                    if (hpVideos.length > 0) {
                        hpVideos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                        const video = hpVideos[0];
                        setVideoUrl(video.source_url || (video.file_path ? `${API.replace('/api', '')}${video.file_path}` : ''));
                    }

                    const newsItems = data.filter(r => r.type === 'news');
                    newsItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setNews(newsItems);
                }
            } catch (err) {
                console.error('Error fetching homepage data', err);
            }
        };
        fetchHomepageData();

        // Fetch products
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API}/products`);
                if (res.ok) setProducts(await res.json());
            } catch (err) { console.error('Error fetching products', err); }
        };
        fetchProducts();
    }, [API]);

    // Auto-rotate the news carousel
    useEffect(() => {
        const interval = setInterval(() => {
            if (carouselRef.current && news.length > 0) {
                const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    carouselRef.current.scrollBy({ left: 240, behavior: 'smooth' });
                }
            }
        }, 4000); // rotate every 4 seconds
        return () => clearInterval(interval);
    }, [news]);

    // Auto-rotate product carousel
    useEffect(() => {
        const interval = setInterval(() => {
            if (productCarouselRef.current && products.length > 0) {
                const { scrollLeft, scrollWidth, clientWidth } = productCarouselRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    productCarouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    productCarouselRef.current.scrollBy({ left: 280, behavior: 'smooth' });
                }
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [products]);

    // Star rendering helper
    const StarRating = ({ rating, size = 16 }) => (
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={size} fill={i <= Math.round(rating) ? '#F59E0B' : 'none'} color={i <= Math.round(rating) ? '#F59E0B' : '#CBD5E1'} />
            ))}
        </div>
    );

    // Fetch full product details for modal
    const openProductModal = async (product) => {
        try {
            const res = await fetch(`${API}/products/${product.id}`);
            if (res.ok) {
                const full = await res.json();
                setSelectedProduct(full);
            }
        } catch (err) { console.error(err); }
    };

    return (
        <>
            {/* Hero Section */}
            <div style={{ backgroundColor: 'var(--primary-dark)', color: 'white', position: 'relative', overflow: 'hidden', minHeight: '600px', display: 'flex', alignItems: 'center' }}>
                {/* Video Background */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.6' }}
                    >
                        <source src="https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4" type="video/mp4" />
                        {/* Fallback for video */}
                    </video>
                    {/* Reduced opacity from 0.8/0.9 to 0.7/0.8 for better video visibility */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(0,51,102,0.7), rgba(0,34,68,0.8))' }}></div>
                </div>

                <div className="container" style={{ position: 'relative', zIndex: 2, padding: '4rem 2rem', width: '100%' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                        {/* Left Column: Content */}
                        <div>
                            <h1 style={{ color: 'white', marginBottom: '1.5rem', lineHeight: '1.1', fontSize: '3.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)', letterSpacing: '-0.02em' }}>{heroContent.title}</h1>
                            <p style={{ fontSize: '1.4rem', color: '#F7FAFC', marginBottom: '3rem', lineHeight: '1.6', fontWeight: '400', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                                {heroContent.subtitle}
                            </p>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <Button to="/membership" className="btn-primary" style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '1.25rem 2.5rem', fontSize: '1.15rem', fontWeight: '800', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                                    Join the Council
                                </Button>
                                <Button to="/framework" className="btn-primary" style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '1.25rem 2.5rem', fontSize: '1.15rem', fontWeight: '800', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                                    {heroContent.ctaPrimary}
                                </Button>
                            </div>
                        </div>

                        {/* Right Column: Video Playback Element */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{
                                width: '100%',
                                maxWidth: '600px',
                                aspectRatio: '16/9',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Placeholder for actual video playback or image */}
                                <a href={videoUrl || '#'} target={videoUrl ? "_blank" : "_self"} rel={videoUrl ? "noopener noreferrer" : ""} style={{ textAlign: 'center', color: 'white', textDecoration: 'none' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', cursor: 'pointer', border: '2px solid white' }}>
                                        <div style={{ width: '0', height: '0', borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '18px solid white', marginLeft: '4px' }}></div>
                                    </div>
                                    <p style={{ fontWeight: '600', letterSpacing: '0.05em', fontSize: '0.9rem' }}>WATCH SHOWREEL</p>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Latest News Carousel */}
            {news.length > 0 && (
                <Section style={{ padding: '4rem 0 0 0' }}>
                    <div style={{ marginBottom: '0', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Globe size={24} color="var(--primary)" /> Latest News
                            </h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => carouselRef.current?.scrollBy({ left: -240, behavior: 'smooth' })}
                                    style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <ChevronLeft size={20} color="var(--text-main)" />
                                </button>
                                <button
                                    onClick={() => carouselRef.current?.scrollBy({ left: 240, behavior: 'smooth' })}
                                    style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <ChevronRight size={20} color="var(--text-main)" />
                                </button>
                            </div>
                        </div>
                        <div
                            ref={carouselRef}
                            style={{ display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '20px', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {news.map(item => (
                                <div key={item.id} style={{ minWidth: '220px', width: 'calc(20% - 16px)', flex: '0 0 auto', scrollSnapAlign: 'start', backgroundColor: 'white', border: '1px solid var(--border-light)', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{ backgroundColor: '#EFF6FF', color: 'var(--primary)', padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>News</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{formatDate(item.created_at)}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', lineHeight: '1.4', color: 'var(--text-main)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', flexGrow: 1, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', padding: '6px 0' }}>{item.summary || item.description}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                                        <button onClick={() => setExpandedNews(item)} style={{ background: '#F8FAFC', color: 'var(--primary)', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', transition: 'all 0.2s', flexGrow: 1, justifyContent: 'center' }}
                                            onMouseOver={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = 'var(--primary)'; }}
                                        >
                                            Read More <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>
            )}

            {/* Product Carousel */}
            {products.length > 0 && (
                <Section style={{ padding: '4rem 0 0 0' }}>
                    <div style={{ marginBottom: '0', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShieldCheck size={24} color="var(--primary)" /> Reviewed Security Products
                            </h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => productCarouselRef.current?.scrollBy({ left: -280, behavior: 'smooth' })} style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                    <ChevronLeft size={20} color="var(--text-main)" />
                                </button>
                                <button onClick={() => productCarouselRef.current?.scrollBy({ left: 280, behavior: 'smooth' })} style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                    <ChevronRight size={20} color="var(--text-main)" />
                                </button>
                            </div>
                        </div>
                        <div ref={productCarouselRef} style={{ display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '20px', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {products.map(p => (
                                <div key={p.id} onClick={() => openProductModal(p)} style={{ minWidth: '260px', width: 'calc(25% - 16px)', flex: '0 0 auto', scrollSnapAlign: 'start', backgroundColor: 'white', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)'; }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{ backgroundColor: '#F0F9FF', color: 'var(--primary)', padding: '3px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>{p.company}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <StarRating rating={p.avg_rating} size={13} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#F59E0B' }}>{p.avg_rating}</span>
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', lineHeight: '1.4', color: 'var(--text-main)', margin: '0 0 8px 0' }}>{p.name}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', flexGrow: 1, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', padding: '0' }}>{p.description}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{p.review_count} review{p.review_count !== 1 ? 's' : ''}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>View Details <ChevronRight size={14} /></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>
            )}

            {/* Featured Services (Flashcards) */}
            <Section style={{ padding: '4rem 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: 'var(--primary)', textShadow: '0 2px 4px rgba(255,255,255,0.5)', fontSize: '2.5rem' }}>Our Services</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    <Card className="service-flashcard" title="Product Review" style={{ backgroundColor: 'white', paddingTop: '2.5rem', borderTop: '5px solid var(--accent)' }}>
                        <p style={{ marginBottom: '1.5rem' }}>Independent security reviews of AI and security products by our expert council members. See ratings and detailed assessments.</p>
                        <Link to="/services/product-reviews" style={{ textDecoration: 'none', color: 'var(--accent)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', display: 'inline-block' }}>View Reviews &rarr;</Link>
                    </Card>
                    <Card className="service-flashcard" title="Framework Playbooks" style={{ backgroundColor: 'white', paddingTop: '2.5rem', borderTop: '5px solid var(--primary)' }}>
                        <p style={{ marginBottom: '1.5rem' }}>Download comprehensive governance playbooks aligned with EU AI Act, NIST AI RMF, and ISO 42001 to implement at your own pace.</p>
                        <Link to="/framework" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', display: 'inline-block' }}>Browse Playbooks &rarr;</Link>
                    </Card>
                    <Card className="service-flashcard" title="Executive Workshops" style={{ backgroundColor: 'white', paddingTop: '2.5rem', borderTop: '5px solid var(--text-secondary)' }}>
                        <p style={{ marginBottom: '1.5rem' }}>Targeted training sessions for leadership teams on AI risk governance, regulatory compliance, and crisis simulation.</p>
                        <Link to="/services/workshops" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', display: 'inline-block' }}>View Schedule &rarr;</Link>
                    </Card>
                </div>
            </Section>

            {/* Intro Section - Adjusted */}
            <Section>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ marginBottom: '1.5rem' }}>Actionable Security Insights in the Age of Artificial Intelligence</h2>
                        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                            We empower organizations by providing comprehensive insight reports and security reviews, bridging the gap between rapid technological advancement and regulatory compliance.
                        </p>
                        <p>
                            Our team leverages industry-leading frameworks to generate detailed assessments that help mitigate systemic risks associated with your AI products and dependencies.
                        </p>
                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <CheckCircle size={20} color="var(--primary)" style={{ marginTop: '4px' }} />
                                <span><strong>Framework-Aligned Insights:</strong> Insight reports based on EU AI Act, NIST AI RMF, and ISO 42001.</span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <CheckCircle size={20} color="var(--primary)" style={{ marginTop: '4px' }} />
                                <span><strong>Enterprise Security Solutions:</strong> We utilize top solutions like Microsoft Purview for our audits.</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-light)', padding: '3rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Why Governance Matters</h3>
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                            <Globe size={40} color="var(--primary)" />
                            <div>
                                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Global Compliance</h4>
                                <p style={{ fontSize: '0.95rem' }}>Navigate the complex web of international AI regulations with confidence.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <Lock size={40} color="var(--primary)" />
                            <div>
                                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Brand Integrity</h4>
                                <p style={{ fontSize: '0.95rem' }}>Protect reputation by preventing bias, hallucinations, and privacy breaches.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Risk Domains */}
            <Section background="light">
                <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
                    <h2>AI Risk Domains</h2>
                    <p style={{ fontSize: '1.1rem' }}>
                        Our comprehensive oversight model addresses the six critical dimensions of Artificial Intelligence risk.
                    </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {riskDomains.map((domain, index) => (
                        <div key={index}>
                            <Card title={domain.title} className="hover:shadow-lg">
                                <p style={{ fontSize: '0.95rem' }}>{domain.description}</p>
                                <Link to={`/risk-domains/${domain.id}`} style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: '500', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none' }}>
                                    <span>View Standards</span>
                                    <ArrowRight size={16} />
                                </Link>
                            </Card>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Membership CTA */}
            <Section>
                <div style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)', padding: '4rem', color: 'white', textAlign: 'center' }}>
                    <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Join the Global Council</h2>
                    <p style={{ maxWidth: '700px', margin: '0 auto 2.5rem auto', fontSize: '1.15rem', color: '#E2E8F0' }}>
                        Access exclusive risk assessment templates, peer benchmarking data, and executive briefings. Join a network of over 500 global organizations committed to responsible AI.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <Button to="/membership" variant="primary" style={{ backgroundColor: 'white', color: 'var(--primary)' }}>
                            Explore Membership
                        </Button>
                        <Button to="/contact" style={{ border: '1px solid white', color: 'white' }}>
                            Contact Us
                        </Button>
                    </div>
                </div>
            </Section>

            {/* Read More News Modal */}
            {expandedNews && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                    onClick={() => setExpandedNews(null)}
                >
                    <div style={{
                        background: 'white', borderRadius: 'var(--radius-md)',
                        padding: '2.5rem', maxWidth: '600px', width: '90%',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)', position: 'relative',
                        maxHeight: '90vh', overflowY: 'auto'
                    }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setExpandedNews(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={24} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <span style={{ backgroundColor: '#EFF6FF', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>News</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>{formatDate(expandedNews.created_at)}</span>
                        </div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px', color: 'var(--text-main)', lineHeight: '1.3' }}>{expandedNews.title}</h2>
                        <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                            {expandedNews.description || expandedNews.summary}
                        </div>
                        {expandedNews.source_url && (
                            <div style={{ marginTop: '30px' }}>
                                <a href={expandedNews.source_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
                                    Read Full Article <ChevronRight size={18} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedProduct(null)}>
                    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '2.5rem', maxWidth: '700px', width: '90%', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={24} /></button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <span style={{ backgroundColor: '#EFF6FF', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>{selectedProduct.company}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <StarRating rating={selectedProduct.avg_rating} size={18} />
                                <span style={{ fontSize: '1rem', fontWeight: '700', color: '#F59E0B' }}>{selectedProduct.avg_rating}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>({selectedProduct.review_count} reviews)</span>
                            </div>
                        </div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '15px', color: 'var(--text-main)', lineHeight: '1.3' }}>{selectedProduct.name}</h2>
                        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '20px' }}>{selectedProduct.description}</p>
                        {selectedProduct.download_link && (
                            <a href={selectedProduct.download_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '25px', transition: 'background 0.2s' }}>
                                <Download size={18} /> Visit Product Page
                            </a>
                        )}

                        {/* Reviews Section */}
                        {selectedProduct.reviews && selectedProduct.reviews.length > 0 && (
                            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text-main)' }}>Member Reviews</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {selectedProduct.reviews.slice(0, 3).map(r => (
                                        <div key={r.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>{r.reviewer_name}</span>
                                                    <span style={{ fontSize: '0.7rem', color: 'white', background: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>{r.reviewer_role}</span>
                                                </div>
                                                <StarRating rating={r.stars} size={13} />
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{r.review_text}</p>
                                        </div>
                                    ))}
                                </div>
                                <Link to={`/services/product-reviews?product=${selectedProduct.id}`} onClick={() => setSelectedProduct(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '15px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' }}>
                                    Show All Reviews <ArrowRight size={16} />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Home;
