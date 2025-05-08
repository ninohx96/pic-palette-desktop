# holah-pic-palette

一个从图像生成配色方案的桌面应用程序。使用 Tauri、React 和 TypeScript 构建。

![app running screenshot](./screenshot.png)

## 功能特点

- **颜色提取**：从粘贴图像中提取鲜艳、柔和和其他颜色变体
- **主题生成**：便捷选择亮色和暗色主题的颜色
- **模板自定义**：编辑输出模板以匹配您项目的需求
- **复制结果**：轻松复制生成的配色方案以在您的项目中使用

## 使用方法

1. **粘贴图像**：点击粘贴区域并按 Ctrl+V 粘贴图像
2. **查看调色板**：应用程序将自动从图像中提取调色板
3. **选择主题颜色**：点击任何颜色卡片下的"LightOne"或"DarkOne"按钮将其选择为您的主题颜色
4. **自定义模板**：点击"Edit Template"修改输出格式
5. **复制结果**：点击"Copy it"将生成的配色方案复制到剪贴板

## 开发

### 前提条件

- Node.js (v20.10.0 或更高版本)
- Rust (v1.86 或更高版本)
- pnpm

### 设置

```bash
# 克隆仓库
git clone https://github.com/ninohx96/pic-palette-desktop.git
cd pic-palette-desktop

# 安装依赖
pnpm install

# 以开发模式运行
pnpm tauri-dev
```

### 构建

```bash
# 为生产环境构建
pnpm tauri-build
```

## 技术细节

- **前端**：React、TypeScript、Radix UI、Tailwind CSS
- **后端**：Rust、Tauri
- **颜色提取**：node-vibrant
- **文件处理**：Tauri 的文件系统 API
