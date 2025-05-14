import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategoryBySlug,
  listCategories,
  updateCategory,
} from '../controllers/category.controller';
import { auth } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - slug
 *         - createdBy
 *       properties:
 *         _id:
 *           type: string
 *           description: The category ID
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Category name
 *           minLength: 2
 *           maxLength: 50
 *           example: "Nature"
 *         description:
 *           type: string
 *           description: Category description
 *           maxLength: 500
 *           example: "Beautiful nature wallpapers"
 *         slug:
 *           type: string
 *           description: URL-friendly version of the category name
 *           example: "nature"
 *         createdBy:
 *           type: string
 *           description: Reference to the user who created the category
 *           example: "507f1f77bcf86cd799439011"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the category was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the category was last updated
 */

/**
 * @swagger
 * /v1/api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories
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
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', listCategories);

/**
 * @swagger
 * /v1/api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a new category
 *     description: Create a new wallpaper category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Category name
 *                 example: "Nature"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Category description
 *                 example: "Beautiful nature wallpapers"
 *               slug:
 *                 type: string
 *                 description: URL-friendly version of the category name
 *                 example: "nature"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
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
 *       409:
 *         description: Category name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', auth, createCategory);

/**
 * @swagger
 * /v1/api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getCategoryById);

/**
 * @swagger
 * /v1/api/categories/slug/{slug}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/slug/:slug', getCategoryBySlug);

/**
 * @swagger
 * /v1/api/categories/{id}:
 *   patch:
 *     tags: [Categories]
 *     summary: Update category
 *     description: Partially update an existing category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Category name
 *                 example: "Nature"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Category description
 *                 example: "Beautiful nature wallpapers"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
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
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Category name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id', auth, updateCategory);

/**
 * @swagger
 * /v1/api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
 *     description: Delete an existing category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', auth, deleteCategory);

export default router;
