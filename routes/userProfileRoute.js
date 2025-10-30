const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authTokenMiddleware');
const { authorize } = require('../middlewares/authRoleMiddleware');
const profileController = require('../controllers/userProfileController');
const upload = require('../middlewares/uploadMiddleware');

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
 *       Allows a logged-in user (student, teacher, or admin) to update their personal profile information, including uploading a new avatar.
 *     tags: [UserProfile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Hoang"
 *               lastName:
 *                 type: string
 *                 example: "Nguyen"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: "male"
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "2002-05-15"
 *               phone:
 *                 type: string
 *                 example: "+84 912 345 678"
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image (optional)
 *               bio:
 *                 type: string
 *                 example: "Lecturer in Computer Science at HCMUT."
 *               address:
 *                 type: string
 *                 example: "268 Ly Thuong Kiet, District 10, Ho Chi Minh City"
 *               academicTitle:
 *                 type: string
 *                 example: "Dr."
 *               expertise:
 *                 type: string
 *                 example: "Artificial Intelligence, Machine Learning"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized — missing or invalid JWT token
 *       500:
 *         description: Internal server error
 */
router.put("/me", auth, upload.single("avatar"), profileController.updateMyProfile);

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
