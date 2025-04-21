import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Hardcoded blacklisted words
export const BLACKLISTED_MESSAGE_WORDS = [
  "sex",
  "fam-chat",
  "family",
  "sexchat",
  "paid",
  "master",
  "സെക്സ്",
  "മാസ്റ്റർ",
  "man ",
  " man",
  "povalle",
  "പോവല്ലേ",
  "nilkku",
  "nilku",
  "നിൽക്കു",
  "adich",
  "അടിച്",
  "കടി",
  "kadi",
  "bro ",
  " bro",
];

export const BLACKLISTED_NAME_WORDS = [
  "💋",
  "👄",
  "👅",
  "💦",
  "👙",
  "🍌",
  "🍆",
  "🔞",
  "👨",
  "🙋‍♂️",
  "🍑",
  "🫦",
  "🫂",
  "🇦🇪",
  "🇶🇦",
  "🇸🇦",
  "♂",
  "🤦‍♂️",
  "🧒",
  "👦",
  "🧔",
  "🧔‍♂️",
  "🐓",
  "😘",
  "sex",
  "സെക്സ്",
  "boy",
  "ബോയ്",
  " b ",
  "mula ",
  "മുല",
  "chappi ",
  "ചപ്പി",
  "പ്രവാസി",
  "uae",
  "ദുബായ്",
  "dubai",
  "qatar",
  "ഖത്തർ",
  "kali ",
  "kalikka",
  "eduthu",
  "എടുത്ത്",
  "കളി",
  "ആണോ",
  "aano",
  "veno",
  "venam",
  "വേണം",
  "വേണോ",
  "oombi",
  "ഊംബി",
  "mood",
  "wife",
  "വൈഫ്",
  "aunty",
  "auty",
  "ആന്റി",
  "house ",
  "lover",
  "kunna",
  "കുണ്ണ",
  "ബോയ്",
  "അണ്ടി",
  "കൊതി",
  "thiyan",
  "chechi",
  "ചേച്ചി",
  "ചെക്കൻ",
  "chekkan",
  "kaaran",
  "kuttan",
  "ചപ്പ",
  "പൂറി",
  "pooru",
  "poori",
  "പൂർ",
  "പൂറു",
  "ചുംബ",
  "കള്ള",
  "കാമ",
  "യൻ",
  "രൻ",
  "ട്ടൻ",
  "ക്കൻ",
  "ള്ളൻ",
  "വൻ",
  "താൻ",
  "rider",
  "kazhap",
  "kazap",
  "male",
  "chekkan",
  "man ",
  "uncle",
  "അങ്കിൾ",
  "kambi",
  "കമ്പി",
  "thinna",
  "തിന്ന",
  "chullan",
  "safe ",
  "സേഫ്",
  "love",
  "തേൻ",
  "തേനീ",
  "തര",
  "tharatte",
  "tharate",
  "പൂവി",
  "poovil",
  "നക്ക",
  "nakka",
  "nakki",
  "penne",
  "പെണ്ണ",
  "പാൽ",
  "പൂവ്",
  "poovu",
  "തരു",
  "tharumo",
  "(b)",
  "hot ",
  "Mr.",
  "മിസ്റ്റർ",
  "ഡോക്ടർ",
  "Dr.",
  "Dr ",
  "doctor",
  "trainer",
  "adima",
  "അടിമ",
  "ഇഷ്ട",
  "ishtam",
  "istam",
  "കുണ്ടി",
  "kundi",
  "gay ",
  "guy",
  "മോൻ",
  "മോളെ",
  "mole",
  "boss",
  "play ",
  "karan",
  "mom ",
  "fantasy",
  "soul",
  "artist",
  "സുഖ",
  "sukham",
  "pennin",
  "age",
  "പ്രണയ",
  "pranay",
  "typing",
  "girls",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "50",
  "ജിന്ന്",
  "ഉണ്ടോ",
  "മൂഡ്",
  "മൂഡാ",
  "secret",
  "സീക്രട്ട്",
  "അവിഹിതം",
  "kalipp",
  "കലിപ്പ",
  "benefit",
  "force",
  "black",
  "massage",
  "മസ്സാജ്",
  "മസാജ്",
  "povalle",
  "പോവല്ലേ",
  "save",
  "സേവ്",
  "devil",
  "player",
  "മ്പൻ",
  "mban",
  "kaana",
  "കാണ",
  "army",
  "ആർമി",
  "romanti",
  "റൊമാന്റ",
  "lick",
  "hacker",
  "polich",
  "പോളിച്ച",
  "slave",
  "adima",
  "payyan",
  "പയ്യന്",
  "sweety",
  "പാവം",
  "pavam",
  "paavam",
  "ഡ്രൈവർ",
  "driver",
  "dirty",
  "അടിച്ച",
  "കേറി",
  "monster",
  "girl friend",
  "girlfriend",
  "പ്പൻ",
  "fitness",
  "യാൻ",
  "crazy",
  "sukhamano",
  "witcher",
  "സ്നേഹതീരം",
  "singer",
  "ഷെഡ്‌ഡി",
  "ഊരി",
  "അടിക്ക",
  "സ്നേഹം",
  "trans",
  "പോലെ",
  "killer",
  "valiya",
  "വലിയ",
  "വിരൽ",
  "ഹിതൻ",
  "മാൻ",
  "ഹാൻ",
  "ആന",
  "മൂടാക്ക",
  "മൊഞ്ച",
  "partner",
  "healer",
  "talking",
  "കോഴി",
  "കഴ",
  "ഗ്രാഫർ",
  "കുതിര",
  "master",
  "ണൻ",
  "സ്വർഗ്ഗം",
  "swargam",
  "couple",
  "അങ്കിള",
  "pazham",
  "പഴം",
  "night",
  "vaa",
  "വാ",
  "ا",
  "service",
  "ബിഗ്",
  " men ",
  "free",
].map((part) => part.toLowerCase());

// Convert name to slug: lowercase, remove all special chars and spaces without adding hyphens
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w]+/g, ""); // Remove all non-word chars including spaces
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Converts "3:16 PM" to ISO timestamp (today's date assumed)
export function parseTimestamp(timeStr: string | null): string | null {
  if (!timeStr) return null;
  const now = new Date();
  const [time, modifier] = timeStr.split(" ");
  let hours;
  const minutesRaw = time.split(":").map(Number)[1];
  hours = Number(time.split(":")[0]);
  const minutes = minutesRaw;

  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  now.setHours(hours, minutes, 0, 0);
  return now.toISOString();
}

// Extract chat messages from MacroDroid screen content
export function extractChatData(
  screenContent: string
): { from: string; to: string; text: string; time: string | null }[] {
  // 1. Extract other person's name (tv_user_name)
  const userRegex = /\[in\.mohalla\.sharechat:id\/tv_user_name\]:\s*(.+)/;
  const userMatch = screenContent.match(userRegex);
  const otherPerson = userMatch ? userMatch[1].trim() : "Unknown";

  // 2. Regex for messages and times
  const messageRegex =
    /\[in\.mohalla\.sharechat:id\/tv_message(?:\$(\d+))?\]:\s*(.+)/g;
  const timeRegex =
    /\[in\.mohalla\.sharechat:id\/tv_message_time(?:\$(\d+))?\]:\s*(.+)/g;

  const messages: {
    from: string;
    to: string;
    text: string;
    time: string | null;
  }[] = [];
  const times: Record<string, string> = {};

  // 3. Extract timestamps
  let timeMatch;
  while ((timeMatch = timeRegex.exec(screenContent)) !== null) {
    const index = timeMatch[1] || "1";
    const timeStr = timeMatch[2].trim();
    times[index] = timeStr;
  }

  // 4. Extract messages and correlate with times
  let msgMatch;
  while ((msgMatch = messageRegex.exec(screenContent)) !== null) {
    const index = msgMatch[1] || "1";
    const content = msgMatch[2].trim();
    const time = times[index] || null;
    const isSenderSelf = content.endsWith(".");
    let timeObj = null;
    try {
      timeObj = parseTimestamp(time);
    } catch {
      console.log("unable to parse time:", time);
    }
    if (timeObj) {
      messages.push({
        from: isSenderSelf ? "Me" : otherPerson,
        to: isSenderSelf ? otherPerson : "Me",
        text: content,
        time: timeObj,
      });
    }
  }

  return messages;
}
