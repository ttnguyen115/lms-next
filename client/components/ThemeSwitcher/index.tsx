"use client";

import { useTheme } from "next-themes";
import React from "react";
import { BiMoon, BiSun } from "react-icons/bi";

type Props = {};

const ThemeSwitcher: React.FC<Props> = (props) => {
    const [mounted, setMounted] = React.useState(false);
    const { theme, setTheme } = useTheme();

    React.useEffect(() => setMounted(true), []);

    const themeSwitcherRender = (): JSX.Element => {
        const props = {
            className: "cursor-pointer",
            size: 25,
            onClick: () => setTheme(theme === "light" ? "dark" : "light"),
        };

        return <>{theme === "light" ? <BiMoon fill="black" {...props} /> : <BiSun {...props} />}</>;
    };

    if (!mounted) return null;

    return <div className="flex items-center justify-center mx-4">{themeSwitcherRender()}</div>;
};

export default React.memo(ThemeSwitcher);
