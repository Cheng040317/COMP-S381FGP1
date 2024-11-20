const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Blog = require('../models/Blog');
const Category = require('../models/Category');
const Favorite = require('../models/Favorite');
const Link = require('../models/Link');
const Comment = require('../models/Comment');

// Define an array of sensitive words
const sensitiveWords = ['silly', 'mother'];
// Convert the sensitive words array to a regex
const sensitiveWordsRegex = new RegExp(sensitiveWords.join('|'), 'gi');

// Home route, displaying the blog list
router.get('/', async (req, res) => {
    try {
        // Pagination settings
        const perPage = 5;
        const page = parseInt(req.query.page) || 1;

        // Query blog posts
        const query = {};
        if (req.query.category) {
            query.category = req.query.category;
        }
        const blogs = await Blog.find({
                ...query,
                isPublic: true
            })
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .populate('category')
            .sort({
                createdAt: -1
            });

        // Query categories
        const categories = await Category.find().sort({ order: 1 });
        // Query links
        const links = await Link.find().sort({ order: 1 });

        // Calculate total pages
        const count = await Blog.countDocuments(query);
        const totalPages = Math.ceil(count / perPage);

        res.render('user/index', {
            blogs: blogs,
            categories: categories,
            links: links,
            user: req.user,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// GET blog detail page
router.get('/blogs/:id', async (req, res) => {
    try {
        const blogId = req.params.id;
        const blog = await Blog.findById(blogId).populate('category');
        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        blog.views++;
        await blog.save();

        // Get comment pagination info
        const page = parseInt(req.query.page) || 1;
        const limit = 5; // Comments per page
        const skip = (page - 1) * limit;
        const totalComments = await Comment.countDocuments({ blog: blogId });
        const totalPages = Math.ceil(totalComments / limit);
        const comments = await Comment.find({ blog: blogId })
            .populate('user')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Check if user has favorited the blog
        let isFavorited = false;
        if (req.user) {
            const userId = req.user._id;
            const favorite = await Favorite.findOne({
                blog: blogId,
                user: userId
            });
            if (favorite) {
                isFavorited = true;
            }
        }
        // Query links
        const links = await Link.find().sort({ order: 1 });
        res.render('user/blogDetail', {
            blog,
            comments,
            isFavorited,
            currentPage: page,
            totalPages,
            links,
            user: req.user // Pass logged-in user info to the template
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// POST favorite a blog
router.post('/blogs/:id/favorite', async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.user._id;

        // Check if already favorited
        const existingFavorite = await Favorite.findOne({
            blog: blogId,
            user: userId
        });
        if (existingFavorite) {
            return res.status(400).send('This blog is already favorited');
        }

        // Create a favorite record
        await Favorite.create({
            blog: blogId,
            user: userId
        });
        res.redirect(`/blogs/${blogId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to favorite the blog');
    }
});

// POST unfavorite a blog
router.post('/blogs/:id/unfavorite', async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.user._id;

        // Find and delete the favorite record
        await Favorite.findOneAndDelete({
            blog: blogId,
            user: userId
        });
        res.redirect(`/blogs/${blogId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to unfavorite the blog');
    }
});

// POST comment on a blog
router.post('/blogs/:id/comments', async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.user._id;
        const content = req.body.content;

        // Create a comment and sanitize the content
        const sanitizedContent = content.replace(sensitiveWordsRegex, '*');
        await Comment.create({
            blog: blogId,
            user: userId,
            content: sanitizedContent
        });
        res.redirect(`/blogs/${blogId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to post comment');
    }
});

// Get user favorites list
router.get('/favorites', async (req, res) => {
    const perPage = 5; // Number of favorites per page
    const page = req.query.page || 1;

    try {
        const favorites = await Favorite.find({
                user: req.user._id
            })
            .populate('blog')
            .skip((perPage * page) - perPage)
            .limit(perPage);

        const count = await Favorite.countDocuments({
            user: req.user._id
        });

        res.render('user/favorites', {
            favorites,
            user: req.user,
            currentPage: page,
            totalPages: Math.ceil(count / perPage)
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// Unfavorite
router.post('/favorites/:id/unfavorite', async (req, res) => {
    try {
        await Favorite.findByIdAndDelete(req.params.id);
        res.redirect('/favorites');
    } catch (err) {
        console.error(err);
        res.redirect('/favorites');
    }
});

// Get user comments list
router.get('/comments', async (req, res) => {
    const perPage = 5; // Number of comments per page
    const page = req.query.page || 1;

    try {
        const comments = await Comment.find({
                user: req.user._id
            })
            .populate('blog')
            .skip((perPage * page) - perPage)
            .limit(perPage);

        const count = await Comment.countDocuments({
            user: req.user._id
        });

        res.render('user/comments', {
            user: req.user,
            comments,
            currentPage: page,
            totalPages: Math.ceil(count / perPage)
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// Delete a comment
router.post('/my-comments/:id/delete', async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        res.redirect('/comments');
    } catch (err) {
        console.error(err);
        res.redirect('/comments');
    }
});

// Edit a comment
router.post('/my-comments/:id/edit', async (req, res) => {
    const { content } = req.body;

    const filteredContent = content.replace(sensitiveWordsRegex, '*');

    try {
        await Comment.findByIdAndUpdate(req.params.id, {
            content: filteredContent,
            updatedAt: Date.now()
        });
        res.redirect('/comments');
    } catch (err) {
        console.error(err);
        res.redirect('/comments');
    }
});

module.exports = router;