import type { Palette } from "@vibrant/color";

export type TReplaceSymbol = "$lightOne" | "$darkOne";

export type TColCouple = {
  background: string;
  foreground: string;
};

export type TPaletteKey = keyof Palette;

export type TUserPreference = {
  lightThemeSource: TPaletteKey;
  darkThemeSource: TPaletteKey;
};

export type TFunc4SelectCol = (variable: TReplaceSymbol, colCouple: TColCouple) => void;

export type TUsedColEntity = {
  $lightOneBg: string;
  $lightOneFg: string;
  $darkOneBg: string;
  $darkOneFg: string;
};
