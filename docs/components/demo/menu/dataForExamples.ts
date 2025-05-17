import { useNuxtApp } from "#app"
import type { GroupMenu } from "#fishtvue/menu"
const { $i18n } = useNuxtApp()
const { t } = $i18n

export const groupsMenu = (): Array<GroupMenu> => [
  {
    items: [
      {
        title: t("title.profile"),
        icon: "user",
        info: "<div>+1</div>"
      },
      {
        title: t("title.billing"),
        icon: "credit-card",
        info: "⌘B"
      },
      {
        title: t("title.settings"),
        icon: "cog-6-tooth",
        info: "⌘S"
      },
      {
        title: t("title.keyboardShortcuts"),
        icon: "solar:keyboard-outline"
        // info: "⌘K"
      }
    ]
  },
  {
    items: [
      {
        title: t("title.team"),
        icon: "users"
      },
      {
        title: t("title.inviteUsers"),
        icon: "user-plus",
        menu: {
          // title:title. "inviteUsers",
          groups: [
            {
              items: [
                {
                  title: t("title.telegram"),
                  icon: "ic:baseline-telegram"
                },
                {
                  title: t("title.twitter"),
                  icon: "ri:twitter-x-fill"
                },
                {
                  title: t("title.instagram"),
                  icon: "ri:instagram-line"
                }
              ]
            },
            {
              items: [
                {
                  title: t("title.more"),
                  icon: "plus-circle"
                }
              ]
            }
          ]
        }
      },
      {
        title: t("title.newTeam"),
        icon: "plus",
        info: "⌘+T"
      }
    ]
  },
  {
    items: [
      {
        title: t("title.gitHub"),
        icon: "akar-icons:github-outline-fill",
        menu: {
          groups: [
            {
              items: [
                {
                  title: t("title.email"),
                  icon: "envelope"
                },
                {
                  title: t("title.message"),
                  icon: "chat-bubble-left"
                },
                {
                  title: t("title.more"),
                  icon: "plus-circle"
                }
              ]
            }
          ]
        }
      },
      {
        title: t("title.support"),
        icon: "system-uicons:support",
        menu: {
          groups: [
            {
              items: [
                {
                  title: t("title.email"),
                  icon: "envelope"
                },
                {
                  title: t("title.message"),
                  icon: "chat-bubble-left"
                },
                {
                  title: t("title.more"),
                  icon: "plus-circle"
                }
              ]
            }
          ]
        }
      },
      {
        title: t("title.api"),
        icon: "bi:cloudy",
        info: "⌘+T",
        disabled: true
      }
    ]
  },
  {
    items: [
      {
        title: t("title.logOut"),
        icon: "ic:round-logout",
        info: "⇧⌘Q"
      }
    ]
  }
]
export const groupsMenuMini = (): Array<GroupMenu> => [
  {
    items: [
      {
        title: t("title.profile"),
        // icon: "user",
        info: "<div>+1</div>"
      },
      {
        title: t("title.billing"),
        // icon: "credit-card",
        info: "⌘B"
      },
      {
        title: t("title.settings"),
        // icon: "cog-6-tooth",
        info: "⌘S"
      },
      {
        title: t("title.keyboardShortcuts")
        // icon: "solar:keyboard-outline",
        // info: "⌘K"
      }
    ]
  }
]
export const groupsMenuSeparatorMini = (): Array<GroupMenu> => [
  {
    items: [
      {
        title: t("title.profile"),
        // icon: "user",
        info: "<div>+1</div>"
      },
      {
        title: t("title.billing"),
        // icon: "credit-card",
        info: "⌘B"
      },
      {
        title: t("title.settings"),
        // icon: "cog-6-tooth",
        info: "⌘S"
      },
      {
        title: t("title.keyboardShortcuts")
        // icon: "solar:keyboard-outline",
        // info: "⌘K"
      }
    ]
  },
  {
    items: [
      {
        title: t("title.logOut"),
        // icon: "ic:round-logout",
        info: "⇧⌘Q"
      }
    ]
  }
]
export const groupsMenuSubmenuMini = (): Array<GroupMenu> => [
  {
    items: [
      {
        title: t("title.team")
        // icon: "users",
      },
      {
        title: t("title.inviteUsers"),
        // icon: "user-plus",
        menu: {
          // title:title. "inviteUsers",
          groups: [
            {
              items: [
                {
                  title: t("title.telegram")
                  // icon: "ic:baseline-telegram",
                },
                {
                  title: t("title.twitter")
                  // icon: "ri:twitter-x-fill",
                },
                {
                  title: t("title.instagram")
                  // icon: "ri:instagram-line",
                }
              ]
            },
            {
              items: [
                {
                  title: t("title.more")
                  // icon: "plus-circle",
                }
              ]
            }
          ]
        }
      },
      {
        title: t("title.newTeam"),
        // icon: "plus",
        info: "⌘+T"
      }
    ]
  }
]
export const groupTitle = () => [
  {
    title: t("title.tools"),
    items: [
      {
        title: t("title.calculator")
        // icon: 'calculator'
      },
      {
        title: t("title.notes")
        // icon: 'note-text'
      },
      {
        title: t("title.timer")
        // icon: 'timer'
      }
    ]
  },
  {
    title: t("title.settings"),
    items: [
      {
        title: t("title.profile")
        // icon: 'account'
      },
      {
        title: t("title.theme")
        // icon: 'theme-light-dark'
      },
      {
        title: t("title.language")
        // icon: 'translate'
      }
    ]
  }
]
export const groupSeparator = () => [
  {
    title: t("title.tools"),
    separator: {
      isVisible: true,
      icon: "chevron-down"
    },
    items: [
      {
        title: t("title.calculator")
        // icon: 'calculator'
      },
      {
        title: t("title.notes")
        // icon: 'note-text'
      },
      {
        title: t("title.timer")
        // icon: 'timer'
      }
    ]
  },
  {
    title: t("title.settings"),
    separator: {
      isVisible: true,
      icon: "chevron-down"
    },
    items: [
      {
        title: t("title.profile")
        // icon: 'account'
      },
      {
        title: t("title.theme")
        // icon: 'theme-light-dark'
      },
      {
        title: t("title.language")
        // icon: 'translate'
      }
    ]
  }
]
export const groupClass = () => [
  {
    title: t("title.tools"),
    class: "bg-gray-100 dark:bg-gray-800",
    items: [
      {
        title: t("title.calculator")
        // icon: 'calculator'
      },
      {
        title: t("title.notes")
        // icon: 'note-text'
      },
      {
        title: t("title.timer")
        // icon: 'timer'
      }
    ]
  },
  {
    title: t("title.settings"),
    class: "bg-zinc-100 dark:bg-zinc-800",
    items: [
      {
        title: t("title.profile")
        // icon: 'account'
      },
      {
        title: t("title.theme")
        // icon: 'theme-light-dark'
      },
      {
        title: t("title.language")
        // icon: 'translate'
      }
    ]
  }
]
export const groupHorizontal = () => [
  {
    title: t("title.user"),
    items: [
      {
        title: t("title.profile"),
        icon: "",
        info: "<div>+1</div>"
      },
      {
        title: t("title.billing"),
        icon: "credit-card",
        info: "⌘B"
      },
      {
        title: t("title.settings"),
        icon: "cog-6-tooth",
        info: "⌘S"
      },
      {
        title: t("title.keyboardShortcuts"),
        icon: "solar:keyboard-outline",
        info: "⌘K"
      }
    ]
  },
  {
    items: [
      {
        title: t("title.gitHub"),
        icon: "akar-icons:github-outline-fill",
        menu: {
          groups: [
            {
              items: [
                {
                  title: t("title.email"),
                  icon: "carbon:email"
                },
                {
                  title: t("title.message"),
                  icon: "chat-bubble-left"
                },
                {
                  title: t("title.more"),
                  icon: "plus-circle"
                }
              ]
            }
          ]
        }
      },
      {
        title: t("title.support"),
        icon: "system-uicons:support",
        menu: {
          groups: [
            {
              items: [
                {
                  title: t("title.email"),
                  icon: "carbon:email"
                },
                {
                  title: t("title.message"),
                  icon: "chat-bubble-left"
                },
                {
                  title: t("title.more"),
                  icon: "plus-circle"
                }
              ]
            }
          ]
        }
      },
      {
        title: t("title.api"),
        icon: "bi:cloudy",
        info: "⌘+T",
        disabled: true
      }
    ]
  }
]
export const icons = (): Array<GroupMenu> => [
  {
    items: [
      {
        title: t("title.add"),
        icon: "plus"
      },
      {
        title: t("title.edit"),
        icon: "pencil"
      },
      {
        title: t("title.delete"),
        icon: "trash"
      },
      {
        title: t("title.search"),
        icon: "magnifying-glass"
      },
      {
        title: t("title.settings"),
        icon: "cog-6-tooth"
      },
      {
        title: t("title.export"),
        icon: "arrow-down-tray"
      },
      {
        title: t("title.import"),
        icon: "arrow-up-tray"
      }
    ]
  },
  {
    title: t("title.favorites"),
    items: [
      {
        title: t("title.documents"),
        icon: "document-text"
      },
      {
        title: t("title.images"),
        icon: "photo"
      },
      {
        title: t("title.starred"),
        icon: "star"
      }
    ]
  },
  {
    title: t("title.account"),
    items: [
      {
        title: t("title.profile"),
        icon: "user"
      },
      {
        title: t("title.notifications"),
        icon: "bell"
      },
      {
        title: t("title.logout"),
        icon: "arrow-right-on-rectangle"
      }
    ]
  }
]
export const onlyIcons = (): Array<GroupMenu> => [
  {
    items: [
      {
        title: t("title.add"),
        icon: "plus"
      },
      {
        title: t("title.edit"),
        icon: "pencil"
      },
      {
        title: t("title.delete"),
        icon: "trash"
      },
      {
        title: t("title.search"),
        icon: "magnifying-glass"
      },
      {
        title: t("title.settings"),
        icon: "cog-6-tooth"
      },
      {
        title: t("title.export"),
        icon: "arrow-down-tray"
      },
      {
        title: t("title.import"),
        icon: "arrow-up-tray"
      }
    ]
  },
  {
    items: [
      {
        title: t("title.documents"),
        icon: "document-text"
      },
      {
        title: t("title.images"),
        icon: "photo"
      },
      {
        title: t("title.starred"),
        icon: "star"
      }
    ]
  },
  {
    items: [
      {
        title: t("title.profile"),
        icon: "user"
      },
      {
        title: t("title.notifications"),
        icon: "bell"
      },
      {
        title: t("title.logout"),
        icon: "arrow-right-on-rectangle"
      }
    ]
  }
]
