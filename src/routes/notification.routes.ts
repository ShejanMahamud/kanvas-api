import { Router } from 'express';
import {
  getUserDeviceTokens,
  registerDeviceToken,
  unregisterDeviceToken,
} from '../controllers/notification.controller';
import { auth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  deviceTokenSchema,
  unregisterTokenSchema,
} from '../validations/notification.validation';

const router = Router();

/**
 * @swagger
 * /v1/api/notifications/register:
 *   post:
 *     tags: [Notifications]
 *     summary: Register a device token for push notifications
 *     description: Register a new device token to receive push notifications for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - deviceType
 *               - deviceId
 *             properties:
 *               token:
 *                 type: string
 *                 description: Device push notification token
 *                 example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
 *               deviceType:
 *                 type: string
 *                 enum: [android, ios, web]
 *                 description: Device platform type
 *                 example: "ios"
 *               deviceId:
 *                 type: string
 *                 description: Unique identifier for the device
 *                 example: "iPhone12,1"
 *     responses:
 *       200:
 *         description: Device token registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Device token registered successfully
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
 *         description: Device token already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/register',
  auth,
  validate(deviceTokenSchema),
  registerDeviceToken,
);

/**
 * @swagger
 * /v1/api/notifications/unregister:
 *   post:
 *     tags: [Notifications]
 *     summary: Unregister a device token
 *     description: Remove a previously registered device token from push notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Device push notification token to unregister
 *                 example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
 *     responses:
 *       200:
 *         description: Device token unregistered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Device token unregistered successfully
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
 *         description: Device token not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/unregister',
  auth,
  validate(unregisterTokenSchema),
  unregisterDeviceToken,
);

/**
 * @swagger
 * /v1/api/notifications/tokens:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user's registered device tokens
 *     description: Retrieve all registered device tokens for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of registered device tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       deviceType:
 *                         type: string
 *                         enum: [android, ios, web]
 *                       deviceId:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       lastUsed:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/tokens', auth, getUserDeviceTokens);

/**
 * @swagger
 * /v1/api/notifications/tokens:
 *   delete:
 *     tags: [Notifications]
 *     summary: Unregister device token
 *     description: Remove a registered device token for push notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Device push notification token to unregister
 *                 example: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
 *     responses:
 *       200:
 *         description: Device token unregistered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Device token unregistered successfully"
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
 *         description: Device token not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/tokens',
  auth,
  validate(unregisterTokenSchema),
  unregisterDeviceToken,
);

export default router;
