import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HiOutlineHome, HiOutlineMoon, HiOutlineSun, HiOutlineArrowRightOnRectangle, HiOutlineCog6Tooth, HiOutlineBars3, HiOutlineXMark } from 'react-icons/hi2';
import logo from '../assets/idHsN22NWk_logos.png';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { to: '/admin/dashboard', icon: HiOutlineHome, label: 'Admin Dashboard' },
    { to: '/admin/settings', icon: HiOutlineCog6Tooth, label: 'Settings' }
];

export default function AdminNavigationBar() {
    const location = useLocation();
    const { logout, user } = useAuth();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <header className={`nav-bar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                <div className="nav-logo-section">
                    <img src={logo} alt="SLIIT Logo" className="nav-logo-img" />
                    <div className="hidden sm:block">
                        <div className="nav-title">SLIIT Kandy <span className="text-amber-400">UNI</span></div>
                        <div className="nav-subtitle text-white/40">Administration Panel</div>
                    </div>
                </div>

                <nav className="nav-links hidden lg:flex">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `nav-link ${isActive || location.pathname.startsWith(item.to) ? 'active' : ''}`
                            }
                        >
                            <span className="icon"><item.icon /></span>
                            <span className="label text-xs sm:text-[13px]">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="nav-actions">
                    <button onClick={toggleTheme} className="theme-toggle" title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
                        {theme === 'light' ? <HiOutlineMoon /> : <HiOutlineSun />}
                    </button>
                    <button 
                        onClick={() => setIsMenuOpen(true)}
                        className="theme-toggle lg:hidden"
                        title="Open Menu"
                    >
                        <HiOutlineBars3 />
                    </button>
                    <button onClick={logout} className="p-2 text-white/60 hover:text-rose-400 transition-colors hidden sm:block" title="Logout">
                        <HiOutlineArrowRightOnRectangle className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {isMenuOpen && (
                <>
                    <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)} />
                    <div className="mobile-menu-drawer">
                        <div className="mobile-menu-header">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">MENU</p>
                                <h3 className="text-xl font-black text-white tracking-tight">Admin Portal</h3>
                            </div>
                            <button 
                                onClick={() => setIsMenuOpen(false)}
                                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                            >
                                <HiOutlineXMark className="text-2xl" />
                            </button>
                        </div>
                        
                        <div className="mobile-menu-content">
                            {navItems.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={({ isActive }) => 
                                        `mobile-nav-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <item.icon className="text-xl" />
                                    <span className="tracking-wide">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>

                        <div className="mobile-user-section">
                            <div className="mobile-user-card">
                                <div className="mobile-user-avatar">
                                    {(user?.name?.charAt(0) || 'A').toUpperCase()}
                                </div>
                                <div className="mobile-user-info">
                                    <h4>{user?.name || 'Admin User'}</h4>
                                    <p>ADMIN</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={logout}
                                className="mobile-logout-btn"
                            >
                                <HiOutlineArrowRightOnRectangle className="text-lg" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
