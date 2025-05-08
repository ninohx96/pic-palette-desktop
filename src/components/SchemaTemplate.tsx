import { Button, Card, DropdownMenu, Flex, TextArea } from "@radix-ui/themes";
import { useEffect, useState } from "react";

import type { TColCouple, TReplaceSymbol, TUsedColEntity } from "~src/types";

type SchemaTemplateProps = {
  selectedColors: Record<TReplaceSymbol, TColCouple>;
};

const templateInitVal = `{ 
  light: { 
    background: "$lightOneBg", 
    foreground: "$lightOneFg" 
  }, 
  dark: { 
    background: "$darkOneBg", 
    foreground: "$darkOneFg" 
  } 
}`;

export function SchemaTemplate({ selectedColors }: SchemaTemplateProps) {
  const [template, setTemplate] = useState<string>(templateInitVal);
  const [result, setResult] = useState<string>("");
  const [copied, toggleCopied] = useState(false);

  // 从本地存储加载模板
  useEffect(() => {
    const savedTemplate = localStorage.getItem("schemaTemplate");
    if (savedTemplate) {
      setTemplate(savedTemplate);
    }
  }, []);

  // 保存模板到本地存储
  useEffect(() => {
    localStorage.setItem("schemaTemplate", template);
  }, [template]);

  // 生成结果
  useEffect(() => {
    let resultText = template;
    const selColsFormatted = Object.entries(selectedColors).reduce<TUsedColEntity>((acc, item) => {
      const [nameKey, colCouple] = item as [TReplaceSymbol, TColCouple];
      if (nameKey === "$darkOne") {
        acc.$darkOneBg = colCouple.background;
        acc.$darkOneFg = colCouple.foreground;
      }
      else if (nameKey === "$lightOne") {
        acc.$lightOneBg = colCouple.background;
        acc.$lightOneFg = colCouple.foreground;
      }
      return acc;
    }, {} as TUsedColEntity);

    // 替换所有变量
    Object.entries(selColsFormatted).forEach(([variable, color]) => {
      // 考虑用户可能编辑模板为 css，所以应缺省引号
      resultText = resultText.replace(new RegExp(`\\${variable}`, "g"), `${color}`);
    });

    setResult(resultText.replace(/\n/g, "").replace(/\s+/g, " "));
  }, [template, selectedColors]);

  return (
    <Card className="w-full p-0 m-0" variant="ghost">
      <Flex direction="column" gap="3">
        <Card className="p-3 bg-gray-50">
          <pre className="font-mono text-sm whitespace-pre-wrap overflow-auto max-h-40">
            {result}
          </pre>
        </Card>
        <Flex gap="2" justify="between">
          <Button
            size="1"
            variant="solid"
            color="ruby"
            onClick={() => {
              navigator.clipboard.writeText(result);
              toggleCopied(true);
              setTimeout(() => toggleCopied(false), 2000);
            }}
          >
            {copied ? "Copied" : "Copy it"}
          </Button>
          <Flex justify="between" gap="1" align="center">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="soft" size="1" className="w-fit">Edit Template</Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content className="w-96">
                <TextArea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  placeholder="输入模板，使用 $变量名 作为颜色占位符"
                  rows={6}
                  className="font-mono text-sm"
                />
              </DropdownMenu.Content>
            </DropdownMenu.Root>
            <Button
              size="1"
              variant="soft"
              onClick={() => {
                setTemplate(templateInitVal);
              }}
            >
              Reset Template
            </Button>

          </Flex>

        </Flex>

      </Flex>
    </Card>
  );
}
