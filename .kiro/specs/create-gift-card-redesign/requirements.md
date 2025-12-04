# Requirements Document

## Introduction

This feature redesigns the CreateGiftCard page to provide a professional, production-ready interface with a split-screen layout. The left side handles gift card creation functionality (AI generation or user upload), while the right side displays a presaved gallery of animated pixel cards for inspiration.

## Glossary

- **CreateGiftCard Page**: The interface where users create NFT gift cards with embedded tokens
- **Split-Screen Layout**: A two-column layout dividing the page into functional sections
- **Pixel Card Gallery**: A collection of animated card previews using pixel animation effects
- **Artwork Mode**: The method of providing artwork (AI generation or manual upload)
- **Gift Card NFT**: An ERC-721 token with embedded ERC-20 token vault

## Requirements

### Requirement 1

**User Story:** As a user, I want to choose between AI-generated artwork or uploading my own image, so that I have flexibility in creating personalized gift cards

#### Acceptance Criteria

1. WHEN the user accesses the CreateGiftCard page, THE System SHALL display two artwork mode options: "AI Generate" and "Upload Image"
2. WHEN the user selects "AI Generate" mode, THE System SHALL display a text input field for entering an art generation prompt
3. WHEN the user selects "Upload Image" mode, THE System SHALL display a file upload interface accepting image files
4. WHEN the user switches between modes, THE System SHALL clear any previously generated or uploaded artwork
5. THE System SHALL maintain the selected artwork mode state throughout the gift card creation process

### Requirement 2

**User Story:** As a user, I want to see a gallery of example gift cards, so that I can get inspiration for my own designs

#### Acceptance Criteria

1. THE CreateGiftCard Page SHALL display a split-screen layout with creation form on the left and gallery on the right
2. THE Gallery Section SHALL display exactly four PixelCard components with animated pixel effects
3. WHEN the user hovers over a gallery card, THE PixelCard SHALL animate with pixel appearance effects
4. THE Gallery Section SHALL remain visible and fixed while the user scrolls the creation form
5. WHERE the viewport width is below 1024px, THE System SHALL stack the gallery below the creation form

### Requirement 3

**User Story:** As a user, I want a clean, professional interface without emojis, so that the application feels production-ready

#### Acceptance Criteria

1. THE CreateGiftCard Page SHALL remove all emoji characters from headings, labels, and button text
2. THE System SHALL use professional typography and spacing consistent with the Deep Tech Dark Mode theme
3. THE System SHALL apply glassmorphism effects to all card containers
4. THE System SHALL use semantic text labels instead of decorative icons
5. THE System SHALL maintain visual hierarchy through font weights and sizes rather than emojis

### Requirement 4

**User Story:** As a user, I want to configure gift card details including token type and amount, so that I can create meaningful gifts

#### Acceptance Criteria

1. WHEN the user has generated or uploaded artwork, THE System SHALL display the gift card details form
2. THE Gift Card Details Form SHALL include fields for token selection, amount, and recipient email
3. THE System SHALL display the user's current token balance for the selected token
4. WHEN the user enters an amount exceeding their balance, THE System SHALL display a validation warning
5. THE System SHALL allow optional custom token address input via a toggle checkbox

### Requirement 5

**User Story:** As a user, I want clear visual feedback during the minting process, so that I understand what's happening

#### Acceptance Criteria

1. WHEN the user clicks the mint button, THE System SHALL display a loading state with descriptive status messages
2. THE System SHALL show sequential progress indicators for: IPFS upload, token approval, and NFT minting
3. WHEN minting completes successfully, THE System SHALL display a success message with transaction hash
4. WHEN an error occurs, THE System SHALL display a user-friendly error message parsed from the contract error
5. AFTER successful minting, THE System SHALL reset the form to its initial state
