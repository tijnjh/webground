import { decode } from "$lib/codec";
import { checkIfShared } from "$lib/helpers";
import type { Code } from "$lib/types";
import type { PageServerLoadEvent } from "./$types";

import nodeHtmlToImage from "node-html-to-image";

export async function load({ url }: PageServerLoadEvent) {
    const emptyCode: Code = {
        html: "",
        css: "",
        js: "",
    };

    if (!checkIfShared(url)) {
        return { code: emptyCode };
    }

    const h = url.searchParams.get("h");
    const c = url.searchParams.get("c");
    const j = url.searchParams.get("j");

    const code: Code = {
        html: h ? decode(h) : "",
        css: c ? decode(c) : "",
        js: j ? decode(j) : "",
    };

    // if (!checkIfCrawler(url)) {
    //     console.log("this is NOT a crawler");
    //     return { code };
    // }

    console.log("this is a crawler");

    const thumbnail = await nodeHtmlToImage({
        html: `
            <html>
                <head>
                    <style>
                        ${code.css}
                    </style>
                </head>
                <body>
                    ${code.html}
                </body>
            </html>
        `,
        encoding: "base64",
    });

    console.log(thumbnail);

    return { code, thumbnail };
}
