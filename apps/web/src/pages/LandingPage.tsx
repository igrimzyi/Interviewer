import { Link } from "react-router-dom"
import { CodeXml, Users, ChartColumn, Calendar, Send, Video, CircleCheckBig, ArrowRight, CirclePlay, type LucideIcon } from "lucide-react"


/*TODO:
    -Make links move across sections of the page and other pages.
*/


type Card = {
    icon: LucideIcon;
    title: string;
    description: string;
}

export default function LandingPage() {

    {/*The data of the features containers*/}
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

    {/*The data of the steps container*/}
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

    const mainHeadingStyle = "text-center text-text-primary text-xl sm:text-2xl font-medium";
    const subTextStyle = "text-text-secondary text-xs sm:text-sm";

    return (
        <div className="grid grid-cols-1 place-content-center justify-center w-full">

            {/* {Top Section} */}
            <section className="px-4 py-10 sm:px-10">

                <div className="flex items-center flex-col md:flex-row justify-center px-2 gap-2 transition-all duration-300">

                    {/*Left container*/}
                    <div className="flex flex-col w-md sm:w-xl md:w-5xl">

                        <h1 className="text-3xl md:text-4xl font-medium text-text-primary" > EnterView</h1>



                        <p className={`${subTextStyle} sm:py-2 md:py-4 sm:mr-20`}>
                            The modern platform for hosting technical interviews.
                            Streamline your hiring process with powerful coding assessments,
                            real-time collaboration and coprehensive analytics.
                        </p>

                        {/*Get Started and Watch demo buttons*/}
                        <div className="flex items-center pr-48  py-4 gap-4">
                            <Link className="text-xs bg-text-primary text-white  flex justify-center items-center gap-1 font-semibold rounded-md w-32 h-8 py-2 px-2 hover:opacity-90 transition-colors duration-300" to="/login">
                                Get Started <ArrowRight className="size-4" /></Link>
                            <Link className="text-xs bg-white text-text-primary  flex justify-center items-center gap-1 font-semibold rounded-md w-32 h-8 py-2 px-2 hover:opacity-90 transition-colors duration-300" to="/demo">
                                <CirclePlay className="size-4" />Watch Demo</Link>
                        </div>



                    </div>

                    {/*Image container*/}
                    <div className="relative w-md sm:w-xl md:w-2xl lg:w-4xl transition-all duration-300">
                        <img className="rounded-md shadow-xl object-cover h-full w-full" src="/src/assets/session.png" alt="EnterView Logo" />
                        <div className="absolute -bottom-4 -right-4 flex items-center rounded-md bg-white shadow-lg px-4 py-2 gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <h3 className="text-text-secondary text-xs">Live interview in progress</h3>
                        </div>
                    </div>
                </div>

            </section>




            {/* {Features Section} */}
            <section>

                <div className="flex flex-col items-center justify-center py-8">
                    <h2 className={`${mainHeadingStyle}`}>Everything you need to conduct technical interviews</h2>
                    <p className={`${subTextStyle}`}>A complete platform designed for modern techincal hiring teams</p>
                </div>



                <div className="flex flex-col py-12 sm:flex-row sm:justify-center gap-4 px-10 ">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div key={feature.title} className="flex flex-col px-4 py-4 rounded-lg  bg-white shadowed-md" >

                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 flex items-center justify-center bg-primary rounded-xl">
                                        <Icon className="h-4 w-4 text-white " />
                                    </div>
                                    <h3 className="text-xs font-semibold">{feature.title}</h3>
                                </div>

                                <p className={`${subTextStyle} pt-4 w-auto max-w-xs`}>{feature.description}</p>
                            </div>)
                    })}
                </div>
            </section>


            {/*How it works Section*/}
            <section id="how-it-works" className="bg-border py-4 w-full">
                <div className="mx-auto max-w-6xl px-4">
                    <h2 className={`${mainHeadingStyle}`}>
                        How it works
                    </h2>
                    <p className={`${subTextStyle} mt-2 text-center`}>Get started in minutes and transform your technical interview process</p>

                    <div className="relative mt-10">

                        <div className="w-auto sm:px-18 md:px-20 lg:px-26 hidden sm:block">
                            {/*Line behind icons*/}
                            <div className="absolute sm:w-5/6 md:w-4/5 top-7 hidden h-0.5  bg-slate-300 md:block" />
                        </div>
                        {/*Steps Section*/}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                            {steps.map((step) => {
                                const Icon = step.icon
                                return (
                                    <div className="flex flex-col items-center text-center">



                                        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-sm">
                                            <Icon className="text-white h-6 w-6" />
                                        </div>
                                        <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                                        <p className="mt-2 max-w-[18rem] text-xs leading-relaxed text-text-secondary">{step.description}</p>
                                    </div>)
                            })}
                        </div>
                    </div>
                </div>
            </section>


        </div>
    )
}