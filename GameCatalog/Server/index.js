require('dotenv').config(); // 1. Load environment variables first
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'session_key_20171013'; // remember to place inside .env

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// 2. Connect to local MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to local MongoDB (GameSelectionCatalog) via Mongoose! 🎉'))
  .catch((err) => console.error('MongoDB connection error:', err));

// 3. Define Schemas
const CatalogSchema = new mongoose.Schema({
  title: String,
  image: String,
  link: String,
  price: Number,
  description: String,
  tags: [String]
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, 
  createdAt: { type: Date, default: Date.now }
});

const CatalogItem = mongoose.model('CatalogItem', CatalogSchema, 'Catalog');
const User = mongoose.model('User', UserSchema, 'Users');

// ==========================================
// SESSION MANAGEMENT MIDDLEWARE
// ==========================================
const authenticateAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Expects "Bearer <TOKEN>"

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attaches session data { userId, email, role } to the request

    // Verify they are actually an admin before modifying data
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired session token.' });
  }
};

// ==========================================
// CATALOG API ROUTES
// ==========================================

// Public Route: Anyone can view games
app.get('/api/games', async (req, res) => {
  try {
    const items = await CatalogItem.find({}); 
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entire catalog from database', error });
  }
});

// Guarded Route: Only authenticated Admins can add
app.post('/api/games', authenticateAdmin, async (req, res) => {
  try {
    const newItem = new CatalogItem(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating new item', error });
  }
});

// Guarded Route: Only authenticated Admins can edit
app.put('/api/games/:id', authenticateAdmin, async (req, res) => {
  try {
    const updatedItem = await CatalogItem.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
    
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: 'Error updating item', error });
  }
});

// Guarded Route: Only authenticated Admins can delete
app.delete('/api/games/:id', authenticateAdmin, async (req, res) => {
  try {
    const deletedItem = await CatalogItem.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
    
    res.json({ message: 'Item successfully deleted', deletedItem });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item', error });
  }
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    // Catch-all duplicate key errors gracefully
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Error registering user', error });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});


// ==========================================
// SALES SCHEMA & MODEL
// ==========================================
const SaleSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  customerEmail: { type: String, required: true },
  
  // 📦 Supports multiple different games in a single transaction
  items: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogItem', required: true },
    title: { type: String, required: true },       // Snapshot cache
    pricePaid: { type: Number, required: true },   // Snapshot cache (important for sales/discounts)
    quantity: { type: Number, required: true, min: 1 }
  }],
  
  totalAmount: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  
  // 💳 Extensible Payment Gateway Metadata Architecture Space
  paymentDetails: {
    method: { type: String, enum: ['free_checkout', 'wallet', 'stripe', 'paypal'], default: 'free_checkout' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    transactionId: { type: String, default: () => new mongoose.Types.ObjectId().toString() } // Placeholder ID
  }
});



const Sale = mongoose.model('Sale', SaleSchema, 'Sales');

// ==========================================
// CHECKOUT API ROUTE
// ==========================================

// Middleware helper to ensure user is logged in (reusing your auth token extraction pattern)
const authenticateUser = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authorization denied. Please sign in.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email, role }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Session expired.' });
  }
};

app.get('/api/checkout', authenticateAdmin, async (req, res) => {
  try {
    // Sort by newest purchases first so the admin sees live updates immediately
    const items = await Sale.find({}).sort({ purchaseDate: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales records from database', error });
  }
});


// 🛒 POST: Process Checkout
app.post('/api/checkout', authenticateUser, async (req, res) => {
  try {
    const { cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cannot checkout an empty basket.' });
    }

    // 1. Map the structural array to ensure strict formatting matching the schema
    const formattedItems = cartItems.map(item => ({
      itemId: item._id,
      title: item.title,
      pricePaid: Number(item.price),
      quantity: Number(item.quantity)
    }));

    // 2. Compute total amount on the server (never trust pricing calculations strictly passed by frontend clients)
    const totalAmount = formattedItems.reduce((sum, item) => sum + (item.pricePaid * item.quantity), 0);

    // 3. Assemble structural sale entity
    const newSale = new Sale({
      userId: req.user.userId,
      customerEmail: req.user.email,
      items: formattedItems,
      totalAmount,
      paymentDetails: {
        method: 'free_checkout', // Ready to swap for 'wallet' or payment gateway configurations later
        status: 'completed'
      }
    });

    const savedSale = await newSale.save();
    res.status(201).json({ message: 'Purchase processed successfully! 🎉', sale: savedSale });
  } catch (error) {
    res.status(500).json({ message: 'Checkout execution failure', error: error.message });
  }
});




// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});