import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Plus, Home, Compass, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"
import { signOut } from "firebase/auth"
import { ModeToggle } from "./toggle-mode"
import { useSession } from "@/AuthContext"
import { useRouter } from "next/navigation"
const items = [
    {
        title: "Home",
        url: "/itinerary",
        icon: Home,
    },
    {
        title: "Discover",
        url: "/itinerary/discover",
        icon: Compass,
    },
    {
        title: "Add Itinerary",
        url: "/itinerary/create",
        icon: Plus,
    }
]

export function AppSidebar() {
    return (
        <Sidebar variant="floating" collapsible="icon" >
            <SidebarHeader>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        <Link href="/itinerary" className="text-2xl mb-4">
                            Buckle Up
                        </Link>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon size={32} />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter >
                <ModeToggle />
                {/* <Button onClick={handleLogout} variant="outline" >Log out</Button> */}
            </SidebarFooter>

        </Sidebar>
    )
}
//   <nav className='p-6 flex justify-between'>
// <Button asChild variant="link">
// <Link href="/itinerary">
//     <h1 className='text-4xl'>
//         Buckle Up
//     </h1>
// </Link>
// </Button>

// <div className='flex gap-6'>
// <Button asChild>
//     <Link href="/itinerary/create">+ New Itinerary</Link>
// </Button>
// <Button asChild>
//     <Link href="/itinerary/discover">Discover More</Link>
// </Button>
// <Button onClick={signOut()} variant="outline" >Log out</Button>
// <ModeToggle />
// </div>
// </nav>