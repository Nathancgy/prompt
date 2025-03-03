import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create template categories
  const templates = [
    {
      name: 'Feature Implementation',
      description: 'A template for requesting a new feature implementation',
      content: `I need to implement the following feature:

[FEATURE DESCRIPTION]

Technical requirements:
- [REQUIREMENT 1]
- [REQUIREMENT 2]
- [REQUIREMENT 3]

The feature should be implemented using [TECHNOLOGY/FRAMEWORK].

Please provide a detailed implementation plan and the code needed to implement this feature.`,
      category: 'Development',
      isPublic: true,
    },
    {
      name: 'Bug Fix',
      description: 'A template for requesting help with fixing a bug',
      content: `I'm encountering the following bug:

[BUG DESCRIPTION]

Steps to reproduce:
1. [STEP 1]
2. [STEP 2]
3. [STEP 3]

Expected behavior:
[EXPECTED BEHAVIOR]

Actual behavior:
[ACTUAL BEHAVIOR]

Error message (if any):
\`\`\`
[ERROR MESSAGE]
\`\`\`

Please help me identify the cause of this bug and provide a solution.`,
      category: 'Debugging',
      isPublic: true,
    },
    {
      name: 'Code Review',
      description: 'A template for requesting a code review',
      content: `Please review the following code:

\`\`\`
[CODE TO REVIEW]
\`\`\`

I'd like feedback on:
- Code quality and best practices
- Potential bugs or edge cases
- Performance considerations
- Security concerns
- Any suggestions for improvement

Please provide detailed feedback and suggestions for improvement.`,
      category: 'Development',
      isPublic: true,
    },
    {
      name: 'Architecture Design',
      description: 'A template for requesting help with system architecture',
      content: `I need help designing the architecture for the following system:

[SYSTEM DESCRIPTION]

Requirements:
- [REQUIREMENT 1]
- [REQUIREMENT 2]
- [REQUIREMENT 3]

Technical constraints:
- [CONSTRAINT 1]
- [CONSTRAINT 2]

Please provide a detailed architecture design, including:
- Component diagram
- Data flow
- Technology stack recommendations
- Scalability considerations
- Security considerations`,
      category: 'Architecture',
      isPublic: true,
    },
    {
      name: 'API Documentation',
      description: 'A template for generating API documentation',
      content: `Please help me document the following API endpoint:

Endpoint: [ENDPOINT]
Method: [HTTP METHOD]
Description: [ENDPOINT DESCRIPTION]

Request parameters:
- [PARAMETER 1]: [DESCRIPTION] - [TYPE] - [REQUIRED/OPTIONAL]
- [PARAMETER 2]: [DESCRIPTION] - [TYPE] - [REQUIRED/OPTIONAL]

Request body:
\`\`\`json
[REQUEST BODY EXAMPLE]
\`\`\`

Response:
\`\`\`json
[RESPONSE EXAMPLE]
\`\`\`

Error responses:
- [ERROR CODE 1]: [ERROR DESCRIPTION]
- [ERROR CODE 2]: [ERROR DESCRIPTION]

Please generate comprehensive documentation for this API endpoint.`,
      category: 'Documentation',
      isPublic: true,
    },
    {
      name: 'Database Query Optimization',
      description: 'A template for optimizing database queries',
      content: `I need help optimizing the following database query:

\`\`\`sql
[DATABASE QUERY]
\`\`\`

Database: [DATABASE TYPE]
Table structure:
- [TABLE 1]: [COLUMNS]
- [TABLE 2]: [COLUMNS]

Current performance:
- Execution time: [EXECUTION TIME]
- Number of rows: [NUMBER OF ROWS]

Please analyze this query and suggest optimizations to improve its performance.`,
      category: 'Database',
      isPublic: true,
    },
    {
      name: 'Unit Test Generation',
      description: 'A template for generating unit tests',
      content: `Please help me write unit tests for the following code:

\`\`\`
[CODE TO TEST]
\`\`\`

Testing framework: [TESTING FRAMEWORK]
Test requirements:
- Test all public methods
- Ensure at least 80% code coverage
- Include tests for edge cases and error handling

Please provide comprehensive unit tests for this code.`,
      category: 'Testing',
      isPublic: true,
    },
  ];

  console.log('Seeding templates...');

  for (const template of templates) {
    await prisma.template.create({
      data: template,
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 