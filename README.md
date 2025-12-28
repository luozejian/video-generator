# Mock Video Generator

A mock video generator that supports creating videos of precise sizes for testing purposes.

## Features

### 🎥 Two Generation Modes
- **Real Render Mode**: Generate playable videos with exact target sizes using tail padding technology
- **Fast Mock Mode**: Instantly generate empty .mp4 files of specified sizes for upload limit testing

### 🎛️ Flexible Configuration
- **Target Size**: Specify video size in MB
- **Duration**: Set video length in seconds
- **Resolution**: Customize width and height

### 🌐 Internationalization
- Support for both English and Chinese languages
- Auto-switching based on user preference

### ✅ Precise Size Matching
- Automatic data padding to exactly match target size
- Visual feedback on padding status

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Choose Generation Mode**:
   - Select "Real Render Mode" for playable videos
   - Select "Fast Mock Mode" for instant empty files

2. **Configure Parameters**:
   - Enter target size in MB
   - Set video duration (for Real Render Mode)
   - Adjust resolution (for Real Render Mode)

3. **Start Generation**:
   - Click "Start Generate" button
   - Wait for the progress bar to complete

4. **Download Result**:
   - Once generated, view file details
   - Click "Download" to save the video

## Technology Stack

- **Frontend Framework**: React 19
- **Type System**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Video Generation**: Canvas API & MediaRecorder API

## Project Structure

```
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles with Tailwind directives
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Limited support (some video formats may not be available)
- Safari: Limited support (MediaRecorder API differences)

## Performance Notes

- Real Render Mode may be resource-intensive for large videos
- Videos larger than 500MB may cause browser crashes
- Fast Mock Mode is recommended for testing upload limits

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
