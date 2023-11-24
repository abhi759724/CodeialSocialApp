const Post = require("../../../models/post");
const Comment = require("../../../models/comment");
const Like = require("../../../models/like");

module.exports.index = async function (request, respond) {
  let posts = await Post.find({})
    .sort("-createdAt")
    .populate("user")
    .populate({
      path: "comments",
      populate: {
        path: "user",
      },
      populate: {
        //for comment
        path: "likes",
      },
    })
    .populate("likes"); //for post

  return respond.json(200, {
    message: "List of Posts",
    posts: posts,
  });
};

module.exports.destroy = async function (request, respond) {
  try {
    let post = await Post.findById(request.params.id);

    if (post.user == request.user.id) {
      await Like.deleteMany({ likeable: post, onModel: "Post" });
      await Like.deleteMany({ _id: { $in: post.comments } });

      post.remove();
      await Comment.deleteMany({ post: request.params.id });

      return respond.json(200, {
        message: "Post and associated comments deleted successfully!",
      });
    } else {
      return respond.json(401, {
        message: "You csnnot delete this post!",
      });
    }
  } catch (err) {
    console.log("*******", err);
    return respond.json(500, {
      message: "Internal server error",
    });
  }
};
