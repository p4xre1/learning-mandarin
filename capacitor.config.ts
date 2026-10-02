import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "app.mingdao.learn",
  appName: "Míngdào",
  webDir: "dist",
  backgroundColor: "#f8faf7",
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_mingdao",
      iconColor: "#58a946",
    },
  },
}

export default config
