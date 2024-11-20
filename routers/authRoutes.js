const express = require('express');
const router = express.Router();
const Cookies = require('cookies');
const User = require('../models/User');

// User registration page
router.get('/register', (req, res) => {
    res.render('register');
});

// User registration logic
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const newUser = new User({
            username,
            password
        });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Login page
router.get('/login', (req, res) => {
    User.findOne({ role: 'admin' }).then(async admin => {
        if (!admin) {
            const adminItem = new User({
                username: 'admin',
                password: 'admin',
                role: 'admin'
            });
            await adminItem.save();
        }
    });
    res.render('login');
});

// Login logic
router.post('/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const user = await User.findOne({ username, role });
        if (!user) {
            res.render('login', {
                error: 'User does not exist'
            });
        } else {
            if (user.isBanned) {
                return res.render('login', {
                    error: 'User is banned!'
                });
            }
            if (password === user.password) {
                let cookies = new Cookies(req, res);
                cookies.set('user', JSON.stringify(user));
                if (role === 'admin') {
                    res.redirect('/admin/users');
                } else {
                    res.redirect('/');
                }
            } else {
                res.render('login', {
                    error: 'Incorrect password'
                });
            }
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Logout handling
router.get('/logout', (req, res) => {
    let cookies = new Cookies(req, res);
    cookies.set("user", null);
    res.redirect('/login');
});

module.exports = router;