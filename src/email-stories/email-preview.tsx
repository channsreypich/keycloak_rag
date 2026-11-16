// Email previews made by `npm run preview-emails` (the HTML Keycloak really
// sent), loaded through Vite so Storybook picks up a new run with a reload.
const PREVIEWS = import.meta.glob<string>("../../email-preview/*.html", {
    query: "?raw",
    import: "default",
    eager: true
});

// The images the emails use, from the email theme itself.
const IMAGES = import.meta.glob<string>("../email/resources/img/*.png", {
    query: "?url",
    import: "default",
    eager: true
});

/** The saved HTML, with its image addresses pointed at the theme's own files. */
function previewHtml(file: string): string | undefined {
    const html = PREVIEWS[`../../email-preview/${file}`];
    if (html === undefined) return undefined;
    return html.replace(/(["'])img\/([^"']+)\1/g, (match, quote: string, name: string) => {
        const url = IMAGES[`../email/resources/img/${name}`];
        return url === undefined ? match : `${quote}${url}${quote}`;
    });
}

/** Shows one email at the width of an email app. */
export function EmailPreview({ file, width }: { file: string; width: number }) {
    const html = previewHtml(file);
    return (
        <div style={{ display: "flex", justifyContent: "center", padding: 24, background: "#e9e9e7", minHeight: "100vh" }}>
            {html === undefined ? (
                <p style={{ fontFamily: "sans-serif" }}>
                    No preview for {file} yet. Run <code>npm run preview-emails</code>, then reload.
                </p>
            ) : (
                <iframe
                    title={file}
                    srcDoc={html}
                    style={{ width, height: 1100, border: 0, background: "#ffffff", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
                />
            )}
        </div>
    );
}
