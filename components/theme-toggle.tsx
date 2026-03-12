"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const current = theme === "system" ? systemTheme : theme;

    return (
        <Button
            variant="outline"
            className="h-9 w-9 p-0 border-black/10 bg-white hover:bg-black/5 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/10"
            onClick={() => setTheme(current === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            type="button"
        >
            {current === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
    );
}