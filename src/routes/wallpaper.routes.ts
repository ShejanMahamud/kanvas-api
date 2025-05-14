import { Request, Response, Router } from 'express';
import {
  deleteWallpaper,
  getMostDownloadedWallpapers,
  getPopularWallpapers,
  getSavedWallpapers,
  getWallpaperById,
  getWallpaperCategories,
  getWallpaperStats,
  listWallpapers,
  saveWallpaper,
  searchWallpapers,
  unsaveWallpaper,
  updateWallpaper,
  uploadWallpaper,
} from '../controllers/wallpaper.controller';
import { auth } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  limitQuerySchema,
  searchQuerySchema,
  uploadWallpaperSchema,
  wallpaperParamsSchema,
  wallpaperQuerySchema,
} from '../validations/wallpaper.validation';

interface WallpaperRequestBody {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPremium?: boolean;
  subscriptionTier?: 'free' | 'basic' | 'premium';
}

const router = Router();

/**
 * @swagger
 * /v1/api/wallpapers:
 *   get:
 *     tags: [Wallpapers]
 *     summary: List wallpapers with optional filters
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Items per page
 *       - in: query
 *         name: isPremium
 *         schema:
 *           type: boolean
 *         description: Filter by premium status
 *       - in: query
 *         name: subscriptionTier
 *         schema:
 *           type: string
 *           enum: [free, basic, premium]
 *         description: Filter by subscription tier
 *     responses:
 *       200:
 *         description: List of wallpapers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallpapers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Wallpaper'
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     totalPages:
 *                       type: number
 */
router.get('/', validate(wallpaperQuerySchema), listWallpapers);

/**
 * @swagger
 * /v1/api/wallpapers/{wallpaperId}:
 *   get:
 *     tags: [Wallpapers]
 *     summary: Get wallpaper by ID
 *     parameters:
 *       - in: path
 *         name: wallpaperId
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallpaper ID
 *     responses:
 *       200:
 *         description: Wallpaper details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallpaper'
 *       404:
 *         description: Wallpaper not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:wallpaperId',
  validate(wallpaperParamsSchema),
  (req: Request<{ id: string }>, res: Response) => {
    getWallpaperById(req, res);
  },
);


/**
 * @swagger
 * /v1/api/wallpapers:
 *   post:
 *     tags: [Wallpapers]
 *     summary: Upload a new wallpaper
 *     description: Upload a new wallpaper with metadata
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - title
 *               - categoryId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Wallpaper image file (JPG, PNG, WEBP)
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 description: Wallpaper title
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Wallpaper description
 *               categoryId:
 *                 type: string
 *                 description: Category ID
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tags
 *     responses:
 *       201:
 *         description: Wallpaper uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallpaper'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       413:
 *         description: File too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  auth,
  upload.single('file'),
  validate(uploadWallpaperSchema),
  uploadWallpaper,
);

/**
 * @swagger
 * /v1/api/wallpapers/{id}:
 *   get:
 *     tags: [Wallpapers]
 *     summary: Get wallpaper by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallpaper ID
 *     responses:
 *       200:
 *         description: Wallpaper details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Wallpaper'
 *       404:
 *         description: Wallpaper not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  validate(wallpaperParamsSchema),
  (req: Request<{ id: string }>, res: Response) => {
    getWallpaperById(req, res);
  },
);

/**
 * @swagger
 * /v1/api/wallpapers/{id}:
 *   delete:
 *     tags: [Wallpapers]
 *     summary: Delete wallpaper
 *     description: Delete a wallpaper by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallpaper ID
 *     responses:
 *       200:
 *         description: Wallpaper deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Wallpaper deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Wallpaper not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:id',
  auth,
  validate(wallpaperParamsSchema),
  (req: Request<{ id: string }>, res: Response) => {
    deleteWallpaper(req, res);
  },
);

/**
 * @swagger
 * /v1/api/wallpapers/search:
 *   get:
 *     tags: [Wallpapers]
 *     summary: Search wallpapers
 *     description: Search wallpapers by title, description, or tags
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wallpapers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Wallpaper'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/search', validate(searchQuerySchema), searchWallpapers);

/**
 * @swagger
 * /v1/api/wallpapers/popular:
 *   get:
 *     tags: [Wallpapers]
 *     summary: Get popular wallpapers
 *     description: Get a list of popular wallpapers based on views and downloads
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Number of wallpapers to return
 *     responses:
 *       200:
 *         description: List of popular wallpapers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wallpapers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Wallpaper'
 */
router.get('/popular', validate(limitQuerySchema), getPopularWallpapers);

/**
 * @swagger
 * /v1/api/wallpapers/most-downloaded:
 *   get:
 *     tags: [Wallpapers]
 *     summary: Get most downloaded wallpapers
 *     description: Get a list of wallpapers sorted by download count
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Number of wallpapers to return
 *     responses:
 *       200:
 *         description: List of most downloaded wallpapers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wallpapers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Wallpaper'
 */
router.get(
  '/most-downloaded',
  validate(limitQuerySchema),
  getMostDownloadedWallpapers,
);

/**
 * @swagger
 * /v1/api/wallpapers/saved:
 *   get:
 *     tags: [Wallpapers]
 *     summary: Get user's saved wallpapers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved wallpapers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wallpapers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Wallpaper'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 */
router.get('/saved', auth, getSavedWallpapers);

/**
 * @swagger
 * /v1/api/wallpapers/{id}/save:
 *   post:
 *     tags: [Wallpapers]
 *     summary: Save wallpaper
 *     description: Save a wallpaper to user's collection
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallpaper ID
 *     responses:
 *       200:
 *         description: Wallpaper saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Wallpaper saved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Wallpaper not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Wallpaper already saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:id/save',
  auth,
  validate(wallpaperParamsSchema),
  (req: Request<{ id: string }>, res: Response) => {
    saveWallpaper(req, res);
  },
);

/**
 * @swagger
 * /v1/api/wallpapers/{id}/save:
 *   delete:
 *     tags: [Wallpapers]
 *     summary: Unsave wallpaper
 *     description: Remove a wallpaper from user's collection
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallpaper ID
 *     responses:
 *       200:
 *         description: Wallpaper unsaved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Wallpaper unsaved successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Wallpaper not found or not saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:id/save',
  auth,
  validate(wallpaperParamsSchema),
  (req: Request<{ id: string }>, res: Response) => {
    unsaveWallpaper(req, res);
  },
);

/**
 * @swagger
 * /v1/api/wallpapers/categories:
 *   get:
 *     tags: [Wallpapers]
 *     summary: Get wallpaper categories
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
router.get('/categories', getWallpaperCategories);

/**
 * @swagger
 * /v1/api/wallpapers/{wallpaperId}/stats:
 *   get:
 *     tags: [Wallpapers]
 *     summary: Get wallpaper statistics
 *     parameters:
 *       - in: path
 *         name: wallpaperId
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallpaper ID
 *     responses:
 *       200:
 *         description: Wallpaper statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 downloads:
 *                   type: number
 *                 likes:
 *                   type: number
 *                 views:
 *                   type: number
 *                 saves:
 *                   type: number
 *                 dailyStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       downloads:
 *                         type: number
 *                       views:
 *                         type: number
 *                       likes:
 *                         type: number
 *       404:
 *         description: Wallpaper not found
 */
router.get(
  '/:id/stats',
  validate(wallpaperParamsSchema),
  (req: Request<{ id: string }>, res: Response) => {
    getWallpaperStats(req, res);
  },
);

/**
 * @swagger
 * /v1/api/wallpapers/{id}:
 *   patch:
 *     tags: [Wallpapers]
 *     summary: Update wallpaper
 *     description: Update wallpaper details (partial update)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallpaper ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPremium:
 *                 type: boolean
 *               subscriptionTier:
 *                 type: string
 *                 enum: [free, basic, premium]
 *     responses:
 *       200:
 *         description: Wallpaper updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Wallpaper'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to update this wallpaper
 *       404:
 *         description: Wallpaper not found
 */
router.patch(
  '/:id',
  auth,
  validate(wallpaperParamsSchema),
  (
    req: Request<{ id: string }, unknown, WallpaperRequestBody>,
    res: Response,
  ) => {
    updateWallpaper(req, res);
  },
);

export default router;
