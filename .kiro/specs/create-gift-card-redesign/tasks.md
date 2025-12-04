# Implementation Plan

- [x] 1. Create PixelCard component with animation logic

  - Create `frontend/src/components/PixelCard.tsx` with Pixel class and animation logic
  - Create `frontend/src/components/PixelCard.css` with styling for canvas and card container
  - Implement four variant configurations (default, blue, yellow, pink)
  - Add ResizeObserver for responsive canvas sizing
  - Implement RequestAnimationFrame animation loop with 60fps throttling
  - Add reduced motion support via media query detection
  - _Requirements: 2.2, 2.3_

- [x] 2. Redesign CreateGiftCard page with split-screen layout

  - [x] 2.1 Update page structure and remove emojis

    - Remove all emoji characters from headings, buttons, and labels

    - Implement split-screen container with grid layout (50/50 on desktop)
    - Add responsive breakpoints for tablet (60/40) and mobile (stacked)
    - Update page title and subtitle with professional copy
    - _Requirements: 3.1, 3.2, 3.4, 2.1_

  - [x] 2.2 Implement artwork mode selector

    - Create tab-based mode selector UI with "AI Generate" and "Upload Image" options
    - Wire up `artworkMode` state to control active tab styling
    - Add mode switching logic that clears opposite mode's data
    - Style active/inactive states with violet accent colors
    - _Requirements: 1.1, 1.4_

  - [x] 2.3 Implement conditional artwork sections

    - Show AI prompt input and generate button when `artworkMode === 'ai'`
    - Show file upload input and preview when `artworkMode === 'upload'`
    - Wire up existing `handleImageUpload` function to upload mode
    - Display appropriate preview based on active mode (generatedImage vs uploadedImage)
    - Ensure imageBlob is set correctly for both modes
    - _Requirements: 1.2, 1.3, 1.5_

  - [x] 2.4 Create gallery section with PixelCard grid

    - Import PixelCard component into CreateGiftCard page
    - Create gallery container in right panel with fixed positioning on desktop
    - Render four PixelCard components with different variants (blue, pink, yellow, default)
    - Add sample content to each card (title, description, token info)
    - Style gallery grid with proper spacing and alignment
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.5 Update form styling and validation

    - Apply glassmorphism effects to all form sections
    - Update input field styling to match Deep Tech Dark Mode theme
    - Add validation for uploaded file size (10MB max) and format
    - Update error messages to use professional copy without emojis
    - Ensure balance display and validation work with both artwork modes
    - _Requirements: 3.3, 4.2, 4.3, 4.4_

- [x] 3. Update responsive behavior and accessibility


  - [x] 3.1 Implement responsive layout

    - Test split-screen layout at desktop breakpoint (≥1024px)
    - Test adjusted split at tablet breakpoint (768px-1023px)
    - Test stacked layout at mobile breakpoint (<768px)
    - Ensure gallery remains visible but scrollable on smaller screens
    - _Requirements: 2.5_

  - [x] 3.2 Add accessibility features

    - Ensure keyboard navigation works through mode selector and form
    - Add proper ARIA labels to file input
    - Test PixelCard focus states (except pink variant with noFocus)
    - Verify reduced motion preference disables animations
    - Test screen reader announcements for loading states
    - _Requirements: 3.2, 3.3_

- [ ] 4. Clean up unused code and fix diagnostics




  - Remove unused state variables if any remain after refactor
  - Fix TypeScript warnings about unused variables
  - Ensure all imports are used
  - Run diagnostics to verify no compilation errors
  - _Requirements: 3.1, 3.5_
