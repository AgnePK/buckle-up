import { Plus, Home, Compass, FerrisWheel, Music4, BedDouble, BookmarkCheck, ChevronDown } from "lucide-react"
import Link from "next/link"
import { Button } from "../components/ui/button"
import { signOut } from "firebase/auth"
import { ModeToggle } from "../components/toggle-mode"
import { useSession } from "@/AuthContext"
import { useRouter } from "next/navigation"
import Image from "next/image"
import logo from "@/public/logo-dark.png"

import { usePathname } from "next/navigation";

import { Url } from "next/dist/shared/lib/router/router";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const dropdownItems = [
    {
        title: "BnBs",
        url: "/itinerary/discover/bnbs",
        icon: BedDouble,
    },
    {
        title: "Attractions",
        url: "/itinerary/discover/attractions",
        icon: FerrisWheel,
    },
    {
        title: "Events",
        url: "/itinerary/discover/events",
        icon: Music4,
    },
]


export function AppSidebar() {

    const { user, signOut } = useSession();
    const router = useRouter()

    // isActive is inspired by 
    // https://dev.to/easyvipin/nextjs-tutorial-adding-navbar-with-active-styling-in-a-server-component-layout-5h68
    const pathname = usePathname()
    const isActive = (path: Url) => pathname === path;

    const handleLogout = async () => {
        await signOut();
        router.replace("/signIn");
    };

    return (
        <nav className="p-2 mx-12 md:pb-8 flex justify-between items-center">
            <div className="flex gap-3  items-center">
                <Image
                    alt="Vercel logo"
                    src={logo}
                    width={50}

                    style={{
                        maxWidth: "100%",
                        height: "auto",
                    }}
                />
                <Link href="/itinerary" className="text-2xl mb-4">
                    Buckle Up
                </Link>
            </div>

            <ul className="flex justify-end items-center gap-10 bg-card px-6 py-4 rounded-4xl">
                <li>
                    <Link href={"/itinerary"}
                        className={`${isActive("/itinerary") ? "text-primary" : ""}`}>
                        Home
                    </Link>
                </li>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="items-center">
                        <div className="flex gap-2 items-center">
                            <ChevronDown />
                            Discover
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {dropdownItems.map((item) => (
                            <DropdownMenuItem key={item.title} onClick={() => router.push(item.url)}>
                                {item.title}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <li>
                    <Link href={"/itinerary/saved"}
                        className={`${isActive("/itinerary/saved") ? "text-primary" : ""}`}>
                        Saved Places
                    </Link>
                </li>
            </ul>
            <div className=" flex gap-3">
                <ModeToggle />
                <Button onClick={handleLogout} variant="outline" >Log out</Button>
            </div>
        </nav>

    )
}
// Moved the sidebar into app so that i can use the useSession.
// Will not work outside of AuthContext (in the components folder)