import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { HiOutlineHome, HiOutlineDocumentChartBar, HiOutlineMoon, HiOutlineSun, HiOutlineArrowRightOnRectangle, HiOutlineCog6Tooth, HiOutlineBars3, HiOutlineXMark } from 'react-icons/hi2'
import logo from '../assets/idHsN22NWk_logos.png'
import { useAuth } from '../context/AuthContext'

const navItems = [
    { to: '/financial/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/financial/records', icon: HiOutlineDocumentChartBar, label: 'Payment Records' },
    { to: '/financial/settings', icon: HiOutlineCog6Tooth, label: 'Settings' }
]

export default function FinancialNavigationBar() {
    const location = useLocation()
    const { logout } = useAuth()
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

    return (
        <header className={`nav-bar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                <div className="nav-logo-section">
                    <img src={logo} alt="SLIIT Logo" className="nav-logo-img" />
                    <div className="hidden sm:block">
                        <div className="nav-title">SLIIT Kandy <span className="text-amber-400">UNI</span></div>
                        <div className="nav-subtitle text-white/40">Financial Management System</div>
                    </div>
                </div>

                <nav className="nav-links hidden lg:flex">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `nav-link ${isActive || location.pathname.startsWith(item.to) ? 'active' : ''}`
                                }
                            >
                                <span className="icon"><Icon /></span>
                                <span className="label text-xs sm:text-[13px]">{item.label}</span>
                            </NavLink>
                        );
                    })}
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
                            <div className="flex items-center gap-3">
                                <img src={logo} alt="SLIIT" className="h-8 w-auto" />
                                <span className="text-white font-black tracking-tight">FINANCIAL MENU</span>
                            </div>
                            <button 
                                onClick={() => setIsMenuOpen(false)}
                                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60"
                            >
                                <HiOutlineXMark className="text-xl" />
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
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                            
                            <button 
                                onClick={logout}
                                className="w-full flex items-center gap-4 p-4 rounded-xl text-rose-400 font-bold hover:bg-rose-500/10 transition-all mt-4"
                            >
                                <HiOutlineArrowRightOnRectangle className="text-xl" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </header>
    )
}
