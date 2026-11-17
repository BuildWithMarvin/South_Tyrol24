import type { Locale } from "@/lib/types";

export const LOCALES: readonly Locale[] = ["de", "it", "en", "zh"];

export const LOCALE_LABELS: Record<Locale, string> = {
  de: "DE",
  it: "IT",
  en: "EN",
  zh: "ZH",
};

const INTL_LOCALES: Record<Locale, string> = {
  de: "de-DE",
  it: "it-IT",
  en: "en-GB",
  zh: "zh-CN",
};

/** The dataset represents the 2026 season. */
const CALENDAR_YEAR = 2026;

export function isLocale(value: string | null): value is Locale {
  return value !== null && (LOCALES as readonly string[]).includes(value);
}

export function formatDoorDate(locale: Locale, day: number): string {
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(CALENDAR_YEAR, 11, day)));
}

export interface UiCopy {
  title: string;
  subtitle: string;
  gridHeading: string;
  progress: (opened: number, total: number) => string;
  loading: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  lockedHint: (date: string) => string;
  lockedLabel: string;
  openLabel: string;
  discoverLabel: string;
  openDoorLabel: string;
  adventLabel: string;
  finaleLabel: string;
  openedLabel: string;
  doorAriaLocked: (day: number, date: string) => string;
  doorAriaOpen: (day: number, title: string) => string;
  doorAriaOpened: (day: number, title: string) => string;
  close: string;
  photoLabel: string;
  photoAlt: (title: string) => string;
  openMaps: string;
  donate: string;
  paypal: string;
  installTitle: string;
  installAndroidBody: string;
  installButton: string;
  installIosShare: string;
  installIosAdd: string;
  installClose: string;
  footer: string;
  footerNote: string;
  seasonHint: string;
  badge: (day: number, date: string) => string;
  languageLabel: string;
}

export const UI: Record<Locale, UiCopy> = {
  de: {
    title: "Südtirol Adventskalender",
    subtitle:
      "24 Orte, 24 Türchen – ein Advent voller Dolomiten, Bergdörfer und warmem Winterlicht.",
    gridHeading: "Die 24 Türchen",
    progress: (opened, total) => `${opened} von ${total} Türchen geöffnet`,
    loading: "Der Kalender wird geöffnet …",
    errorTitle: "Der Kalender konnte nicht geladen werden.",
    errorBody: "Bitte prüfe deine Verbindung und versuche es noch einmal.",
    retry: "Erneut versuchen",
    lockedHint: (date) => `Dieses Türchen öffnet sich erst am ${date}.`,
    lockedLabel: "Noch verschlossen",
    openLabel: "Jetzt öffnen",
    discoverLabel: "Entdecken",
    openDoorLabel: "Türchen öffnen",
    adventLabel: "Advent",
    finaleLabel: "Finale",
    openedLabel: "Geöffnet",
    doorAriaLocked: (day, date) =>
      `Türchen ${day}, noch verschlossen. Öffnet am ${date}.`,
    doorAriaOpen: (day, title) => `Türchen ${day}: ${title}. Jetzt öffnen.`,
    doorAriaOpened: (day, title) => `Türchen ${day}: ${title}. Geöffnet.`,
    close: "Schließen",
    photoLabel: "Foto",
    photoAlt: (title) => `${title} in Südtirol`,
    openMaps: "In Google Maps öffnen",
    donate: "Projekt unterstützen · Buy Me a Coffee",
    paypal: "Per PayPal unterstützen",
    installTitle: "App auf dem Startbildschirm ablegen",
    installAndroidBody: "Öffnen Sie den Kalender künftig mit einem Tipp direkt vom Startbildschirm.",
    installButton: "Zum Startbildschirm hinzufügen",
    installIosShare: "Tippen Sie unten auf das Teilen-Symbol {icon}.",
    installIosAdd: "Wählen Sie „Zum Home-Bildschirm“.",
    installClose: "Schließen",
    footer: "Mit Liebe für Südtirol gestaltet.",
    footerNote: "Ursprünglich für meinen Opa gebaut – wenn dir der Kalender Freude macht, freue ich mich über einen kleinen virtuellen Glühwein.",
    seasonHint:
      "Der Kalender öffnet am 1. Dezember – schau gern wieder vorbei.",
    badge: (day, date) => `Türchen ${day} · ${date}`,
    languageLabel: "Sprache wählen",
  },
  it: {
    title: "Calendario dell'Avvento dell'Alto Adige",
    subtitle:
      "24 luoghi, 24 porticine — un Avvento tra Dolomiti, borghi di montagna e luci calde d'inverno.",
    gridHeading: "Le 24 porticine",
    progress: (opened, total) => `${opened} di ${total} porticine aperte`,
    loading: "Apertura del calendario …",
    errorTitle: "Impossibile caricare il calendario.",
    errorBody: "Controlla la connessione e riprova.",
    retry: "Riprova",
    lockedHint: (date) => `Questa porticina si aprirà il ${date}.`,
    lockedLabel: "Ancora chiusa",
    openLabel: "Apri ora",
    discoverLabel: "Scopri",
    openDoorLabel: "Apri la porticina",
    adventLabel: "Avvento",
    finaleLabel: "Gran finale",
    openedLabel: "Aperta",
    doorAriaLocked: (day, date) =>
      `Porticina ${day}, ancora chiusa. Si apre il ${date}.`,
    doorAriaOpen: (day, title) => `Porticina ${day}: ${title}. Apri ora.`,
    doorAriaOpened: (day, title) => `Porticina ${day}: ${title}. Aperta.`,
    close: "Chiudi",
    photoLabel: "Foto",
    photoAlt: (title) => `${title} in Alto Adige`,
    openMaps: "Apri in Google Maps",
    donate: "Offrimi un caffè · Buy Me a Coffee",
    paypal: "Sostieni con PayPal",
    installTitle: "Aggiungi l'app alla schermata Home",
    installAndroidBody: "Apri il calendario con un solo tocco, direttamente dalla schermata Home.",
    installButton: "Aggiungi alla schermata Home",
    installIosShare: "Tocca l'icona Condividi {icon} in basso sullo schermo.",
    installIosAdd: "Scegli «Aggiungi alla schermata Home».",
    installClose: "Chiudi",
    footer: "Fatto con amore per l'Alto Adige.",
    footerNote: "Nato per mio nonno – se il calendario ti piace, sarò felice di ricevere un piccolo vin brûlé virtuale.",
    seasonHint:
      "Il calendario si apre il 1° dicembre — torna a trovarci.",
    badge: (day, date) => `Porticina ${day} · ${date}`,
    languageLabel: "Scegli la lingua",
  },
  en: {
    title: "South Tyrol Advent Calendar",
    subtitle:
      "24 places, 24 doors — an Advent of Dolomites, mountain villages and warm winter light.",
    gridHeading: "The 24 doors",
    progress: (opened, total) => `${opened} of ${total} doors opened`,
    loading: "Opening the calendar …",
    errorTitle: "The calendar could not be loaded.",
    errorBody: "Please check your connection and try again.",
    retry: "Try again",
    lockedHint: (date) => `This door opens on ${date}.`,
    lockedLabel: "Still locked",
    openLabel: "Open now",
    discoverLabel: "Discover",
    openDoorLabel: "Open door",
    adventLabel: "Advent",
    finaleLabel: "Finale",
    openedLabel: "Opened",
    doorAriaLocked: (day, date) =>
      `Door ${day}, still locked. Opens on ${date}.`,
    doorAriaOpen: (day, title) => `Door ${day}: ${title}. Open now.`,
    doorAriaOpened: (day, title) => `Door ${day}: ${title}. Opened.`,
    close: "Close",
    photoLabel: "Photo",
    photoAlt: (title) => `${title} in South Tyrol`,
    openMaps: "Open in Google Maps",
    donate: "Support this project · Buy Me a Coffee",
    paypal: "Support via PayPal",
    installTitle: "Add the app to your home screen",
    installAndroidBody: "Open the calendar with one tap, straight from your home screen.",
    installButton: "Add to Home Screen",
    installIosShare: "Tap the Share icon {icon} at the bottom of the screen.",
    installIosAdd: "Choose “Add to Home Screen”.",
    installClose: "Close",
    footer: "Made with love for South Tyrol.",
    footerNote: "Originally built for my grandpa – if the calendar brings you joy, I'd be happy about a little virtual mulled wine.",
    seasonHint: "The calendar opens on 1 December — do come back.",
    badge: (day, date) => `Door ${day} · ${date}`,
    languageLabel: "Choose language",
  },
  zh: {
    title: "南蒂罗尔降临节日历",
    subtitle:
      "24 个地方，24 扇小门——在多洛米蒂、山间村庄与温暖冬光中迎接降临节。",
    gridHeading: "24 扇小门",
    progress: (opened, total) => `已打开 ${opened} / ${total} 扇`,
    loading: "正在打开日历……",
    errorTitle: "日历加载失败。",
    errorBody: "请检查网络连接后重试。",
    retry: "重试",
    lockedHint: (date) => `这扇门将于 ${date} 开启。`,
    lockedLabel: "尚未开启",
    openLabel: "立即打开",
    discoverLabel: "探索",
    openDoorLabel: "打开小门",
    adventLabel: "将临期",
    finaleLabel: "终章",
    openedLabel: "已打开",
    doorAriaLocked: (day, date) =>
      `第 ${day} 扇门，尚未开启。将于 ${date} 开启。`,
    doorAriaOpen: (day, title) => `第 ${day} 扇门：${title}。立即打开。`,
    doorAriaOpened: (day, title) => `第 ${day} 扇门：${title}。已打开。`,
    close: "关闭",
    photoLabel: "摄影",
    photoAlt: (title) => `${title}，南蒂罗尔`,
    openMaps: "在 Google 地图中打开",
    donate: "请我喝杯咖啡 · Buy Me a Coffee",
    paypal: "通过 PayPal 支持",
    installTitle: "将应用添加到主屏幕",
    installAndroidBody: "以后只需点一下主屏幕图标，即可打开日历。",
    installButton: "添加到主屏幕",
    installIosShare: "点按屏幕底部的分享图标 {icon}。",
    installIosAdd: "选择“添加到主屏幕”。",
    installClose: "关闭",
    footer: "用心呈现南蒂罗尔之美。",
    footerNote: "最初是为我的爷爷做的——如果你喜欢这个日历，欢迎请我喝一杯小小的虚拟热红酒。",
    seasonHint: "日历将于 12 月 1 日开启——欢迎再来。",
    badge: (day, date) => `第 ${day} 扇门 · ${date}`,
    languageLabel: "选择语言",
  },
};
