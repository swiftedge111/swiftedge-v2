const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const cron = require('node-cron');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); 
const app = express();

app.use(cors({
  origin: 'https://broker.swiftedgetrade.com'
}));
// Serve static files from the frontend folder

app.use(express.static(path.join(__dirname, '../frontend')));

// Route to serve home.html for the homepage

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


// Middleware
app.use(express.json());
app.use(bodyParser.json());


// MongoDB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    console.log("Connected to DB:", mongoose.connection.name);
  })



const authenticateJWT = (req, res, next) => {
    console.log('Authenticating JWT...');
    
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.log('Authorization token missing');
        return res.status(401).json({  
            success: false,
            message: 'Authorization token required'
        });
    }

    console.log('Received Token:', token);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', {
                error: err,
                message: err.message,
                expiredAt: err.expiredAt
            });
            return res.status(403).json({ 
                success: false,
                message: 'Invalid or expired token',
                suggestion: 'Please login again'
            });
        }

        console.log('Decoded Token:', decoded);     
        req.user = {
            id: decoded.id,       
            iat: decoded.iat,
            exp: decoded.exp
        };
        
        next();
    });
};

// User Schema
const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    lastLogin: {type: String, default: null},
    status: {type: String, default: "Inactive"}, 
    uid: { type: String, required: true, unique: true },
    totalBalance: { type: Number, default: 0 },  
    totalProfit: { type: Number, default: 0 },  
    holdingBalance: { type: Number, default: 0 },
    holdings: [
        {
            name: { type: String },
            symbol: { type: String },
            amount: { type: Number },
            value: { type: Number }
        }
    ],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

});

const User = mongoose.model('User', UserSchema);

// Profit Schema
const ProfitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uid: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const Profit = mongoose.model('Profit', ProfitSchema);

// Admin Model
const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: { type: Date, default: Date.now },
    lastLogin: Date
});

const Admin = mongoose.model('Admin', AdminSchema);

 
// deposit schema definition and model
const depositSchema = new mongoose.Schema({
  method: { type: String, required: true },
  bankDetails: {
      bankName: String,
      routingNumber: String,
      accountNumber: String,
      accountName: String,
      swiftCode: String,
  },
  cryptoDetails: [
      {
          cryptocurrency: { type: String, required: true },
          walletAddress: String,
          network: String,
      },
  ],
  digitalWalletDetails: [
      {
          walletType: { type: String, required: true },
          walletUsername: String,
          walletInfo: String,
      },
  ],
});
const Deposit = mongoose.model('Deposit', depositSchema);
module.exports = { Deposit };


//PIN GENERATION DATABASE

// PIN Schema definition and model
const pinSchema = new mongoose.Schema({
  pinCode: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }, 
  expirationAt: { type: Date, required: true }, 
  status: { type: String, enum: ['active', 'expired'], default: 'active' } 
});


const Pin = mongoose.model('Pin', pinSchema);

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uid: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  method: { 
    type: String, 
    enum: ['holding', 'manual', 'crypto', 'bank', 'profit'], 
    required: true 
  },
  details: { type: Object },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'rejected'], 
    default: 'completed' 
  },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);


// Helper function to update user balances
// Helper function to update user balances - DEBUG VERSION
async function updateUserBalances(userId) {
    console.log('=== UPDATE USER BALANCES START ===');
    console.log('User ID:', userId);
    
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.log('ERROR: User not found');
            throw new Error('User not found');
        }

        console.log('1. Current user holdings:', user.holdings);
        
        // Calculate holding balance (sum of all holdings values)
        const holdingBalance = user.holdings.reduce((sum, holding) => {
            return sum + (holding.value || 0);
        }, 0);
        
        console.log('2. Calculated holdingBalance:', holdingBalance);
        
        // Calculate total profit (sum of all profit entries)
        console.log('3. Calculating total profit...');
        const totalProfitResult = await Profit.aggregate([
            { $match: { userId: user._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        console.log('4. Profit aggregation result:', totalProfitResult);
        
        const totalProfit = totalProfitResult.length > 0 ? totalProfitResult[0].total : 0;
        console.log('5. Total profit:', totalProfit);
        
        // Update user fields
        user.holdingBalance = holdingBalance;
        user.totalProfit = totalProfit;
        user.totalBalance = holdingBalance + totalProfit;
        
        console.log('6. Updated user fields:', {
            holdingBalance: user.holdingBalance,
            totalProfit: user.totalProfit,
            totalBalance: user.totalBalance
        });
        
        await user.save();
        console.log('7. User saved');
        
        // Return the updated user document
        const updatedUser = await User.findById(userId).select('fullName email username uid status totalBalance totalProfit holdingBalance holdings');
        console.log('8. Returning updated user');
        
        console.log('=== UPDATE USER BALANCES END ===');
        return updatedUser;
        
    } catch (error) {
        console.error('=== UPDATE USER BALANCES ERROR ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.log('=== UPDATE USER BALANCES ERROR END ===');
        throw error;
    }
}


// ==================== PROFIT SYSTEM ENDPOINTS ====================

// 1. Search user by UID (reuse existing logic) - FIXED VERSION
app.get('/admin/search-user/:uid', authenticateJWT, async (req, res) => {
  try {
    const { uid } = req.params;
    
    const user = await User.findOne({ uid }).select('fullName email username uid status totalBalance totalProfit holdingBalance');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Calculate user's current balances
    const updatedUser = await updateUserBalances(user._id);
    
    // Return the user data
    res.json({
      success: true,
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        username: updatedUser.username,
        uid: updatedUser.uid,
        status: updatedUser.status,
        holdingBalance: updatedUser.holdingBalance || 0,
        totalProfit: updatedUser.totalProfit || 0,
        totalBalance: updatedUser.totalBalance || 0
      }
    });
  } catch (error) {
    console.error('Error searching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// 2. Add profit to user
app.post('/admin/add-profit', authenticateJWT, async (req, res) => {
  try {
    const { uid, amount, description } = req.body;
    
    // Validate input
    if (!uid || !amount) {
      return res.status(400).json({
        success: false,
        message: 'UID and amount are required'
      });
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }
    
    // Find user
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create profit record
    const profit = new Profit({
      userId: user._id,
      uid: user.uid,
      amount: parsedAmount,
      description: description || 'Profit added',
      addedBy: req.user.id,
      timestamp: new Date()
    });
    
    await profit.save();
    
    // Create transaction record for profit
    const transaction = new Transaction({
      userId: user._id,
      uid: user.uid,
      type: 'credit',
      amount: parsedAmount,
      method: 'profit',
      details: {
        description: description || 'Profit added',
        category: 'profit'
      },
      status: 'completed'
    });
    
    await transaction.save();
    
    // Update user balances
    const updatedUser = await updateUserBalances(user._id);
    
    // Send notification email
    try {
      await sendProfitNotification(
        user.email,
        parsedAmount,
        updatedUser.totalProfit,
        updatedUser.totalBalance,
        description
      );
    } catch (emailError) {
      console.error('Failed to send profit notification:', emailError);
      // Continue even if email fails
    }
    
    res.json({
      success: true,
      message: 'Profit added successfully',
      data: {
        profit: {
          amount: parsedAmount,
          description: profit.description,
          timestamp: profit.timestamp,
          totalProfit: updatedUser.totalProfit,
          totalBalance: updatedUser.totalBalance
        }
      }
    });
    
  } catch (error) {
    console.error('Error adding profit:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// 3. Get user profit history
app.get('/admin/user-profits/:uid', authenticateJWT, async (req, res) => {
  try {
    const { uid } = req.params;
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Build query
    const query = { userId: user._id };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get profits with pagination
    const profits = await Profit.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('addedBy', 'username');
    
    const total = await Profit.countDocuments(query);
    
    // Get summary
    const summary = await Profit.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        user: {
          fullName: user.fullName,
          email: user.email,
          uid: user.uid
        },
        profits,
        summary: summary[0] || { totalProfit: 0, count: 0, average: 0 },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching profit history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// 4. Get all profits (admin dashboard)
app.get('/admin/all-profits', authenticateJWT, async (req, res) => {
  try {
    const { page = 1, limit = 50, uid, startDate, endDate } = req.query;
    
    const query = {};
    
    if (uid) {
      const user = await User.findOne({ uid });
      if (user) {
        query.userId = user._id;
      }
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const profits = await Profit.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'fullName email uid')
      .populate('addedBy', 'username');
    
    const total = await Profit.countDocuments(query);
    
    // Get daily summary
    const dailySummary = await Profit.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);
    
    res.json({
      success: true,
      data: {
        profits,
        dailySummary,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching all profits:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


// Fetch Bank Transfer Data
app.get('/admin/deposit/bank-transfer', authenticateJWT, async (req, res) => {
  try {
    const deposit = await Deposit.findOne({ method: 'bank-transfer' });
    res.json(deposit || {});
  } catch (error) {
    console.error('Error fetching bank transfer data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save Bank Transfer Data
app.post('/admin/deposit/bank-transfer', authenticateJWT, async (req, res) => {
  const { bankName, routingNumber, accountNumber, accountName, swiftCode } = req.body;
  try {
    let deposit = await Deposit.findOneAndUpdate(
      { method: 'bank-transfer' },
      { 
        bankDetails: { 
          bankName, 
          routingNumber, 
          accountNumber, 
          accountName, 
          swiftCode 
        },
        $unset: { cryptoDetails: "", digitalWalletDetails: "" }   
      },
      { new: true, upsert: true }
    );
    res.json(deposit);
  } catch (error) {
    console.error('Error saving bank transfer data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Fetch Cryptocurrency Data
app.get('/admin/deposit/crypto', authenticateJWT, async (req, res) => {
  try {
    const deposit = await Deposit.findOne({ method: 'crypto' });
    res.json(deposit?.cryptoDetails || []);
  } catch (error) {
    console.error('Error fetching cryptocurrency data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Save Cryptocurrency Data
app.post('/admin/deposit/crypto', authenticateJWT, async (req, res) => {
  const { cryptocurrency, walletAddress, network } = req.body;

  try {
    // Find the deposit document for 'crypto'
    let deposit = await Deposit.findOne({ method: 'crypto' });

    // If the deposit document exists
    if (deposit) {
      // Check if the cryptocurrency already exists in the array
      const existingCrypto = deposit.cryptoDetails.find(
        (crypto) => crypto.cryptocurrency === cryptocurrency
      );

      if (existingCrypto) {
        // If the cryptocurrency exists, update only that entry
        await Deposit.updateOne(
          { method: 'crypto', 'cryptoDetails.cryptocurrency': cryptocurrency },
          {
            $set: {
              'cryptoDetails.$.walletAddress': walletAddress,
              'cryptoDetails.$.network': network,
            },
          }
        );
      } else {
        // If the cryptocurrency doesn't exist, add it to the array
        await Deposit.updateOne(
          { method: 'crypto' },
          {
            $push: {
              cryptoDetails: {
                cryptocurrency,
                walletAddress,
                network,
              },
            },
          }
        );
      }
    } else {
      // If the 'crypto' deposit document doesn't exist, create it
      deposit = new Deposit({
        method: 'crypto',
        cryptoDetails: [{ cryptocurrency, walletAddress, network }],
      });
      await deposit.save();
    }

    // Now, ensure that if there are any unwanted fields, like 'digitalWalletDetails', they are excluded or unset
    await Deposit.updateOne(
      { method: 'crypto' },
      {
        $unset: { digitalWalletDetails: "" }, // Remove 'digitalWalletDetails' if unnecessary
      }
    );

    res.status(200).json({ message: 'Cryptocurrency details saved successfully!' });
  } catch (error) {
    console.error('Error saving cryptocurrency data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Fetch Digital Wallets Data
app.get('/admin/deposit/digital-wallets', authenticateJWT, async (req, res) => {
  try {
    const deposit = await Deposit.findOne({ method: 'digital-wallets' });
    res.json(deposit?.digitalWalletDetails || []);
  } catch (error) {
    console.error('Error fetching digital wallet data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save Digital Wallet Data
app.post('/admin/deposit/digital-wallets', authenticateJWT, async (req, res) => {
  const { walletType, walletUsername, walletInfo } = req.body;

  try {
    // Find the deposit document for 'digital-wallets'
    let deposit = await Deposit.findOne({ method: 'digital-wallets' });

    // If the deposit document exists
    if (deposit) {
      // Check if the walletType already exists in the array
      const existingWallet = deposit.digitalWalletDetails.find(
        (wallet) => wallet.walletType === walletType
      );

      if (existingWallet) {
        // If the walletType exists, update only that entry
        await Deposit.updateOne(
          { method: 'digital-wallets', 'digitalWalletDetails.walletType': walletType },
          {
            $set: {
              'digitalWalletDetails.$.walletUsername': walletUsername,
              'digitalWalletDetails.$.walletInfo': walletInfo,
            },
          }
        );
      } else {
        // If the walletType doesn't exist, add it to the array
        await Deposit.updateOne(
          { method: 'digital-wallets' },
          {
            $push: {
              digitalWalletDetails: {
                walletType,
                walletUsername,
                walletInfo,
              },
            },
          }
        );
      }
    } else {
      // If the 'digital-wallets' deposit document doesn't exist, create it
      deposit = new Deposit({
        method: 'digital-wallets',
        digitalWalletDetails: [{ walletType, walletUsername, walletInfo }],
      });
      await deposit.save();
    }

    // Now, ensure that if there are any unwanted fields, like 'cryptoDetails', they are excluded or unset
    await Deposit.updateOne(
      { method: 'digital-wallets' },
      {
        $unset: { cryptoDetails: "" }, // Remove 'cryptoDetails' if unnecessary
      }
    );

    res.status(200).json({ message: 'Digital wallet details saved successfully!' });
  } catch (error) {
    console.error('Error saving digital wallet data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Sample route to get deposit details from the database
app.get('/api/deposit-details', async (req, res) => {
  try {
      const depositDetails = await Deposit.findOne(); // Fetch the first deposit details document (you may adjust based on your data model)
      
      if (!depositDetails) {
          return res.status(404).send('Deposit details not found');
      }
      
      res.json(depositDetails); // Send back the deposit details in JSON format
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});


//welcome email sending function

function getWelcomeEmailTemplate(user) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4361ee; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Our Platform!</h1>
                </div>
                <div class="content">
                    <p>Hello ${user.fullName},</p>
                    <p>Thank you for creating an account with us. We're excited to have you on board!</p>
                    <p>Your account details:</p>
                    <ul>
                        <li><strong>Username:</strong> ${user.username}</li>
                        <li><strong>Email:</strong> ${user.email}</li>
                    </ul>
                    <p>If you have any questions, feel free to reply to this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Swiftedge Trade. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

function getPlainTextWelcomeEmail(user) {
    return `
        Welcome to Our Platform!
        
        Hello ${user.fullName},
        
        Thank you for creating an account with us. We're excited to have you on board!
        
        Your account details:
        - Username: ${user.username}
        - Email: ${user.email}
        
        If you have any questions, feel free to reply to this email.
        
        © ${new Date().getFullYear()} Swiftedge Trade. All rights reserved.
    `;
}
  

// User sign up and login routes...

app.post('/signup', async (req, res) => {
    const { fullName, email, username, password, phone } = req.body;

    try {
        const lowerEmail = email.toLowerCase();
        const lowerUsername = username.toLowerCase();

        // Check if the user already exists with the same email or username
        const existingUser = await User.findOne({ 
            $or: [
                { email: lowerEmail },
                { username: lowerUsername }
            ]
        });

        if (existingUser) {
            if (existingUser.email === lowerEmail) {
                return res.status(400).json({ 
                    message: 'Email already registered',
                    resolution: 'Try logging in or use a different email'
                });
            } else {
                return res.status(400).json({ 
                    message: 'Username already taken',
                    resolution: 'Please choose a different username'
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a shortened UID
        const uid = uuidv4().slice(0, 8);

        // Create new user
        const user = new User({ 
            fullName, 
            email: lowerEmail, 
            username: lowerUsername, 
            password: hashedPassword, 
            phone,
            uid,  
            balance: 0,  
            holdings: []  
        });
        
        await user.save();

        // Send welcome email
        sendWelcomeEmail(user).catch(console.error);

        res.status(201).json({ 
            message: 'Account created successfully',
            nextSteps: 'Check your email for a welcome message'
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            message: 'Registration service temporarily unavailable',
            resolution: 'Please try again in a few minutes'
        });
    }
});

// Email sending function
async function sendWelcomeEmail(user) {
    try {
        await resend.emails.send({
            from: 'SwiftEdge Trade <noreply@swiftedgetrade.com>',
            to: user.email,
            subject: 'Welcome to Our Platform!',
            text: getPlainTextWelcomeEmail(user),
            html: getWelcomeEmailTemplate(user)
        });
        console.log(`Welcome email sent to ${user.email} via Resend`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
}


// User login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
      // Convert input to lowercase for case-insensitive comparison
      const loginInput = username.toLowerCase();
      
      // Check if input is email format
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginInput);
      
      // Find user by either username or email
      const user = await User.findOne({
          $or: [
              { username: loginInput },
              { email: isEmail ? loginInput : null } // Only check email if input looks like email
          ]
      });

      if (!user) {
          return res.status(400).json({ 
              message: 'Account not found',
              suggestion: 'Please check your login details or sign up for a new account'
          });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ 
              message: 'Incorrect password',
              resolution: 'Please try again or reset your password'
          });
      }

      user.status = 'Active';
      user.lastLogin = new Date().toISOString();
      await user.save();

      // Create JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5h' });

      res.json({ 
          token, 
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          message: 'Login successful'
      });
  } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
          message: 'Login service temporarily unavailable',
          resolution: 'Please try again later'
      });
  }
});



//Backend to get user details

app.get('/user-info', async (req, res) => {
    // Get the token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied, token missing' });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch the user based on the decoded user ID
        const user = await User.findById(decoded.id).select('username uid status lastLogin');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with user information
        res.json({
            username: user.username,
            uid: user.uid,
            status: user.status,
            lastLogin: user.lastLogin,
        });
    } catch (error) {
        console.error("Error fetching user info:", error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Fetch Holdings for a User by UID
app.get('/admin/user-holdings/:uid', authenticateJWT, async (req, res) => {
    const { uid } = req.params;  

    try {
        
        const user = await User.findOne({ uid: uid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            fullName: user.fullName,
            email: user.email,
            username: user.username,
            holdings: user.holdings   
        });

    } catch (error) {
        console.error('Error fetching user holdings:', error);
        res.status(500).json({ message: 'Server error occurred' });
    }
});

//Add holdings
// FIXED version of add-holding endpoint
app.post('/admin/add-holding', authenticateJWT, async (req, res) => {
    console.log('=== ADD HOLDING REQUEST START ===');
    console.log('Request body:', req.body);
    
    const { uid, name, symbol, amount, value } = req.body;

    try {
        console.log('1. Searching for user with UID:', uid);
        const user = await User.findOne({ uid });
        
        if (!user) {
            console.log('ERROR: User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('2. User found:', user.email);
        console.log('3. Previous balance:', user.totalBalance || 0);

        // Store previous balance for notification
        const previousBalance = user.totalBalance || 0;

        // Add the new holding
        console.log('4. Adding holding:', { name, symbol, amount, value });
        user.holdings.push({ name, symbol, amount, value });

        // IMPORTANT: Save the user FIRST so holdings are in database
        console.log('5. Saving user with new holding...');
        await user.save();
        console.log('6. User saved with new holding');

        // Create a transaction record
        console.log('7. Creating transaction record');
        const transaction = new Transaction({
            userId: user._id,
            uid: user.uid,
            type: 'credit',
            amount: value,
            method: 'holding',
            details: {
                assetName: name,
                assetSymbol: symbol,
                units: amount
            },
            status: 'completed'
        });

        await transaction.save();
        console.log('8. Transaction saved:', transaction._id);

        console.log('9. Updating user balances...');
        const updatedUser = await updateUserBalances(user._id);
        console.log('10. User balances updated:', {
            holdingBalance: updatedUser.holdingBalance,
            totalProfit: updatedUser.totalProfit,
            totalBalance: updatedUser.totalBalance
        });

        // Send notification if balance increased
        if (updatedUser.totalBalance > previousBalance) {
            console.log('11. Sending funding notification...');
            try {
                await sendFundingNotification(
                    user.email,
                    updatedUser.totalBalance - previousBalance,
                    updatedUser.totalBalance
                );
                console.log('12. Funding notification sent to', user.email);
            } catch (emailError) {
                console.error('13. Failed to send funding notification:', emailError);
            }
        }

        console.log('14. Sending success response');
        res.json({
            message: 'Holding added successfully',
            holdings: updatedUser.holdings,
            holdingBalance: updatedUser.holdingBalance,
            totalProfit: updatedUser.totalProfit,
            totalBalance: updatedUser.totalBalance
        });
        
        console.log('=== ADD HOLDING REQUEST END ===');

    } catch (error) {
        console.error('=== ADD HOLDING ERROR ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.log('=== ADD HOLDING ERROR END ===');
        
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
});

// Update the portfolio endpoint - ENHANCED VERSION
app.get('/portfolio', authenticateJWT, async (req, res) => {
  try {
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Ensure balances are up to date
      await updateUserBalances(user._id);
      
      // Refresh user data after balance update
      const updatedUser = await User.findById(req.user.id);

      // Get today's start and end timestamps
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      // Get yesterday's start and end timestamps
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const yesterdayEnd = new Date(todayEnd);
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

      // Get this week's start (Sunday)
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      // Calculate today's profit
      const todayProfitResult = await Profit.aggregate([
          { 
              $match: { 
                  userId: updatedUser._id,
                  timestamp: { $gte: todayStart, $lte: todayEnd }
              } 
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const todayProfit = todayProfitResult.length > 0 ? todayProfitResult[0].total : 0;

      // Calculate yesterday's profit
      const yesterdayProfitResult = await Profit.aggregate([
          { 
              $match: { 
                  userId: updatedUser._id,
                  timestamp: { $gte: yesterdayStart, $lte: yesterdayEnd }
              } 
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const yesterdayProfit = yesterdayProfitResult.length > 0 ? yesterdayProfitResult[0].total : 0;

      // Calculate this week's balance change (sum of profits this week)
      const weekProfitResult = await Profit.aggregate([
          { 
              $match: { 
                  userId: updatedUser._id,
                  timestamp: { $gte: weekStart, $lte: todayEnd }
              } 
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const balanceChange = weekProfitResult.length > 0 ? weekProfitResult[0].total : 0;

      // Calculate total holdings value
      const totalHoldingsValue = updatedUser.holdings.reduce((sum, holding) => sum + (holding.value || 0), 0);

      // Format holdings for frontend with additional metadata
      const formattedHoldings = updatedUser.holdings.map(holding => ({
          name: holding.name,
          symbol: holding.symbol,
          amount: holding.amount,
          value: holding.value,
          unit: holding.symbol ? holding.symbol.split('/')[0] : holding.name,
          type: getAssetType(holding.symbol || holding.name),
          icon: getAssetIcon(holding.symbol || holding.name)
      }));

      // Calculate total return percentage
      const investedCapital = updatedUser.holdingBalance || 0;
      const totalReturn = investedCapital > 0 
          ? ((updatedUser.totalProfit / investedCapital) * 100) 
          : 0;

      // Get performance data for chart (last 7 days by default)
      const performanceData = await getPerformanceData(updatedUser._id, '7d');

      // Get monthly stats for best month and average
      const monthlyStats = await getMonthlyStats(updatedUser._id);

      res.json({
          // Financial Overview
          totalBalance: updatedUser.totalBalance || 0,
          investedCapital: investedCapital,
          initialInvestment: investedCapital,
          profitEarned: updatedUser.totalProfit || 0,
          
          // Daily Profits
          todayProfit: todayProfit,
          yesterdayProfit: yesterdayProfit,
          
          // Weekly Change
          balanceChange: balanceChange,

          // Holdings
          holdings: formattedHoldings,
          totalHoldingsValue: totalHoldingsValue,

          // Performance Chart Data
          performanceData: performanceData,

          // Chart Statistics
          totalReturn: totalReturn,
          bestMonth: monthlyStats.bestMonth,
          avgMonthlyReturn: monthlyStats.avgMonthlyReturn
      });
  } catch (error) {
      console.error('Error fetching portfolio:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

// Portfolio performance endpoint for different time periods
app.get('/portfolio/performance', authenticateJWT, async (req, res) => {
  try {
      const { period } = req.query;
      const user = await User.findById(req.user.id);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Get performance data based on period
      const performanceData = await getPerformanceData(user._id, period || '7d');

      res.json({
          performanceData: performanceData,
          period: period || '7d'
      });
  } catch (error) {
      console.error('Error fetching portfolio performance:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to determine asset type
function getAssetType(symbolOrName) {
    if (!symbolOrName) return 'crypto';
    const upper = symbolOrName.toUpperCase();
    if (upper.includes('BTC') || upper.includes('BITCOIN')) return 'crypto';
    if (upper.includes('ETH') || upper.includes('ETHEREUM')) return 'crypto';
    if (upper.includes('SOL') || upper.includes('SOLANA')) return 'crypto';
    if (upper.includes('XRP') || upper.includes('RIPPLE')) return 'crypto';
    if (upper.includes('USDT') || upper.includes('USDC')) return 'stablecoin';
    if (upper.includes('XAU') || upper.includes('GOLD')) return 'metal';
    if (upper.includes('XAG') || upper.includes('SILVER')) return 'metal';
    if (upper.includes('PLATINUM') || upper.includes('XPT')) return 'metal';
    return 'crypto';
}

// Helper function to get asset icon
function getAssetIcon(symbolOrName) {
    if (!symbolOrName) return 'fab fa-bitcoin';
    const upper = symbolOrName.toUpperCase();
    if (upper.includes('BTC') || upper.includes('BITCOIN')) return 'fab fa-bitcoin';
    if (upper.includes('ETH') || upper.includes('ETHEREUM')) return 'fab fa-ethereum';
    if (upper.includes('SOL') || upper.includes('SOLANA')) return 'fas fa-sun';
    if (upper.includes('XRP') || upper.includes('RIPPLE')) return 'fas fa-water';
    if (upper.includes('USDT') || upper.includes('USDC')) return 'fas fa-dollar-sign';
    if (upper.includes('XAU') || upper.includes('GOLD')) return 'fas fa-coins';
    if (upper.includes('XAG') || upper.includes('SILVER')) return 'fas fa-gem';
    if (upper.includes('PLATINUM') || upper.includes('XPT')) return 'fas fa-gem';
    return 'fab fa-bitcoin';
}

// Helper function to get performance data for chart
async function getPerformanceData(userId, period) {
    const now = new Date();
    let startDate;
    let groupFormat;
    let labelFormat;

    // Determine date range based on period
    switch (period) {
        case '7d':
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
            groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } };
            labelFormat = 'day';
            break;
        case '1m':
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 1);
            groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } };
            labelFormat = 'day';
            break;
        case '3m':
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 3);
            groupFormat = { $dateToString: { format: "%Y-%U", date: "$timestamp" } }; // Year-Week
            labelFormat = 'week';
            break;
        case '1y':
            startDate = new Date(now);
            startDate.setFullYear(startDate.getFullYear() - 1);
            groupFormat = { $dateToString: { format: "%Y-%m", date: "$timestamp" } };
            labelFormat = 'month';
            break;
        case 'all':
        default:
            startDate = new Date(0); // Beginning of time
            groupFormat = { $dateToString: { format: "%Y-%m", date: "$timestamp" } };
            labelFormat = 'month';
            break;
    }

    try {
        // Aggregate profits by date
        const profitsByDate = await Profit.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    timestamp: { $gte: startDate, $lte: now }
                }
            },
            {
                $group: {
                    _id: groupFormat,
                    total: { $sum: '$amount' },
                    date: { $first: '$timestamp' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // If no data, return empty array
        if (profitsByDate.length === 0) {
            return [];
        }

        // Calculate cumulative values and format for chart
        let cumulativeValue = 0;
        const performanceData = profitsByDate.map((item, index) => {
            cumulativeValue += item.total;
            
            // Format label based on period type
            let label;
            const date = new Date(item.date);
            
            switch (labelFormat) {
                case 'day':
                    label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    break;
                case 'week':
                    label = `Week ${Math.ceil(date.getDate() / 7)}`;
                    break;
                case 'month':
                    label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    break;
                default:
                    label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }

            return {
                label: label,
                value: cumulativeValue,
                dailyChange: item.total,
                tooltip: `+$${item.total.toFixed(2)}`
            };
        });

        return performanceData;
    } catch (error) {
        console.error('Error getting performance data:', error);
        return [];
    }
}

// Helper function to get monthly statistics
async function getMonthlyStats(userId) {
    try {
        // Get profits grouped by month
        const monthlyProfits = await Profit.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$timestamp" } },
                    total: { $sum: '$amount' },
                    month: { $first: '$timestamp' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        if (monthlyProfits.length === 0) {
            return {
                bestMonth: { name: 'N/A', return: 0 },
                avgMonthlyReturn: 0
            };
        }

        // Find best month
        let bestMonth = { name: 'N/A', return: 0 };
        let totalProfits = 0;

        monthlyProfits.forEach(month => {
            totalProfits += month.total;
            if (month.total > bestMonth.return) {
                const date = new Date(month.month);
                bestMonth = {
                    name: date.toLocaleDateString('en-US', { month: 'short' }),
                    return: month.total
                };
            }
        });

        // Calculate average monthly return
        const avgMonthlyReturn = totalProfits / monthlyProfits.length;

        return {
            bestMonth: bestMonth,
            avgMonthlyReturn: avgMonthlyReturn
        };
    } catch (error) {
        console.error('Error getting monthly stats:', error);
        return {
            bestMonth: { name: 'N/A', return: 0 },
            avgMonthlyReturn: 0
        };
    }
}


// Password Reset Request Route
app.post('/request-reset', async (req, res) => {
  const { email } = req.body;

  try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = Date.now() + 3600000;  

      // Save token and expiry to user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = tokenExpiry;
      await user.save();

      // Generate reset link with query parameter
      const resetLink = `https://www.swiftedgetrade.com/update-password.html?token=${resetToken}`;

      // Send reset email with Resend
      await resend.emails.send({
          from: 'SwiftEdge Trade <noreply@swiftedgetrade.com>',
          to: user.email,
          subject: 'Password Reset Request',
          text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`,
          html: `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
      });
      res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
      console.error('Error in /request-reset:', error);
      res.status(500).json({ message: 'Server error' });
  }
});


//api route to verify token

app.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;

  try {
      const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() },  
      });

      if (!user) {
          return res.status(400).send('Invalid or expired token');
      }

      // Redirect to the update password page
      res.redirect(`/update-password.html?userId=${user._id}`);
  } catch (error) {
      console.error('Error in /reset-password/:token:', error);
      res.status(500).send('Server error');
  }
});



//reset password route

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body; 
 
  try {
      const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
          console.log("Token not found or expired in database:", token); // Log if token is invalid or expired
          return res.status(400).json({ message: 'Invalid or expired token' });
      }
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("New password hashed successfully");

      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.log("Password updated successfully for user:", user.email);
      res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
      console.error("Error in /reset-password/:token route:", error);  
      res.status(500).json({ message: 'Server error' });
  }
});


// Seed Admin logs
async function seedAdmin() {
    try {
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
            const admin = new Admin({
                username: 'admin',
                email: 'swiftedgetrade@gmail.com',
                password: hashedPassword
            });
            await admin.save();
            console.log('Default admin account created');
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
    }
}

seedAdmin();

// Admin Login Route 
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });
        
        if (!admin) {
            return res.status(401).json({ 
                message: 'Invalid username or password',
                field: 'username'
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid username or password',
                field: 'password'
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Create JWT token
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot Password Route
app.post('/admin/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'No account with that email exists' });
        }

        // Create reset token (expires in 1 hour)
        const resetToken = crypto.randomBytes(20).toString('hex');
        admin.resetPasswordToken = resetToken;
        admin.resetPasswordExpires = Date.now() + 3600000; 
        await admin.save();

        // Send email
        const resetUrl = `${process.env.BASE_URL}/reset-password.html?token=${resetToken}`;
        
        const mailOptions = {
            to: admin.email,
            from: process.env.EMAIL_FROM,
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset for your admin account.</p>
                <p>Click this link to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password Route
app.post('/admin/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const admin = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!admin) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash new password
        admin.password = await bcrypt.hash(newPassword, 10);
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
        await admin.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change Password Route (requires auth)
app.post('/admin/change-password', authenticateAdmin, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    try {
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Current password is incorrect',
                field: 'currentPassword'
            });
        }

        // Update password
        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Authentication Middleware
function authenticateAdmin(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
}

//Route to generate pin
const SALT_ROUNDS = 10;  


// Generate PIN API

app.post('/admin/generate-pin', authenticateJWT, async (req, res) => {
  const { pinLength, expirationTime } = req.body;

  console.log("===== BACKEND LOGS =====");
  console.log("Received pinLength (from frontend):", pinLength);
  console.log("Received expirationTime (from frontend):", expirationTime);

  try {
    // Validate input
    if (![4, 6].includes(pinLength)) {
      console.error("Error: PIN length must be 4 or 6 digits.");
      return res.status(400).json({ message: 'PIN length must be 4 or 6 digits' });
    }

    if (!expirationTime || isNaN(expirationTime)) {
      console.error("Error: Valid expiration time is required.");
      return res.status(400).json({ message: 'Valid expiration time is required' });
    }

    // Generate random PIN
    const rawPin = Array(pinLength)
      .fill(0)
      .map(() => Math.floor(Math.random() * 10))
      .join(''); // Generate a random 4 or 6-digit PIN
    console.log("Generated raw PIN:", rawPin);

    // Encrypt the PIN
    const encryptedPin = await bcrypt.hash(rawPin, SALT_ROUNDS);
    console.log("Encrypted PIN:", encryptedPin);

    // Calculate expiration timestamp
    const expirationAt = new Date(Date.now() + expirationTime * 60 * 1000); // Convert minutes to milliseconds
    console.log("Calculated expirationAt (timestamp):", expirationAt);

    // Save the PIN to the database
    const pin = new Pin({
      pinCode: encryptedPin,
      expirationAt,
    });

    await pin.save();
    console.log("PIN saved to database successfully.");

    // Return the raw PIN and expiration details to the admin
    res.status(200).json({
      message: 'PIN generated successfully',
      pin: rawPin, // Send the raw PIN to the admin
      expirationAt,
    });
  } catch (error) {
    console.error("Error generating PIN:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Schedule job to run every minute
cron.schedule('* * * * *', async () => {
  console.log('Running background job to expire PINs...');
  try {
      const result = await Pin.updateMany(
          { status: 'active', expirationAt: { $lt: new Date() } },
          { status: 'expired' }
      );

      if (result.modifiedCount > 0) {
          console.log(`${result.modifiedCount} PIN(s) marked as expired.`);
      } else {
          console.log('No PINs to expire at this time.');
      }
  } catch (error) {
      console.error('Error expiring PINs:', error);
  }
});

// Verify PIN Route
app.post('/verify-pin', async (req, res) => {
  const { pin } = req.body;

  // Validate PIN input
  if (!pin || (pin.length !== 4 && pin.length !== 6)) {
    return res.status(400).json({ message: 'Invalid PIN format. PIN must be 4 or 6 digits.' });
  }

  try {
    // Search for the PIN in the database (regardless of status or expiration)
    const pinRecords = await Pin.find({});  

    let pinMatch = null;
    for (const record of pinRecords) {
      const isMatch = await bcrypt.compare(pin, record.pinCode);
      if (isMatch) {
        pinMatch = record;
        break;
      }
    }

    if (!pinMatch) {
      // PIN does not exist in the database
      return res.status(400).json({ message: 'Invalid PIN. Please try again.' });
    }

    // Check if the PIN is expired
    if (pinMatch.expirationAt < new Date() || pinMatch.status === 'expired') {
      return res.status(404).json({ message: 'PIN expired. Please request a new PIN.' });
    }

    // PIN is valid and active
    return res.status(200).json({
      message: 'Transaction approved! The money is on its way to your bank.',
    });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Route to delete all pins
app.delete('/admin/pins', authenticateJWT, async (req, res) => {
  try {
      await Pin.deleteMany({}); // Delete all pins from the database
      res.status(200).json({ message: 'All pins have been successfully deleted.' });
  } catch (error) {
      console.error('Error deleting pins:', error);
      res.status(500).json({ message: 'Server error' });
  }
});


// funding notification with Resend - UPDATED WITH BETTER LOGGING
async function sendFundingNotification(email, amount, newBalance) {
  try {
    console.log('=== FUNDING EMAIL ATTEMPT ===');
    console.log('To:', email);
    console.log('Amount:', amount);
    console.log('New Balance:', newBalance);
    
    const result = await resend.emails.send({
      from: 'SwiftEdge Trade <noreply@swiftedgetrade.com>',
      to: email,
      subject: 'Your Trading Account Has Been Funded',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Account Funding Notification</h2>
          <p>Hello,</p>
          <p>Your trading account has been successfully funded.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Amount Credited:</strong> $${amount.toFixed(2)}</p>
            <p><strong>New Account Balance:</strong> $${newBalance.toFixed(2)}</p>
          </div>
          
          <p>If you have any questions or didn't initiate this funding, please contact our support team immediately.</p>
          
          <p>Best regards,<br>SwiftEdge Trade Team</p>
          
          <div style="margin-top: 30px; font-size: 12px; color: #6c757d;">
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ FUNDING: Email sent successfully to', email);
    console.log('Resend ID:', result.id);
    console.log('=== FUNDING EMAIL COMPLETE ===');
    
    return { success: true, message: 'Notification sent successfully', resendId: result.id };
    
  } catch (error) {
    console.error('❌ FUNDING: Email failed for', email);
    console.error('Error:', error.message);
    console.error('Full error:', error);
    console.log('=== FUNDING EMAIL FAILED ===');
    
    // Don't throw error to avoid blocking the main process
    return { success: false, message: 'Failed to send funding notification', error: error.message };
  }
}


// Add this after other email functions

// Profit notification email
async function sendProfitNotification(email, amount, totalProfit, totalBalance, description) {
  try {
    console.log('=== PROFIT EMAIL ATTEMPT ===');
    console.log('To:', email);
    console.log('Amount:', amount);
    console.log('Total Profit:', totalProfit);
    console.log('Total Balance:', totalBalance);
    
    const result = await resend.emails.send({
      from: 'SwiftEdge Trade <noreply@swiftedgetrade.com>',
      to: email,
      subject: 'Profit Added to Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Profit Notification</h2>
          <p>Hello,</p>
          <p>Profit has been added to your trading account.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <p><strong>Profit Amount:</strong> $${amount.toFixed(2)}</strong></p>
            ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Updated Account Summary:</strong></p>
            <p>Total Profit: $${totalProfit.toFixed(2)}</p>
            <p>Total Balance: $${totalBalance.toFixed(2)}</p>
          </div>
          
          <p>This profit has been added to your total account balance and is available for withdrawal.</p>
          
          <p>If you have any questions or didn't expect this profit, please contact our support team.</p>
          
          <p>Best regards,<br>SwiftEdge Trade Team</p>
          
          <div style="margin-top: 30px; font-size: 12px; color: #6c757d;">
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ PROFIT: Email sent successfully to', email);
    console.log('Resend ID:', result.id);
    console.log('=== PROFIT EMAIL COMPLETE ===');
    
    return { success: true, message: 'Profit notification sent', resendId: result.id };
    
  } catch (error) {
    console.error('❌ PROFIT: Email failed for', email);
    console.error('Error:', error.message);
    console.error('Full error:', error);
    console.log('=== PROFIT EMAIL FAILED ===');
    
    return { success: false, message: 'Failed to send profit notification', error: error.message };
  }
}



// Backend Logic for withdrawals and Transactions history

// Admin middleware
const ADMIN_UIDS = ['admin123', 'admin456'];  

const adminOnly = (req, res, next) => {
  if (req.user && ADMIN_UIDS.includes(req.user.uid)) {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

 
//Transaction History Route

// Get user transactions with pagination
app.get('/api/transactions', authenticateJWT, async (req, res) => {
    try {
        const { page = 1, limit = 10, filter } = req.query;
        const skip = (page - 1) * limit;
        
        const query = { userId: req.user.id };
        if (filter && ['credit', 'debit'].includes(filter)) {
            query.type = filter;
        }

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(query);

        res.json({
            transactions,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



//Withdrawal Request Route and Admin Approval

// POST /api/withdraw - Create withdrawal request
app.post('/api/withdraw', authenticateJWT, async (req, res) => {
    try {
        console.log('Received withdrawal request:', {
            headers: req.headers,
            body: req.body,
            user: req.user
        });

        const { amount, method, walletAddress, bankDetails, cryptoType } = req.body;
        const userId = req.user.id; // Changed from _id to id to match JWT structure

        console.log('Looking for user with ID:', userId);

        // Verify user exists
        const user = await User.findById(userId).select('+totalBalance');
        if (!user) {
            console.error('User not found with ID:', userId);
            return res.status(404).json({ 
                success: false,
                error: 'User not found',
                userId: userId,
                suggestion: 'Check if user exists in database'
            });
        }

        console.log('Found user:', {
            id: user._id,
            email: user.email,
            balance: user.totalBalance
        });

        // Validate amount
        if (!amount || isNaN(amount)) {
            console.error('Invalid amount:', amount);
            return res.status(400).json({ 
                success: false,
                error: 'Invalid amount',
                received: amount
            });
        }

        if (amount <= 0) {
            console.error('Non-positive amount:', amount);
            return res.status(400).json({ 
                success: false,
                error: 'Amount must be positive',
                received: amount
            });
        }

        // Validate method
        if (!method || !['crypto', 'bank'].includes(method)) {
            console.error('Invalid method:', method);
            return res.status(400).json({ 
                success: false,
                error: 'Invalid withdrawal method',
                received: method,
                validMethods: ['crypto', 'bank']
            });
        }

        // Method-specific validation
        if (method === 'crypto') {
            if (!walletAddress || !cryptoType) {
                console.error('Missing crypto fields:', { walletAddress, cryptoType });
                return res.status(400).json({ 
                    success: false,
                    error: 'Wallet address and crypto type are required',
                    received: { walletAddress, cryptoType }
                });
            }
        } else {
            if (!bankDetails || !bankDetails.bankName || !bankDetails.accountNumber) {
                console.error('Incomplete bank details:', bankDetails);
                return res.status(400).json({ 
                    success: false,
                    error: 'Bank details are incomplete',
                    requiredFields: ['bankName', 'accountNumber'],
                    received: bankDetails
                });
            }
        }

        // Check sufficient balance (with 5% buffer for fees)
        if (user.totalBalance < amount * 1.05) {
            console.error('Insufficient balance:', {
                currentBalance: user.totalBalance,
                requiredAmount: amount * 1.05
            });
            return res.status(400).json({ 
                success: false,
                error: 'Insufficient balance (including potential fees)',
                currentBalance: user.totalBalance,
                requiredAmount: amount * 1.05,
                feePercentage: 5
            });
        }

        // Create withdrawal record
        const withdrawal = new Transaction({
            userId,
            uid: user.uid,
            type: 'debit',
            amount,
            method,
            details: {
                ...(method === 'crypto' ? { 
                    walletAddress,
                    cryptoType 
                } : bankDetails),
                pinVerified: true
            },
            status: 'pending'
        });

        await withdrawal.save();

        console.log('Withdrawal created successfully:', withdrawal);

        res.json({ 
            success: true, 
            message: 'Withdrawal request submitted for admin approval',
            withdrawalId: withdrawal._id,
            record: withdrawal
        });

    } catch (error) {
        console.error('Withdrawal processing error:', {
            message: error.message,
            stack: error.stack,
            body: req.body,
            user: req.user
        });
        
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/admin/withdrawals/pending - Get pending withdrawals
app.get('/api/admin/withdrawals/pending', authenticateJWT, authenticateAdmin, async (req, res) => {
    try {
        const pendingWithdrawals = await Transaction.find({
            type: 'debit',
            status: 'pending'
        }).populate('userId', 'fullName uid email');

        res.json({ 
            success: true, 
            withdrawals: pendingWithdrawals 
        });

    } catch (error) {
        console.error('Error fetching pending withdrawals:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// POST /api/admin/withdrawals/:id/process - Process withdrawal
app.post('/api/admin/withdrawals/:id/process', authenticateJWT, authenticateAdmin, async (req, res) => {
    try {
        const { action } = req.body;  
        const transactionId = req.params.id;

        // Find the transaction
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ 
                success: false,
                error: 'Transaction not found' 
            });
        }

        // Verify it's a pending withdrawal
        if (transaction.type !== 'debit' || transaction.status !== 'pending') {
            return res.status(400).json({ 
                success: false,
                error: 'Not a pending withdrawal' 
            });
        }

        // Find the user
        const user = await User.findById(transaction.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        // Process based on action
        if (action === 'approve') {
            // Check if user has sufficient balance (again, in case it changed)
            if (user.totalBalance < transaction.amount) {
                return res.status(400).json({ 
                    success: false,
                    error: 'User has insufficient balance' 
                });
            }

            // Deduct from user's balance
            user.totalBalance -= transaction.amount;
            await user.save();

            // Update transaction
            transaction.status = 'completed';
            transaction.processedBy = req.user.id;
            transaction.processedAt = new Date();
            await transaction.save();

            res.json({ 
                success: true,
                message: 'Withdrawal approved successfully',
                newBalance: user.totalBalance
            });

        } else if (action === 'reject') {
            // Update transaction
            transaction.status = 'rejected';
            transaction.processedBy = req.user.id;
            transaction.processedAt = new Date();
            await transaction.save();

            res.json({ 
                success: true,
                message: 'Withdrawal rejected successfully'
            });

        } else {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid action' 
            });
        }

    } catch (error) {
        console.error('Error processing withdrawal:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Debug email route - Add this to your server
app.post('/debug-email', async (req, res) => {
    const { email } = req.body;
    
    try {
        console.log('=== DEBUG EMAIL START ===');
        console.log('Testing email to:', email);
        console.log('Resend API Key exists:', !!process.env.RESEND_API_KEY);
        console.log('Domain: swiftedgetrade.com');
        
        const result = await resend.emails.send({
            from: 'SwiftEdge Trade <noreply@swiftedgetrade.com>',
            to: email,
            subject: 'DEBUG: Test Email from SwiftEdge',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #007bff;">DEBUG Test Email</h2>
                    <p>This is a test email to verify email functionality.</p>
                    <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                    <p><strong>To:</strong> ${email}</p>
                    <p><strong>From:</strong> no-reply@swiftedgetrade.com</p>
                </div>
            `
        });
        
        console.log('✅ DEBUG: Email sent successfully');
        console.log('Resend Response:', result);
        console.log('=== DEBUG EMAIL END ===');
        
        res.json({ 
            success: true, 
            message: 'Debug email sent successfully',
            result 
        });
        
    } catch (error) {
        console.error('❌ DEBUG: Email failed');
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            code: error.code,
            stack: error.stack
        });
        console.log('=== DEBUG EMAIL END ===');
        
        res.status(500).json({ 
            success: false, 
            error: error.message,
            details: error 
        });
    }
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 