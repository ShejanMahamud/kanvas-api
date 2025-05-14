import { Router } from 'express';
import {
  cancelSubscription,
  getSubscriptionHistory,
  getSubscriptionStatus,
  handleSubscriptionWebhook,
  verifyAndSaveSubscription,
} from '../controllers/subscription.controller';
import { auth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { subscriptionSchema } from '../validations/subscription.validation';

const router = Router();

/**
 * @swagger
 * /v1/api/subscriptions/webhook:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Handle Google Play subscription webhook
 *     description: Webhook endpoint for processing subscription events from Google Play
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: object
 *                 properties:
 *                   data:
 *                     type: string
 *                     description: Base64 encoded notification data
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       500:
 *         description: Error processing webhook
 */
router.post('/webhook', handleSubscriptionWebhook);

/**
 * @swagger
 * /v1/api/subscriptions/verify:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Verify and save a new Google Play subscription
 *     description: Verify subscription details from Google Play and save to database
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - packageName
 *               - subscriptionId
 *               - purchaseToken
 *             properties:
 *               packageName:
 *                 type: string
 *                 description: Google Play package name
 *               subscriptionId:
 *                 type: string
 *                 description: Google Play subscription ID
 *               purchaseToken:
 *                 type: string
 *                 description: Google Play purchase token
 *     responses:
 *       200:
 *         description: Subscription verified and saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Invalid subscription data
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/verify',
  auth,
  validate(subscriptionSchema),
  verifyAndSaveSubscription,
);

/**
 * @swagger
 * /v1/api/subscriptions/status:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Get current subscription status
 *     description: Retrieve the current subscription status and details for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current subscription status
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
 *                     isSubscribed:
 *                       type: boolean
 *                     tier:
 *                       type: string
 *                       enum: [free, basic, premium]
 *                     expiryDate:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/status', auth, getSubscriptionStatus);

/**
 * @swagger
 * /v1/api/subscriptions:
 *   delete:
 *     tags: [Subscriptions]
 *     summary: Cancel subscription
 *     description: Cancel the current subscription for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active subscription found
 */
router.delete('/', auth, cancelSubscription);

/**
 * @swagger
 * /v1/api/subscriptions/history:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Get subscription history
 *     description: Get the subscription history for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Unauthorized
 */
router.get('/history', auth, getSubscriptionHistory);

/**
 * @swagger
 * components:
 *   schemas:
 *     Subscription:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: objectId
 *         subscriptionId:
 *           type: string
 *         productId:
 *           type: string
 *         tier:
 *           type: string
 *           enum: [basic, premium]
 *         status:
 *           type: string
 *           enum: [active, expired, cancelled, paused, pending, failed]
 *         startDate:
 *           type: string
 *           format: date-time
 *         expiryDate:
 *           type: string
 *           format: date-time
 *         autoRenewing:
 *           type: boolean
 *         paymentState:
 *           type: number
 *         priceAmount:
 *           type: number
 *         priceCurrency:
 *           type: string
 *         countryCode:
 *           type: string
 *         orderId:
 *           type: string
 *         purchaseType:
 *           type: string
 *           enum: [subscription, one_time]
 *         gracePeriodEndDate:
 *           type: string
 *           format: date-time
 *         trialEndDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export default router;
