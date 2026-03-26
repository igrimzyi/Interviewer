import { Link } from 'react-router-dom'
import { buttonStyles } from '../styles/shared'
import { Menu } from 'lucide-react'

import { useState } from 'react'

export default function Navbar() {
    {
        const [open, setOpen] = useState(false);
        const mobileMenuStyle = "flex items-center justify-center hover:bg-text-primary hover:text-white w-full h-8 transition-colors duration-300";
        return (
            <nav className="sticky top-0 flex flex-col justify-center shadow-md px-2 py-2 bg-white z-100 w-full">
                <div className="flex justify-between items-center flex-wrap  w-full px-4 sm:px-10">

                    {/*Lleft side: Logo and Title*/}
                    <div className="flex items-center gap-2">
                        <img className="w-6" src="/src/assets/logo.png" alt="EnterView Logo" />
                        <Link to="/"
                            className="text-lg pt-2">EnterView</Link>
                    </div>


                    {/*Mobile Navigation button*/}
                    <button className="sm:hidden flex items-center justify-center px-2 mr-10 py2 h-10 w-10 bg-text-primary rounded box-border  cursor-pointer hover:opacity-90 transition-colors duration-300"
                        onClick={() => setOpen(!open)}>
                        <Menu className="text-white w-5 h-5" />
                    </button>


                    {/*Desktop Navigation*/}
                    <div className="hidden sm:flex items-center gap-4 text-text-secondary text-xs">
                        <Link to="/features">Features</Link>
                        <Link to="/how-it-works">How It Works</Link>
                        <Link to="/about">About</Link>
                    </div>

                    <div className=" hidden sm:flex items-center gap-4">
                        <Link to="/login"
                            className="text-xs px-4 py-2 flex items-center justify-center hover:bg-slate-400 rounded-md transition-colors duration-300 w-24 h-8">
                            Sign In</Link>
                        <Link to="/register"
                            className={`${buttonStyles} text-xs text-white bg-text-primary w-24 h-8`}>
                            Get Started</Link>
                    </div>
                </div>

                {/*Mobile Navigation button */}
                {open &&
                    <div className="sm:hidden flex-col justify-between items-center pt-2 -mx-2">
                        <div className="grid grid-cols-1 place-items-center text-text-secondary text-xs">
                            <div className={`${mobileMenuStyle}`}>
                                <Link to="/features">Features</Link>
                            </div>
                            <div className={`${mobileMenuStyle}`}>
                                <Link to="/how-it-works">How It Works</Link>
                            </div>
                            <div className={`${mobileMenuStyle}`}>
                                <Link to="/about">About</Link>
                            </div>
                            <div className={`${mobileMenuStyle}`}>
                                <Link to="/login">Sign In</Link>
                            </div>
                            <div className={`${mobileMenuStyle}`}>
                                <Link to="/signup">Get Started</Link>
                            </div>


                        </div>
                    </div>}
            </nav>

        )
    }
}
