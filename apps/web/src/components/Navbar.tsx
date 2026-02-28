import { Link } from 'react-router-dom'
import { buttonStyles } from '../styles/shared'

export default function Navbar() {
    {
        return (
            <nav className="sticky top-0 flex bg-white shadow-2xs px-8 py-2">
                <div className="flex justify-between items-center flex-wrap gap-4 
            max-w-300 mx-auto w-full">

                    {/*Lleft side: Logo and Title*/}
                    <div className="flex items-center gap-2">
                        <img className="w-4" src="/src/assets/logo.png" alt="EnterView Logo" />
                        <Link to="/"
                        className="text-base">EnterView</Link>
                    </div>

                    {/*Middle: Navigation Links*/}
                    <div className="flex items-center gap-4 text-text-secondary text-xs">
                        <Link to="/features">Features</Link>
                        <Link to="/how-it-works">How It Works</Link>
                        <Link to="/about">About</Link>
                    </div>

                    {/*Right side: Sign In and Get Started buttons*/}
                    <div className="flex items-center gap-4">
                        <Link to="/login"
                            className="text-xs px-4 py-2 hover:opacity-90 transition-colors duration-300">
                            Sign In</Link>
                        <Link to="/signup"
                            className={`${buttonStyles} text-white bg-text-primary`}>
                            Get Started</Link>
                    </div>
                </div>
            </nav>
        )
    }
}