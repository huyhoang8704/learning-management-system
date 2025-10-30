const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authTokenMiddleware');
const { authorize } = require('../middlewares/authRoleMiddleware');
const profileController = require('../controllers/userProfileController');

/**
 * @swagger
 * tags:
 *   name: UserProfile
 *   description: Manage user profiles
 */


/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [UserProfile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 *       401:
 *         description: Unauthorized
 */
router.get('/me', auth, profileController.getMyProfile);

/**
 * @swagger
 * /api/profile/me:
 *   put:
 *     summary: Update the profile of the currently logged-in user
 *     description: |
 *       Allows a logged-in user (student, teacher, or admin) to update their personal profile information.
 *       Only the authenticated user can update their own profile.
 *     tags: [UserProfile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's given name
 *                 example: "Hoang"
 *               lastName:
 *                 type: string
 *                 description: User's family name
 *                 example: "Nguyen"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: User's gender
 *                 example: "male"
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Date of birth (YYYY-MM-DD)
 *                 example: "2002-05-15"
 *               phone:
 *                 type: string
 *                 description: Contact phone number
 *                 example: "+84 912 345 678"
 *               avatarUrl:
 *                 type: string
 *                 description: URL to user's avatar image
 *                 example: "https://example.com/avatars/hoang.jpg"
 *               bio:
 *                 type: string
 *                 description: Short introduction or description about the user
 *                 example: "Lecturer in Computer Science at HCMUT."
 *               address:
 *                 type: string
 *                 description: Physical address or place of residence
 *                 example: "268 Ly Thuong Kiet, District 10, Ho Chi Minh City"
 *               academicTitle:
 *                 type: string
 *                 description: Academic title (for teachers)
 *                 example: "Dr."
 *               expertise:
 *                 type: string
 *                 description: Area of expertise or specialization
 *                 example: "Artificial Intelligence, Machine Learning"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "671c85f4bcd92fabc6781d22"
 *                 user:
 *                   type: string
 *                   description: Reference ID of the user account
 *                   example: "671c85bdbcd92fabc6781d11"
 *                 firstName:
 *                   type: string
 *                   example: "Hoang"
 *                 lastName:
 *                   type: string
 *                   example: "Nguyen"
 *                 gender:
 *                   type: string
 *                   example: "male"
 *                 phone:
 *                   type: string
 *                   example: "+84 912 345 678"
 *                 bio:
 *                   type: string
 *                   example: "Lecturer in Computer Science at HCMUT."
 *                 address:
 *                   type: string
 *                   example: "268 Ly Thuong Kiet, District 10, Ho Chi Minh City"
 *                 academicTitle:
 *                   type: string
 *                   example: "Dr."
 *                 expertise:
 *                   type: string
 *                   example: "Artificial Intelligence"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-10-26T08:35:22.123Z"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid date format for 'dob'"
 *       401:
 *         description: Unauthorized — missing or invalid JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 *       500:
 *         description: Internal server error
 */
router.put('/me', auth, profileController.updateMyProfile);


/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get all user profiles (Admin only)
 *     tags: [UserProfile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of profiles
 *       403:
 *         description: Forbidden
 */
router.get('/', auth, authorize('admin'), profileController.getAllProfiles);

/**
 * @swagger
 * /api/profile/{id}:
 *   get:
 *     summary: Get profile by ID (Admin only)
 *     tags: [UserProfile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Profile data
 *       404:
 *         description: Not found
 */
router.get('/:id', auth, authorize('admin'), profileController.getProfileById);

/**
 * @swagger
 * /api/profile/{id}:
 *   delete:
 *     summary: Delete profile (Admin only)
 *     tags: [UserProfile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', auth, authorize('admin'), profileController.deleteProfile);

module.exports = router;
