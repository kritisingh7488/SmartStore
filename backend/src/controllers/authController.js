const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@cocoacrumb.com').toLowerCase();
  if (email.toLowerCase() === adminEmail) {
    return res.status(400).json({ message: 'Cannot register with administrator email address' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role: 'customer' });

  return res.status(201).json({
    token: createToken(user._id.toString()),
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@cocoacrumb.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123';

  if (email.toLowerCase() === adminEmail) {
    if (password !== adminPassword) {
      return res.status(401).json({ message: 'Invalid administrator credentials' });
    }

    // Auto-create/seed admin in database so they have a real ID
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const hash = await bcrypt.hash(adminPassword, 12);
      adminUser = await User.create({
        name: 'Store Admin',
        email: adminEmail,
        passwordHash: hash,
        role: 'admin'
      });
    } else if (adminUser.role !== 'admin') {
      adminUser.role = 'admin';
      await adminUser.save();
    }

    return res.json({
      token: createToken(adminUser._id.toString()),
      user: { id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role }
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const hashToCompare = user.passwordHash || user.password;
  if (!hashToCompare) {
    return res.status(401).json({ message: 'Invalid credentials or account schema mismatch' });
  }

  const matches = await bcrypt.compare(password, hashToCompare);
  if (!matches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({
    token: createToken(user._id.toString()),
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}

async function me(req, res) {
  return res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
}

module.exports = {
  register,
  login,
  me
};