/**
 * Health Check API Endpoint
 * 
 * Provides health status for container deployments and monitoring.
 * Used by Docker health checks and external monitoring systems.
 */

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  try {
    // Basic health checks
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.2',
      node_version: process.version,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        pid: process.pid
      }
    };

    // Add container-specific information if running in container
    if (process.env.DOCKER_CONTAINER || process.env.NODE_ENV === 'production') {
      healthStatus.container = {
        running: true,
        type: 'development-environment',
        registry: 'ghcr.io/jsb2010/dropsentinel'
      };
    }

    // Return health status
    res.status(200).json(healthStatus);

  } catch (error) {
    // Return error status if health check fails
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: process.uptime()
    });
  }
}
