"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bug,
  Building2,
  ChartArea,
  Home,
  Medal,
  Settings,
  SquareStack,
} from "lucide-react"

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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { ModeToggle } from "./theme-toggle"


const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Bugs",
    url: "/bugs",
    icon: Bug,
  },
  {
    title: "Jenkins Build Data",
    url: "/jenkins",
    icon: Building2,
  },
  {
    title: "CRT",
    url: "/crt",
    icon: ChartArea,
  },
  {
    title: "PR Leaderboard",
    url: "/leaderboard",
    icon: Medal,
  },
  {
    title: "Sprint Tracker",
    url: "/sprint-tracker",
    icon: SquareStack,
  },
]

const adminItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded bg-gradient-to-r from-red-500/70 via-blue-950/50 to-blue-500/30" />
          <span className="font-bold">QA Metric Monitor</span>
        </div>

        
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Admin Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
