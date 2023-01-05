import "./ToolTip.scss";
import Portal from "../Portal";
import { cloneElement, useState, useRef, useEffect } from "react";

// mostly from https://www.youtube.com/watch?v=bnuw7pqWUGA

function ToolTip({
    children,
    text,
    placement = "top",
    spacing = 10,
    disabled = false,
}) {
    // text (string) = text for the tooltip
    // spacing (number) = distance in px u want the tooltip from the child
    // placement (string) = one of "top", "bottom", "left", "right"
    //              which is where the tooltip will be placed relative the the child
    // disabled (boolean) = if we want to show the tooltip or not depending on other factors

    // tooltip will be positioned relative to the screen top and left px value

    // using ref to prevent this object from changing when rerendering
    // const position_ref = useRef({ x: 0, y: 0 });
    const child_ref = useRef();
    const tooltip_ref = useRef();

    const [show_tooltip, set_show_tooltip] = useState(false);
    const [tooltip_position, set_tooltip_position] = useState({
        x: -100,
        y: -100,
    });

    const reveal_tooltip = () => {
        set_show_tooltip(true);
    };

    const hide_tooltip = () => {
        set_show_tooltip(false);
    };

    useEffect(() => {
        // removing tooltip when user scrolls and tooltip is focused from tabbing
        const handleScroll = () => {
            // console.log("window.scrollY", window.scrollY);
            hide_tooltip();
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        if (tooltip_ref.current) {
            set_tooltip_position(
                calculate_position(
                    child_ref.current.getBoundingClientRect(),
                    {
                        clientWidth: tooltip_ref.current.clientWidth,
                        clientHeight: tooltip_ref.current.clientHeight,
                        offsetWidth: tooltip_ref.current.offsetWidth,
                        offsetHeight: tooltip_ref.current.offsetHeight,
                    },
                    placement,
                    spacing
                )
            );
        }
    }, [show_tooltip, text]);

    if (disabled || text === "" || text === undefined) {
        // not creating portal, or cloning element if tooltip is disabled
        return <>{children}</>;
    }

    // clone element allows us to pass props to the
    // element passed in the first parameter of cloneElement
    // in our case it is the children element
    return (
        <>
            {cloneElement(children, {
                ref: child_ref,
                onMouseOver: reveal_tooltip,
                onMouseLeave: hide_tooltip,
                // allowing tooltip to be shown when tabbing through page
                onFocus: reveal_tooltip,
                onBlur: hide_tooltip, // = onUnFocus
            })}
            <Portal>
                {show_tooltip ? (
                    <span
                        key={text}
                        className="ToolTip"
                        ref={tooltip_ref}
                        style={{
                            // visibility hidden prevent tooltip from interacting with other elements
                            visibility: show_tooltip ? "visible" : "hidden",
                            opacity: show_tooltip ? "1" : "0",
                            top: `${tooltip_position.y}px`,
                            left: `${tooltip_position.x}px`,

                            transitionDelay: ` ${
                                show_tooltip ? 0.01 : 0.02
                            }s !important`,
                            transformOrigin: `${negate_placement(placement)}`,
                            transform: `scale(${show_tooltip ? 1 : 0.7})`,
                        }}
                    >
                        {text}
                    </span>
                ) : null}
            </Portal>
        </>
    );
}

const negate_placement = (placement) => {
    // gives the opposite of the passed in placement

    switch (placement) {
        case "top":
            return "bottom";
        case "bottom":
            return "top";
        case "left":
            return "right";
        case "right":
            return "left";
        default:
            return "top";
    }
};

const check_horizontal = (placement) => {
    return placement === "left" || placement === "right";
};

const check_vertical = (placement) => {
    return placement === "top" || placement === "bottom";
};

const calculate_position = (
    child_rect,
    tooltip_dimensions,
    placement,
    spacing
) => {
    // to calculate and return an object of x and y, to position the tooltip

    // child_rect contain {x: left, y:top, width, height, top, left, bottom, right}
    // where width and height refer to the client hieght

    // tooltip_dimensions also has offsetHeight and offsetWidth

    // child_element = the children passed in the ToolTip component    = el rect
    let recursive_count = 0;

    // refers to the x and y coordinates the
    // tooltip will use to position itself
    let position = {
        x: 0,
        y: 0,
    };

    // refers to the px value of the boundary where the tooltip is allowed to be in
    const screen_boundaries = {
        top: spacing,
        left: spacing,
        bottom:
            window.innerHeight - (tooltip_dimensions.clientHeight + spacing),
        right:
            document.body.clientWidth -
            (tooltip_dimensions.clientWidth + spacing),
        // using documents width to not intefere with scrollbar width
    };

    // the rectangular px border values of the children element
    // const child_rectangle = child_element.getBoundingClientRect();

    return (function calculate_new_position_recursivley(placement) {
        recursive_count += 1;

        // finding the top left position to place the tooltip
        // based on the placement by the user
        // relative the the child elements placement and the tooltips dimensions
        switch (placement) {
            case "top":
                position.x =
                    child_rect.left +
                    (child_rect.width - tooltip_dimensions.offsetWidth) / 2;
                position.y =
                    child_rect.top -
                    (tooltip_dimensions.offsetHeight + spacing);
                break;
            case "bottom":
                position.x =
                    child_rect.left +
                    (child_rect.width - tooltip_dimensions.offsetWidth) / 2;
                position.y = child_rect.bottom + spacing;
                break;
            case "left":
                position.x =
                    child_rect.left -
                    (tooltip_dimensions.offsetWidth + spacing);
                position.y =
                    child_rect.top +
                    (child_rect.height - tooltip_dimensions.offsetHeight) / 2;
                break;
            case "right":
                position.x = child_rect.right + spacing;
                position.y =
                    child_rect.top +
                    (child_rect.height - tooltip_dimensions.offsetHeight) / 2;
                break;
            default:
                // default position is "top"
                position.x =
                    child_rect.left +
                    (child_rect.width - tooltip_dimensions.offsetWidth) / 2;
                position.y =
                    child_rect.top -
                    (tooltip_dimensions.offsetHeight + spacing);
                break;
        }

        // preventing infinite recursion calls
        if (recursive_count < 3) {
            // if the position of the tooltip is outside the allowed area
            // we will call calculate_position again with a the opposite placement
            if (
                (check_horizontal(placement) &&
                    (position.x < screen_boundaries.left ||
                        position.x > screen_boundaries.right)) ||
                (check_vertical(placement) &&
                    (position.y < screen_boundaries.top ||
                        position.y > screen_boundaries.bottom))
            ) {
                position = calculate_new_position_recursivley(
                    negate_placement(placement)
                );
            }
        }

        // when the tooltips position is outside the screen boundary
        // we will update the tooltips position so we can see it properly
        if (position.x < screen_boundaries.left) {
            position.x = screen_boundaries.left;
        } else if (position.x > screen_boundaries.right) {
            position.x = screen_boundaries.right;
        }

        if (position.y < screen_boundaries.top) {
            position.y = screen_boundaries.top;
        } else if (position.y > screen_boundaries.bottom) {
            position.y = screen_boundaries.bottom;
        }

        return position;
    })(placement);
};

export default ToolTip;
