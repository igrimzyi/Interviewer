import { Link } from 'react-router-dom'
import { buttonStyles } from '../styles/shared'
import { Menu } from 'lucide-react'

import { useState } from 'react'

export default function Navbar() {
    {
        const [open, setOpen] = useState(false);

        return (
            <nav className="sticky top-0 flex flex-col shadow-md px-2 py-2 bg-white z-100 w-full">
                <div className="flex  justify-between items-center flex-wrap gap-4 w-full sm:px-10">

                    {/*Lleft side: Logo and Title*/}
                    <div className="flex items-center gap-2">
                        <img className="w-4" src="/src/assets/logo.png" alt="EnterView Logo" />
                        <Link to="/"
                            className="text-base">EnterView</Link>
                    </div>


                    {/*Mobile Navigation button*/}
                    <button className="sm:hidden mx-[8vw] px-2 py2 h-full bg-text-primary rounded box-border  cursor-pointer hover:opacity-90 transition-colors duration-300"
                        onClick={() => setOpen(!open)}>
                        <Menu className="text-white w-4" />
                    </button>


                    {/*Desktop Navigation*/}
                    <div className="hidden sm:flex items-center gap-4 text-text-secondary text-xs">
                        <Link to="/features">Features</Link>
                        <Link to="/how-it-works">How It Works</Link>
                        <Link to="/about">About</Link>
                    </div>

                    <div className=" hidden sm:flex items-center gap-4">
                        <Link to="/login"
                            className="text-xs px-4 py-2 hover:opacity-90 transition-colors duration-300">
                            Sign In</Link>
                        <Link to="/signup"
                            className={`${buttonStyles} text-xs text-white bg-text-primary`}>
                            Get Started</Link>
                    </div>
                </div>

                {/*Mobile Navigation button */}
                {open &&
                    <div className="sm:hidden flex-col justify-between items-center py-2 ">
                        <div className="grid grid-cols-1 place-items-center gap-4 text-text-secondary text-xs">
                            <Link to="/features">Features</Link>
                            <Link to="/how-it-works">How It Works</Link>
                            <Link to="/about">About</Link>
                            <Link to="/login">Sign In</Link>
                            <Link to="/signup">Get Started</Link>
                        </div>
                    </div>}
            </nav>

        )
    }
}