import React from "react";

interface HeadingProps {
    title: string;
    description: string;
    keywords: string;
}

export function Heading({ title, description, keywords }: Readonly<HeadingProps>) {
    return (
        <>
            <title>{title}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
        </>
    );
}

export default React.memo(Heading);
