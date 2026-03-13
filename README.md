<div align="center">

# MarkFlow

**A Modern Markdown Editor with AI-Powered Writing Assistance**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[English](#features) | [简体中文](#功能特性)

</div>

---

## Overview

MarkFlow is a feature-rich, modern Markdown editor built with Next.js 16, React 19, and TypeScript. It provides a seamless writing experience with AI-powered assistance, multi-document management, real-time preview, and extensive export options.

![MarkFlow Screenshot](docs/screenshot.png)

## Features

### Core Editor
- **Real-time Preview** - Live preview with GitHub-flavored Markdown support
- **Syntax Highlighting** - Code blocks with multiple language support
- **Multiple View Modes** - Edit only, Preview only, or Split view
- **Customizable Font Size** - Adjustable editor font size (10-24px)
- **Dark/Light Theme** - System preference detection with manual toggle

### Multi-Document Management
- **Document List** - Sidebar with all your documents
- **Quick Switch** - Switch between documents instantly
- **Auto-save** - Automatic saving to local storage
- **Document Favorites** - Star important documents
- **Search & Filter** - Find documents by title or content
- **Document Stats** - Word count, character count, reading time

### AI Writing Assistant
MarkFlow integrates with multiple AI providers to supercharge your writing:

- **Continue Writing** - AI continues your content naturally
- **Polish Text** - Improve clarity and professionalism
- **Expand Content** - Add more details and examples
- **Rewrite Content** - Rephrase while keeping the meaning
- **Generate Summary** - Extract key points
- **Generate Outline** - Create structured outlines
- **Generate Titles** - Get catchy title suggestions
- **Translate Text** - Chinese ↔ English translation
- **Fix Errors** - Grammar and spelling corrections
- **Explain Content** - Get simple explanations

**Supported AI Providers:**
- Doubao (ByteDance)
- DeepSeek
- OpenAI (GPT)
- Kimi (Moonshot AI)
- Custom OpenAI-compatible APIs

### Template System
Get started quickly with 10 built-in templates:

| Category | Templates |
|----------|-----------|
| Basic | Blank Document |
| Development | README, Technical Design, API Docs, Changelog |
| Writing | Blog Post |
| Business | Meeting Notes, Weekly Report |
| Personal | Resume (Detailed), Resume (Simple) |

### Export Options
- **Markdown (.md)** - Raw markdown file
- **HTML** - Styled HTML with GitHub CSS
- **Plain Text (.txt)** - Text only
- **PDF** - Via browser print dialog

### Editing Features
- **Undo/Redo** - Full history support (up to 50 steps)
- **Find & Replace** - Search and replace text
- **Table of Contents** - Auto-generated from headings
- **Keyboard Shortcuts** - Efficient editing workflow

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | Full-stack framework (App Router) |
| React 19 | UI library |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Styling |
| shadcn/ui | UI components |
| @uiw/react-md-editor | Markdown editor |
| marked | Markdown parsing |
| next-themes | Theme management |
| Lucide React | Icons |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9.0+

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/markflow.git
cd markflow
```

2. Install dependencies
```bash
pnpm install
```

3. Start the development server
```bash
pnpm dev
```

4. Open [http://localhost:5000](http://localhost:5000) in your browser

### Building for Production

```bash
pnpm build
pnpm start
```

## Configuration

### AI Setup

1. Click the Settings icon (⚙️) in the toolbar
2. Select your AI provider
3. Enter your API Key
4. Choose a model
5. Click "Test Connection" to verify
6. Save your configuration

### Environment Variables (Optional)

Create a `.env.local` file for server-side AI configuration:

```env
# For default AI integration (optional)
# If not set, users can configure via Settings page
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save document |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + F` | Find & Replace |

## Project Structure

```
markflow/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Main editor page
│   │   ├── settings/          # Settings page
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── markdown-editor.tsx # Main editor component
│   │   ├── theme-provider.tsx  # Theme context
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── document-manager.ts # Document management
│   │   ├── templates.ts       # Built-in templates
│   │   ├── ai-config.ts       # AI configuration
│   │   └── utils.ts           # Utility functions
│   └── hooks/                 # Custom React hooks
├── public/                    # Static assets
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Roadmap

- [ ] Cloud sync for documents
- [ ] Collaboration features
- [ ] More AI providers
- [ ] Custom themes
- [ ] Plugin system
- [ ] Mobile app

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [@uiw/react-md-editor](https://github.com/uiwjs/react-md-editor) - Markdown editor
- [Lucide](https://lucide.dev/) - Beautiful icons

---

<div align="center">

Made with ❤️ by MarkFlow Team

[⬆ Back to Top](#markflow)

</div>
