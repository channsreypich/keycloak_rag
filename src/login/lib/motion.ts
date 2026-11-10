import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };

/** Animations only run inside this media query (people who ask for less motion get none). */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * What the entrance staggers in: the root's children, but form fields one by one
 * (a form counts as its children). A root with a single wrapper is opened up too.
 */
function entranceItems(root: HTMLElement): HTMLElement[] {
    const items: HTMLElement[] = [];
    const visit = (el: Element) => {
        for (const child of Array.from(el.children)) {
            if (!(child instanceof HTMLElement)) continue;
            if (child instanceof HTMLInputElement && child.type === "hidden") continue;
            if (child.hasAttribute("data-fx")) continue;
            if (child.tagName === "FORM") visit(child);
            else items.push(child);
        }
    };
    visit(root);
    // A single wrapper: stagger what is inside it instead
    if (items.length === 1 && items[0].children.length > 1) {
        const [wrapper] = items.splice(0);
        visit(wrapper);
    }
    return items;
}

/**
 * "Glass settling": the card fades in out of the background and frosts over,
 * then its content follows one item after another. Opacity only (never visibility), so
 * autofocused fields keep their focus.
 * Returns the ref for the glass card.
 *
 * @param content where the items to stagger live (defaults to the card)
 */
export function useEntrance<T extends HTMLElement = HTMLDivElement>(
    content?: RefObject<HTMLElement>
) {
    const card = useRef<T>(null);

    useGSAP(() => {
        const cardEl = card.current;
        if (!cardEl) return;
        const mm = gsap.matchMedia();
        mm.add(MOTION_OK, () => {
            const items = entranceItems(content?.current ?? cardEl);
            gsap.timeline({ defaults: { ease: "power3.out" } })
                // The glass fades in out of the background (together with it)
                // and frosts over as it appears
                .fromTo(
                    cardEl,
                    {
                        opacity: 0,
                        backdropFilter: "blur(0px)",
                        webkitBackdropFilter: "blur(0px)"
                    },
                    {
                        opacity: 1,
                        backdropFilter: "blur(24px)",
                        webkitBackdropFilter: "blur(24px)",
                        duration: 1,
                        ease: "power2.out",
                        clearProps: "opacity,backdropFilter,webkitBackdropFilter"
                    }
                )
                .from(
                    items,
                    {
                        opacity: 0,
                        y: 12,
                        filter: "blur(6px)",
                        duration: 0.5,
                        stagger: 0.05,
                        clearProps: "opacity,transform,filter"
                    },
                    0.3
                );
        });
        return () => mm.revert();
    });

    return card;
}
