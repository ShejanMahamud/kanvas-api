import { Router } from 'express';
import { getHealth, getMetrics } from '../controllers/health.controller';

const router = Router();

/**
 * @swagger
 * /v1/api/health:
 *   get:
 *     tags: [Health]
 *     summary: Get API health status
 *     responses:
 *       200:
 *         description: API health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, unhealthy]
 *                 version:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       enum: [healthy, unhealthy]
 *                     storage:
 *                       type: string
 *                       enum: [healthy, unhealthy]
 *                     cache:
 *                       type: string
 *                       enum: [healthy, unhealthy]
 */
router.get('/', getHealth);

/**
 * @swagger
 * /v1/api/health/metrics:
 *   get:
 *     tags: [Health]
 *     summary: Get API metrics
 *     responses:
 *       200:
 *         description: API metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime:
 *                   type: string
 *                 responseTime:
 *                   type: object
 *                   properties:
 *                     avg:
 *                       type: number
 *                     p95:
 *                       type: number
 *                     p99:
 *                       type: number
 *                 requests:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     successful:
 *                       type: number
 *                     failed:
 *                       type: number
 *                 resources:
 *                   type: object
 *                   properties:
 *                     cpu:
 *                       type: object
 *                       properties:
 *                         usage:
 *                           type: string
 *                         load:
 *                           type: number
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: string
 *                         total:
 *                           type: string
 *                     storage:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: string
 *                         total:
 *                           type: string
 */
router.get('/metrics', getMetrics);

export default router;
