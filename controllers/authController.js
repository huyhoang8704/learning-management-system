const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');


// Hàm tạo JWT
function signToken(user) {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'your_jwt_secret_here',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}


// Đăng ký (user)
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Please provide name, email, password' });
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ error: 'Email already registered' });

        // Tạo user với role user
        const user = await User.create({ name, email, password, role: 'student' });
        await UserProfile.create({ user: user._id });
        const token = signToken(user);

        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) { next(err); }
};
// Đăng ký (admin)
const registerAdmin = async (req, res) => {
    try {
        const { name, email, password} = req.body;
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

        // Tạo user với role admin
        const user = await User.create({ name, email, password, role: 'admin' });

        res.status(201).json({ token: signToken(user), user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// Đăng ký (teacher)
const registerTeacher = async (req, res) => {
    try {
        const { name, email, password} = req.body;
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

        // Tạo user với role teacher
        const user = await User.create({ name, email, password, role: 'teacher' });

        res.status(201).json({ token: signToken(user), user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Đăng nhập
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });


        if (!user) return res.status(400).json({ error: 'Invalid credentials' });


        const match = await user.comparePassword(password);
        if (!match) return res.status(400).json({ error: 'Invalid credentials' });

        const token = signToken(user);

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) { next(err); }
};


// Lấy thông tin cá nhân (me)
const me = async (req, res) => {
    res.json({ user: req.user });
};

module.exports = { 
    register, 
    login, 
    me,
    registerAdmin, 
    registerTeacher,
};