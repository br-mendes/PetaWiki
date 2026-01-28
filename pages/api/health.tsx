// Health Check Endpoint para PetaWiki
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const startTime = Date.now();

  try {
    // Verificar conectividade com banco
    const dbCheck = await fetch(`${process.env.DATABASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'User-Agent': 'PetaWiki Health Check v1.0'
      }
    });

    // Verificar Supabase API
    const supabaseCheck = await fetch(`${process.env.SUPABASE_URL}/rest/v1/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'User-Agent': 'PetaWiki Health Check v1.0'
      }
    });

    // Verificar status do storage (se aplicável)
    let storageStatus = { status: 'not_applicable' };
    if (typeof process.env.AWS_S3_BUCKET !== 'undefined') {
      try {
        const s3Check = await fetch(`https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/health`);
        storageStatus = await s3Check.json();
      } catch {
        storageStatus = { status: 'error', message: 'Failed to check S3' };
      }
    }

    // Teste de carga simples
    const { performance } = await import('perf_hooks').then(() => ({
      now: () => Date.now(),
      mark: (name: string) => Date.now(),
      measure: (name: string) => {
        const start = performance.now();
        return () => {
          const end = performance.now();
          return end - start;
        };
      }
    }));

    const loadTime = performance.measure('database_check');

    // Resumo de saúde
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime,
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV,
      database: {
        status: dbCheck.ok ? 'connected' : 'disconnected',
        response_time: loadTime
      },
      supabase: {
        status: supabaseCheck.ok ? 'connected' : 'disconnected',
        response_time: loadTime
      },
      storage: storageStatus,
      performance: {
        load_time: loadTime,
        memory_usage: process.memoryUsage(),
        cpu_usage: process.cpuUsage()
      }
    };

    // Headers para cache
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    
    // Responder com status baseado na saúde
    const statusCode = healthStatus.database.status === 'connected' && 
                      healthStatus.supabase.status === 'connected' ? 200 : 503;

    res.status(statusCode).json(healthStatus);

  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });
  }
}