import { Calendar, Home, Inbox, Search, Settings, Bug, ChartArea, Medal, SquareStack } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ModeToggle } from "./theme-toggle"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Bugs",
    url: "bugs",
    icon: Bug,
  },
  {
    title: "CRT Analysis",
    url: "#",
    icon: ChartArea,
  },
  {
    title: 'TFS Leaderboard', 
    url: 'leaderboard', 
    icon: Medal,
  },
  {
    title: 'Sprint Tracker', 
    url: 'sprint-tracker', 
    icon: SquareStack,
  },
  {
    title: "Settings",
    url: "settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarContent>
            <SidebarFooter>
                <ModeToggle />
            </SidebarFooter>
        </SidebarContent>
      </SidebarContent>
    </Sidebar>
  )
}
