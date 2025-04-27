# Multi-modal Content Writing Tool

A modern, feature-rich content writing tool built with Next.js and TailwindCSS that combines text editing with interactive elements.

## Features

- Rich text editing with support for:
  - Text formatting (bold, italic, underline)
  - Headings (H1-H6)
  - Nested lists
  - Custom block elements (quotes, code blocks, callouts)
- Interactive inline components
  - Insert and edit elements within text
  - Drag and reposition elements
- Advanced keyboard shortcuts
  - Combination key support (e.g., Cmd+B for bold)
  - Custom key sequences (e.g., "/" for commands)
  - Keyboard navigation
- Smart clipboard handling
  - Preserve formatting when pasting
  - Format conversion
  - Custom paste behaviors
- @mention system
  - Fuzzy search across data sources
  - Preview cards for mentioned entities
- Undo/redo system
  - Group related operations
  - Preserve selection state
  - Handle complex transformations

## Technical Details

- Built with Next.js and TailwindCSS
- Custom rich text editor implementation (no external WYSIWYG libraries)
- Optimized bundle size (<150KB gzipped)
- Full offline support with state persistence
- High accessibility score (95%+ on Lighthouse)
- Support for latest two versions of major browsers

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
  ├── app/                    # Next.js app directory
  ├── components/
  │   └── Editor/            # Editor components
  │       ├── Editor.tsx     # Main editor component
  │       ├── Toolbar.tsx    # Formatting toolbar
  │       ├── CommandPalette.tsx  # Command interface
  │       ├── MentionSystem.tsx   # @mention system
  │       └── hooks/         # Custom editor hooks
  └── lib/
      └── types/            # TypeScript type definitions
```

## Development

### Key Components

- **Editor**: Core component managing the editing experience
- **Toolbar**: Handles text formatting and block-level controls
- **CommandPalette**: Provides command interface and keyboard shortcuts
- **MentionSystem**: Manages @mentions with fuzzy search

### State Management

The editor uses a custom state management system with the following key features:

- Immutable state updates for reliable undo/redo
- Efficient selection tracking
- Optimized rendering for large documents

### Keyboard Shortcuts

- `Cmd/Ctrl + B`: Bold
- `Cmd/Ctrl + I`: Italic
- `Cmd/Ctrl + U`: Underline
- `/`: Open command palette
- `@`: Trigger mentions
- `Cmd/Ctrl + Z`: Undo
- `Cmd/Ctrl + Shift + Z`: Redo

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
