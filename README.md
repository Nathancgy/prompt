# Prompt Manager

A web application for managing AI prompts for your coding projects. Organize prompts by project, use templates, and streamline your AI-assisted development workflow.

## Features

- **User Authentication**: Secure sign-up and login
- **Project Management**: Create and organize projects
- **Prompt Storage**: Save and organize prompts by project
- **Templates**: Use pre-made prompt templates for common tasks
- **Default Meta Prompts**: Set default prompts to be included with all your project prompts
- **Copy to Clipboard**: Easily copy prompts for use with AI tools

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma with SQLite (can be configured for other databases)
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/prompt-manager.git
   cd prompt-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

4. Seed the database with templates:
   ```bash
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Deployment

This application can be deployed to Vercel, Netlify, or any other platform that supports Next.js applications.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
