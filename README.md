<div align="center">
   
# AI for WordPress, Design & Development
   
https://github.com/user-attachments/assets/27460f31-feba-4c66-8b96-80f6fbba6863

</div>
This is a modern development environment for WordPress that includes AI capabilities, built with Next.js and Supabase for backend services.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (version 20 or higher)
- pnpm (recommended) or npm
- Git

## Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/prappo/wordpress-ai
   cd wordpress-ai
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # OpenAI Configuration (if using AI features)
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start the development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

   The application will be available at `https://localhost:3000`

## Vercel Deployment

1. **Create a Vercel Account**

   - Sign up at [vercel.com](https://vercel.com)
   - Install the Vercel CLI: `npm i -g vercel`

2. **Deploy to Vercel**

   ```bash
   vercel
   ```

3. **Environment Variables**
   Add the following environment variables in your Vercel project settings:
   - All the variables from your `.env.local` file

## Payment Integration

Payment integration has been removed from this project. The application now focuses on the core WordPress AI development features without payment processing.

## Supabase Configuration

1. **Create a Supabase Project**

   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Database Setup**
   - Create necessary tables in your Supabase database
   - Set up authentication if required
   - Configure row level security (RLS) policies

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors
- `pnpm prettier` - Format code with Prettier

## Troubleshooting

1. **HTTPS Issues in Development**

   - The development server uses experimental HTTPS
   - You might need to accept the self-signed certificate in your browser

2. **General Issues**

   - Check the browser console for any JavaScript errors
   - Verify your environment variables are correctly set

3. **Supabase Connection Issues**
   - Verify your Supabase URL and API keys
   - Check if your IP is allowed in Supabase dashboard
   - Ensure your database tables are properly set up


## License

This project is licensed under the terms of the license included in the repository.
