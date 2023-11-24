const Post = require("../models/post");
const Comment = require("../models/comment");
const Like = require("../models/like");

module.exports.create = async function (request, respond) {
  try {
    let post = await Post.create({
      content: request.body.content,
      user: request.user._id,
    });
    if (request.xhr) {
      post = await post.populate("user", "name avatar");
      return respond.status(200).json({
        data: {
          post: post,
        },
        message: "Post created !",
      });
    }
    request.flash("success", "Post published!");
    return respond.redirect("back");
  } catch (err) {
    request.flash("err", err);
    return respond.redirect("back");
  }
};

module.exports.destroy = async function (request, respond) {
  try {
    let post = await Post.findById(request.params.id);

    // .id means converting the object id into string
    if (post.user == request.user.id) {
      await Like.deleteMany({ likeable: post, onModel: "Post" });
      await Like.deleteMany({ _id: { $in: post.comments } });

      post.remove();
      await Comment.deleteMany({ post: request.params.id });

      if (request.xhr) {
        return respond.status(200).json({
          data: {
            post_id: request.params.id,
          },
          message: "Post deleted !",
        });
      }

      request.flash("success", "Post and associated comments deleted");
      return respond.redirect("back");
    } else {
      request.flash("error", "You can not delete this post!");
      return respond.redirect("back");
    }
  } catch (err) {
    request.flash("err", err);
    return respond.redirect("back");
  }
};
