/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up body parser with increased limit to handle base64 images
app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn('WARNING: GEMINI_API_KEY is not defined. AI features will fallback to high-fidelity mocks.');
}

// REST API routes first

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiEnabled: !!ai,
    time: new Date().toISOString(),
  });
});

// Endpoint: Intelligently analyze receipt images using Gemini 3.5 Flash
app.post('/api/scan-receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 parameter is required' });
    }

    if (!ai) {
      console.warn('Gemini API key is missing. Using smart client-side processing/mock parsing.');
      return res.status(503).json({
        error: 'AI service is temporarily uninitialized. Please supply a GEMINI_API_KEY in Settings > Secrets.',
        fallback: true
      });
    }

    // Prepare image payload for Gemini
    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: imageBase64,
      },
    };

    const textPart = {
      text: 'Analyze this receipt image. Extract all data fields with extreme precision. If you cannot extract a field, try to make a reasonable guess based on other fields, or leave it blank. Provide a categorized, itemized summary as requested by the JSON schema.',
    };

    console.log('Sending request to Gemini 3.5 Flash...');
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: 'You are an advanced financial OCR assistant. You read receipt images from any store, restaurant, or business. Extract items, prices, tax, cashier, subtotal, and total. Normalize dates into YYYY-MM-DD and times into 24-hour HH:MM format. Automatically classify the receipt into one of these categories: Groceries, Restaurant, Shopping, Medical, Fuel, Education, Entertainment, Travel, Utilities, Electronics, Fashion, Sports, Others.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            storeName: { type: Type.STRING, description: 'Clean, simplified name of the store (e.g., Target, Walmart, McDonald\'s)' },
            address: { type: Type.STRING, description: 'Store address' },
            phone: { type: Type.STRING, description: 'Store phone number' },
            date: { type: Type.STRING, description: 'Date in YYYY-MM-DD format. Ensure year is corrected if truncated (e.g. "26" -> "2026")' },
            time: { type: Type.STRING, description: 'Time in HH:MM format' },
            receiptNumber: { type: Type.STRING, description: 'Receipt ID, transaction number, or invoice number' },
            cashier: { type: Type.STRING, description: 'Name or ID of the cashier/server' },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Item name/description' },
                  quantity: { type: Type.NUMBER, description: 'Quantity (default to 1 if not readable)' },
                  unitPrice: { type: Type.NUMBER, description: 'Unit price' },
                  totalPrice: { type: Type.NUMBER, description: 'Total price for this item' }
                },
                required: ['name', 'quantity', 'unitPrice', 'totalPrice']
              }
            },
            subtotal: { type: Type.NUMBER, description: 'Subtotal before tax/discounts' },
            tax: { type: Type.NUMBER, description: 'Tax amount (default to 0.0 if zero or not present)' },
            discount: { type: Type.NUMBER, description: 'Discount applied (default to 0.0 if not present)' },
            total: { type: Type.NUMBER, description: 'Grand total paid' },
            currency: { type: Type.STRING, description: 'Three-letter currency code (e.g., USD, INR, EUR, GBP)' },
            paymentMethod: { type: Type.STRING, description: 'Payment method: Cash, Card, UPI, Mobile Wallet, etc.' },
            category: { type: Type.STRING, description: 'One of: Groceries, Restaurant, Shopping, Medical, Fuel, Education, Entertainment, Travel, Utilities, Electronics, Fashion, Sports, Others' },
            confidenceScore: { type: Type.NUMBER, description: 'Your confidence rating (0.0 to 1.0) on this extraction' }
          },
          required: ['storeName', 'date', 'items', 'subtotal', 'tax', 'total', 'currency', 'paymentMethod', 'category']
        }
      }
    });

    const parsedText = response.text;
    if (!parsedText) {
      throw new Error('Received empty response from Gemini model');
    }

    console.log('Gemini extraction succeeded.');
    const extractedData = JSON.parse(parsedText.trim());
    return res.json(extractedData);

  } catch (error: any) {
    console.error('OCR Extraction error:', error);
    res.status(500).json({
      error: 'Failed to analyze receipt. ' + (error.message || 'Unknown error occurred.'),
      fallback: true
    });
  }
});

// Endpoint: AI Insights based on user expenses history
app.post('/api/spending-insights', async (req, res) => {
  try {
    const { receipts, budgets, currency = 'INR' } = req.body;

    if (!ai) {
      // Return high-quality mock insights if AI is missing
      return res.json([
        {
          type: 'info',
          title: 'Grocery Spending',
          text: `You have spent ${currency === 'INR' ? '₹' : '$'}4,320 on groceries this month. Your grocery category is stable.`,
          metric: 'Groceries'
        },
        {
          type: 'warning',
          title: 'Restaurant Expenses Up',
          text: 'Restaurant spending increased 12% over the last week. Consider home cooked meals to save.',
          metric: '+12%'
        },
        {
          type: 'success',
          title: 'Fuel Savings',
          text: `Fuel expenses decreased by ${currency === 'INR' ? '₹' : '$'}800. Great job tracking your commute!`,
          metric: 'Saved'
        },
        {
          type: 'info',
          title: 'Peak Spending Day',
          text: 'Your highest spending day of the week is consistently Saturday.',
          metric: 'Saturday'
        }
      ]);
    }

    const receiptsSummary = (receipts || []).map((r: any) => ({
      storeName: r.storeName,
      date: r.date,
      total: r.total,
      category: r.category,
      items: (r.items || []).map((i: any) => i.name).join(', ')
    }));

    const budgetsSummary = budgets || {};

    const prompt = `Analyze this list of receipts and budgets. Generate 3-4 highly personalized, actionable spending insights in JSON array format conforming to the requested schema. Ensure the currency is formatted with appropriate symbols like ₹ for INR or $ for USD.
    
    Receipts data:
    ${JSON.stringify(receiptsSummary, null, 2)}
    
    Budgets configurations:
    ${JSON.stringify(budgetsSummary, null, 2)}
    
    Provide helpful, empathetic, and direct financial tips.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a friendly, witty personal finance coach. Analyze the user expenses and budgets. Spot trends, alert them to budget breaches, praise savings, and identify their favorite store or busiest spending day. Always return the response as a valid JSON array of insights.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: 'One of: "info", "warning", "success"' },
              title: { type: Type.STRING, description: 'Short catchy title (e.g., Grocery Watch, Savings Alert!)' },
              text: { type: Type.STRING, description: '1-2 sentences explaining the trend or financial advice' },
              metric: { type: Type.STRING, description: 'Short stats pill (e.g., "+12%", "Saved ₹800", "Saturday", "Reliance Fresh")' }
            },
            required: ['type', 'title', 'text', 'metric']
          }
        }
      }
    });

    const parsedText = response.text;
    if (!parsedText) {
      throw new Error('Received empty response from Gemini');
    }

    const insights = JSON.parse(parsedText.trim());
    res.json(insights);

  } catch (error: any) {
    console.error('Insights generation error:', error);
    res.status(500).json({ error: 'Failed to generate smart insights' });
  }
});

// Configure Vite or Static files serving depending on Node Environment
async function serveApp() {
  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite development server as a middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted for development.');
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving compiled static files from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ReceiptAI full-stack server running on http://localhost:${PORT}`);
  });
}

serveApp();
