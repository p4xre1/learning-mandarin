import { LocalNotifications } from "@capacitor/local-notifications"
import { Preferences } from "@capacitor/preferences"
import { Share } from "@capacitor/share"

const REMINDER_ID = 1900

export async function readPreference(key: string) {
  const result = await Preferences.get({ key })
  return result.value
}

export async function savePreference(key: string, value: string) {
  await Preferences.set({ key, value })
}

export async function shareLearningData(data: unknown) {
  const text = JSON.stringify(data, null, 2)
  try {
    await Share.share({
      title: "Míngdào learning data",
      text,
      dialogTitle: "Export learning data",
    })
  } catch {
    const url = URL.createObjectURL(
      new Blob([text], { type: "application/json" }),
    )
    const link = document.createElement("a")
    link.href = url
    link.download = `mingdao-export-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }
}

export async function clearLearningPreferences() {
  await Promise.all(
    ["mingdao-progress", "mingdao-bookmarks", "mingdao-reminders"].map((key) =>
      Preferences.remove({ key }),
    ),
  )
  localStorage.removeItem("mingdao-bookmarks")
}

export async function migrateWebPreference(key: string) {
  const nativeValue = await readPreference(key)
  if (nativeValue !== null) return nativeValue

  const webValue = localStorage.getItem(key)
  if (webValue !== null) await savePreference(key, webValue)
  return webValue
}

export async function setDailyReminder(
  enabled: boolean,
  locale: "en" | "ar" | "ary",
) {
  if (!enabled) {
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] })
    await savePreference("mingdao-reminders", "false")
    return false
  }

  const permission = await LocalNotifications.requestPermissions()
  if (permission.display !== "granted") {
    throw new Error("notification-permission-denied")
  }

  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] })
  const message = {
    en: {
      title: "Time for a little Mandarin",
      body: "Your daily review is ready. A few minutes keeps the words fresh.",
    },
    ar: {
      title: "حان وقت تعلّم الصينية",
      body: "مراجعتك اليومية جاهزة. بضع دقائق تثبّت الكلمات.",
    },
    ary: {
      title: "وقت شوية ديال الصينية",
      body: "مراجعة اليوم واجدة. غير شوية ديال الوقت باش تبقى فاكر الكلمات.",
    },
  }[locale]
  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: message.title,
        body: message.body,
        schedule: {
          on: { hour: 19, minute: 0 },
          repeats: true,
          allowWhileIdle: true,
        },
      },
    ],
  })
  await savePreference("mingdao-reminders", "true")
  return true
}
