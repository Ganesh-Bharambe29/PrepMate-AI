# PrepMate AI — Local AI Interview Practice

> A privacy-conscious, locally powered interview practice platform that helps candidates prepare for software interviews with an AI interviewer running on their own machine.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-PrepMate%20AI-111827?style=for-the-badge)](https://prep-mate-ai-seven.vercel.app/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/API-Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Ollama](https://img.shields.io/badge/Local%20AI-Ollama-black?style=flat-square)](https://ollama.com/)
[![Qwen3](https://img.shields.io/badge/Model-Qwen3%204B-6B5BFF?style=flat-square)](https://ollama.com/library/qwen3)

---

## 🚀 Live Demo

### [Open PrepMate AI →](https://prep-mate-ai-seven.vercel.app/)

> **Note:** The frontend is available through the live demo. The core AI inference uses **Qwen3 4B through Ollama**, so the complete AI-powered interview experience is intended to run locally on a machine where Ollama is installed.

---

## 📌 Overview

**PrepMate AI** is a full-stack AI interview practice platform built around a simple real-world problem:

> A college friend preparing for software interviews did not always have someone available to conduct mock interviews and provide useful feedback.

Instead of building another generic AI chatbot, I designed PrepMate AI to behave like a **technical interviewer**.

A candidate can:

- Choose an interview category
- Select a difficulty level
- Select the number of questions
- Start a mock interview
- Answer technical questions
- Receive AI-generated evaluation
- Get contextual follow-up questions
- Review a final performance report

The core AI is powered by **Qwen3 4B running locally through Ollama**.

The main idea behind the project is simple:

> **Make realistic interview practice available whenever the candidate needs it, without making a proprietary cloud AI API the core dependency.**

---

## 🎯 Why I Built PrepMate AI

Interview preparation is easy to read about, but actually practicing an interview is different.

A candidate needs to:

1. Understand a question.
2. Think independently.
3. Explain the answer clearly.
4. Handle follow-up questions.
5. Discover gaps in their knowledge.
6. Learn from mistakes.
7. Repeat the process consistently.

My college friend was facing the practical problem of not always having someone available to conduct mock interviews and provide feedback.

So I built PrepMate AI around that specific need.

This project was created for the **Hacktoberfest 2026 Weekend Challenge — Build for a Friend**.

---

## ✨ Features

### 🤖 AI-Powered Mock Interviews

PrepMate AI simulates a technical interview instead of acting like a general-purpose chatbot.

### 📚 Multiple Interview Categories

Practice across areas such as:

- Java
- Data Structures & Algorithms
- DBMS
- Computer Networks
- Operating Systems
- JavaScript
- React
- Full Stack Development

### 🎚️ Difficulty Levels

Choose:

- Easy
- Medium
- Hard

### 🔢 Configurable Interview Length

Select the number of questions for a shorter or longer practice session.

### 🧠 Answer Evaluation

The AI analyzes the candidate's answer and provides useful feedback including:

- Score
- Verdict
- Strengths
- Missing points
- Areas for improvement
- Ideal answer
- Follow-up question

### 🔄 Contextual Follow-Up Questions

Instead of asking unrelated questions, PrepMate uses the previous interaction to continue the interview naturally.

```text
Question
   ↓
Candidate Answer
   ↓
AI Evaluation
   ↓
Contextual Follow-Up
