import { useNuxtApp } from "#app"
import type { GroupMenu } from "#fishtvue/menu"
import type { IColumn } from "#fishtvue/table"
import type { Panel } from "#fishtvue/split"

export const menuGroups = (): GroupMenu[] => {
  const { $i18n } = useNuxtApp()
  const { t } = $i18n
  return [
    {
      class: "h-[calc(85vh-167px)]",
      items: [
        // {
        //     title: t("start.menu.Home"),
        //     icon: "lucide:home",
        //     to: "/",
        // },
        {
          title: t("start.menu.Cards"),
          icon: "lucide:layout-grid",
          to: "/cards"
        },
        {
          title: t("start.menu.Inbox"),
          icon: "lucide:inbox",
          to: "/inbox"
        },
        {
          title: t("start.menu.Customers"),
          icon: "lucide:users",
          to: "/customers"
        },
        {
          title: t("start.menu.Chat"),
          icon: "lucide:message-circle",
          to: "/chat"
        }
        // {
        //     title: t("start.menu.Settings"),
        //     icon: "lucide:settings",
        //     to: "/settings"
        // }
      ]
    }
  ]
}
export type Features = Partial<Record<"icon" | "iconColor" | "bg" | "title" | "description" | "link", string>>
export const features = (): Features[] => {
  const { $i18n } = useNuxtApp()
  const { t } = $i18n
  return [
    {
      icon: "mdi:view-grid-plus",
      iconColor: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/70",
      title: t("start.features.Components.title"),
      description: t("start.features.Components.description"),
      link: "/components/components"
    },
    {
      icon: "tabler:palette",
      iconColor: "text-pink-500",
      bg: "bg-pink-50 dark:bg-pink-950/70",
      title: t("start.features.Design.title"),
      description: t("start.features.Design.description"),
      link: "/configuration/theming"
    },
    {
      icon: "mdi:accessibility",
      iconColor: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/70",
      title: t("start.features.Accessibility.title"),
      description: t("start.features.Accessibility.description"),
      link: "/gettingstarted/accessibility#wai-aria"
    },
    {
      icon: "meteor-icons:language",
      iconColor: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-950/70",
      title: t("start.features.Internationalization.title"),
      description: t("start.features.Internationalization.description"),
      link: "/configuration/internationalization"
    },
    {
      icon: "mdi:emoticon-outline",
      iconColor: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/70",
      title: t("start.features.Icons.title"),
      description: t("start.features.Icons.description"),
      link: "/components/misc/icons"
    },
    {
      icon: "mdi:speedometer",
      iconColor: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/70",
      title: t("start.features.Performance.title"),
      description: t("start.features.Performance.description")
    },
    {
      icon: "mdi:cellphone",
      iconColor: "text-teal-500",
      bg: "bg-teal-50 dark:bg-teal-950/70",
      title: t("start.features.Mobile.title"),
      description: t("start.features.Mobile.description")
    },
    {
      icon: "mdi:language-typescript",
      iconColor: "text-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-950/70",
      title: t("start.features.TypeScript.title"),
      description: t("start.features.TypeScript.description")
    }
  ]
}
export const chatPanels = (): Panel[] => {
  return [
    {
      name: "chats",
      size: 30,
      minSize: 20
    },
    {
      name: "chat",
      minSize: 50
    }
  ]
}

export type Chat = {
  name: string
  avatar: string
  message: string
  time: string
  isOnline: boolean
  newMessages: number
}
export const chatsData = (): Chat[] => {
  const { $i18n } = useNuxtApp()
  const { t } = $i18n
  return [
    {
      name: t("start.name.Fisht_Team"),
      avatar: "logo.png",
      message: t("start.message.Fisht_Team"),
      time: "12:30",
      isOnline: false,
      newMessages: 3
    },
    {
      name: t("start.name.Emma_Wilson"),
      avatar: "Emma_Wilson.jpg",
      message: t("start.message.Emma_Wilson"),
      time: "12:30",
      isOnline: true,
      newMessages: 3
    },
    {
      name: t("start.name.James_Chen"),
      avatar: "James_Chen.jpg",
      message: t("start.message.James_Chen"),
      time: "11:45",
      isOnline: true,
      newMessages: 0
    },
    {
      name: t("start.name.Sophia_Rodriguez"),
      avatar: "Sophia_Rodriguez.jpg",
      message: t("start.message.Sophia_Rodriguez"),
      time: "10:15",
      isOnline: false,
      newMessages: 1
    },
    {
      name: t("start.name.Lucas_Miller"),
      avatar: "Lucas_Miller.jpg",
      message: t("start.message.Lucas_Miller"),
      time: "09:50",
      isOnline: true,
      newMessages: 2
    },
    {
      name: t("start.name.Olivia_Brown"),
      avatar: "Olivia_Brown.jpg",
      message: t("start.message.Olivia_Brown"),
      time: t("start.time.Yesterday"),
      isOnline: false,
      newMessages: 0
    },
    {
      name: t("start.name.Ava_Johnson"),
      avatar: "Ava_Johnson.jpg",
      message: t("start.message.Ava_Johnson"),
      time: t("start.time.Yesterday"),
      isOnline: false,
      newMessages: 5
    },
    {
      name: t("start.name.Ethan_Davis"),
      avatar: "Ethan_Davis.jpg",
      message: t("start.message.Ethan_Davis"),
      time: t("start.time.Yesterday"),
      isOnline: true,
      newMessages: 0
    },
    {
      name: t("start.name.Isabella_Garcia"),
      avatar: "Isabella_Garcia.jpg",
      message: t("start.message.Isabella_Garcia"),
      time: t("start.time.Monday"),
      isOnline: false,
      newMessages: 0
    },
    {
      name: t("start.name.Mason_Thompson"),
      avatar: "Mason_Thompson.jpg",
      message: t("start.message.Mason_Thompson"),
      time: t("start.time.Monday"),
      isOnline: true,
      newMessages: 1
    },
    {
      name: t("start.name.Charlotte_Lee"),
      avatar: "Charlotte_Lee.jpg",
      message: t("start.message.Charlotte_Lee"),
      time: t("start.time.Sunday"),
      isOnline: false,
      newMessages: 0
    },
    {
      name: t("start.name.Alexander_Wright"),
      avatar: "Alexander_Wright.jpg",
      message: t("start.message.Alexander_Wright"),
      time: t("start.time.Sunday"),
      isOnline: true,
      newMessages: 2
    },
    {
      name: t("start.name.Mia_Martinez"),
      avatar: "Mia_Martinez.jpg",
      message: t("start.message.Mia_Martinez"),
      time: t("start.time.Saturday"),
      isOnline: false,
      newMessages: 0
    },
    {
      name: t("start.name.Daniel_Anderson"),
      avatar: "Daniel_Anderson.jpg",
      message: t("start.message.Daniel_Anderson"),
      time: t("start.time.Saturday"),
      isOnline: true,
      newMessages: 0
    },
    {
      name: t("start.name.Sophie_Turner"),
      avatar: "Sophie_Turner.jpg",
      message: t("start.message.Sophie_Turner"),
      time: t("start.time.Friday"),
      isOnline: false,
      newMessages: 3
    },
    {
      name: t("start.name.David_Kim"),
      avatar: "David_Kim.jpg",
      message: t("start.message.David_Kim"),
      time: t("start.time.Friday"),
      isOnline: true,
      newMessages: 0
    },
    {
      name: t("start.name.Emily_White"),
      avatar: "Emily_White.jpg",
      message: t("start.message.Emily_White"),
      time: t("start.time.Thursday"),
      isOnline: false,
      newMessages: 1
    },
    {
      name: t("start.name.Michael_Scott"),
      avatar: "Michael_Scott.jpg",
      message: t("start.message.Michael_Scott"),
      time: t("start.time.Thursday"),
      isOnline: true,
      newMessages: 4
    }
  ]
}
export type Message = {
  name: string
  avatar: string
  message: string
  time: string
  isMe: boolean
}
export const activeChat = (): Message[] => {
  const { $i18n } = useNuxtApp()
  const { t } = $i18n
  return [
    {
      name: t("start.name.William_Taylor"),
      avatar: "William_Taylor.jpg",
      message: t("start.activeChat.10:00"),
      time: "10:00",
      isMe: true
    },
    {
      name: t("start.name.Emma_Wilson"),
      avatar: "Emma_Wilson.jpg",
      message: t("start.activeChat.10:02"),
      time: "10:02",
      isMe: false
    },
    {
      name: t("start.name.James_Chen"),
      avatar: "James_Chen.jpg",
      message: t("start.activeChat.10:03"),
      time: "10:03",
      isMe: false
    },
    {
      name: t("start.name.Sophia_Rodriguez"),
      avatar: "Sophia_Rodriguez.jpg",
      message: t("start.activeChat.10:05"),
      time: "10:05",
      isMe: false
    },
    {
      name: t("start.name.Lucas_Miller"),
      avatar: "Lucas_Miller.jpg",
      message: t("start.activeChat.10:07"),
      time: "10:07",
      isMe: false
    },
    {
      name: t("start.name.Olivia_Brown"),
      avatar: "Olivia_Brown.jpg",
      message: t("start.activeChat.10:08"),
      time: "10:08",
      isMe: false
    },
    {
      name: t("start.name.Fisht_Team"),
      avatar: "logo.png",
      message: t("start.activeChat.10:10"),
      time: "10:10",
      isMe: false
    },
    {
      name: t("start.name.William_Taylor"),
      avatar: "William_Taylor.jpg",
      message: t("start.activeChat.10:12"),
      time: "10:12",
      isMe: true
    },
    {
      name: t("start.name.Emma_Wilson"),
      avatar: "Emma_Wilson.jpg",
      message: t("start.activeChat.10:15"),
      time: "10:15",
      isMe: false
    },
    {
      name: t("start.name.William_Taylor"),
      avatar: "William_Taylor.jpg",
      message: t("start.activeChat.10:17"),
      time: "10:17",
      isMe: true
    }
  ]
}

export const mailsPanels = (): Panel[] => {
  return [
    {
      name: "menu",
      size: 200,
      minSize: 80,
      maxSize: 200
    },
    {
      name: "mails",
      minSize: 312
    },
    {
      name: "mail",
      minSize: 380
    }
  ]
}

export const menuMails = (): GroupMenu[] => {
  const { $i18n } = useNuxtApp()
  const { t } = $i18n
  return [
    {
      // title: "Navigation",
      items: [
        {
          title: t("start.menu.Inbox"),
          icon: "lucide:inbox",
          info: "140"
        },
        {
          title: t("start.menu.Starry"),
          icon: "lucide:star",
          info: "5"
        },
        {
          title: t("start.menu.Drafts"),
          icon: "lucide:file",
          info: "9"
        },
        {
          title: t("start.menu.Important"),
          icon: "lucide:alert-circle"
        },
        {
          title: t("start.menu.Sent"),
          icon: "lucide:send"
        },
        {
          title: t("start.menu.Archive"),
          icon: "lucide:archive"
        },
        {
          title: t("start.menu.Spam"),
          icon: "lucide:alert-triangle"
        },
        {
          title: t("start.menu.Trash"),
          icon: "lucide:trash-2"
        }
      ]
    }
  ]
}
type Mail = {
  name: string
  email: string
  avatar: string
  title: string
  text: string
  time: string
  timeFull: string
  tags: string[]
}
export const dataMails = (): Mail[] => {
  const { $i18n } = useNuxtApp()
  const { t } = $i18n
  return [
    {
      name: t("start.name.Fisht_Team"),
      email: "team@fisht.io",
      avatar: "logo.png",
      title: t("start.mailsTitle.Fisht_Team"),
      text: t("start.mailsText.Fisht_Team"),
      time: "10:00 AM",
      timeFull: "Oct 22, 2023, 10:00:00 AM",
      tags: [t("start.tags.important"), t("start.tags.work")]
    },
    {
      name: t("start.name.Emma_Wilson"),
      email: "emma.wilson@company.com",
      avatar: "Emma_Wilson.jpg",
      title: t("start.mailsTitle.Emma_Wilson"),
      text: t("start.mailsText.Emma_Wilson"),
      time: "9:45 AM",
      timeFull: "Oct 22, 2023, 9:45:00 AM",
      tags: [t("start.tags.work")]
    },
    {
      name: t("start.name.James_Chen"),
      email: "james.chen@company.com",
      avatar: "James_Chen.jpg",
      title: t("start.mailsTitle.James_Chen"),
      text: t("start.mailsText.James_Chen"),
      time: "9:30 AM",
      timeFull: "Oct 22, 2023, 9:30:00 AM",
      tags: [t("start.tags.work"), t("start.tags.urgent")]
    },
    {
      name: t("start.name.Sophia_Rodriguez"),
      email: "sophia.r@company.com",
      avatar: "Sophia_Rodriguez.jpg",
      title: t("start.mailsTitle.Sophia_Rodriguez"),
      text: t("start.mailsText.Sophia_Rodriguez"),
      time: t("start.time.Yesterday"),
      timeFull: "Oct 21, 2023, 10:00:00 AM",
      tags: [t("start.tags.design")]
    },
    {
      name: t("start.name.Lucas_Miller"),
      email: "lucas.m@company.com",
      avatar: "Lucas_Miller.jpg",
      title: t("start.mailsTitle.Lucas_Miller"),
      text: t("start.mailsText.Lucas_Miller"),
      time: t("start.time.Yesterday"),
      timeFull: "Oct 21, 2023, 2:00:00 PM",
      tags: [t("start.tags.work")]
    },
    {
      name: t("start.name.Olivia_Brown"),
      email: "olivia.b@company.com",
      avatar: "Olivia_Brown.jpg",
      title: t("start.mailsTitle.Olivia_Brown"),
      text: t("start.mailsText.Olivia_Brown"),
      time: t("start.time.days2"),
      timeFull: "Oct 20, 2023, 11:30:00 AM",
      tags: [t("start.tags.important")]
    },
    {
      name: t("start.name.Ava_Johnson"),
      email: "ava.j@company.com",
      avatar: "Ava_Johnson.jpg",
      title: t("start.mailsTitle.Ava_Johnson"),
      text: t("start.mailsText.Ava_Johnson"),
      time: t("start.time.days2"),
      timeFull: "Oct 20, 2023, 3:15:00 PM",
      tags: [t("start.tags.bug"), t("start.tags.urgent")]
    },
    {
      name: t("start.name.Ethan_Davis"),
      email: "ethan.d@company.com",
      avatar: "Ethan_Davis.jpg",
      title: t("start.mailsTitle.Ethan_Davis"),
      text: t("start.mailsText.Ethan_Davis"),
      time: t("start.time.days3"),
      timeFull: "Oct 19, 2023, 9:00:00 AM",
      tags: [t("start.tags.social")]
    },
    {
      name: t("start.name.Isabella_Garcia"),
      email: "isabella.g@company.com",
      avatar: "Isabella_Garcia.jpg",
      title: t("start.mailsTitle.Isabella_Garcia"),
      text: t("start.mailsText.Isabella_Garcia"),
      time: t("start.time.days4"),
      timeFull: "Oct 18, 2023, 2:30:00 PM",
      tags: [t("start.tags.feature")]
    },
    {
      name: t("start.name.Mason_Thompson"),
      email: "mason.t@company.com",
      avatar: "Mason_Thompson.jpg",
      title: t("start.mailsTitle.Mason_Thompson"),
      text: t("start.mailsText.Mason_Thompson"),
      time: t("start.time.days4"),
      timeFull: "Oct 18, 2023, 10:45:00 AM",
      tags: [t("start.tags.important"), t("start.tags.security")]
    },
    {
      name: t("start.name.Charlotte_Lee"),
      email: "charlotte.l@company.com",
      avatar: "Charlotte_Lee.jpg",
      title: t("start.mailsTitle.Charlotte_Lee"),
      text: t("start.mailsText.Charlotte_Lee"),
      time: t("start.time.days5"),
      timeFull: "Oct 17, 2023, 4:00:00 PM",
      tags: [t("start.tags.feedback")]
    },
    {
      name: t("start.name.Alexander_Wright"),
      email: "alex.w@company.com",
      avatar: "Alexander_Wright.jpg",
      title: t("start.mailsTitle.Alexander_Wright"),
      text: t("start.mailsText.Alexander_Wright"),
      time: t("start.time.days5"),
      timeFull: "Oct 17, 2023, 1:20:00 PM",
      tags: [t("start.tags.documentation")]
    },
    {
      name: t("start.name.Mia_Martinez"),
      email: "mia.m@company.com",
      avatar: "Mia_Martinez.jpg",
      title: t("start.mailsTitle.Mia_Martinez"),
      text: t("start.mailsText.Mia_Martinez"),
      time: t("start.time.days5"),
      timeFull: "Oct 16, 2023, 11:00:00 AM",
      tags: [t("start.tags.testing")]
    },
    {
      name: t("start.name.Daniel_Anderson"),
      email: "daniel.a@company.com",
      avatar: "Daniel_Anderson.jpg",
      title: t("start.mailsTitle.Daniel_Anderson"),
      text: t("start.mailsText.Daniel_Anderson"),
      time: t("start.time.week1"),
      timeFull: "Oct 15, 2023, 3:45:00 PM",
      tags: [t("start.tags.deployment")]
    },
    {
      name: t("start.name.Sophie_Turner"),
      email: "sophie.t@company.com",
      avatar: "Sophie_Turner.jpg",
      title: t("start.mailsTitle.Sophie_Turner"),
      text: t("start.mailsText.Sophie_Turner"),
      time: t("start.time.week1"),
      timeFull: "Oct 15, 2023, 10:30:00 AM",
      tags: [t("start.tags.marketing")]
    },
    {
      name: t("start.name.David_Kim"),
      email: "david.k@company.com",
      avatar: "David_Kim.jpg",
      title: t("start.mailsTitle.David_Kim"),
      text: t("start.mailsText.David_Kim"),
      time: t("start.time.week1"),
      timeFull: "Oct 15, 2023, 9:15:00 AM",
      tags: [t("start.tags.finance")]
    },
    {
      name: t("start.name.Emily_White"),
      email: "emily.w@company.com",
      avatar: "Emily_White.jpg",
      title: t("start.mailsTitle.Emily_White"),
      text: t("start.mailsText.Emily_White"),
      time: t("start.time.week2"),
      timeFull: "Oct 8, 2023, 2:00:00 PM",
      tags: [t("start.tags.important")]
    },
    {
      name: t("start.name.Michael_Scott"),
      email: "michael.s@company.com",
      avatar: "Michael_Scott.jpg",
      title: t("start.mailsTitle.Michael_Scott"),
      text: t("start.mailsText.Michael_Scott"),
      time: t("start.time.week2"),
      timeFull: "Oct 8, 2023, 11:30:00 AM",
      tags: [t("start.tags.social")]
    }
  ]
}
export const dataCustomers = () => {
  const { $i18n } = useNuxtApp()
  const { t } = $i18n
  return [
    {
      name: t("start.name.Emma_Wilson"),
      avatar: "Emma_Wilson.jpg",
      email: "emma.wilson@example.com",
      age: 28,
      location: t("start.location.New_York"),
      occupation: t("start.occupation.Graphic_Designer"),
      position: t("start.position.Senior_Designer"),
      lastActive: "2025-05-04T14:30:00Z",
      status: t("start.status.Active"),
      isActive: true
    },
    {
      name: t("start.name.James_Chen"),
      avatar: "James_Chen.jpg",
      email: "james.chen@example.com",
      age: 34,
      location: t("start.location.San_Francisco"),
      occupation: t("start.occupation.Software_Engineer"),
      position: t("start.position.Lead_Engineer"),
      lastActive: "2025-05-05T09:15:00Z",
      status: t("start.status.Active"),
      isActive: true
    },
    {
      name: t("start.name.Sophia_Rodriguez"),
      avatar: "Sophia_Rodriguez.jpg",
      email: "sophia.rodriguez@example.com",
      age: 25,
      location: t("start.location.Miami"),
      occupation: t("start.occupation.Marketing_Specialist"),
      position: t("start.position.Marketing_Coordinator"),
      lastActive: "2025-05-03T20:45:00Z",
      status: t("start.status.Inactive"),
      isActive: false
    },
    {
      name: t("start.name.Lucas_Miller"),
      avatar: "Lucas_Miller.jpg",
      email: "lucas.miller@example.com",
      age: 52,
      location: t("start.location.Chicago"),
      occupation: t("start.occupation.Data_Analyst"),
      position: t("start.position.Data_Scientist"),
      lastActive: "2025-05-05T11:20:00Z",
      status: t("start.status.Active"),
      isActive: true
    },
    {
      name: t("start.name.Olivia_Brown"),
      avatar: "Olivia_Brown.jpg",
      email: "olivia.brown@example.com",
      age: 27,
      location: t("start.location.Austin"),
      occupation: t("start.occupation.Product_Manager"),
      position: t("start.position.Associate_Product_Manager"),
      lastActive: "2025-05-04T16:50:00Z",
      status: t("start.status.Active"),
      isActive: true
    },
    {
      name: t("start.name.Ava_Johnson"),
      avatar: "Ava_Johnson.jpg",
      email: "ava.johnson@example.com",
      age: 22,
      location: t("start.location.Seattle"),
      occupation: t("start.occupation.Content_Creator"),
      position: t("start.position.Social_Media_Influencer"),
      lastActive: "2025-05-05T07:30:00Z",
      status: t("start.status.Active"),
      isActive: true
    },
    {
      name: t("start.name.Ethan_Davis"),
      avatar: "Ethan_Davis.jpg",
      email: "ethan.davis@example.com",
      age: 29,
      location: t("start.location.Boston"),
      occupation: t("start.occupation.Financial_Advisor"),
      position: t("start.position.Wealth_Management_Consultant"),
      lastActive: "2025-05-04T22:10:00Z",
      status: t("start.status.Inactive"),
      isActive: false
    },
    {
      name: t("start.name.Isabella_Garcia"),
      avatar: "Isabella_Garcia.jpg",
      email: "isabella.garcia@example.com",
      age: 31,
      location: t("start.location.Los_Angeles"),
      occupation: t("start.occupation.Ux_Designer"),
      position: t("start.position.Lead_Ux_Designer"),
      lastActive: "2025-05-05T13:40:00Z",
      status: t("start.status.Active"),
      isActive: true
    },
    {
      name: t("start.name.Mason_Thompson"),
      avatar: "Mason_Thompson.jpg",
      email: "mason.thompson@example.com",
      age: 26,
      location: t("start.location.Denver"),
      occupation: t("start.occupation.Web_Developer"),
      position: t("start.position.Frontend_Developer"),
      lastActive: "2025-05-05T10:25:00Z",
      status: t("start.status.Active"),
      isActive: true
    },
    {
      name: t("start.name.Charlotte_Lee"),
      avatar: "Charlotte_Lee.jpg",
      email: "charlotte.lee@example.com",
      age: 33,
      location: t("start.location.Portland"),
      occupation: t("start.occupation.Hr_Manager"),
      position: t("start.position.Hr_Business_Partner"),
      lastActive: "2025-05-04T19:00:00Z",
      status: t("start.status.Inactive"),
      isActive: false
    },
    {
      name: t("start.name.Alexander_Wright"),
      avatar: "Alexander_Wright.jpg",
      email: "alexander.wright@example.com",
      age: 35,
      location: t("start.location.Atlanta"),
      occupation: t("start.occupation.Architect"),
      position: t("start.position.Senior_Architect"),
      lastActive: "2025-05-05T08:55:00Z",
      status: t("start.status.Active"),
      isActive: true
    },
    {
      name: t("start.name.Mia_Martinez"),
      avatar: "Mia_Martinez.jpg",
      email: "mia.martinez@example.com",
      age: 24,
      location: t("start.location.Phoenix"),
      occupation: t("start.occupation.Social_Media_Manager"),
      position: t("start.position.Digital_Marketing_Specialist"),
      lastActive: "2025-05-05T12:15:00Z",
      status: t("start.status.Active"),
      isActive: true
    },
    {
      name: t("start.name.Daniel_Anderson"),
      avatar: "Daniel_Anderson.jpg",
      email: "daniel.anderson@example.com",
      age: 32,
      location: t("start.location.Houston"),
      occupation: t("start.occupation.Civil_Engineer"),
      position: t("start.position.Project_Engineer"),
      lastActive: "2025-05-04T17:35:00Z",
      status: t("start.status.Inactive"),
      isActive: false
    },
    {
      name: t("start.name.Sophie_Turner"),
      avatar: "Sophie_Turner.jpg",
      email: "sophie.turner@example.com",
      age: 29,
      location: t("start.location.San_Diego"),
      occupation: t("start.occupation.Teacher"),
      position: t("start.position.High_School_Teacher"),
      lastActive: "2025-05-05T06:45:00Z",
      status: t("start.status.Active"),
      isActive: true
    },
    {
      name: t("start.name.David_Kim"),
      avatar: "David_Kim.jpg",
      email: "david.kim@example.com",
      age: 28,
      location: t("start.location.Philadelphia"),
      occupation: t("start.occupation.Cybersecurity_Analyst"),
      position: t("start.position.Security_Consultant"),
      lastActive: "2025-05-05T14:00:00Z",
      status: t("start.status.Active"),
      isActive: true
    },
    {
      name: t("start.name.Emily_White"),
      avatar: "Emily_White.jpg",
      email: "emily.white@example.com",
      age: 26,
      location: t("start.location.Minneapolis"),
      occupation: t("start.occupation.Journalist"),
      position: t("start.position.Investigative_Reporter"),
      lastActive: "2025-05-04T21:20:00Z",
      status: t("start.status.Inactive"),
      isActive: false
    },
    {
      name: t("start.name.Michael_Scott"),
      avatar: "Michael_Scott.jpg",
      email: "michael.scott@example.com",
      age: 40,
      location: t("start.location.Scranton"),
      occupation: t("start.occupation.Regional_Manager"),
      position: t("start.position.Branch_Manager"),
      lastActive: "2025-05-05T15:10:00Z",
      status: t("start.status.Active"),
      isActive: true
    }
  ]
}
export const columnsCustomers = (): IColumn[] => {
  const { $i18n } = useNuxtApp()
  const { t } = $i18n
  return [
    {
      name: "name",
      type: "string",
      dataField: "name",
      caption: t("start.columnsCustomers.name"),
      cellTemplate: "name",
      isFilter: true
    },
    {
      name: "occupation",
      type: "select",
      dataField: "occupation",
      caption: t("start.columnsCustomers.occupation"),
      isFilter: true
    },
    {
      name: "position",
      type: "select",
      dataField: "position",
      caption: t("start.columnsCustomers.position"),
      isFilter: true
    },
    {
      name: "location",
      dataField: "location",
      caption: t("start.columnsCustomers.address"),
      type: "select",
      isFilter: true
    },
    {
      name: "status",
      type: "select",
      dataField: "status",
      caption: t("start.columnsCustomers.status"),
      cellTemplate: "status",
      isFilter: true,
      maxWidth: 100
    }
  ]
}
