import { Link } from "react-router-dom"
import { buttonStyles } from "../styles/shared"
import { CodeXml, Users, ChartColumn, Calendar, Send, Video, CircleCheckBig, ArrowRight, CirclePlay, type LucideIcon } from "lucide-react"


/*TODO:
-Style the top, middle and bottom container so it matches the screenshot
-Fix the links so it can scroll to the sections instead of a seperate webpage
*/


type Card = {
    icon: LucideIcon;
    title: string;
    description: string;
}

export default function LandingPage() {

    const features: Card[] = [
        {
            icon: CodeXml,
            title: "Live coding Enviorment",
            description: "Provide candidates with a real-time coding environment supporting 40+ programming languages with syntax highlighting and auto-completion."
        },
        {
            icon: Users,
            title: "Collaborative Interviews",
            description: "Enable multiple interviewers to join sessions, share notes, and evaluate candidates together in real-time."
        },
        {
            icon: ChartColumn,
            title: "Advanced Analytics",
            description: "Track interview performance, compare candidates, and make data-driven hiring decisions with comprehensive analytics."
        }
    ]

    const steps: Card[] = [
        {
            icon: Calendar,
            title: "Schedule Interview",
            description: "Create interview sessions and customize coding challenges based on the role requirements."
        },
        {
            icon: Send,
            title: "Invite Candidates",
            description: "Send interview invitations via email with all necessary details and session links."
        },
        {
            icon: Video,
            title: "Conduct Interview",
            description: "Join the live session with your candidate, watch them code, and collaborate in real-time."
        },
        {
            icon: CircleCheckBig,
            title: "Evaluate & Decide",
            description: " Review recordings, compare notes with your team, and make informed hiring decisions."
        }
    ]
    const subTextStyle = "text-text-secondary text-xs"

    return (
        <div className="grid grid-cols-1cols-1 items-center justify-center px-12">

            {/* {Top Section} */}
            <div className="flex ">
                <div className="grid grid-cols-2 py-24 gap-8">
                    <div className="grid grid-cols-1 gap-2">
                        <div>
                            <h1 className="text-4xl font-medium text-text-primary"> EnterView</h1>
                        </div>
                        <div className={`${subTextStyle}`}>
                            <p>
                                The modern platform for hosting technical interviews.
                                Streamline your hiring process with powerful coding assessments,
                                real-time collaboration and coprehensive analytics.
                            </p>
                        </div>

                        {/*Get Started and Watch demo buttons*/}
                        <div className="flex items-center pr-8 py-8 gap-4">
                            <Link className={`${buttonStyles} text-xs bg-text-primary text-white flex justify-center gap-2 font-medium`} to="/login">
                                Get Started <ArrowRight className="w-4 h-4"/></Link>
                            <Link className={`${buttonStyles} text-xs bg-white text-text-primary flex justify-center gap-2 font-medium`} to="/demo">
                                <CirclePlay className="w-4 h-4"/>Watch Demo</Link>
                        </div>
                    </div>

                    {/*Image container*/}
                    <img className="rounded-md shadow-md" src="/src/assets/session.png" alt="EnterView Logo" />
                </div>
            </div>


            <div className="">
                <div className="text-center px-48 py-12">
                    <div>
                        <h2 className="text-text-primary text-2xl font-medium">Everything you need to conduct technical interviews</h2>

                    </div>
                    <p className={`${subTextStyle}`}>A complete platform designed for modern techincal hiring teams</p>
                </div>

            </div>

            {/* {Features Section} */}
            <div className="">
                <div className="grid grid-cols-3 gap-4">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div className="p-4 rounded-lg bg-white shadowed-md" >
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary rounded-xs"><Icon className="text-white"/></div>
                                    <h3 className="text-sm font-medium">{feature.title}</h3>
                                </div>

                                <p className={`${subTextStyle}`}>{feature.description}</p>
                            </div>)
                    })}
                </div>

            </div>

            {/*How it works Section*/}
            <div className="">
                <div className=" text-center">
                    <h2 className="text-text-primary text-2xl font-medium">How it works</h2>
                    <p className={`${subTextStyle}`}>Get started in minutes and transform your technical interview process</p>
                </div>

                {/*Steps Section*/}
                <div className="grid grid-cols-4">
                    {steps.map((step) => {
                        const Icon = step.icon
                        return (
                            <div className="p-4 rounded-lg bg-white shadowed-md">
                                <h1><Icon /></h1>
                                <h2>{step.title}</h2>
                                <p className={`${subTextStyle}`}>{step.description}</p>
                            </div>)
                    })}
                </div>

            </div>
        </div>
    )
}