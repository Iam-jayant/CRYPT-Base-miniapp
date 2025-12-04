# Design Document

## Overview

The CreateGiftCard page redesign implements a professional split-screen layout that separates the gift card creation workflow (left) from an inspirational gallery of animated pixel cards (right). The design removes all emoji decorations, implements proper artwork mode switching between AI generation and manual upload, and maintains the Deep Tech Dark Mode aesthetic with glassmorphism effects.

## Architecture

### Component Structure

```
CreateGiftCard (Page Component)
├── Wallet Connection Guard
├── Split-Screen Container
│   ├── Left Panel - Creation Form
│   │   ├── Page Header
│   │   ├── Artwork Mode Selector (Tabs)
│   │   ├── AI Generation Section
│   │   │   ├── Prompt Input
│   │   │   └── Generate Button
│   │   ├── Upload Section
│   │   │   ├── File Input
│   │   │   └── Preview
│   │   ├── Artwork Preview
│   │   └── Gift Card Details Form
│   │       ├── Token Selection
│   │       ├── Amount Input
│   │       ├── Recipient Email
│   │       └── Mint Button
│   └── Right Panel - Gallery
│       └── PixelCard Grid (4 cards)
│           ├── PixelCard (variant: blue)
│           ├── PixelCard (variant: pink)
│           ├── PixelCard (variant: yellow)
│           └── PixelCard (variant: default)
└── PixelCard Component (new)
    ├── Canvas Animation Logic
    └── Pixel Class
```

### Layout Strategy

- **Desktop (≥1024px)**: Two-column grid with 50/50 split
- **Tablet (768px-1023px)**: Two-column grid with 60/40 split
- **Mobile (<768px)**: Single column, gallery stacked below form

### State Management

```typescript
// Artwork state
const [artworkMode, setArtworkMode] = useState<'ai' | 'upload'>('ai');
const [prompt, setPrompt] = useState('');
const [generatedImage, setGeneratedImage] = useState<string | null>(null);
const [uploadedImage, setUploadedImage] = useState<string | null>(null);
const [imageBlob, setImageBlob] = useState<Blob | null>(null);

// Form state
const [selectedToken, setSelectedToken] = useState<`0x${string}`>(...);
const [amount, setAmount] = useState('');
const [recipientEmail, setRecipientEmail] = useState('');
const [useCustomToken, setUseCustomToken] = useState(false);
const [customTokenAddress, setCustomTokenAddress] = useState<`0x${string}`>('0x');

// Loading states
const [isGenerating, setIsGenerating] = useState(false);
const [isMinting, setIsMinting] = useState(false);
```

## Components and Interfaces

### PixelCard Component

**Purpose**: Animated card component with pixel shimmer effects for the gallery

**Props Interface**:
```typescript
interface PixelCardProps {
  variant?: 'default' | 'blue' | 'yellow' | 'pink';
  gap?: number;
  speed?: number;
  colors?: string;
  noFocus?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

**Pixel Class**:
- Manages individual pixel animation state
- Handles appear/disappear/shimmer animations
- Calculates delay based on distance from center for wave effect

**Animation Logic**:
- `appear()`: Pixels grow from center outward with delay
- `disappear()`: Pixels shrink back to center
- `shimmer()`: Continuous size oscillation when fully appeared
- RequestAnimationFrame loop at 60fps

**Variants**:
- `default`: Slate colors (#f8fafc, #f1f5f9, #cbd5e1)
- `blue`: Sky blue colors (#e0f2fe, #7dd3fc, #0ea5e9)
- `yellow`: Yellow colors (#fef08a, #fde047, #eab308)
- `pink`: Rose colors (#fecdd3, #fda4af, #e11d48)

### CreateGiftCard Page Updates

**Artwork Mode Selector**:
```typescript
// Tab-based selector
<div className="flex gap-2 p-1 bg-black/40 rounded-lg border border-white/10">
  <button
    onClick={() => setArtworkMode('ai')}
    className={cn(
      "flex-1 px-4 py-2 rounded-md transition-all",
      artworkMode === 'ai' 
        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
        : "text-slate-400 hover:text-slate-300"
    )}
  >
    AI Generate
  </button>
  <button
    onClick={() => setArtworkMode('upload')}
    className={cn(
      "flex-1 px-4 py-2 rounded-md transition-all",
      artworkMode === 'upload'
        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
        : "text-slate-400 hover:text-slate-300"
    )}
  >
    Upload Image
  </button>
</div>
```

**Conditional Rendering**:
- Show AI prompt input when `artworkMode === 'ai'`
- Show file upload when `artworkMode === 'upload'`
- Display appropriate preview based on active mode
- Clear opposite mode's data when switching

## Data Models

### Gallery Card Content

```typescript
interface GalleryCardContent {
  title: string;
  description: string;
  tokenSymbol: string;
  amount: string;
}

const galleryCards: GalleryCardContent[] = [
  {
    title: "Birthday Celebration",
    description: "Special gift for milestone moments",
    tokenSymbol: "USDC",
    amount: "50.00"
  },
  {
    title: "Holiday Greetings",
    description: "Seasonal tokens of appreciation",
    tokenSymbol: "DAI",
    amount: "100.00"
  },
  {
    title: "Achievement Reward",
    description: "Recognize outstanding performance",
    tokenSymbol: "USDC",
    amount: "250.00"
  },
  {
    title: "Thank You Gift",
    description: "Express gratitude with value",
    tokenSymbol: "DAI",
    amount: "75.00"
  }
];
```

## Error Handling

### Validation Rules

1. **Artwork Validation**:
   - AI mode: Prompt must not be empty
   - Upload mode: File must be valid image format (jpg, png, gif, webp)
   - File size limit: 10MB maximum

2. **Amount Validation**:
   - Must be greater than 0
   - Must not exceed user's token balance
   - Must be valid decimal number

3. **Token Address Validation**:
   - Custom address must be valid Ethereum address format
   - Must start with "0x" and be 42 characters

### Error Messages

```typescript
const ERROR_MESSAGES = {
  NO_ARTWORK: 'Please generate or upload artwork first',
  INVALID_AMOUNT: 'Please enter a valid amount greater than 0',
  INSUFFICIENT_BALANCE: 'Amount exceeds your token balance',
  INVALID_ADDRESS: 'Please enter a valid token address',
  UPLOAD_FAILED: 'Failed to upload image. Please try again',
  GENERATION_FAILED: 'Failed to generate artwork. Please try again',
  MINT_FAILED: 'Failed to mint gift card. Please check your wallet',
};
```

## Testing Strategy

### Unit Tests

1. **PixelCard Component**:
   - Test pixel initialization with different variants
   - Test animation lifecycle (appear → shimmer → disappear)
   - Test responsive behavior with ResizeObserver
   - Test reduced motion preference handling

2. **CreateGiftCard Page**:
   - Test artwork mode switching
   - Test form validation logic
   - Test image upload handling
   - Test AI generation flow
   - Test minting workflow

### Integration Tests

1. **Artwork Generation Flow**:
   - User enters prompt → clicks generate → sees generated image
   - User uploads file → sees preview → can proceed to mint

2. **Mode Switching**:
   - Switch from AI to Upload clears generated image
   - Switch from Upload to AI clears uploaded file
   - Form state persists across mode switches

3. **Minting Flow**:
   - Complete form → approve tokens → mint NFT → receive confirmation
   - Email notification sent if recipient email provided

### Visual Regression Tests

1. Split-screen layout at different breakpoints
2. Gallery card animations and hover states
3. Form states (empty, filled, loading, error)
4. Glassmorphism effects and backdrop blur

## Styling Guidelines

### Color Palette

```css
/* Primary */
--violet-500: #8b5cf6;
--violet-600: #7c3aed;
--purple-600: #9333ea;

/* Backgrounds */
--zinc-900: #18181b;
--black-40: rgba(0, 0, 0, 0.4);

/* Borders */
--white-10: rgba(255, 255, 255, 0.1);
--violet-500-20: rgba(139, 92, 246, 0.2);

/* Text */
--slate-300: #cbd5e1;
--slate-400: #94a3b8;
--white: #ffffff;
```

### Typography

```css
/* Headings */
.page-title {
  font-size: 2.5rem; /* 40px */
  font-weight: 300;
  line-height: 1.2;
}

.section-title {
  font-size: 1.25rem; /* 20px */
  font-weight: 500;
  line-height: 1.4;
}

/* Body */
.body-text {
  font-size: 0.875rem; /* 14px */
  font-weight: 400;
  line-height: 1.5;
}

/* Labels */
.label-text {
  font-size: 0.875rem; /* 14px */
  font-weight: 500;
  line-height: 1.4;
}
```

### Glassmorphism Effect

```css
.glass-card {
  background: rgba(24, 24, 27, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
}
```

### Responsive Breakpoints

```css
/* Mobile first approach */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large desktop */ }
```

## Performance Considerations

1. **Canvas Optimization**:
   - Use RequestAnimationFrame for smooth 60fps animations
   - Cancel animation frames on component unmount
   - Throttle resize observer callbacks

2. **Image Handling**:
   - Compress uploaded images before IPFS upload
   - Use object URLs for local preview (memory efficient)
   - Revoke object URLs on cleanup

3. **Lazy Loading**:
   - Gallery cards render immediately (above fold)
   - Form sections render conditionally based on state

4. **Code Splitting**:
   - PixelCard component can be lazy loaded if needed
   - AI art service loaded on demand

## Accessibility

1. **Keyboard Navigation**:
   - Tab through mode selector, inputs, and buttons
   - PixelCard components focusable (except pink variant with noFocus)
   - Focus visible indicators on all interactive elements

2. **Screen Readers**:
   - Proper ARIA labels on file inputs
   - Status announcements for loading states
   - Error messages associated with form fields

3. **Reduced Motion**:
   - PixelCard respects `prefers-reduced-motion`
   - Animations disabled or simplified when preference set

4. **Color Contrast**:
   - All text meets WCAG AA standards
   - Focus indicators have sufficient contrast
   - Error states use color + text (not color alone)

## Migration Notes

### Breaking Changes

- `artworkMode` state now actively used (was unused)
- `handleImageUpload` now properly integrated
- `uploadedImage` state now utilized in upload mode

### Backward Compatibility

- Existing AI generation flow remains unchanged
- Token selection and minting logic preserved
- Email notification feature maintained
