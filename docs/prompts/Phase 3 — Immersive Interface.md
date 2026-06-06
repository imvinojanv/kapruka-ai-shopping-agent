# Task: Phase 3 - Conversational Shopping Experience

Read:

/docs/Kapruka AI Shopping Agent Challenge - Blueprint.md

Review all Phase 1 and Phase 2 outputs.

You are now building the entire frontend experience.

Goal:

Create an award-winning AI shopping interface.

## Design Requirements

Stack:

- Shadcn UI
- Tailwind CSS
- Framer Motion
- Zustand

## Build

src/components/

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
- CartDrawer

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

Minimum width:

375px

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