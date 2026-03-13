'use client';

import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Table,
  Code2,
  Download,
  Upload,
  FileText,
  Eye,
  SplitSquareHorizontal,
  Maximize2,
  Moon,
  Sun,
  History,
  Trash2,
  Save,
  FolderOpen,
  Copy,
  FileCode,
  FileDown,
  Monitor,
  CheckSquare,
  Minus,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

// 动态导入编辑器组件，避免 SSR 问题
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

// 注册语法高亮语言
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import html from 'react-syntax-highlighter/dist/esm/languages/hljs/htmlbars';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import go from 'react-syntax-highlighter/dist/esm/languages/hljs/go';
import rust from 'react-syntax-highlighter/dist/esm/languages/hljs/rust';
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
import markdown from 'react-syntax-highlighter/dist/esm/languages/hljs/markdown';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('markdown', markdown);

interface MarkdownEditorProps {
  initialContent?: string;
  initialTitle?: string;
}

interface HistoryItem {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

// Markdown 示例内容
const MARKDOWN_EXAMPLE = `# Markdown 编辑器使用指南

## 🎉 欢迎使用 Markdown 编辑器

这是一个功能丰富的现代 Markdown 编辑器，支持实时预览、代码高亮、多种导出格式等功能。

## ✨ 功能特性

### 文本格式化
- **加粗文本** 使用 \`**文本**\`
- *斜体文本* 使用 \`*文本*\`
- ~~删除线~~ 使用 \`~~文本~~\`
- \`行内代码\` 使用反引号

### 列表

无序列表：
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2

有序列表：
1. 第一项
2. 第二项
3. 第三项

任务列表：
- [x] 已完成任务
- [ ] 未完成任务
- [ ] 另一个未完成任务

### 引用

> 这是一段引用文字
> 可以有多行

### 代码块

支持多种编程语言的语法高亮：

\`\`\`javascript
function greeting(name) {
  console.log(\`Hello, \${name}!\`);
  return {
    message: \`Welcome to Markdown Editor\`,
    timestamp: Date.now()
  };
}

// 调用函数
greeting('World');
\`\`\`

\`\`\`python
def fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# 打印前10个斐波那契数
for i in range(10):
    print(fibonacci(i))
\`\`\`

### 表格

| 功能 | 快捷键 | 说明 |
| --- | --- | --- |
| 加粗 | Ctrl+B | 将选中文本加粗 |
| 斜体 | Ctrl+I | 将选中文本斜体 |
| 保存 | Ctrl+S | 保存到历史记录 |

### 链接与图片

[访问 GitHub](https://github.com)

![Markdown Logo](https://markdown-here.com/img/icon256.png)

### 分割线

---

## 🚀 快捷键

| 操作 | Windows/Linux | macOS |
| --- | --- | --- |
| 加粗 | Ctrl+B | Cmd+B |
| 斜体 | Ctrl+I | Cmd+I |
| 保存 | Ctrl+S | Cmd+S |

## 📝 开始编辑

点击工具栏按钮或使用快捷键开始编写你的文档吧！
`;

export default function MarkdownEditor({
  initialContent = MARKDOWN_EXAMPLE,
  initialTitle = 'Markdown 编辑器',
}: MarkdownEditorProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [mode, setMode] = useState<'edit' | 'preview' | 'live'>('live');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [wordCount, setWordCount] = useState({ chars: 0, words: 0, lines: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<{ level: number; text: string; id: string }[]>([]);
  const [fontSize, setFontSize] = useState(14);
  const [showHelp, setShowHelp] = useState(false);

  // 初始化
  useEffect(() => {
    const savedContent = localStorage.getItem('markdown-content');
    const savedTitle = localStorage.getItem('markdown-title');
    const savedHistory = localStorage.getItem('markdown-history');
    const savedFontSize = localStorage.getItem('markdown-font-size');

    if (savedContent) setContent(savedContent);
    if (savedTitle) setTitle(savedTitle);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, []);

  // 自动保存
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('markdown-content', content);
      localStorage.setItem('markdown-title', title);
      localStorage.setItem('markdown-font-size', fontSize.toString());
    }, 1000);
    return () => clearTimeout(timer);
  }, [content, title, fontSize]);

  // 统计字数
  useEffect(() => {
    const chars = content.length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lines = content.split('\n').length;
    setWordCount({ chars, words, lines });
  }, [content]);

  // 生成目录
  useEffect(() => {
    const headings = content.match(/^#{1,6}\s+.+$/gm);
    if (headings) {
      const tocItems = headings.map((heading) => {
        const level = heading.match(/^#+/)?.[0].length || 1;
        const text = heading.replace(/^#+\s+/, '');
        const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
        return { level, text, id };
      });
      setToc(tocItems);
    } else {
      setToc([]);
    }
  }, [content]);

  // 工具栏操作
  const actions = {
    bold: () => {
      document.execCommand('insertText', false, '****');
    },
    italic: () => {
      document.execCommand('insertText', false, '**');
    },
    strikethrough: () => {
      document.execCommand('insertText', false, '~~~~');
    },
    code: () => {
      document.execCommand('insertText', false, '``');
    },
    codeBlock: () => {
      document.execCommand('insertText', false, '```\n\n```');
    },
    h1: () => {
      document.execCommand('insertText', false, '# ');
    },
    h2: () => {
      document.execCommand('insertText', false, '## ');
    },
    h3: () => {
      document.execCommand('insertText', false, '### ');
    },
    ul: () => {
      document.execCommand('insertText', false, '- ');
    },
    ol: () => {
      document.execCommand('insertText', false, '1. ');
    },
    quote: () => {
      document.execCommand('insertText', false, '> ');
    },
    link: () => {
      document.execCommand('insertText', false, '[](url)');
    },
    image: () => {
      document.execCommand('insertText', false, '![](url)');
    },
    table: () => {
      const table = `| 列1 | 列2 | 列3 |
| --- | --- | --- |
| 内容 | 内容 | 内容 |`;
      document.execCommand('insertText', false, table);
    },
    task: () => {
      document.execCommand('insertText', false, '- [ ] ');
    },
    hr: () => {
      document.execCommand('insertText', false, '\n---\n');
    },
  };

  // 导出功能
  const exportFile = useCallback(
    (format: 'md' | 'html' | 'txt') => {
      let blob: Blob;
      let filename: string;

      switch (format) {
        case 'md':
          blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
          filename = `${title}.md`;
          break;
        case 'html':
          const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; 
      max-width: 900px; 
      margin: 0 auto; 
      padding: 40px 20px; 
      line-height: 1.8;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
    code { background: #f6f8fa; padding: 2px 6px; border-radius: 3px; font-family: SFMono-Regular, Consolas, monospace; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #dfe2e5; padding-left: 20px; margin: 0; color: #6a737d; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #dfe2e5; padding: 10px 14px; }
    th { background: #f6f8fa; }
    img { max-width: 100%; }
    hr { border: none; border-top: 2px solid #eee; margin: 2em 0; }
    @media print {
      body { padding: 0; max-width: none; }
    }
  </style>
</head>
<body>
${content}
</body>
</html>`;
          blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          filename = `${title}.html`;
          break;
        case 'txt':
          blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
          filename = `${title}.txt`;
          break;
      }

      saveAs(blob, filename);
      toast.success(`已导出为 ${format.toUpperCase()} 文件`);
    },
    [content, title]
  );

  // 导入文件
  const importFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt,.markdown';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContent(text);
        setTitle(file.name.replace(/\.(md|txt|markdown)$/, ''));
        toast.success('文件导入成功');
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // 保存历史
  const saveToHistory = useCallback(() => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      title,
      content,
      timestamp: Date.now(),
    };
    const newHistory = [newItem, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('markdown-history', JSON.stringify(newHistory));
    toast.success('已保存到历史记录');
  }, [title, content, history]);

  // 加载历史记录
  const loadFromHistory = useCallback((item: HistoryItem) => {
    setContent(item.content);
    setTitle(item.title);
    toast.success('已从历史记录加载');
  }, []);

  // 清空历史
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('markdown-history');
    toast.success('历史记录已清空');
  }, []);

  // 复制内容
  const copyContent = useCallback(() => {
    navigator.clipboard.writeText(content);
    toast.success('已复制到剪贴板');
  }, [content]);

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 打印
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // 字体大小调整
  const adjustFontSize = useCallback((delta: number) => {
    setFontSize((prev) => Math.max(10, Math.min(24, prev + delta)));
  }, []);

  // 重置字体大小
  const resetFontSize = useCallback(() => {
    setFontSize(14);
  }, []);

  // 清空内容
  const clearContent = useCallback(() => {
    setContent('');
    toast.success('内容已清空');
  }, []);

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            actions.bold();
            break;
          case 'i':
            e.preventDefault();
            actions.italic();
            break;
          case 's':
            e.preventDefault();
            saveToHistory();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, saveToHistory]);

  return (
    <div ref={containerRef} className="h-screen flex flex-col bg-background print:bg-white">
      {/* 顶部工具栏 */}
      <div className="border-b bg-card px-4 py-2 print:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-none shadow-none text-lg font-semibold w-64 focus-visible:ring-0"
              placeholder="文档标题"
            />
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {/* 格式化按钮 */}
            <Button variant="ghost" size="icon" onClick={actions.bold} title="加粗 (Ctrl+B)">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={actions.italic} title="斜体 (Ctrl+I)">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={actions.strikethrough} title="删除线">
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={actions.code} title="行内代码">
              <Code className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* 标题按钮 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="标题">
                  <Heading1 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={actions.h1}>
                  <Heading1 className="h-4 w-4 mr-2" /> 一级标题
                </DropdownMenuItem>
                <DropdownMenuItem onClick={actions.h2}>
                  <Heading2 className="h-4 w-4 mr-2" /> 二级标题
                </DropdownMenuItem>
                <DropdownMenuItem onClick={actions.h3}>
                  <Heading3 className="h-4 w-4 mr-2" /> 三级标题
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 列表按钮 */}
            <Button variant="ghost" size="icon" onClick={actions.ul} title="无序列表">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={actions.ol} title="有序列表">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={actions.task} title="任务列表">
              <CheckSquare className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={actions.quote} title="引用">
              <Quote className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* 插入按钮 */}
            <Button variant="ghost" size="icon" onClick={actions.link} title="链接">
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={actions.image} title="图片">
              <Image className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={actions.codeBlock} title="代码块">
              <Code2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={actions.table} title="表格">
              <Table className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={actions.hr} title="分割线">
              <Minus className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* 视图切换 */}
            <Button
              variant={mode === 'edit' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setMode('edit')}
              title="编辑模式"
            >
              <FileCode className="h-4 w-4" />
            </Button>
            <Button
              variant={mode === 'live' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setMode('live')}
              title="实时预览"
            >
              <SplitSquareHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant={mode === 'preview' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setMode('preview')}
              title="预览模式"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* 字体大小 */}
            <Button variant="ghost" size="icon" onClick={() => adjustFontSize(-1)} title="缩小字体">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={resetFontSize} title="重置字体">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => adjustFontSize(1)} title="放大字体">
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* 导入导出 */}
            <Button variant="ghost" size="icon" onClick={importFile} title="导入文件">
              <Upload className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="导出文件">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportFile('md')}>
                  <FileDown className="h-4 w-4 mr-2" /> 导出为 Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportFile('html')}>
                  <FileDown className="h-4 w-4 mr-2" /> 导出为 HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportFile('txt')}>
                  <FileDown className="h-4 w-4 mr-2" /> 导出为 TXT
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 历史记录 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="历史记录">
                  <History className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="font-semibold">历史记录</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveToHistory}
                      className="h-7"
                    >
                      <Save className="h-3 w-3 mr-1" /> 保存
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearHistory}
                      className="h-7 text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> 清空
                    </Button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {history.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    暂无历史记录
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    {history.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => loadFromHistory(item)}
                        className="flex flex-col items-start"
                      >
                        <span className="font-medium truncate w-full">{item.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 主题切换 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="切换主题">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="h-4 w-4 mr-2" /> 浅色模式
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="h-4 w-4 mr-2" /> 深色模式
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="h-4 w-4 mr-2" /> 跟随系统
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* 其他功能 */}
            <Button variant="ghost" size="icon" onClick={copyContent} title="复制内容">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handlePrint} title="打印">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={clearContent} title="清空内容">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} title="全屏">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 主编辑区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 目录侧边栏 */}
        {toc.length > 0 && (
          <div className="w-56 border-r bg-card overflow-y-auto p-4 hidden md:block print:hidden">
            <h3 className="font-semibold mb-3 flex items-center gap-2 sticky top-0 bg-card pb-2">
              <FolderOpen className="h-4 w-4" />
              目录
            </h3>
            <div className="space-y-1">
              {toc.map((item, index) => (
                <button
                  key={index}
                  className="block w-full text-left text-sm hover:bg-accent px-2 py-1 rounded transition-colors truncate"
                  style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                  onClick={() => {
                    const element = document.querySelector(`[data-heading="${item.id}"]`);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 编辑器主体 */}
        <div className="flex-1 overflow-hidden" style={{ fontSize: `${fontSize}px` }}>
          <MDEditor
            value={content}
            onChange={(val) => setContent(val || '')}
            preview={mode}
            height="100%"
            visibleDragbar={false}
            hideToolbar={true}
            enableScroll={true}
            style={{
              fontSize: `${fontSize}px`,
            }}
          />
        </div>
      </div>

      {/* 底部状态栏 */}
      <div className="border-t bg-card px-4 py-1.5 flex items-center justify-between text-xs text-muted-foreground print:hidden">
        <div className="flex items-center gap-4">
          <span>字符: {wordCount.chars.toLocaleString()}</span>
          <span>词数: {wordCount.words.toLocaleString()}</span>
          <span>行数: {wordCount.lines.toLocaleString()}</span>
          <span>字体: {fontSize}px</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            自动保存已启用
          </span>
          <span>Markdown</span>
          <span>{mode === 'edit' ? '编辑' : mode === 'preview' ? '预览' : '实时'}</span>
        </div>
      </div>
    </div>
  );
}
