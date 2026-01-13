# SQL Query Risk Analyzer

## Project Overview

This is a project that shows how to use AI-powered analysis to build a simple, real-time SQL query performance analyzer.

The app:

- Accepts SQL SELECT queries through a web interface
- Uses OpenAI API to analyze query structure and predict performance
- Identifies performance risks, scalability concerns, and optimization opportunities
- Provides actionable recommendations with specific SQL examples

## Demonstration Link

https://www.loom.com/share/f5b3e4e9c23941638e08a9c308c9cf0b

## What is this project?

A full-stack web application that demonstrates:

- Real-time SQL query validation and security checks
- AI-powered query analysis using OpenAI's GPT-4o-mini model
- Structured analysis output with risk assessment and recommendations
- Modern React frontend with TypeScript and Tailwind CSS
- RESTful API backend with Express and TypeScript
- Query history persistence using localStorage
- User-friendly features: example queries, keyboard shortcuts, copy-to-clipboard

## Tech Stack

**Language**

- TypeScript (frontend and backend)
- JavaScript (compiled)

**Frontend Libraries**

- React 19 – UI framework
- TypeScript – Type safety
- Vite – Build tool and dev server
- Tailwind CSS 3.4 – Utility-first CSS framework
- Lucide React – Icon library

**Backend Libraries**

- Node.js – Runtime environment
- Express 5 – Web framework
- TypeScript – Type safety
- OpenAI (openai) – AI API integration
- CORS – Cross-origin resource sharing
- dotenv – Environment variable management

**Other**

- OpenAI API (GPT-4o-mini) for query analysis
- LocalStorage for query history persistence
- JSON format for structured AI responses

## How it Works (High Level)

**1. Load and validate query**

The frontend receives a SQL query from the user, validates it in real-time to ensure it's a safe SELECT statement (blocks DDL/DML), and sends it to the backend API.

**2. Process query on backend**

The backend receives the query, performs additional security validation (SQL injection prevention, read-only enforcement), and prepares it for AI analysis.

**3. AI analysis**

The backend sends the query to OpenAI's API with a carefully crafted prompt that instructs the AI to:
- Analyze the query structure
- Predict performance at various scales
- Identify potential bottlenecks (missing indexes, inefficient joins, etc.)
- Provide specific optimization recommendations

**4. Format and return results**

The AI response is parsed, validated, and formatted into a structured JSON object containing:
- Verdict (OPTIMAL, SAFE_FOR_NOW, RISKY, CRITICAL)
- Headline summary
- Primary risk details
- Recommended fix with actionable SQL examples
- Confidence level and reasoning
- Next steps

**5. Display analysis**

The frontend renders the analysis with:
- Color-coded verdict badges
- Detailed risk breakdown
- Copy-to-clipboard for recommended SQL fixes
- Query history for easy access to previous analyses
