import { SVGProps } from "react";
import { IconProps, Icons } from "./types";

interface ExtendedSVGProps extends SVGProps<SVGSVGElement> {
  title: string;
}

const FILLED = "Filled";

export const Icon = ({
  type,
  width,
  height,
  color,
  filled,
  className,
  alt,
  small,
}: IconProps) => {
  const iconType = filled ? `${type}${FILLED}` : type;
  const IconElement = Icons[iconType];
  const defaultSize = small ? 16 : 24;

  // TODO: default to outlined?
  if (!IconElement) {
    return null;
  }

  const props = {
    width: width || defaultSize,
    height: height || defaultSize,
    className: `inline ${className ?? ""}`,
    color,
  } as ExtendedSVGProps;

  if (alt) {
    props.role = "img";
    props.title = alt;
  }

  if (!alt) {
    props["aria-hidden"] = true;
  }

  return <IconElement {...props} />;
};
