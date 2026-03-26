import { type LucideIcon, Building2, User, Calendar, Clock4, Lock, CircleAlert  } from "lucide-react"
import { buttonStyles } from '../styles/shared'

type Interview = {
    position: string;
    org: string;
    interviewer: string;
    start: Date;
    end: Date;
    sessionID: string;
}

type Props = {
    interview: Interview;
}

function InfoCard({ interview }: Props) {
    const fields: { icon: LucideIcon; key: string; label: string }[] = [
        { icon: Building2, key: "org", label: "Orginazation" },
        { icon: User, key: "interviewer", label: "Interviewer" },
        { icon: Calendar, key: "start", label: "Date" },
        { icon: Clock4, key: "time", label: "Time", }
    ];

    const formattedDate = interview.start.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = `${interview.start.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    })} - ${interview.end.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    })}`;

    return (
        <div className="flex flex-col bg-neutral-100 rounded-2xl p-4 gap-4 items-center justify-center w-full">

            <div className="grid grid-cols-2 gap-4 items-center justify-center w-full">
                {fields.map((field) => {
                    const Icon = field.icon;
                    let val: string;

                    if (field.key == "start") {
                        val = formattedDate;
                    } else if (field.key == "time") {
                        val = formattedTime;
                    } else {
                        val = interview[field.key as keyof Interview] as string;
                    }
                    return (
                        <div className="flex gap-2" key={field.key}>
                            <div className="flex items-center justify-center bg-white border-border shadow-sm p-2 rounded-xl h-9 w-9">
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="text-xs text-gray-500">{field.label}</h3>
                                <span className="text-xs">{val}</span>
                            </div>
                        </div>

                    );
                })}
            </div>

            
            <div className="border-t border-gray-300 pt-4 mt-4 space-y-2 text-xs w-full">
                <div className="flex justify-between">
                    <span className="text-gray-500">Position:</span>
                    <span className="">{interview.position}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="">
                        {Math.round((interview.end.getTime() - interview.start.getTime()) / 60000)} minutes
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-500">Session ID:</span>
                    <span className="">{interview.sessionID}</span>
                </div>
            </div>
        </div>
    );

}

function MyForm() {
    return (

        <form className="flex flex-col text-xs">

            <div className="flex flex-col  py-4 gap-2">
                <label className="flex gap-1">
                    <Lock className="w-4 h-4" />
                    <span className="font-medium">Interview Password</span>
                </label>
            <input
                className="rounded-lg bg-gray-100 p-2" 
                id="password"
                type="password"
                placeholder="Enter one-time password"
                />

                <span className="text-[10px] text-gray-500 pb-1">This password was provided to you by the interviwer via email</span>
                <button className={`${buttonStyles} bg-black text-white text-xs  hover:opacity-90 transition-colors duration-300 cursor-pointer`}> Join Interview Session 	&gt; </button>

            </div>
        </form>
    )
}
export default function JoinSession() {

    const interview: Interview = {
        position: "Senior Frontend Engineer",
        org: "Coyote Inc.",
        interviewer: "John Smith",
        start: new Date("2024-02-22T14:00:00"),
        end: new Date("2024-02-22T15:00:00"),
        sessionID: "INT-2024-4872"
    }


    const subTextStyle = "text-xs";
    return (
        <div className="flex flex-col items-center justify-center w-screen h-screen bg-white font-['Inter']">
            <div className="flex items-center gap-2 p-8">
                <img className="w-8" src="/src/assets/logo.png" alt="EnterView Logo" />
                <h1 className="text-2xl pt-2 ">EnterView</h1>
            </div>

            <div className="flex flex-col w-full max-w-140 rounded-2xl bg-white border border-border shadow-xl px-5 pt-3 pb-10">
                <div className="flex flex-col items-center gap-2 pt-2 pb-8">
                    <div className="bg-blue-200 rounded-lg px-2 py-0.5">
                        <p className="text-[10px] font-semibold text-blue-600">Interview Session</p>
                    </div>
                    <h2 className="text-xl font-semibold">
                        {interview.position} Interview
                    </h2>
                    <p className={`${subTextStyle} text-gray-400`}>You've been invited to join this interview session</p>
                </div>

                <div className="border-b border-gray-300 pb-4">
                <InfoCard interview={interview} />
                <MyForm />

                <div className="flex gap-3 bg-blue-100 border border-blue-200 rounded-lg p-4">
                    <CircleAlert className="w-5 h-5  text-blue-700 font-bold"/>
                    <div className="flex flex-col text-[11px] gap-2 py-1">
                        <span className="text-xs font-semibold text-blue-900 ">Need help?</span>
                        <span className="text-blue-700">If you haven't received your interview password, please contact
                            <span className="text-[11px] font-bold">{` ${interview.interviewer}`}</span> or an interview coordinator</span>
                    </div>
                </div>

                </div>
            </div>
            <span className="text-xs text-gray-400 pt-4">Powered by EnterView • Secure Interview Platform</span>
        </div>
    )
}