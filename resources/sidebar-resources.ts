import {
    Bug,
    Building2,
    ChartArea,
    CircuitBoard,
    Home,
    Medal,
    Settings,
    SquareStack,
  } from "lucide-react"


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

  const bugPageItems = [
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
    {
        title: "Query Builder",
        url: "/query-builder",
        icon: CircuitBoard
    }
  ]


  export {
    items, 
    adminItems,
    bugPageItems
  }
  