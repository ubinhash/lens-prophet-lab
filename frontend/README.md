# Lens Starter

A moderntemplate for building decentralized social applications on Lens Protocol.

## Getting Started

Welcome to the Lens Starter template! Here's how to get started quickly:

1. Clone this repository
2. Install dependencies: `bun install`
3. Copy the environment file: `cp .env.example .env`
4. Create a Lens app at [https://developer.lens.xyz/apps](https://developer.lens.xyz/apps)
5. Copy your App ID and paste it into the `.env` file as `NEXT_PUBLIC_APP_ADDRESS`
6. Start the development server: `bun run dev`
7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Tools

- **TS Toolkit**: [Bun](https://bun.sh/)
- **Linting & Formatting**: [Biome](https://biomejs.dev/)
- **Scripts**:
  - `bun run dev` - Start development server
  - `bun run build` - Build for production
  - `bun run start` - Start production server
  - `bun run format` - Format code with Biome
  - `bun run lint` - Lint code with Biome
  - `bun run check` - Format and lint code with Biome

## Technologies used in this template

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (via Radix UI primitives)
- **Lens Protocol**: 
  - `@lens-protocol/client` 
  - `@lens-protocol/react`
  - `@lens-chain/sdk`
- **Theme Handling**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Web3 Integration**:
  - [ConnectKit](https://docs.family.co/connectkit)
  - [wagmi](https://wagmi.sh/)
  - [viem](https://viem.sh/)
- **Form Handling**:
  - [react-hook-form](https://react-hook-form.com/)
  - [zod](https://zod.dev/) (validation)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
