# UI/UX Design Documentation

This document explains the user interface design, component structure, and user experience patterns.

## Design Principles

### 1. Simplicity
- Clean, uncluttered interface
- Minimal cognitive load
- Clear visual hierarchy

### 2. Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast colors

### 3. Responsiveness
- Mobile-first design
- Flexible layouts
- Touch-friendly targets (min 44x44px)

### 4. Performance
- Smooth animations (60fps)
- Fast page loads
- Efficient DOM updates

## Color System

### Primary Colors
```css
--primary-color: #4f46e5;      /* Indigo - Main brand color */
--primary-dark: #4338ca;       /* Darker indigo - Hover states */
--secondary-color: #10b981;    /* Green - Success, hydration */
--danger-color: #ef4444;       /* Red - Delete, warnings */
```

### Neutral Colors
```css
--text-primary: #1f2937;       /* Dark gray - Primary text */
--text-secondary: #6b7280;     /* Medium gray - Secondary text */
--bg-primary: #ffffff;         /* White - Main background */
--bg-secondary: #f9fafb;       /* Light gray - Card backgrounds */
--border-color: #e5e7eb;       /* Light gray - Borders */
```

### Usage Guidelines
- Primary: Buttons, links, active states
- Secondary: Success states, progress indicators
- Danger: Destructive actions, errors
- Text: Ensure WCAG AA contrast (4.5:1 minimum)

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

**Benefits**:
- Uses system fonts (fast loading)
- Cross-platform consistency
- Native feel on each OS

### Font Sizes
- **H1 (App Title)**: 1.5rem (24px)
- **H2 (Section Headers)**: 1.5rem (24px)
- **H3 (Subsection)**: 1.2rem (19.2px)
- **Body**: 1rem (16px)
- **Small**: 0.9rem (14.4px)
- **Tiny**: 0.75rem (12px)

### Font Weights
- **Regular**: 400
- **Semi-bold**: 600
- **Bold**: 700

## Layout Structure

### Main Container
```
┌─────────────────────────────────┐
│     Top Bar (Header)            │
│  - App Title                    │
│  - Greeting                     │
│  - Score & Streak               │
├─────────────────────────────────┤
│     Navigation Tabs             │
│  [Tasks] [Hydration] [AI] [...] │
├─────────────────────────────────┤
│                                 │
│     Content Area                │
│  (Tab-specific content)         │
│                                 │
└─────────────────────────────────┘
```

### Top Bar Component
- **Purpose**: Display app identity and key metrics
- **Layout**: Flexbox with space-between
- **Responsive**: Stacks vertically on mobile

### Navigation Tabs
- **Purpose**: Switch between main sections
- **Interaction**: Click to activate
- **Visual**: Bottom border indicator
- **Mobile**: Horizontal scrollable

## Component Library

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">Save</button>
```
- Use for: Primary actions
- Style: Solid background, white text
- States: Default, hover, active, disabled

#### Secondary Button
```html
<button class="btn btn-secondary">Cancel</button>
```
- Use for: Secondary actions
- Style: Outlined, transparent background
- States: Border color changes on hover

#### Success Button
```html
<button class="btn btn-success">Complete</button>
```
- Use for: Positive actions (complete task)
- Style: Green background

#### Danger Button
```html
<button class="btn btn-danger">Delete</button>
```
- Use for: Destructive actions
- Style: Red background
- **Always confirm before action**

### Task Card Component

**Structure**:
```
┌─────────────────────────────────┐
│ Title                  [Priority]│
│ Notes                            │
│ 📅 Date  🔄 Repeat  ⭐ Points    │
│ [Complete] [Edit] [Delete]       │
└─────────────────────────────────┘
```

**States**:
- **Default**: White background, border
- **Hover**: Shadow, slight lift
- **Completed**: Grayed out, strikethrough text
- **Overdue**: Red warning indicator

**Responsive Behavior**:
- Stacks vertically on mobile
- Buttons wrap on small screens

### Modal Component

**Structure**:
```
┌─────────────────────────────────┐
│                    [×]          │
│  Modal Title                    │
│                                 │
│  Form Fields                    │
│                                 │
│              [Cancel] [Save]    │
└─────────────────────────────────┘
```

**Features**:
- Backdrop overlay (50% opacity)
- Close on backdrop click
- Close on ESC key
- Scrollable content
- Slide-up animation

### Progress Ring Component

**Purpose**: Visual hydration progress

**Implementation**:
- SVG circle with stroke-dasharray
- Animated via CSS transition
- Percentage calculated dynamically

**Visual**:
```
        ┌─────┐
        │ 5.5 │
        │ / 8 │
        └─────┘
```

### Form Components

#### Input Fields
- **Style**: Rounded borders, padding
- **Focus**: Primary color border
- **Validation**: Red border on error (future)

#### Select Dropdowns
- **Style**: Consistent with inputs
- **Options**: Clear labels

#### Textarea
- **Style**: Multi-line input
- **Resize**: Vertical only

## Animations

### Principles
- **Subtle**: Enhance, don't distract
- **Fast**: 200-300ms duration
- **Purposeful**: Provide feedback

### Animation Types

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```
- Use: Tab switching, modal opening

#### Slide In
```css
@keyframes slideIn {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```
- Use: Task cards appearing

#### Slide Up
```css
@keyframes slideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```
- Use: Modal appearance

### Respect User Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

## Responsive Design

### Breakpoints
- **Mobile**: < 600px
- **Tablet**: 600px - 900px
- **Desktop**: > 900px

### Mobile Adaptations
1. **Top Bar**: Stacks vertically
2. **Navigation**: Horizontal scroll
3. **Task Header**: Stacks buttons
4. **Modal**: Full-width with padding
5. **Buttons**: Full-width on small screens

### Touch Targets
- Minimum: 44x44px
- Spacing: 8px minimum between targets
- Button padding: Adequate for thumb taps

## Accessibility Features

### Keyboard Navigation
- Tab order: Logical flow
- Focus indicators: Visible outlines
- Shortcuts: ESC to close modals

### Screen Reader Support
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`
- ARIA labels: Where needed
- Alt text: For images (future)

### Color Contrast
- Text/Background: WCAG AA (4.5:1)
- Interactive elements: Clear distinction
- Error states: Red for visibility

## User Flows

### Adding a Task
1. Click "+ Add Task" button
2. Modal opens with form
3. Fill in task details
4. Click "Save Task"
5. Modal closes
6. Task appears in list
7. Success feedback (optional)

### Completing a Task
1. Click "Complete" button
2. Task marked as completed
3. Score increases
4. Streak updates (if applicable)
5. Task moves to bottom (or filtered out)
6. Notification shown

### Setting Background
1. Go to Settings tab
2. Click "Upload Background"
3. Select image file
4. Image loads and displays
5. Stored in IndexedDB
6. Applied to background overlay

## Customization Options

### Current
- Background image upload
- Notification preferences
- Hydration goal

### Future
- Theme selection (light/dark)
- Color scheme customization
- Font size adjustment
- Layout preferences

## Performance Optimizations

### CSS
- Use transform/opacity for animations (GPU-accelerated)
- Avoid layout-triggering properties in animations
- Minimal repaints/reflows

### JavaScript
- Debounce input handlers
- Throttle scroll events
- Lazy load images (future)
- Virtual scrolling for long lists (future)

### Rendering
- Update only changed DOM elements
- Batch DOM updates
- Use DocumentFragment for multiple inserts

## Error States

### Empty States
- **No Tasks**: Friendly message with CTA
- **No Hydration Log**: Encouragement to start
- **No Results**: Clear explanation

### Error Messages
- **Clear**: Explain what went wrong
- **Actionable**: Suggest next steps
- **Visible**: Prominent display
- **Dismissible**: User can close

## Future UI Enhancements

### Planned
- Dark mode
- Multiple themes
- Customizable dashboard
- Drag-and-drop task reordering
- Swipe gestures on mobile
- Pull-to-refresh
- Skeleton loaders
- Toast notifications
- Tooltips
- Progress bars for goals

