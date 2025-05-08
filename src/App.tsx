import type { Vec3 } from "@vibrant/color";

import { Box, Button, Card, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { Vibrant } from "node-vibrant/browser";
import { useCallback, useState } from "react";

import type { TColCouple, TPaletteKey, TReplaceSymbol, TUserPreference } from "./types";

import { ColorCard } from "./components/ColorCard";
import { PasteArea } from "./components/PasteArea";
import { SchemaTemplate } from "./components/SchemaTemplate";
import { PicSvgIcon } from "./components/svgs";
import { shouldUseLightText } from "./lib/utils";

type PaletteColor = {
  hex: string;
  rgb: Vec3;
  // hsl: Vec3;
  population: number;
  name: string;
};

// 默认配色偏好
const DEFAULT_PREFERENCE: TUserPreference = {
  lightThemeSource: "LightVibrant",
  darkThemeSource: "Muted",
};

// 从本地存储加载用户配色偏好
function loadUserPreference(): TUserPreference {
  const savedPreference = localStorage.getItem("colorPreference");
  if (savedPreference) {
    try {
      return JSON.parse(savedPreference);
    }
    catch (err) {
      console.error("加载用户配色偏好失败:", err);
    }
  }
  return DEFAULT_PREFERENCE;
}

// 保存用户配色偏好到本地存储
function saveUserPreference(preference: TUserPreference): void {
  localStorage.setItem("colorPreference", JSON.stringify(preference));
}

function App() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedColors, setSelectedColors] = useState<Record<TReplaceSymbol, TColCouple>>({
    $lightOne: {
      background: "",
      foreground: "",
    },
    $darkOne: {
      background: "",
      foreground: "",
    },
  });
  const [userPreference, setUserPreference] = useState<TUserPreference>(loadUserPreference);

  // 处理粘贴事件
  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    // 检查是否有图片数据
    if (!event.clipboardData?.items)
      return;

    setError("");

    // 查找图片类型的数据
    for (let i = 0; i < event.clipboardData.items.length; i++) {
      const item = event.clipboardData.items[i];

      if (item.type.startsWith("image/")) {
        setLoading(true);

        try {
          // 获取图片数据
          const blob = item.getAsFile();
          if (!blob) {
            throw new Error("无法获取图片数据");
          }

          const theUrl = URL.createObjectURL(blob);
          setImageUrl(theUrl);
          await extractPalette(theUrl);
          // URL.revokeObjectURL(theUrl); // >. 这里在 img.onload 之前即触发了
        }
        catch (err) {
          setError(`处理图片失败: ${err}`);
          setImageUrl("");
          setPalette([]);
        }
        finally {
          setLoading(false);
        }

        break;
      }
    }
    // note: 需要显式声明 userPreference， 规避 autoSelectColorScheme 函数中获取旧值
  }, [userPreference]);

  // 自动选择配色方案
  const autoSelectColorScheme = (colors: PaletteColor[]) => {
    // console.log("@userPreference", userPreference);
    const lightThemeColor = colors.find((color) => color.name === userPreference.lightThemeSource);
    const darkThemeColor = colors.find((color) => color.name === userPreference.darkThemeSource);

    const newSelectedColors = { ...selectedColors };

    if (lightThemeColor) {
      const textColor = shouldUseLightText(...lightThemeColor.rgb) ? "white" : "#333";
      newSelectedColors.$lightOne = {
        background: `rgb(${lightThemeColor.rgb.map(Math.round).join(" ")})`,
        foreground: textColor,
      };
    }

    if (darkThemeColor) {
      const textColor = shouldUseLightText(...darkThemeColor.rgb) ? "white" : "#333";
      newSelectedColors.$darkOne = {
        background: `rgb(${darkThemeColor.rgb.map(Math.round).join(" ")})`,
        foreground: textColor,
      };
    }

    setSelectedColors(newSelectedColors);
  };

  // 提取调色板
  const extractPalette = async (path: string) => {
    try {
      // console.warn("开始提取调色板，路径：", path);

      // 使用 node-vibrant 直接处理图片路径
      const vibrant = new Vibrant(path, {
        quality: 5, // 降低质量以提高性能
        colorCount: 64, // 增加颜色数量以获取更多可能的颜色
      });

      // console.warn("开始获取调色板");
      const swatches = await vibrant.getPalette();
      const swatchesSortedArr = [
        {
          name: "Vibrant",
          swatch: swatches.Vibrant,
        },
        {
          name: "DarkVibrant",
          swatch: swatches.DarkVibrant,
        },
        {
          name: "LightVibrant",
          swatch: swatches.LightVibrant,
        },
        {
          name: "Muted",
          swatch: swatches.Muted,
        },
        {
          name: "DarkMuted",
          swatch: swatches.DarkMuted,
        },
        {
          name: "LightMuted",
          swatch: swatches.LightMuted,
        },
      ];

      const colors: PaletteColor[] = [];
      let totalPopulation = 0;

      swatchesSortedArr.forEach((item) => {
        if (item.swatch)
          totalPopulation += item.swatch.population;
      });

      // 转换色板为我们的格式
      swatchesSortedArr.forEach((item) => {
        const { swatch } = item;
        if (!swatch)
          return;

        if (swatch) {
          const {
            rgb,
            hex,
            // hsl,
          } = swatch;
          const populationPercent = (swatch.population / totalPopulation) * 100;

          colors.push({
            hex,
            rgb,
            // hsl,
            population: populationPercent,
            name: item.name,
          });
        }
      });

      setPalette(colors);

      // 自动选择配色方案
      autoSelectColorScheme(colors);
    }
    catch (err) {
      setError(`提取调色板失败: ${err}`);
      setPalette([]);
    }
  };

  // 重置应用状态
  const handleReset = async () => {
    // console.warn("@handleReset");
    setImageUrl("");
    setPalette([]);
    setError("");
    setSelectedColors({
      $lightOne: {
        background: "",
        foreground: "",
      },
      $darkOne: {
        background: "",
        foreground: "",
      },
    });
  };

  // 更新用户配色偏好
  const updateUserPreference = (lightSource: TPaletteKey, darkSource: TPaletteKey) => {
    // console.log("@updateUserPreference", lightSource, darkSource);
    const newPreference = {
      lightThemeSource: lightSource,
      darkThemeSource: darkSource,
    };
    setUserPreference(newPreference);
    saveUserPreference(newPreference);
  };

  return (
    <Container className="p-4 max-w-5xl mx-auto min-h-screen">
      <Flex direction="column" gap="4">
        {/* <Heading size="8" className="text-center mb-2 text-gray-600">holah-pic-palette</Heading> */}
        <Heading className="text-left mb-6 text-sm text-gray-300 italic space-x-3">
          <PicSvgIcon className="inline-block size-[1.8em] p-0.5 bg-gradient-to-br rounded-md from-orange-300 via-pink-300 to-teal-300" />
          <span>A gadget for generating color schemes. / 获取基于图片的配色方案</span>
        </Heading>
        {error && (
          <Card className="bg-red-50 border-red-200 p-3 mb-4">
            <Text className="text-red-600">{error}</Text>
          </Card>
        )}

        {/* 使用 PasteArea 组件处理粘贴事件 */}
        <PasteArea
          onPaste={handlePaste}
          imageUrl={imageUrl}
          isLoading={loading}
        />

        {imageUrl && (
          <Flex direction="column" gap="6">
            <Box>
              <Flex justify="between" align="center" className="mb-4">
                <Text className="text-sm text-gray-300">Click on the area above to upload an image again.</Text>
                <Flex gap="2">
                  <Button size="1" onClick={handleReset}>Reset</Button>
                </Flex>
              </Flex>

              {/* <Separator size="4" className="mb-4" /> */}

              {palette.length > 0
                ? (
                    <>
                      <div className="mt-8">
                        <Heading size="4" className="mb-4">Results:</Heading>
                        <span className="text-xs text-gray-400">
                          current color plan couple: light:
                          <span className="text-gray-600 font-bold">{userPreference.lightThemeSource}</span>
                          &nbsp;/ dark:
                          <span className="text-gray-600 font-bold">{userPreference.darkThemeSource}</span>
                        </span>
                        <SchemaTemplate
                          selectedColors={selectedColors}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-8">
                        {palette.map((color, index) => (
                          <ColorCard
                            key={index}
                            hex={color.hex}
                            rgb={color.rgb}
                            population={color.population}
                            name={color.name}
                            onSelectForVariable={(variable, colCouple) => {
                              // 更新选中的颜色
                              setSelectedColors((prev) => ({
                                ...prev,
                                [variable]: colCouple,
                              }) as Record<TReplaceSymbol, TColCouple>);

                              // 如果用户手动选择了颜色，更新偏好设置
                              const colorName = color.name as TPaletteKey;
                              if (variable === "$lightOne") {
                                updateUserPreference(colorName, userPreference.darkThemeSource);
                              }
                              else if (variable === "$darkOne") {
                                updateUserPreference(userPreference.lightThemeSource, colorName);
                              }
                            }}
                            isLightTheme={color.name === userPreference.lightThemeSource}
                            isDarkTheme={color.name === userPreference.darkThemeSource}
                          />
                        ))}
                      </div>
                    </>
                  )
                : (
                    <Card className="p-6 text-center">
                      <Text>无法从图像中提取调色板</Text>
                    </Card>
                  )}
            </Box>
          </Flex>
        )}
      </Flex>
    </Container>
  );
}

export default App;
