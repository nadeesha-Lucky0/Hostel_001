import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/idHsN22NWk_logos.png';
import doubleRoomImg from '../assets/20260422_002352.jpg';
import heroBgImg from '../assets/IMG_3684.jpg';
import aboutImg1 from '../assets/IMG_2172.jpg';
import aboutImg2 from '../assets/IMG_2173.jpg';
import AuthModal from '../components/AuthModal';
import { api } from '../services/api';
import {
    HiOutlineHome,
    HiOutlineBuildingOffice2,
    HiOutlineUserGroup,
    HiOutlineClipboardDocumentList,
    HiOutlinePhone,
    HiOutlineMapPin,
    HiOutlineEnvelope,
    HiOutlineLockClosed,
    HiOutlineArrowRight,
    HiOutlineMegaphone,
    HiOutlineCalendarDays,
    HiOutlineArrowDownTray,
    HiOutlinePhoto
} from 'react-icons/hi2';
import { 
    FaFacebookF, 
    FaInstagram, 
    FaTiktok, 
    FaYoutube 
} from 'react-icons/fa';


const normalizeAttachments = (notice) => {
    if (notice.attachments && notice.attachments.length > 0) return notice.attachments;
    if (notice.attachmentUrl) return [{ url: notice.attachmentUrl, type: notice.attachmentType }];
    return [];
};

const LandingSlideshow = ({ images, showNoticeBadge = true, className = "aspect-video" }) => {
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        if (images.length <= 1) return;
        const t = setInterval(() => setIdx(i => (i + 1) % images.length), 5000);
        return () => clearInterval(t);
    }, [images.length]);
    if (images.length === 0) return null;
    return (
        <div className={`relative overflow-hidden ${className}`}>
            {images.map((img, i) => (
                <img key={i} src={img.url} alt={`Slide ${i + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
                />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                        <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`}
                        />
                    ))}
                </div>
            )}
            {showNoticeBadge && (
                <span className="absolute top-3 right-3 text-white text-[9px] font-black uppercase tracking-widest bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none">Read Notice ↗</span>
            )}
        </div>
    );
};

const Landing = () => {
    const navigate = useNavigate();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [notices, setNotices] = useState([]);
    const [loadingNotices, setLoadingNotices] = useState(true);

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const res = await api.getNotices();
            if (res.success) setNotices(res.data);
        } catch (err) {
            console.error('Failed to fetch notices:', err);
        } finally {
            setLoadingNotices(false);
        }
    };

    const openAuth = (mode) => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
    };

    const stats = [
        { label: 'Total Rooms', value: '300+', icon: HiOutlineBuildingOffice2 },
        { label: 'Happy Students', value: '200+', icon: HiOutlineUserGroup },
        { label: 'Security Level', value: '24/7', icon: HiOutlineLockClosed },
        { label: 'Kandy Units', value: '02', icon: HiOutlineHome },
    ];

    return (
        <div className="landing-page min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-900">
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="SLIIT Logo" className="w-16 h-10 object-contain" />
                    <div>
                        <h1 className="text-lg font-black text-slate-900 leading-none">SLIIT Kandy <span className="text-indigo-600">UNI</span></h1>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hostel Management System</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <a href="#about" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">About</a>
                    <a href="#services" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Services</a>
                    <a href="#notices" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                        <HiOutlineMegaphone className="text-indigo-500" /> Notices
                    </a>
                    <a href="#contact" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Contact</a>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openAuth('login')}
                        className="px-6 py-2.5 text-slate-600 hover:text-indigo-600 text-sm font-bold transition-all"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => openAuth('register')}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
                    >
                        Sign Up
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center z-0 scale-105"
                    style={{
                        backgroundImage: `url(${heroBgImg})`,
                    }}
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-950/80 backdrop-blur-[3px]" />

                <div className="relative z-20 text-center px-6 max-w-4xl mx-auto animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-widest mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        SLIIT Kandy Official Hostel Portal
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-[1.1]">
                        The Perfect Stay For <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-200">
                            Engineering Excellence.
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-indigo-100/80 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                        Experience a premium living environment designed specifically for the students of SLIIT Kandy.
                        Safety, comfort, and a vibrant community await you.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => openAuth('login')}
                            className="w-full sm:w-auto px-10 py-4 bg-white/20 backdrop-blur-xl text-white border border-white/30 rounded-2xl text-base font-extrabold shadow-2xl shadow-white/5 hover:bg-white/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            Get Started Now <HiOutlineArrowRight className="text-lg" />
                        </button>
                        <a href="#about" className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl text-base font-bold hover:bg-white/20 active:scale-95 transition-all text-center">
                            Explore More
                        </a>
                    </div>
                </div>
            </section>

            {/* Quick Stats Section */}
            <section className="relative z-30 -mt-16 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col items-center text-center border border-slate-100 transition-transform hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-4">
                                <stat.icon />
                            </div>
                            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Room Types Section */}
            <section id="services" className="py-24 px-6 bg-slate-50 overflow-hidden">
                <style>{`
                    .perspective-1000 { perspective: 1000px; }
                    .preserve-3d { transform-style: preserve-3d; }
                    .backface-hidden { backface-visibility: hidden; }
                    .rotate-y-180 { transform: rotateY(180deg); }
                    .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
                    .flip-card-inner { transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
                `}</style>

                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="text-indigo-600 font-black uppercase tracking-[0.2em] text-xs mb-4">Your Future Home</div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Explore Our Rooms</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg italic">"Choose the space that best fits your lifestyle and academic needs."</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        {/* Single Room */}
                        <div className="flip-card perspective-1000 h-[500px] group">
                            <div className="flip-card-inner preserve-3d relative w-full h-full">
                                {/* Front */}
                                <div className="flip-card-front backface-hidden absolute inset-0 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100">
                                    <div className="h-2/3 overflow-hidden">
                                        <img
                                            src="https://webasset.sliit.lk/web/6-On-Campus-SLIIT-Kandy-Uni-Hostel-(1)_1756279469.JPG"
                                            alt="Single Room"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-8 text-center">
                                        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-3">Premium Solo</div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2">Single Room</h3>
                                        <p className="text-slate-500 text-sm font-medium">Perfect for focused academic performance.</p>
                                    </div>
                                </div>
                                {/* Back */}
                                <div className="flip-card-back backface-hidden absolute inset-0 rotate-y-180 bg-indigo-950 rounded-[2.5rem] p-10 flex flex-col justify-center text-left text-white shadow-2xl shadow-indigo-900/40">
                                    <h3 className="text-3xl font-black mb-6">Single Room Details</h3>
                                    <ul className="space-y-4 mb-8">
                                        <li className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">✓</div>
                                            <span className="text-indigo-100/90 font-medium">Study Desk,Table & Cupboard</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">✓</div>
                                            <span className="text-indigo-100/90 font-medium">Attached Modern Bathroom</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">✓</div>
                                            <span className="text-indigo-100/90 font-medium">Single Orthopedic Bed</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">✓</div>
                                            <span className="text-indigo-100/90 font-medium">High-speed WIFI</span>
                                        </li>
                                    </ul>
                                    <button
                                        onClick={() => openAuth('login')}
                                        className="w-full py-4 bg-white text-indigo-950 rounded-2xl font-black hover:scale-105 transition-transform"
                                    >
                                        Check Availability
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Double Room */}
                        <div className="flip-card perspective-1000 h-[500px] group">
                            <div className="flip-card-inner preserve-3d relative w-full h-full">
                                {/* Front */}
                                <div className="flip-card-front backface-hidden absolute inset-0 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100">
                                    <div className="h-2/3 overflow-hidden">
                                        <img
                                            src={doubleRoomImg}
                                            alt="Double Room"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-8 text-center">
                                        <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-3">Community Living</div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2">Double Sharing Room</h3>
                                        <p className="text-slate-500 text-sm font-medium">Vibrant space for collaborative learning.</p>
                                    </div>
                                </div>
                                {/* Back */}
                                <div className="flip-card-back backface-hidden absolute inset-0 rotate-y-180 bg-indigo-900 rounded-[2.5rem] p-10 flex flex-col justify-center text-left text-white shadow-2xl shadow-indigo-900/40">
                                    <h3 className="text-3xl font-black mb-6">Double Room Details</h3>
                                    <ul className="space-y-4 mb-8">
                                        <li className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">✓</div>
                                            <span className="text-indigo-100/90 font-medium">Two Separate Beds</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">✓</div>
                                            <span className="text-indigo-100/90 font-medium">Two Separate Study Units</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">✓</div>
                                            <span className="text-indigo-100/90 font-medium">Two Separate Fans</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">✓</div>
                                            <span className="text-indigo-100/90 font-medium">Two Separate Storage Cupboards</span>
                                        </li>
                                    </ul>
                                    <button
                                        onClick={() => openAuth('login')}
                                        className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-black hover:scale-105 transition-transform"
                                    >
                                        Check Availability
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/20">
                            <LandingSlideshow 
                                images={[{ url: aboutImg1 }, { url: aboutImg2 }]} 
                                showNoticeBadge={false} 
                                className="w-full h-full"
                            />
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-indigo-600 rounded-3xl -z-10 animate-pulse"></div>
                    </div>
                    <div>
                        <div className="text-indigo-600 font-black uppercase tracking-[0.2em] text-xs mb-4">About the Hostel</div>
                        <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
                            Providing A Second Home <br />
                            <span className="text-indigo-600">For Your Academic Journey.</span>
                        </h2>
                        <p className="text-slate-600 text-lg leading-relaxed mb-8">
                            At SLIIT Kandy, we believe that education is not just about the classroom.
                            Our hostels provide a secure, modern, and collaborative environment where
                            students can thrive. With state-of-the-art facilities and a dedicated
                            management team, we ensure your focus remains on your studies while you
                            enjoy a comfortable stay.
                        </p>
                        <div className="space-y-4">
                            {[
                                'Fully Furnished Single & Double Rooms',
                                '24/7 High-Speed Wi-Fi Connectivity',
                                'Dedicated Study Halls & Discussion Areas',
                                'Integrated Security & QR Access System'
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">✓</div>
                                    <span className="text-slate-700 font-semibold">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Notices Section */}
            <section id="notices" className="py-24 px-6 bg-slate-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="text-indigo-600 font-black uppercase tracking-[0.2em] text-xs mb-4">Announcements</div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Latest Notices</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg italic">Stay informed with the latest updates from the warden.</p>
                    </div>

                    {loadingNotices ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : notices.length > 0 ? (
                        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-8 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
                            {notices.map((notice) => {
                                const atts = normalizeAttachments(notice);
                                const images = atts.filter(a => a.type === 'image');
                                const docs = atts.filter(a => a.type !== 'image');
                                return (
                                    <div key={notice._id} className="min-w-[85vw] md:min-w-0 snap-start group bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer" onClick={() => navigate(`/notice/${notice._id}`)}>
                                        {/* Multi-photo auto-slideshow */}
                                        {images.length > 0 && <LandingSlideshow images={images} className="aspect-video" />}

                                        <div className="p-8 flex flex-col flex-grow">
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                                                    <HiOutlineMegaphone />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest">Official Update</div>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                                                {notice.title}
                                            </h3>

                                            <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-grow line-clamp-3">
                                                {notice.content}
                                            </p>

                                            {/* Document attachment */}
                                            {docs.length > 0 && (
                                                <a
                                                    href={docs[0].url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={e => e.stopPropagation()}
                                                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-colors mb-5"
                                                >
                                                    <HiOutlineCalendarDays className="text-lg" />
                                                    View Document Attached
                                                    <HiOutlineArrowDownTray className="ml-auto text-slate-400" />
                                                </a>
                                            )}

                                            <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                                                        {notice.createdBy?.name?.charAt(0) || 'W'}
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{notice.createdBy?.role}</span>
                                                </div>
                                                <span className="text-xs font-black text-indigo-600 flex items-center gap-1">
                                                    Read More <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                            <HiOutlineClipboardDocumentList className="text-5xl text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active notices at the moment</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Support/Footer Banner */}
            <section className="py-24 px-6 bg-indigo-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl font-black text-white mb-6">Need Immediate Assistance?</h2>
                    <p className="text-indigo-100/60 text-lg mb-12 max-w-2xl mx-auto">
                        Our team is available 24/7 to help you with any issues or queries related to your stay.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-12">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl backdrop-blur-md border border-white/10">
                                <HiOutlinePhone />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200/60">Call Us</div>
                                <div className="text-lg font-bold text-white">+94 81 2 386 611</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl backdrop-blur-md border border-white/10">
                                <HiOutlineEnvelope />
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200/60">Email Us</div>
                                <div className="text-lg font-bold text-white">kandyofficer@sliit.lk</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Us Section */}
            <section id="contact" className="py-32 px-6 bg-slate-50/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100">Get In Touch</div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Ready To Join Our Community?</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg italic leading-relaxed">"Our team is dedicated to providing you with the best possible living experience. Reach out anytime."</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center flex flex-col items-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                                <HiOutlineMapPin />
                            </div>
                            <h3 className="font-black text-xl text-slate-900 mb-4">Our Location</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                SLIIT Kandy UNI, <br />
                                Kengolla, Kundasale, <br />
                                Kandy, Sri Lanka.
                            </p>
                        </div>
                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center flex flex-col items-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                                <HiOutlinePhone />
                            </div>
                            <h3 className="font-black text-xl text-slate-900 mb-4">Direct Contact</h3>
                            <div className="space-y-2">
                                <p className="text-slate-500 text-sm font-bold">+94 81 2 386 611</p>
                                <p className="text-slate-500 text-sm font-bold">+94 81 2 386 612</p>
                            </div>
                        </div>
                        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center flex flex-col items-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                            <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-3xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                                <HiOutlineEnvelope />
                            </div>
                            <h3 className="font-black text-xl text-slate-900 mb-4">Email Support</h3>
                            <div className="space-y-2">
                                <p className="text-slate-500 text-sm font-bold">kandyofficer@sliit.lk</p>
                                <p className="text-slate-500 text-sm font-bold">hostel.info@sliit.lk</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-16 pb-10 px-6 bg-slate-950 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2.5 mb-6">
                            <div className="p-1.5 bg-white rounded-lg">
                                <img src={logo} alt="SLIIT Logo" className="w-10 h-6 object-contain" />
                            </div>
                            <span className="text-lg font-black tracking-tight">SLIIT Kandy <span className="text-indigo-400">UNI</span></span>
                        </div>
                        <p className="text-slate-400 text-[13px] leading-relaxed font-medium mb-6 max-w-[240px]">
                            Empowering future engineers with a secure, collaborative living environment.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { icon: FaFacebookF, url: 'https://facebook.com/sliit.kandy', label: 'Facebook' }, // UPDATE FACEBOOK URL HERE
                                { icon: FaInstagram, url: 'https://instagram.com/sliit.kandy', label: 'Instagram' }, // UPDATE INSTAGRAM URL HERE
                                { icon: FaTiktok, url: 'https://tiktok.com/@sliit.kandy', label: 'TikTok' }, // UPDATE TIKTOK URL HERE
                                { icon: FaYoutube, url: 'https://youtube.com/sliitkandy', label: 'YouTube' } // UPDATE YOUTUBE URL HERE
                            ].map((social, i) => (
                                <a 
                                    key={i} 
                                    href={social.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-indigo-400 transition-all cursor-pointer"
                                    title={social.label}
                                >
                                    <social.icon className="text-sm" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Quick Navigation</h4>
                        <ul className="space-y-3">
                            {['About Us', 'Room Types', 'Official Notices', 'Contact Us'].map(item => (
                                <li key={item}>
                                    <a href={`#${item.toLowerCase().split(' ')[0]}`} className="text-slate-300 hover:text-white transition-colors text-xs font-bold flex items-center gap-2 group">
                                        <span className="w-1 h-px bg-indigo-500 group-hover:w-3 transition-all"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Resources</h4>
                        <ul className="space-y-3">
                            {['Student Guidelines', 'Hostel FAQs', 'Fee Structure', 'Support'].map(item => (
                                <li key={item}>
                                    <a href="#" className="text-slate-300 hover:text-white transition-colors text-xs font-bold flex items-center gap-2 group">
                                        <span className="w-1 h-px bg-indigo-500 group-hover:w-3 transition-all"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Legal & Privacy</h4>
                        <ul className="space-y-3">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                                <li key={item}>
                                    <a href="#" className="text-slate-300 hover:text-white transition-colors text-xs font-bold flex items-center gap-2 group">
                                        <span className="w-1 h-px bg-indigo-500 group-hover:w-3 transition-all"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                        © 2026 SLIIT Kandy University Hostel.
                    </p>
                    <div className="flex gap-6">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">v2.4.0</span>
                        <span className="text-[9px] font-black text-indigo-500/60 uppercase tracking-widest">SECURE TLS 1.3</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
