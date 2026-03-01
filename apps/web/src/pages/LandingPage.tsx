import { Link } from "react-router-dom"
import { CodeXml, Users, ChartColumn, Calendar, Send, Video, CircleCheckBig, ArrowRight, CirclePlay, type LucideIcon } from "lucide-react"


/*TODO:
-Make ui and navbar responsive across various screens.
-Make links move across sections of the page.
-Fix padding and sizing of buttons for top, middle and bottom section.
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
    const subTextStyle = "text-text-secondary sm:text-sm"

    return (
        <div className="grid grid-cols-1 place-content-center justify-center w-full">

            {/* {Top Section} */}
            <section className="sm:px-10">

                <div className="grid grid-cols-1 sm:grid-cols-2 items-center py-4 sm:py-8 md:py-16 lg:py-20">

                    <div className="grid grid-cols-1 sm:pr-[2vw] ">

                        <div className="">
                            <div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-text-primary"> EnterView</h1>
                            </div>

                            <div className={`${subTextStyle} sm:py-2 md:py-4`}>
                                <p>
                                    The modern platform for hosting technical interviews.
                                    Streamline your hiring process with powerful coding assessments,
                                    real-time collaboration and coprehensive analytics.
                                </p>
                            </div>

                            {/*Get Started and Watch demo buttons*/}
                            <div className="flex pr-48  py-4 gap-4">
                                <Link className="text-xs bg-text-primary text-white  flex justify-center items-center gap-1 font-semibold rounded-md sm:w-32 sm:h-8 py-2 px-2 hover:opacity-90 transition-colors duration-300" to="/login">
                                    Get Started <ArrowRight className="size-4" /></Link>
                                <Link className="text-xs bg-white text-text-primary  flex justify-center items-center gap-1 font-semibold rounded-md sm:w-32 sm:h-8 py-2 px-2 hover:opacity-90 transition-colors duration-300" to="/demo">
                                    <CirclePlay className="size-4" />Watch Demo</Link>
                            </div>
                        </div>




                    </div>

                    {/*Image container*/}
                    <div className="relative sm:w-xl md:w-">
                        <img className="rounded-md shadow-xl object-cover" src="/src/assets/session.png" alt="EnterView Logo" />
                        <div className="absolute -bottom-4 -right-4 flex items-center rounded-md bg-white shadow-lg px-4 py-2 gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <h3 className="text-text-secondary sm:text-xs">Live interview in progress</h3>
                        </div>
                    </div>
                </div>

            </section>


            <div >
                <div className="text-center sm:px-[20vw] sm:py-[5vw]">
                    <div>
                        <h2 className="text-text-primary sm:text-2xl font-medium">Everything you need to conduct technical interviews</h2>
                    </div>
                    <p className={`${subTextStyle}`}>A complete platform designed for modern techincal hiring teams</p>
                </div>

            </div>

            {/* {Features Section} */}
            <section>
                <div className="mx-auto max-w-6xl px-4 py-10">
                    <div className="grid sm:grid-cols-3 gap-6">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div key={feature.title} className="sm:p-6 rounded-lg bg-white shadowed-md" >

                                    <div className="flex items-center gap-3">
                                        <div className="sm:h-10 sm:w-10 flex items-center justify-center bg-primary rounded-xl">
                                            <Icon className="h-5 w-5 text-white " />
                                        </div>
                                        <h3 className="text-base font-semibold">{feature.title}</h3>
                                    </div>

                                    <p className="mt-3 text-sm leading-relaxed text-text-secondary">{feature.description}</p>
                                </div>)
                        })}
                    </div>

                </div>
            </section>


            {/*How it works Section*/}
            <section id="how-it-works" className="bg-border py-4 w-full">
                <div className="mx-auto max-w-6xl px-4">
                    <h2 className="text-center sm:text-3xl font-semibold">
                        How it works
                    </h2>
                    <p className={`${subTextStyle} mt-2 text-center`}>Get started in minutes and transform your technical interview process</p>

                    <div className="relative mt-10">
                        {/*Line behind icons*/}
                        <div className="absolute left-25 top-7 hidden h-0.5  bg-slate-300 w-4xl shadow-2xl sm:block" />

                        {/*Steps Section*/}
                        <div className="grid sm:grid-cols-4 gap-10">
                            {steps.map((step) => {
                                const Icon = step.icon
                                return (
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-sm">
                                            <Icon className="text-white h-6 w-6" />
                                        </div>
                                        <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                                        <p className="mt-2 max-w-[18rem] text-xs leading-relaxed text-slate-500">{step.description}</p>
                                    </div>)
                            })}
                        </div>
                    </div>
                </div>
            </section>


        </div>
    )
}