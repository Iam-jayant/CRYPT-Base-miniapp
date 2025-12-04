# Email Notification Setup Guide

## Overview
The gift card platform now supports email notifications when NFTs are minted. This uses EmailJS for sending emails.

## Setup Steps

### 1. EmailJS Account Setup
1. Go to [EmailJS.com](https://www.emailjs.com/) and create a free account
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template
4. Get your credentials

### 2. Environment Variables
Add these to your `.env` file (already configured):
```
VITE_EMAILJS_SERVICE_ID=service_tdish3k
VITE_EMAILJS_TEMPLATE_ID=template_1ktzb1c
VITE_EMAILJS_PUBLIC_KEY=63a0jDHrlLtmu8-HE
```

### 3. EmailJS Template
Create a template with these variables:
- `{{to_email}}` - Recipient email address
- `{{sender_address}}` - Wallet address of sender
- `{{token_id}}` - NFT token ID
- `{{token_symbol}}` - Token symbol (USDC, DAI, etc.)
- `{{amount}}` - Amount of tokens in gift card
- `{{claim_url}}` - URL to claim the gift card
- `{{tx_hash}}` - Transaction hash
- `{{explorer_url}}` - Block explorer link

### 4. Example Email Template

```
Subject: 🎁 You've Received a Gift Card NFT!

Hello!

You've received a gift card NFT from {{sender_address}}!

Gift Card Details:
- Token ID: {{token_id}}
- Contains: {{amount}} {{token_symbol}}
- Transaction: {{tx_hash}}

To claim your gift card:
1. Visit: {{claim_url}}
2. Connect your wallet
3. View your gift in "My Gifts"

View transaction: {{explorer_url}}

Happy gifting! 🎉
```

## How It Works

1. User creates a gift card and enters recipient email (optional)
2. After successful minting, email is automatically sent
3. Recipient receives email with claim instructions
4. If email fails, gift card is still created successfully

## Testing

1. Create a gift card with a valid email address
2. Check console for email send status
3. Verify email delivery in recipient inbox
4. Check spam folder if not received

## Troubleshooting

### Email not sending
- Check EmailJS credentials in `.env`
- Verify EmailJS service is active
- Check browser console for errors
- Ensure email template exists

### Email goes to spam
- Add sender to contacts
- Check EmailJS email service settings
- Consider using a custom domain

## Features

✅ Automatic email on NFT mint
✅ Transaction details included
✅ Claim URL provided
✅ Graceful fallback if email fails
✅ Optional - works without email too
