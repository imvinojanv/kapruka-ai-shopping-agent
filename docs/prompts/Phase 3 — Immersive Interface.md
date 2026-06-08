# Task: Phase 3 - Conversational Shopping Experience

Read:

/docs/Kapruka AI Shopping Agent Challenge - Blueprint.md

Review all Phase 1 and Phase 2 outputs.

You are now building the entire frontend experience.

Goal:

Create an award-winning AI shopping interface.

## Tool Result Rendering Rules

The UI must never render raw MCP payloads.

Create a mapping layer:

search_products
→ ProductCarousel

get_product
→ ProductDetailCard

list_categories
→ CategoryExplorer

list_delivery_cities
→ CitySelector

check_delivery
→ DeliveryCalculator

create_order
→ CheckoutCard

track_order
→ TrackingTimeline

## Design Requirements

Stack:

- Shadcn UI
- Tailwind CSS
- Framer Motion
- Zustand

## Build

components/

### Chat

- ChatContainer
- ChatMessage
- MessageComposer
- TypingIndicator
- StreamingResponse

### Product Experiences

- ProductCard
- ProductCarousel
- ProductComparison
- QuantitySelector
- CartModal

### Delivery

- DeliveryCalculator
- DeliveryCityPicker
- ShippingTimeline

### Checkout

- OrderSummary
- CheckoutReview
- GiftOptions

### System

- ToolExecutionStatus
- LoadingSkeletons
- ErrorStates

## Application Layout Requirements

The UI should follow a modern AI assistant experience similar to ChatGPT, Claude, Perplexity, or Cursor.

You have freedom regarding visual styling, spacing, color palette (Already Defined with Shadcn UI), and interaction design, but must follow the structural layout below.

### Primary Layout

The application consists of:

1. Collapsible Sidebar
2. Main Chat Workspace

Desktop:
- Sidebar visible by default
- User can collapse/expand

Mobile/Tablet:
- Sidebar becomes a left-slide-over drawer/sheet (use Shadcn UI's Sheet component, like: `components/examples/c-sheet-4.tsx`)
- Header menu button controls visibility

---

## Sidebar Requirements

Create a dedicated Sidebar component.

### Top Section

Contains:

- Application logo (use `public/kapruka-logo.png`)
- Label badge: "AI Assistant"

### Action Section

Contains:

- "New Assistant" button

Behavior:

- Creates a new chat thread
- Clears active conversation state
- Generates a new session identifier
- Preserves previous chat history

### History Section

Scrollable list containing (Ordered by last updated):

- Conversation title
- Delete action

Requirements:

- Infinite height scroll area
- Active conversation highlighted
- Smooth animations during creation/deletion
- Persist locally

### User Section

Fixed at bottom.

Contains:

- Avatar (use Shadcn UI Avatar component)
- Full name (use "Vinojan Abhimanyu" as dummy data)
- Email address (use "imvinojanv@gmail.com" as dummy data)

Just use a dummy user information for now.

---

## Main Workspace Layout

### Header

Sticky top navigation.

#### Left Side

Contains:

- Sidebar toggle button
- Current model indicator (not for mobile)

Display:

Claude Sonnet 4.5 (Just a static display for now)

Use a modern model selector appearance even if only one model is available. (This is for future-proofing when more models are added. Now it can just be a static display, but design the architecture to allow easy expansion to a popover selector in the future.)

#### Right Side

Contains:

1. Settings button
2. Cart button

### Settings Popover

Create a settings modal or popover.

Support:

- Language selection (English, Sinhala, Tamil)
- Currency selection (LKR, USD)
- Theme selection (Light, Dark) as a togggle button

Design the architecture to allow future settings expansion.

### Cart Button

Requirements:

- Cart icon
- Product count badge
- Animated updates
- Opens cart modal on click

---

## Welcome Experience

When there are no messages:

Display a landing experience instead of an empty chat.

Include:

### Welcome Section

- Greeting headline
- Short description
- Shopping assistant explanation

### Suggested Prompt Cards

Display clickable suggestion cards.

Examples:

- I need to buy a birthday cake under Rs. 5000
- I am looking for a toy for my baby
- Recommend a gift for my wife
- Show flower delivery options in Colombo

Requirements:

- Responsive grid layout
- Hover effects
- Motion animations
- One-click execution

Clicking a card should:

1. Insert the prompt
2. Trigger the AI request immediately
3. Open the conversation (should navigate with chat uuid in URL for deep linking, like `/chat/{uuid}`)

---

## Chat Area

Requirements:

- Streaming messages
- Tool execution indicators
- Generative UI cards
- Product carousels
- Delivery widgets
- Checkout widgets

Support:

- Markdown rendering
- Code blocks
- Rich product layouts
- Smooth streaming transitions

---

## Composer Area

The prompt input section must remain fixed to the bottom.

### Prompt Input

Large multi-line prompt input.

Requirements:

- Auto-growing textarea
- Keyboard shortcuts
- Mobile optimized

### Left Actions - Second Row

Include:

1. Zap icon
2. Voice/Microphone icon

Note:

Voice functionality is future scope.

Design architecture to allow future speech integration.

### Right Actions - Second Row

Include:

1. Usage indicator
2. Send button

Display:

"52% Used"

Note:

This is currently visual only.
Create extensible architecture for the token usage indicator in the future functionality.

### Keyboard Shortcuts Behavior

Enter:
- Submit message

Shift + Enter:
- New line

/:
- Open tags suggestion menu (future scope)

Disable send button while requests are processing.

---

## Motion & Interaction Requirements

Use Framer Motion extensively.

Implement:

- Sidebar collapse animations
- Chat message entry animations
- Product card animations
- Cart drawer animations
- Prompt card hover interactions
- Modal transitions
- Streaming state transitions

Target:

Premium AI product feel.

Avoid excessive animation.

Prioritize smoothness and responsiveness.

---

## UX Requirements

The application should feel closer to:

- ChatGPT
- Claude
- Perplexity
- Gemini

than a traditional ecommerce website.

The AI conversation must remain the primary experience.

Products, delivery checks, carts, and checkout flows should appear as contextual UI blocks within the conversation rather than separate pages.

Maintain a single conversational workspace throughout the shopping journey.

## Animation Requirements

Implement:

- Layout animations
- Streaming animations
- Product card transitions
- Carousel transitions
- Cart animations

Target:

60 FPS interaction quality

## Zustand

Persist:

- Cart
- User profile
- Delivery details
- Chat history

Persist across refreshes.

## Responsive Support

Support:

- Mobile
- Tablet
- Desktop

Minimum width: 375px

## Checkout Expiry Experience

Checkout URLs expire after 60 minutes.

Requirements:

- Countdown timer
- Expiry warning banner
- Refresh checkout CTA
- Persistent order state

## AI UX Enhancements

When tool results arrive:

Render UI components instead of raw text.

Examples:

search_products
→ Product Carousel

check_delivery
→ Delivery Widget

create_order
→ Checkout Card

track_order
→ Order Tracking Card

## Deliverables

Generate:

- Component hierarchy
- Reusable UI primitives
- Zustand stores
- Motion architecture
- Responsive layouts

Do not optimize localization yet.

That belongs to Phase 4.