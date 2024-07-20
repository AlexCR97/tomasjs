// See https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797

export type ConsoleColor =
  //
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "default"
  | "orange"
  | "pink"
  | "reset";

export const COLOR_CODES = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  default: 39,
  orange: 208,
  pink: 211,
  reset: 0,
} as const;

export const COLOR_ESCAPES = {
  black: `\u001b[${COLOR_CODES.black}m`,
  red: `\u001b[${COLOR_CODES.red}m`,
  green: `\u001b[${COLOR_CODES.green}m`,
  yellow: `\u001b[${COLOR_CODES.yellow}m`,
  blue: `\u001b[${COLOR_CODES.blue}m`,
  magenta: `\u001b[${COLOR_CODES.magenta}m`,
  cyan: `\u001b[${COLOR_CODES.cyan}m`,
  white: `\u001b[${COLOR_CODES.white}m`,
  default: `\u001b[${COLOR_CODES.default}m`,
  orange: `\u001b[38;5;${COLOR_CODES.orange}m`,
  pink: `\u001b[38;5;${COLOR_CODES.pink}m`,
  reset: `\u001b[${COLOR_CODES.reset}m`,
} as const;

type ColorEscape<T extends ConsoleColor> = (typeof COLOR_ESCAPES)[T];

type ResetEscape = (typeof COLOR_ESCAPES)["reset"];

export type ColorEscapedString<
  TColor extends ConsoleColor,
  TString extends string
> = `${ColorEscape<TColor>}${TString}${ResetEscape}`;

export function escape<TColor extends ConsoleColor, TString extends string>(
  color: TColor,
  str: TString
): ColorEscapedString<TColor, TString> {
  const colorEscape = COLOR_ESCAPES[color];
  const resetEscape = COLOR_ESCAPES.reset;
  return `${colorEscape}${str}${resetEscape}`;
}
