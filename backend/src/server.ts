import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { initDatabase, dbQuery, inMemoryFallback, isPostgresActive } from './db';
import { explainDocumentOrWord } from './services/gemini';
import { explainDocumentWithGroq } from './services/groq';
import { sendOtpEmail, verifyOtp, getUserByToken, logoutToken } from './services/auth';
import { getCatalogList, queryPublicData } from './services/datagov';
import { queryResources, matchResourcesForDocument, ResourceCategory } from './services/resources';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middleware
app.use(
  cors({
    origin: CORS_ORIGIN === '*' ? true : [CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Helper to extract or validate user ID or anonymous session ID
async function getEffectiveSessionId(req: Request): Promise<string> {
  const authHeader = req.headers.authorization || '';
  if (authHeader) {
    const user = await getUserByToken(authHeader);
    if (user) return user.id;
  }
  const headerSession = req.headers['x-session-id'];
  if (typeof headerSession === 'string' && headerSession.trim().length > 0) {
    return headerSession.trim();
  }
  return uuidv4();
}

// ------------------------------------------------------------------------------
// 1. HEALTH CHECK
// ------------------------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Setu Backend API',
    uptime: process.uptime(),
    postgres_active: isPostgresActive(),
    timestamp: new Date().toISOString(),
  });
});

// ------------------------------------------------------------------------------
// 1.1 CITIZEN AUTHENTICATION & EMAIL OTP VERIFICATION
// ------------------------------------------------------------------------------
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  try {
    const { email, type, name } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required.' });
      return;
    }

    const result = await sendOtpEmail(email, type || 'login', name);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    console.error('[Setu /api/auth/send-otp error]:', err);
    res.status(500).json({ success: false, message: 'Failed to send verification code. Please try again.' });
  }
});

app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp, name, type } = req.body;
    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Both email and verification code are required.' });
      return;
    }

    const result = await verifyOtp(email, otp, name, type || 'login');
    res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    console.error('[Setu /api/auth/verify-otp error]:', err);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
});

app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || '';
    const user = await getUserByToken(authHeader);
    if (!user) {
      res.status(401).json({ success: false, message: 'Unauthorized or session expired.' });
      return;
    }
    res.json({ success: true, user });
  } catch (err: any) {
    console.error('[Setu /api/auth/me error]:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve user session.' });
  }
});

app.post('/api/auth/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || '';
    logoutToken(authHeader);
    res.json({ success: true, message: 'Successfully signed out.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Logout failed.' });
  }
});

// ------------------------------------------------------------------------------
// 2. FLOW 1: UNDERSTAND A DOCUMENT OR WORD (GEMINI 3.1 FLASH LITE + GROQ DUAL ENGINE)
// ------------------------------------------------------------------------------
app.post('/api/understand', async (req: Request, res: Response) => {
  try {
    const { text, lang, file, aiProvider } = req.body;

    const hasText = typeof text === 'string' && text.trim().length > 0;
    const hasFile = file && typeof file.base64 === 'string' && file.base64.length > 0;

    if (!hasText && !hasFile) {
      res.status(400).json({
        error: 'Please provide the document text, notice, or attach a document file to explain.',
      });
      return;
    }

    let fileAttachment: { name: string; type: string; base64: string } | undefined;
    if (hasFile) {
      fileAttachment = {
        name: typeof file.name === 'string' ? file.name.slice(0, 120) : 'document.pdf',
        type: typeof file.type === 'string' ? file.type : 'application/pdf',
        base64: file.base64,
      };
    }

    const selectedLang = lang === 'hi' ? 'hi' : 'en';

    // If Groq is explicitly requested and no heavy PDF binary is attached
    if (aiProvider === 'groq' && hasText && !hasFile) {
      const groqExplanation = await explainDocumentWithGroq(text.trim(), selectedLang);
      if (groqExplanation && groqExplanation.summary) {
        const matchedResources = matchResourcesForDocument({
          disclaimer_type: groqExplanation.disclaimer_type,
          rawText: text.trim(),
          summary: groqExplanation.summary,
          terms: groqExplanation.terms_explained,
          watch_out_for: groqExplanation.watch_out_for,
        });
        res.json({
          success: true,
          data: {
            ...groqExplanation,
            matched_resources: matchedResources,
            cached: false,
            ai_engine_used: 'Groq (openai/gpt-oss-120b)',
          },
        });
        return;
      }
    }

    // Default: Gemini 2.5 Flash with Groq automatic fallback
    const explanation = await explainDocumentOrWord(
      hasText ? text.trim() : '',
      selectedLang,
      fileAttachment
    );

    res.json({
      success: true,
      data: {
        ...explanation,
        ai_engine_used: aiProvider === 'groq' ? 'Groq AI (Ultra-Fast)' : 'Google Gemini 2.5 Flash',
      },
    });
  } catch (err: any) {
    console.error('[Setu /api/understand error]:', err);
    res.status(500).json({
      error: 'An unexpected error occurred while explaining the document. Please try again.',
    });
  }
});

// ------------------------------------------------------------------------------
// 3. GLOSSARY (PRE-SEEDED SENIOR-FRIENDLY INDIAN TERMS)
// ------------------------------------------------------------------------------
app.get('/api/glossary', async (req: Request, res: Response) => {
  try {
    const { domain, search } = req.query;

    if (isPostgresActive()) {
      let query = 'SELECT id, term, domain, plain_en, plain_hi, why_it_matters_en, why_it_matters_hi FROM glossary_terms';
      const params: any[] = [];
      const conditions: string[] = [];

      if (typeof domain === 'string' && domain.trim()) {
        params.push(domain.trim());
        conditions.push(`domain = $${params.length}`);
      }

      if (typeof search === 'string' && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        conditions.push(`(LOWER(term) LIKE $${params.length} OR LOWER(plain_en) LIKE $${params.length})`);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY term ASC;';
      const result = await dbQuery(query, params);
      res.json({ success: true, count: result.rows.length, data: result.rows });
      return;
    }

    // In-memory fallback
    res.json({
      success: true,
      count: 0,
      data: [],
      note: 'PostgreSQL glossary table offline, fallback active.',
    });
  } catch (err: any) {
    console.error('[Setu /api/glossary error]:', err);
    res.status(500).json({ error: 'Failed to retrieve glossary items.' });
  }
});

// ------------------------------------------------------------------------------
// 4. FLOW 2: PUBLIC DATA CATALOG LIST
// ------------------------------------------------------------------------------
app.get('/api/find/catalog', async (req: Request, res: Response) => {
  try {
    const catalog = await getCatalogList();
    res.json({
      success: true,
      catalog,
    });
  } catch (err: any) {
    console.error('[Setu /api/find/catalog error]:', err);
    res.status(500).json({ error: 'Failed to load public data catalog.' });
  }
});

// ------------------------------------------------------------------------------
// 5. FLOW 2: PUBLIC DATA QUERY (DATA.GOV.IN + GEMINI SUMMARY)
// ------------------------------------------------------------------------------
app.post('/api/find/query', async (req: Request, res: Response) => {
  try {
    const { slug, filterValue, lang } = req.body;

    if (!slug || !filterValue) {
      res.status(400).json({
        error: 'Both catalog slug and filter value are required.',
      });
      return;
    }

    const selectedLang = lang === 'hi' ? 'hi' : 'en';
    const result = await queryPublicData(slug, filterValue, selectedLang);

    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('[Setu /api/find/query error]:', err);
    res.status(500).json({
      error: 'Failed to fetch public information. Please try again.',
    });
  }
});

// ------------------------------------------------------------------------------
// 6. FLOW 3: RESOURCES BRIDGE (CURATED VERIFIED CIVIC & EDUCATIONAL DIRECTORY)
// ------------------------------------------------------------------------------
app.get('/api/resources', (req: Request, res: Response) => {
  try {
    const { category, search, target } = req.query;
    const categoryParam = typeof category === 'string' ? (category as ResourceCategory | 'all') : undefined;
    const searchParam = typeof search === 'string' ? search : undefined;
    const targetParam = typeof target === 'string' ? target : undefined;

    const resources = queryResources({
      category: categoryParam,
      search: searchParam,
      target: targetParam,
    });

    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (err: any) {
    console.error('[Setu GET /api/resources error]:', err);
    res.status(500).json({ error: 'Failed to retrieve curated resources.' });
  }
});

// ------------------------------------------------------------------------------
// 7. FLOW 4: SAVED ITEMS (PERSISTENT CITIZEN & ANONYMOUS SESSION VIA X-SESSION-ID)
// ------------------------------------------------------------------------------
app.get('/api/saved', async (req: Request, res: Response) => {
  try {
    const sessionId = await getEffectiveSessionId(req);

    if (isPostgresActive()) {
      const resData = await dbQuery(
        'SELECT id, session_id, kind, title, payload, created_at FROM saved_items WHERE session_id = $1 ORDER BY created_at DESC;',
        [sessionId]
      );
      res.json({
        success: true,
        session_id: sessionId,
        items: resData.rows,
      });
      return;
    }

    // In-Memory store
    const items = inMemoryFallback.saved_items
      .filter((item) => item.session_id === sessionId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    res.json({
      success: true,
      session_id: sessionId,
      items,
    });
  } catch (err: any) {
    console.error('[Setu GET /api/saved error]:', err);
    res.status(500).json({ error: 'Failed to fetch saved items.' });
  }
});

app.post('/api/saved', async (req: Request, res: Response) => {
  try {
    const sessionId = await getEffectiveSessionId(req);
    const { kind, title, payload } = req.body;

    if (!kind || !title || !payload) {
      res.status(400).json({ error: 'kind, title, and payload are required.' });
      return;
    }

    const itemId = uuidv4();
    const createdAt = new Date();

    if (isPostgresActive()) {
      await dbQuery(
        `INSERT INTO saved_items (id, session_id, kind, title, payload, created_at)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        [itemId, sessionId, kind, title, JSON.stringify(payload), createdAt]
      );
    } else {
      inMemoryFallback.saved_items.unshift({
        id: itemId,
        session_id: sessionId,
        kind,
        title,
        payload,
        created_at: createdAt,
      });
    }

    res.status(201).json({
      success: true,
      id: itemId,
      session_id: sessionId,
      message: 'Item saved successfully.',
    });
  } catch (err: any) {
    console.error('[Setu POST /api/saved error]:', err);
    res.status(500).json({ error: 'Failed to save item.' });
  }
});

app.delete('/api/saved/:id', async (req: Request, res: Response) => {
  try {
    const sessionId = await getEffectiveSessionId(req);
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Item ID is required.' });
      return;
    }

    if (isPostgresActive()) {
      await dbQuery(
        'DELETE FROM saved_items WHERE id = $1 AND session_id = $2;',
        [id, sessionId]
      );
    } else {
      inMemoryFallback.saved_items = inMemoryFallback.saved_items.filter(
        (item) => !(item.id === id && item.session_id === sessionId)
      );
    }

    res.json({
      success: true,
      message: 'Saved item removed.',
    });
  } catch (err: any) {
    console.error('[Setu DELETE /api/saved error]:', err);
    res.status(500).json({ error: 'Failed to remove saved item.' });
  }
});

// ------------------------------------------------------------------------------
// PROCESS ERROR RESILIENCE & SERVER STARTUP
// ------------------------------------------------------------------------------
process.on('uncaughtException', (err: any) => {
  console.error('[Setu Server Uncaught Exception]:', err?.message || err);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('[Setu Server Unhandled Rejection]:', reason?.message || reason);
});

async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🌉 SETU BACKEND SERVER RUNNING ON PORT ${PORT}`);
    console.log(`⚡ Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
});
