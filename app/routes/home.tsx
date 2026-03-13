import { Airplay, Cog, HandCoins, ListTodo } from "lucide-react";
import { Link } from "react-router";

const items = [
    {
        to: "/t",
        label: "POS",
        Icon: HandCoins,
    },
    {
        to: "/o",
        label: "OBSERVE",
        Icon: Airplay,
    },
    {
        to: "/a",
        label: "ADMIN",
        Icon: Cog,
    },
    {
        to: "/i",
        label: "INVENTORY",
        Icon: ListTodo,
    },
];

export default function HomePage() {
    return (
        <div className="min-h-screen bg-stone-100 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col justify-center">
                <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {items.map(({ to, label, Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className="
                                flex aspect-square min-h-[140px] flex-col items-center justify-center
                                rounded-2xl bg-white p-4 text-blue-500 shadow-sm transition
                                hover:-translate-y-1 hover:shadow-md
                                active:scale-[0.98]
                            "
                        >
                            <Icon className="mb-3 h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20" />
                            <span className="text-sm font-semibold tracking-wide sm:text-base">
                                {label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}