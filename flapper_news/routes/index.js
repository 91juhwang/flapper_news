var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// requring database for restful routes crud actions
var mongoose = require('mongoose')
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

router.get('/posts', function(req, res, next) {
	Post.find(function(err, posts) {
		if (err) { return next(err); }

		res.json(posts);
	})
});

// posting data to the server
router.post('/posts', function(req, res, next) {
	var post = new Post(req.body);

	post.save(function(err, post) {
		if (err) {return next(err); }

		res.json(post);
	});
});

// router for creating post params to get the specific post
router.param('post', function(req, res, next, id) {
	var query = Post.findById(id);

	query.exec(function(err, post) {
		if (err) { return next(err); }
		if (!post) { return next(new Error("Can't find the post!")); }

		req.post = post;
		return next(); 
	})
})

// router for getting the specific post id
router.get('/posts/:post', function(req, res) { 
	req.post.populate('comments', function(err, post) {
		res.json(post)
	})
});

// creating update method for upvotes
router.put('/posts/:post/upvote', function(req, res, next) {
	req.post.upvote(function(err, post) { 
		if (err) { return next(err); }

		res.json(post);
	});
});

// comments router
router.post('/posts/:post/comments', function(req, res, next) {
	var comment = new Comment(req.body);
	comment.post = req.post;

	comment.save(function(err, comment) {
		if (err) { return next(err); }

		req.post.comments.push(comment);
		req.post.save(function(err, post) {
			if (err) { return next(err); }

			res.json(comment);
		})
	})
})

// router for creating comment params to get the specific post
router.param('comment', function(req, res, next, id) {
	var query = Comment.findById(id);

	query.exec(function(err, post) {
		if (err) { return next(err); }
		if (!post) { return next(new Error("Can't find the comment!")); }

		req.comment = comment;
		return next(); 
	})
})
// creating update method for upvotes for comments
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
	req.comment.upvote(function(err, comment) { 
		if (err) { return next(err); }

		res.json(comment);
	});
});

module.exports = router;