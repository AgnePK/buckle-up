import { Plus, Home, Compass, FerrisWheel, Music4, BedDouble, ChevronDown, Menu } from "lucide-react"
import Link from "next/link"
import { Button } from "../components/ui/button"
import { signOut } from "firebase/auth"
import { ModeToggle } from "../components/toggle-mode"
import { useSession } from "@/AuthContext"
import { useRouter } from "next/navigation"
import Image from "next/image"
import logo from "@/public/icon-512-svg.svg"

import { usePathname } from "next/navigation";

import { Url } from "next/dist/shared/lib/router/router";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet"

import { useState } from "react"

const dropdownItems = [
    {
        title: "BnBs",
        url: "/itinerary/discover/bnbs",
    },
    {
        title: "Attractions",
        url: "/itinerary/discover/attractions",
    },
    {
        title: "Events",
        url: "/itinerary/discover/events",
    },
]


export function NavBar() {

    const { user, signOut } = useSession();
    const router = useRouter()

    // isActive is inspired by 
    // https://dev.to/easyvipin/nextjs-tutorial-adding-navbar-with-active-styling-in-a-server-component-layout-5h68
    const pathname = usePathname()

    const isActive = (path: Url) => pathname === path;

    // Handle routing in mobile menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const handleMobileNavigation = (url: string) => {
        router.push(url);
        setIsMobileMenuOpen(false);
    }

    const handleLogout = async () => {
        await signOut();
        router.replace("/signIn");
    };

    return (
        <nav className="p-4 mx-2 md:mx-6 flex justify-between items-center md:pb-8">
            {/* Logo - visible on all screen sizes */}
            <div className="flex gap-3 items-center  md:relative   rounded-2xl">
                <Image
                    alt="Buckle Up logo"
                    src={logo}
                    width={60}
                    style={{
                        maxWidth: "100%",
                        height: "auto",
                    }}
                    onClick={() => { router.push("/itinerary") }}
                />
                <Link href="/itinerary" className="text-2xl font-medium hidden text-primary  sm:block">
                    Buckle Up
                </Link>
            </div>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center gap-10 bg-muted/80 px-6 py-4 rounded-xl">
                <li>
                    <Link href={"/itinerary"}
                        className={`${isActive("/itinerary") ? " text-primary " : ""}`}>
                        My Itineraries
                    </Link>
                </li>
                <li>
                    <Link
                        href={"/itinerary/create"}
                        className={`flex items-center  gap-2 ${isActive("/itinerary/create") ? " text-primary " : ""}`}>
                        Create Itinerary
                        <Plus size={20} />
                    </Link>
                </li>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="items-center">
                        <div className="flex gap-2 items-center cursor-pointer">
                            <p>Discover</p>
                            <ChevronDown className="pt-1 ms-1" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className=" bg-muted border-none">
                        {dropdownItems.map((item) => (
                            <DropdownMenuItem key={item.title} className="text-center" onClick={() => router.push(item.url)}>
                                {item.title}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <li>
                    <Link href={"/itinerary/saved"}
                        className={`${isActive("/itinerary/saved") ? " text-primary " : ""}`}>
                        Saved Places
                    </Link>
                </li>
            </ul>

            {/* Right section with theme toggle and logout button */}
            <div className="flex gap-4  items-center">
                {/* Theme toggle - hidden on small mobile */}
                <div className="hidden sm:block ">
                    <ModeToggle />
                </div>

                {/* Logout button - visible on medium screens and above */}
                <div className="hidden md:block">
                    <Button onClick={handleLogout} variant="outline" className="bg-muted border-none">Log out</Button>
                </div>

                {/* Mobile menu button - visible on medium screens and below */}
                <Sheet>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" aria-label="Menu">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                        <SheetHeader className="mb-6">
                            <SheetTitle className="text-2xl text-primary">Buckle Up</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col gap-6 px-6">
                            {/* Mobile navigation links */}
                            <SheetClose asChild>
                                <Link
                                    href="/itinerary"
                                    className={`flex items-center text-lg ${isActive("/itinerary") ? "text-primary font-medium" : ""}`}
                                >
                                    <Home className="mr-2 h-5 w-5" />
                                    My Itineraries
                                </Link>
                            </SheetClose>

                            <div className="flex flex-col gap-3 ">
                                <p className="text-lg flex items-center">
                                    <Compass className="mr-2 h-5 w-5" />
                                    Discover
                                </p>
                                {dropdownItems.map((item) => {
                                    return (
                                        <SheetClose key={item.title} asChild>
                                            <Link
                                                href={item.url}
                                                className={`flex pl-7 items-center ${isActive(item.url) ? "text-primary font-medium" : ""}`}
                                            >
                                                {item.title}
                                            </Link>
                                        </SheetClose>
                                    );
                                })}
                            </div>

                            <SheetClose asChild>
                                <Link
                                    href="/itinerary/saved"
                                    className={`flex items-center text-lg ${isActive("/itinerary/saved") ? "text-primary font-medium" : ""}`}
                                >
                                    <BedDouble className="mr-2 h-5 w-5" />
                                    Saved Places
                                </Link>
                            </SheetClose>

                            {/* Theme toggler in mobile menu */}
                            <div className="flex items-center text-lg">
                                <div className="mr-2">
                                    <ModeToggle />
                                </div>
                                Theme
                            </div>

                            {/* Logout button in mobile menu */}
                            <Button onClick={handleLogout} variant="outline" className="bg-muted border-none">Log out</Button>

                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    )
}
// Moved the sidebar into app so that i can use the useSession.
// Will not work outside of AuthContext (in the components folder)