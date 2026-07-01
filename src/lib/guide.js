// Saver — Guide structure. Non-translatable skeleton (ids, icons, colours, demo
// keys, per-step icons) lives here; all visible text comes from the locale files
// under `guide.*` (en + ar). Hooks merge the two so topics stay in sync with the
// active language.
import { useMemo } from "react";
import { useT } from "./i18n.js";

// id → icon, colour (CSS var, follows theme), demo (GuideDemo key), step icons.
const GROUPS = [
  {
    id: "around",
    topics: [
      { id: "home", icon: "home", color: "var(--ac)", demo: "home", stepIcons: ["eye", "wallet", "chev"] },
      { id: "accounts", icon: "wallet", color: "var(--ac)", demo: "accounts", stepIcons: ["plus", "bell", "transfer", "grip"] },
      { id: "transfer", icon: "transfer", color: "var(--ac)", demo: "transfer", stepIcons: ["transfer", "wallet", "check"] },
    ],
  },
  {
    id: "everyday",
    topics: [
      { id: "add", icon: "plus", color: "var(--ac)", demo: "add", stepIcons: ["plus", "cal", "layers"] },
      { id: "categories", icon: "layers", color: "var(--ac)", demo: "categories", stepIcons: ["layers", "palette", "grip"] },
      { id: "activity", icon: "activity", color: "var(--ac)", demo: "activity", stepIcons: ["search", "cal", "funnel"] },
      { id: "quick", icon: "zap", color: "var(--ac)", demo: "quick", stepIcons: ["zap", "plus"] },
    ],
  },
  {
    id: "plan",
    topics: [
      { id: "goals", icon: "target", color: "var(--ac)", demo: "goals", stepIcons: ["target", "lock", "sparkles"] },
      { id: "spendgoal", icon: "target", color: "var(--ac)", demo: "spendgoal", stepIcons: ["target", "lock", "arrowDown"] },
      { id: "bills", icon: "bills", color: "var(--ac)", demo: "bills", stepIcons: ["bills", "cal", "bell", "check"] },
      { id: "budgets", icon: "sparkles", color: "var(--ac)", demo: "budgets", stepIcons: ["sparkles", "target", "cal", "cal"] },
    ],
  },
  {
    id: "control",
    topics: [
      { id: "breakdown", icon: "target", color: "var(--ac)", demo: "breakdown", stepIcons: ["cal", "layers"] },
      { id: "notifications", icon: "bell", color: "var(--ac)", demo: "notifications", stepIcons: ["bell", "chev", "check"] },
      { id: "privacy", icon: "shield", color: "var(--ac)", demo: "privacy", stepIcons: ["download", "download", "lock"] },
    ],
  },
  {
    id: "yours",
    topics: [
      { id: "customize", icon: "grip", color: "var(--ac)", demo: "customize", stepIcons: ["grip", "eye"] },
      { id: "appearance", icon: "palette", color: "var(--ac)", demo: "appearance", stepIcons: ["sun", "palette", "book"] },
      { id: "currency", icon: "coins", color: "var(--ac)", demo: "currency", stepIcons: ["coins", "check"] },
      { id: "install", icon: "share", color: "var(--ac)", demo: "install", stepIcons: ["share", "plus", "home"] },
    ],
  },
];

const ALL = GROUPS.flatMap((g) => g.topics);

// Merge a skeleton topic with its translated text (guide.topics.<id>).
function build(t, tr) {
  const x = tr(`guide.topics.${t.id}`) || {};
  const steps = (x.steps || []).map((s, i) => ({ icon: t.stepIcons[i], title: s.title, text: s.text }));
  return { id: t.id, icon: t.icon, color: t.color, demo: t.demo, title: x.title, blurb: x.blurb, intro: x.intro, tip: x.tip, steps };
}

// Translated topic list grouped by area (for the guide hub).
export function useGuide() {
  const tr = useT();
  return useMemo(() => GROUPS.map((g) => ({ label: tr(`guide.groups.${g.id}`), topics: g.topics.map((t) => build(t, tr)) })), [tr]);
}

// Translated FAQ entries.
export function useFaq() {
  const tr = useT();
  return useMemo(() => tr("guide.faq") || [], [tr]);
}

// A single translated topic by id (for the topic page).
export function useTopic(id) {
  const tr = useT();
  return useMemo(() => {
    const t = ALL.find((x) => x.id === id);
    return t ? build(t, tr) : null;
  }, [tr, id]);
}
