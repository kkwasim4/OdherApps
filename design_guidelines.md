# OdherApp Explorer - Design Guidelines

## Design Approach

**Selected Framework**: Material Design-inspired data-centric approach with crypto industry conventions

**Rationale**: OdherApp Explorer is an information-dense analytics platform where data accuracy, readability, and efficient scanning are paramount. Drawing from established blockchain explorers (Etherscan, DexScreener) and data platforms (Linear, Notion dashboards), prioritizing clarity and functional hierarchy over decorative elements.

**Core Principle**: Every pixel serves the mission of rapid, accurate token analysis. No distracting flourishes—pure signal.

---

## Typography System

**Font Families**:
- Primary: Inter (via Google Fonts CDN) - Clean, highly legible for data
- Monospace: JetBrains Mono - Contract addresses, numerical data, hashes

**Hierarchy**:
- H1 (Platform Title): 3xl, bold, tracking-tight
- H2 (Section Headers): 2xl, semibold  
- H3 (Subsections): xl, semibold
- Body: base, normal weight, leading-relaxed for readability
- Data Labels: sm, medium, uppercase with tracking-wide
- Numerical Data: lg-xl, semibold, monospace for alignment
- Contract Addresses: sm, monospace with text-truncation
- Risk Indicators: base-lg, bold

---

## Layout System

**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16
- Card padding: p-6 or p-8
- Section gaps: gap-4 to gap-8
- Container margins: mx-4 to mx-8
- Vertical rhythm: space-y-6 between major sections

**Grid Structure**:
- Max container width: max-w-7xl
- Main content: 2-column on desktop (lg:grid-cols-2), single on mobile
- Data cards: 3-column grid for metrics (lg:grid-cols-3)
- Single column for search input and results detail view

---

## Component Library

### Core Navigation
**Top Header**: 
- Full-width, sticky positioning
- Logo left, primary navigation center (Analyze, Docs, API), wallet connect right
- Height: h-16
- Border bottom separator

### Search Interface (Primary Interaction)
**Search Bar**:
- Hero positioning but not decorative—functional focus
- Large input field: h-14 with rounded-lg borders
- Placeholder: "Enter contract address (EVM or Solana)"
- Search icon left, chain auto-detect badge right
- Example addresses below as clickable chips (p-2 rounded-full, text-sm)
- Width: max-w-3xl centered

### Data Display Cards

**Token Overview Card**:
- Grid layout displaying: Chain badge, token name/symbol, contract address (truncated, click-to-copy), verification status badge
- Metadata section: Total supply, decimals, holder count in 3-column grid

**Liquidity Panel**:
- Table format with columns: DEX name, Pair, Liquidity USD, 24h volume
- Total liquidity prominently displayed at top (text-3xl, bold)
- Multiple DEX rows with alternating subtle backgrounds

**Risk Analysis Card**:
- Risk score: Large circular progress indicator (1-100 scale)
- Critical warnings as alert boxes with icon (Heroicons: exclamation-triangle)
- Risk factors list with severity badges (High/Medium/Low)
- Grid of detected issues: Owner privileges, LP ownership %, honeypot detection

**Holder Distribution**:
- Horizontal bar chart showing top 10 holders
- Percentage bars with address labels (truncated)

**AI Summary Section**:
- Distinct card with subtle background differentiation
- Icon: sparkles or beaker (Heroicons)
- Paragraph text with key insights highlighted

### Status Badges
- Chain badges: Small rounded pills (px-3 py-1, text-xs) with chain logos (Ethereum, BSC, Solana icons via CDN)
- Verification: Green checkmark + "Verified" or yellow alert + "Unverified"
- Risk levels: Red (High), amber (Medium), green (Low)

### Action Elements
**Primary CTA**: "Analyze Token" button - Large (h-12), full-width on mobile, auto-width desktop
**Secondary**: "View on Explorer", "Share Analysis" - Ghost/outline style
**Copy buttons**: Icon-only with tooltip, positioned next to addresses

---

## Page Structure

**Landing/Search Page**:
1. Header navigation
2. Search hero: Centered search bar with heading "Multi-Chain Token Intelligence" (text-4xl, bold), subheading explaining instant verification
3. Feature highlights: 3-column grid (lg:grid-cols-3) showcasing key capabilities with icons
4. Example tokens section: Cards demonstrating analysis results
5. Trust indicators: "23 Chains Supported" stats in 4-column grid
6. Footer: Links, social, documentation

**Analysis Results Page**:
1. Sticky header with search bar (condensed)
2. Token overview card spanning full width
3. Two-column layout (lg:grid-cols-2):
   - Left: Liquidity panel, AI summary
   - Right: Risk analysis, holder distribution
4. Expandable sections for advanced data (contract functions, transaction history)

---

## Images

**No large hero images**. This is a data tool—visual weight goes to information display.

**Icon Usage**:
- Heroicons (via CDN) for all UI icons
- Chain logos: Small 24x24px SVG logos for Ethereum, BSC, Polygon, Solana etc. (use public CDN sources)
- Risk indicators: Warning triangles, checkmarks, info circles

**Illustrations**: Optional decorative elements in empty states ("No analysis yet—paste a contract address to begin")

---

## Interactions

**Minimal animations**:
- Smooth transitions on card reveals (transition-all duration-200)
- Loading states: Subtle skeleton loaders for async data
- No scroll-triggered animations
- Hover states: Slight opacity/scale changes on interactive elements

**Critical UX**:
- Auto-focus search input on page load
- Real-time chain detection as user types
- Instant feedback for invalid addresses
- Progressive data loading (metadata → liquidity → risk)
- Toast notifications for copy actions

---

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation for search and results
- Color-blind safe risk indicators (icons + text, not just color)
- Sufficient contrast ratios for all data text
- Focus visible states on all interactive components