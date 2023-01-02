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
    const position_ref = useRef({ x: 0, y: 0 });
    const tooltip_ref = useRef();

    const [show_tooltip, set_show_tooltip] = useState(false);

    const handle_mouse_over = (e) => {
        // using the event from hover to get
        // the child elements position to calculate tooltip position
        position_ref.current = calculate_position(
            e.currentTarget,
            tooltip_ref,
            placement,
            spacing
        );

        set_show_tooltip(true);
    };

    const handle_mouse_leave = () => {
        set_show_tooltip(false);
    };

    useEffect(() => {
        // removing tooltip when user scrolls and tooltip is focused from tabbing
        const handleScroll = (event) => {
            // console.log("window.scrollY", window.scrollY);
            handle_mouse_leave();
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    if (disabled || text === "" || text === undefined) {
        // not creating portal, or cloning element if tooltip is disabled
        return <>{children}</>;
    }

    // clone element allows us to pass props to the
    // element passed in the first param
    // in our case it is the children element
    return (
        <>
            {cloneElement(children, {
                onMouseOver: handle_mouse_over,
                onMouseLeave: handle_mouse_leave,

                // allowing tooltip to be shown when tabbing through page
                onFocus: handle_mouse_over,
                onBlur: handle_mouse_leave,
                onScroll: handle_mouse_leave,
            })}
            <Portal>
                <span
                    key={text}
                    className="ToolTip"
                    ref={tooltip_ref}
                    style={{
                        // visibility hidden prevent tooltip from interacting with other elements
                        visibility: show_tooltip ? "visible" : "hidden",
                        opacity: show_tooltip ? "1" : "0",
                        top: `${position_ref.current.y}px`,
                        left: `${position_ref.current.x}px`,

                        transitionDelay: ` ${
                            show_tooltip ? 0.01 : 0.02
                        }s !important`,
                        transformOrigin: `${negate_placement(placement)}`,
                        transform: `scale(${show_tooltip ? 1 : 0.7})`,
                    }}
                >
                    {text}
                </span>
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

const calculate_position = (child_element, tooltip_ref, placement, spacing) => {
    // to calculate and return an object of x and y, to position the tooltip
    // child_element = the children passed in the ToolTip component    = el
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
            window.innerHeight - (tooltip_ref.current.clientHeight + spacing),
        right:
            document.body.clientWidth -
            (tooltip_ref.current.clientWidth + spacing),
        // using documents width to not intefere with scrollbar width
    };

    // the rectangular px border values of the children element
    const child_rectangle = child_element.getBoundingClientRect();

    return (function calculate_new_position_recursivley(placement) {
        recursive_count += 1;

        // finding the top left position to place the tooltip
        // based on the placement by the user
        // relative the the child elements placement and the tooltips dimensions
        switch (placement) {
            case "top":
                position.x =
                    child_rectangle.left +
                    (child_element.offsetWidth -
                        tooltip_ref.current.offsetWidth) /
                        2;
                position.y =
                    child_rectangle.top -
                    (tooltip_ref.current.offsetHeight + spacing);
                break;
            case "bottom":
                position.x =
                    child_rectangle.left +
                    (child_element.offsetWidth -
                        tooltip_ref.current.offsetWidth) /
                        2;
                position.y = child_rectangle.bottom + spacing;
                break;
            case "left":
                position.x =
                    child_rectangle.left -
                    (tooltip_ref.current.offsetWidth + spacing);
                position.y =
                    child_rectangle.top +
                    (child_element.offsetHeight -
                        tooltip_ref.current.offsetHeight) /
                        2;
                break;
            case "right":
                position.x = child_rectangle.right + spacing;
                position.y =
                    child_rectangle.top +
                    (child_element.offsetHeight -
                        tooltip_ref.current.offsetHeight) /
                        2;
                break;
            default:
                // default position is "top"
                position.x =
                    child_rectangle.left +
                    (child_element.offsetWidth -
                        tooltip_ref.current.offsetWidth) /
                        2;
                position.y =
                    child_rectangle.top -
                    (tooltip_ref.current.offsetHeight + spacing);
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
