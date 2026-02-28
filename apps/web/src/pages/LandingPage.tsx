import { Link } from "react-router-dom"
import { buttonStyles } from "../styles/shared"
import { CodeXml, Users, ChartColumn, type LucideIcon } from "lucide-react"

type Card = {
    icon: LucideIcon;
    title: string;
    description: string;
}

export default function LandingPage() {

    const features: Card[] = [
        {
            icon: CodeXml,
            title: "",
            description: ""
        },
        {
            icon: Users,
            title: "",
            description: ""
        },
        {
            icon: ChartColumn,
            title: "",
            description: ""
        }
    ]

    const Test = features[0].icon;
    const subTextStyle = "text-text-secondary text-xs"
    return (
        <div className="grid grid-cols-1cols-1 items-center justify-center px-12">

            {/* {Top container} */}
            <div className="">
                <div className="grid grid-cols-2 py-24 gap-8">
                    <div>
                        <div>
                            <h1 className="text-4xl font-medium text-text-primary"> <Test /> EnterView</h1>
                        </div>
                        <div className={`${subTextStyle}`}>
                            <p>
                                The modern platform for hosting technical interviews.
                                Streamline your hiring process with powerful coding assessments,
                                real-time collaboration and coprehensive analytics.
                            </p>
                        </div>
                        {/*Get Started and Watch demo buttons*/}
                        <div>
                            <Link className={`${buttonStyles} bg-border text-text-primary`} to="/signup">Get Started </Link>
                            <Link className={`${buttonStyles} bg-border text-text-primary`} to="/demo"> Watch Demo</Link>
                        </div>
                    </div>

                    {/*Image container*/}
                    <img className="rounded-md shadow-md" src="/src/assets/session.png" alt="EnterView Logo" />
                </div>
            </div>

            {/* {middle container} */}
            <div className="">
                <div className="text-center px-48 py-12">
                    <div>
                        <h2 className="text-text-primary text-2xl font-medium">Everything you need to conduct technical interviews</h2>

                    </div>
                    <p className={`${subTextStyle}`}>A complete platform designed for modern techincal hiring teams</p>
                </div>

            </div>

            {/* {Cards container} */}
            <div className="">
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg">
                        <h2>Live coding Enviorment</h2>

                        <p className={`${subTextStyle}`}>Provide candidates with a real-time coding environment supporting
                            40+ programming languages with syntax highlighting and auto-completion.</p>
                    </div>
                    <div className="p-4 rounded-lg" >
                        <h2>Collaborative Interviews</h2>
                        <p className={`${subTextStyle}`}>Enable multiple interviewers to join sessions, share notes, and
                            evaluate candidates together in real-time.</p>
                    </div>
                    <div className=" p-4 rounded-lg">
                        <h2>Advanced Analytics</h2>
                        <p className={`${subTextStyle}`}>Track interview performance, compare candidates, and make data-driven
                            hiring decisions with comprehensive analytics.</p>
                    </div>
                </div>

            </div>

            {/*How it works Section*/}
            <div className="">
                <div className=" text-center">
                    <h2 className="text-text-primary text-2xl font-medium">How it works</h2>
                    <p className={`${subTextStyle}`}>Get started in minutes and transform your technical interview process</p>
                </div>
                <div>
                    <p>icons</p>
                </div>


            </div>
        </div>
    )
}