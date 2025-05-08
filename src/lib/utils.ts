import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 合并 Tailwind 类名
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 将 RGB 转换为 HEX
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join("")}`;
}

// 将 HEX 转换为 RGB
export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        Number.parseInt(result[1], 16),
        Number.parseInt(result[2], 16),
        Number.parseInt(result[3], 16),
      ]
    : null;
}

// 复制文本到剪贴板
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

// 获取颜色名称
export function getColorName(hex: string): string {
  // 这里可以实现一个简单的颜色名称映射
  const colorMap: Record<string, string> = {
    "#ff0000": "红色",
    "#00ff00": "绿色",
    "#0000ff": "蓝色",
    "#ffff00": "黄色",
    "#ff00ff": "品红",
    "#00ffff": "青色",
    "#000000": "黑色",
    "#ffffff": "白色",
    "#808080": "灰色",
  };

  // 简化颜色以匹配基本颜色
  const rgb = hexToRgb(hex);
  if (!rgb)
    return "未知";

  // 找到最接近的基本颜色
  let minDistance = Infinity;
  let closestColor = "未知";

  Object.entries(colorMap).forEach(([baseHex, name]) => {
    const baseRgb = hexToRgb(baseHex);
    if (baseRgb) {
      const distance = Math.sqrt(
        (rgb[0] - baseRgb[0]) ** 2
        + (rgb[1] - baseRgb[1]) ** 2
        + (rgb[2] - baseRgb[2]) ** 2,
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = name;
      }
    }
  });

  return closestColor;
}

/**
 * @tool AI/claude
 * 根据背景色 RGB 值判断前景色是否应该使用白色
 * 返回 true 表示应该使用白色，false 表示应该使用黑色
 * @param r - 红色通道值 (0-255)
 * @param g - 绿色通道值 (0-255)
 * @param b - 蓝色通道值 (0-255)
 */
export function shouldUseLightText(r: number, g: number, b: number) {
  // 将 RGB 值转换为相对亮度
  // 根据 WCAG 2.0 规范：https://www.w3.org/TR/WCAG20/#relativeluminancedef
  const toSRGB = (x: number) => {
    x = x / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  const sR = toSRGB(r);
  const sG = toSRGB(g);
  const sB = toSRGB(b);
  // 计算相对亮度 L
  const L = 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
  // 如果亮度小于 0.5，使用白色文本
  // 如果亮度大于等于 0.5，使用黑色文本
  return L < 0.5;
}

export function vec3ToHSLString([h, s, l]: [number, number, number]): string {
  const hue = Math.round(h * 360); // 0~360
  const sat = Math.round(s * 100); // 0~100%
  const light = Math.round(l * 100); // 0~100%
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}
