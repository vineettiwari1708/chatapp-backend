import { generateToken } from '../lib/utils.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';

// signup new user
export const signup = async (req, res) => {
	const { fullName, email, password, bio } = req.body;
	try {
		if (!fullName || !email || !password || !bio) {
			return res.json({ success: false, message: 'Missing Details' });
		}
		const user = await User.findOne({ email });
		if (user) {
			return res.json({ success: false, message: 'Account alredy exists' });
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const newUser = await User.create({
			fullName,
			email,
			password: hashedPassword,
			bio,
		});
		const token = generateToken(newUser._id);
		res.json({
			success: true,
			userData: newUser,
			token,
			message: 'Account created successfully',
		});
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

//controller to login a user
export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const userData = await User.findOne({ email });
		const isPasswordCorrect = await bcrypt.compare(password, userData.password);
		if (!isPasswordCorrect) {
			return res.json({ success: false, message: 'Invalid credentials' });
		}
		const token = generateToken(userData._id);
		res.json({
			success: true,
			userData,
			token,
			message: 'Login successful',
		});
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

// controller to check if user is authenticated
export const checkAuth = (req, res) => {
	res.json({ success: true, user: req.user });
};

// controller to update userprofile details
export const updateProfile = async (req, res) => {
	try {
		const { profilePic, bio, fullName } = req.body;
		const userId = req.user._id;
		let updatedUser;
		if (!profilePic) {
			updatedUser = await User.findByIdAndUpdate(
				userId,
				{ bio, fullName },
				{ new: true },
			);
		} else {
			const upload = await cloudinary.uploader.upload(profilePic);
			updatedUser = await User.findByIdAndUpdate(
				userId,
				{ profilePic: upload.secure_url, bio, fullName },
				{ new: true },
			);
		}

		res.json({ success: true, user: updatedUser });
	} catch (error) {
		console.log(error.message);
		res.json({ success: false, message: error.message });
	}
};

// export const updateProfile = async (req, res) => {
//   try {
//     const { profilePic, bio, fullName } = req.body;
//     const userId = req.user._id;

//     if (!bio || !fullName) {
//       return res.json({ success: false, message: 'Bio and Full Name are required' });
//     }

//     let updatedUser;

//     if (!profilePic) {
//       // If there's no profilePic, just update the bio and fullName
//       updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { bio, fullName },
//         { new: true }
//       );
//     } else {
//       // Upload profilePic to Cloudinary and get the URL
//       const uploadResponse = await cloudinary.uploader.upload(profilePic);

//       // Handle upload failure gracefully
//       if (!uploadResponse || !uploadResponse.secure_url) {
//         return res.json({ success: false, message: 'Failed to upload profile image' });
//       }

//       updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { profilePic: uploadResponse.secure_url, bio, fullName },
//         { new: true }
//       );
//     }

//     return res.json({ success: true, user: updatedUser });

//   } catch (error) {
//     console.error("Error in updateProfile:", error.message); // Log full error for debugging

//     // Respond with a meaningful message and prevent exposing sensitive details
//     res.json({ success: false, message: 'Error updating profile', error: error.message });
//   }
// };

// export const updateProfile = async (req, res) => {
//   try {
//     const { profilePic, bio, fullName } = req.body;
//     const userId = req.user._id;

//     let updatedUser;

//     if (!profilePic) {
//       // Update user without profile picture
//       updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { bio, fullName },
//         { new: true }
//       );
//     } else {
//       // Upload profile picture to Cloudinary
//       const uploadResponse = await cloudinary.uploader.upload(profilePic);
//       console.log("Cloudinary upload successful:", uploadResponse);

//       updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { profilePic: uploadResponse.secure_url, bio, fullName },
//         { new: true }
//       );
//     }

//     res.json({ success: true, user: updatedUser });
//   } catch (error) {
//     console.error("Error during profile update:", error); // More detailed logging
//     res.status(500).json({
//       success: false,
//       message: "Error updating profile",
//       error: error.message,
//     });
//   }
// };
