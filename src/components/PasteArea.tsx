import { Card, Flex, Text } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";

import { cn } from "~src/lib/utils";

import { PicSvgIcon } from "./svgs";

type PasteAreaProps = {
  onPaste: (event: ClipboardEvent) => void;
  imageUrl?: string;
  isLoading?: boolean;
};

export function PasteArea({ onPaste, imageUrl, isLoading = false }: PasteAreaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  // 处理点击事件，聚焦到伪输入框
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  };

  // 处理失焦事件
  const handleBlur = () => {
    setIsFocused(false);
  };

  // 监听粘贴事件
  useEffect(() => {
    const currentRef = inputRef.current;

    if (currentRef) {
      currentRef.addEventListener("paste", onPaste);

      return () => {
        currentRef.removeEventListener("paste", onPaste);
      };
    }
  }, [onPaste]);

  return (
    <Card
      className={cn(
        `w-full p-4 border transition-all cursor-pointer mx-auto`,
        isFocused ? "border-gray-700" : "border-dashed border-gray-300",
        imageUrl ? "bg-gray-50" : "aspect-square size-[360px] absolute m-auto inset-0 rounded-md",
      )}
      onClick={handleClick}
      variant="ghost"
    >
      <div
        ref={inputRef}
        tabIndex={0}
        onBlur={handleBlur}
        className="outline-none min-h-10 flex items-center justify-center size-full"
      >
        {isLoading
          ? (
              <Flex justify="center" align="center" className="h-full w-full">
                <Text size="5">处理中...</Text>
              </Flex>
            )
          : imageUrl
            ? (
                <Flex direction="column" gap="2" className="w-full group">
                  <Flex justify="center" className="w-full pb-6">
                    <img
                      src={imageUrl}
                      alt="粘贴的图片"
                      className="max-h-10 object-contain group-hover:max-h-40 transition-all"
                      onLoad={() => {
                        console.log("done URL.revokeObjectURL");
                        URL.revokeObjectURL(imageUrl);
                      }}
                    />
                  </Flex>
                </Flex>
              )
            : (
                <Flex direction="column" align="center" gap="4" justify="center" className="aspect-square">
                  <PicSvgIcon className="size-full opacity-20 absolute bg-gradient-to-br from-orange-300 via-pink-300 to-teal-300 rounded-md" />
                  <Text size="3" className="text-gray-700 animate-pulse">点击此区域并按 Ctrl+V 粘贴图片</Text>
                  {/* <Text className="text-xs text-gray-400">支持 JPG, PNG, GIF 等常见图片格式</Text> */}
                </Flex>
              )}
      </div>
    </Card>
  );
}
