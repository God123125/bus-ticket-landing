import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  {
    code: "km",
    label: "ភាសាខ្មែរ",
    shortLabel: "KH",
    flag: "🇰🇭",
  },
  {
    code: "en",
    label: "English",
    shortLabel: "EN",
    flag: "🇺🇸",
  },
];

export function LanguageChanger({
  variant = "default",
}: {
  variant?: "default" | "compact" | "mobile";
}) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("km") ? "km" : "en";

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    try {
      localStorage.setItem("i18nextLng", langCode);
    } catch {
      // ignore storage error
    }
  };

  const selected =
    LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  if (variant === "mobile") {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1 border border-border/50">
        {LANGUAGES.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-all ${
                isActive
                  ? "bg-background text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 px-2.5 text-xs font-medium hover:bg-secondary border border-transparent hover:border-border/60 transition-colors"
        >
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="font-semibold">{selected.shortLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 min-w-36">
        {LANGUAGES.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center justify-between cursor-pointer text-xs py-2 ${
                isActive ? "bg-accent font-semibold text-primary" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
