const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Blog = require('../models/Blog');
const Category = require('../models/Category');
const Comment = require('../models/Comment');

// User management page route with pagination
router.get('/users', async (req, res) => {
    const page = req.query.page || 1; // Get current page number from query parameters, default to first page
    const limit = 10; // Number of users displayed per page

    try {
        const users = await User.find()
            .sort({ createdAt: 'desc' })
            .skip((page - 1) * limit) // Skip previous pages
            .limit(limit); // Limit the number of returned users

        const totalUsers = await User.countDocuments(); // Total number of users for calculating total pages
        const totalPages = Math.ceil(totalUsers / limit); // Total pages

        res.render('admin/users', {
            users,
            currentUser: req.user,
            totalPages,
            currentPage: page
        }); // Render admin/users.ejs template and pass user data, current user info, total pages, and current page
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Handle freeze user functionality
router.post('/users/:id/freeze', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        if (user.role === 'admin') {
            return res.status(403).send('Admin account cannot be frozen');
        }

        // Set user to frozen state
        user.isBanned = true;
        await user.save();

        res.redirect('/admin/users'); // Redirect back to user management page after freezing
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Handle reset password functionality
router.post('/users/:id/reset-password', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Set user password to "123"
        user.password = '123';
        await user.save();

        res.redirect('/admin/users'); // Redirect back to user management page after resetting password
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Category management page route with pagination
router.get('/categories', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Get current page number from query parameters, default to first page
    const limit = 10; // Number of categories displayed per page

    try {
        const categories = await Category.find()
            .sort({ order: 1 }) // Sort by order field
            .skip((page - 1) * limit) // Skip previous pages
            .limit(limit); // Limit the number of returned categories

        const totalCategories = await Category.countDocuments(); // Total number of categories for calculating total pages
        const totalPages = Math.ceil(totalCategories / limit); // Total pages

        res.render('admin/categories', {
            categories,
            currentUser: req.user,
            totalPages,
            currentPage: page
        }); // Render admin/categories.ejs template and pass category data, current user info, total pages, and current page
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Add new category
router.post('/categories', async (req, res) => {
    const { title, order } = req.body;

    try {
        const newCategory = new Category({
            title,
            order
        });
        await newCategory.save();
        res.redirect('/admin/categories');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Edit category
router.post('/categories/:id/edit', async (req, res) => {
    const categoryId = req.params.id;
    const { title, order } = req.body;

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).send('Category not found');
        }

        category.title = title;
        category.order = order;
        category.updatedAt = Date.now();

        await category.save();
        res.redirect('/admin/categories');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Delete category
router.post('/categories/:id/delete', async (req, res) => {
    const categoryId = req.params.id;

    try {
        await Category.findByIdAndDelete(categoryId);
        res.redirect('/admin/categories');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Blog management page route with pagination
router.get('/blogs', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Current page number, default to first page
    const limit = 10; // Number of blogs displayed per page

    try {
        // Query blog data with pagination, sorted by creation time in descending order
        const blogs = await Blog.find()
            .sort({ isTop: 'desc', createdAt: 'desc' })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('category', 'title'); // Populate category title

        // Calculate total pages
        const totalBlogs = await Blog.countDocuments();
        const totalPages = Math.ceil(totalBlogs / limit);

        // Query all category data for selecting categories when adding/editing blogs
        const categories = await Category.find().sort({ title: 'asc' });

        // Render admin/blogs page and pass blog data, category data, and pagination info
        res.render('admin/blogs', {
            currentUser: req.user,
            blogs,
            categories,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        handleError(res, error); // Handle error case
    }
});

// POST /admin/blogs route - Create new blog
router.post('/blogs', async (req, res) => {
    try {
        const { title, content, category, isPublic, isTop } = req.body;
        
        // Create new blog object
        const newBlog = new Blog({
            title,
            content,
            category,
            isPublic: isPublic === 'true', // Convert to boolean
            isTop: isTop === 'true' // Convert to boolean
        });

        // Save blog to database
        await newBlog.save();

        res.redirect('/admin/blogs'); // Redirect to blog management page
    } catch (error) {
        handleError(res, error); // Handle error case
    }
});

// GET /admin/blogs/:id/edit route - Render edit blog page
router.get('/blogs/:id/edit', async (req, res) => {
    const { id } = req.params;

    try {
        // Query blog data by blog ID
        const blog = await Blog.findById(id);

        // Query all category data for selecting categories when editing blogs
        const categories = await Category.find().sort({ title: 'asc' });

        // Render edit blog page and pass blog data and category data
        res.render('admin/edit-blog', { blog, categories });
    } catch (error) {
        handleError(res, error); // Handle error case
    }
});

// POST /admin/blogs/:id route - Update blog information
router.post('/blogs/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const { title, content, category, isPublic, isTop } = req.body;

        // Update blog data
        await Blog.findByIdAndUpdate(id, {
            title,
            content,
            category,
            isPublic: isPublic === 'true', // Convert to boolean
            isTop: isTop === 'true', // Convert to boolean
            updatedAt: Date.now()
        });

        res.redirect('/admin/blogs'); // Redirect to blog management page
    } catch (error) {
        handleError(res, error); // Handle error case
    }
});

// POST /admin/blogs/:id/delete route - Delete blog
router.post('/blogs/:id/delete', async (req, res) => {
    const { id } = req.params;

    try {
        // Delete blog by blog ID
        await Blog.findByIdAndDelete(id);

        res.redirect('/admin/blogs'); // Redirect to blog management page
    } catch (error) {
        handleError(res, error); // Handle error case
    }
});

// Error handling function
function handleError(res, error) {
    console.error(error);
    res.status(500).send('Internal server error');
}

// POST request: Toggle blog's public status
router.post('/blogs/:id/toggle-public', async (req, res) => {
    const blogId = req.params.id;

    try {
        // Find the corresponding blog record
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Toggle public status
        blog.isPublic = !blog.isPublic;
        await blog.save();

        res.redirect('/admin/blogs'); // Redirect to blog management page
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST request: Toggle blog's top status
router.post('/blogs/:id/toggle-top', async (req, res) => {
    const blogId = req.params.id;

    try {
        // Find the corresponding blog record
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Toggle top status
        blog.isTop = !blog.isTop;
        await blog.save();

        res.redirect('/admin/blogs'); // Redirect to blog management page
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get comments list (pagination)
router.get('/comments', async (req, res) => {
    const perPage = 10; // Number of comments displayed per page
    const page = parseInt(req.query.page) || 1; // Current page number, default to first page

    try {
        const skip = (perPage * page) - perPage;
        const comments = await Comment
            .find()
            .skip(skip)
            .limit(perPage)
            .sort({ createdAt: -1 })
            .populate('blog', 'title') // Populate blog, selecting only the title field
            .populate('user', 'username'); // Populate user, selecting only the username field

        const count = await Comment.countDocuments(); // Total number of comments

        res.render('admin/comments', {
            currentUser: req.user,
            comments: comments,
            current: page,
            pages: Math.ceil(count / perPage)
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Delete comment
router.post('/comments/:id/delete', async (req, res) => {
    const commentId = req.params.id;

    try {
        await Comment.findByIdAndDelete(commentId);
        req.flash('success_msg', 'Comment deleted successfully');
        res.redirect('/admin/comments');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Failed to delete comment');
        res.redirect('/admin/comments');
    }
});

// GET change password page
router.get('/password', (req, res) => {
    res.render('admin/password', { error: null, currentUser: req.user });
});

// POST handle change password request
router.post('/change-password', async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = req.user; 

    try {
        // Validate current password
        const isPasswordValid = currentPassword == user.password;
        if (!isPasswordValid) {
            res.render('admin/password', { error: 'Incorrect current password!', currentUser: req.user });
            return;
        }

        // Validate new password and confirmation password match
        if (newPassword !== confirmPassword) {
            res.render('admin/password', { error: 'New password and confirmation do not match', currentUser: req.user });
            return;
        }

        // Update user password
        let mUser = await User.findOne({ _id: user._id });
        mUser.password = newPassword;
        await mUser.save();
        
        // Password changed successfully, redirect to login page
        res.redirect('/login');
    } catch (error) {
        // Handle error, re-render change password page with error message
        res.render('admin/password', { error: error.message, currentUser: req.user });
    }
});

module.exports = router;