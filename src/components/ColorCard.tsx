import { Button, Card, Flex, Text, Tooltip } from "@radix-ui/themes";
import { useState } from "react";

import type { TFunc4SelectCol } from "~src/types";

import { cn, shouldUseLightText } from "../lib/utils";

type Vec3 = [number, number, number];
type ColorCardProps = {
  hex: string;
  rgb: Vec3;
  population: number;
  name: string;
  onSelectForVariable?: TFunc4SelectCol;
  isLightTheme?: boolean;
  isDarkTheme?: boolean;
};

export function ColorCard({ hex, rgb, population, name, onSelectForVariable, isLightTheme = false, isDarkTheme = false }: ColorCardProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const textColor = shouldUseLightText(...rgb) ? "#FFF" : "#333";

  const copyToClipboard = (value: string, type: string) => {
    navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const rgbHuman4Css = `rgb(${rgb.map(Math.round).join(" ")})`;
  const colCouple = {
    background: rgbHuman4Css,
    foreground: textColor,
  };

  return (
    <Card className="w-full overflow-hidden outline-dashed outline-1 outline-gray-200">
      <div
        className="h-24 flex items-center justify-center p-3"
        style={{ backgroundColor: hex }}
      >
        <Text size="5" weight="bold" style={{ color: textColor }}>
          {name}
        </Text>
      </div>

      <Flex direction="column" gap="2" className="p-3">
        <Flex justify="between" align="center">
          <Text size="2" weight="bold">HEX:</Text>
          <Tooltip content={copied === "hex" ? "已复制!" : "点击复制"}>
            <Button
              variant="soft"
              size="1"
              onClick={() => copyToClipboard(hex, "hex")}
              className={cn(
                "font-mono",
                copied === "hex" ? "bg-green-100" : "",
              )}
            >
              {hex}
            </Button>
          </Tooltip>
        </Flex>

        <Flex justify="between" align="center">
          <Text size="2" weight="bold">RGB:</Text>
          <Tooltip content={copied === "rgb" ? "已复制!" : "点击复制"}>
            <Button
              variant="soft"
              size="1"
              onClick={() => copyToClipboard(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`, "rgb")}
              className={cn(
                "font-mono",
                copied === "rgb" ? "bg-green-100" : "",
              )}
            >
              {rgbHuman4Css}
            </Button>
          </Tooltip>
        </Flex>

        {onSelectForVariable && (
          <Flex justify="between" align="center" className="mt-1">
            <Text size="2" weight="bold">Template:</Text>
            <Flex gap="1">
              <Button
                variant={isLightTheme ? "solid" : "soft"}
                size="1"
                onClick={() => onSelectForVariable("$lightOne", colCouple)}
                color={isLightTheme ? "gray" : undefined}
              >
                LightOne
              </Button>
              <Button
                variant={isDarkTheme ? "solid" : "soft"}
                size="1"
                onClick={() => onSelectForVariable("$darkOne", colCouple)}
                color={isDarkTheme ? "gray" : undefined}
              >
                DarkOne
              </Button>
            </Flex>
          </Flex>
        )}

        <Text size="1" className="text-gray-500 mt-1">
          Percentage:
          {" "}
          {Math.round(population * 100) / 100}
          %
        </Text>
      </Flex>
    </Card>
  );
}
