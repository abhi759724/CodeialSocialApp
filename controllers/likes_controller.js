const Like = require("../models/like");
const Post = require("../models/post");
const Comment = require("../models/comment");

module.exports.toggleLike = async function (request, respond) {
  try {
    // likes/toggle/?id = abcdef&type=Post

    // likes/toggle/?id=abcdef&type=Post
    let likeable;
    let deleted = false;

    if (request.query.type == "Post") {
      likeable = await Post.findById(request.query.id).populate("likes");
    } else {
      likeable = await Comment.findById(request.query.id).populate("likes");
    }

    // check if a like already exists
    let existingLike = await Like.findOne({
      likeable: request.query.id,
      onModel: request.query.type,
      user: request.user.id, //_id
    });

    // if a like already exists then delete it
    if (existingLike) {
      likeable.likes.pull(existingLike._id);
      likeable.save();

      existingLike.remove();
      deleted = true;
    } else {
      // else make a new like

      let newLike = await Like.create({
        user: request.user._id,
        likeable: request.query.id,
        onModel: request.query.type,
      });

      likeable.likes.push(newLike._id);
      likeable.save();
    }

    return respond.status(200).json({
      message: "Request Successful",
      data: {
        deleted: deleted,
      },
    });
  } catch (err) {
    console.log(err);
    return respond.json(500, {
      message: "Internal Server Error",
    });
  }
};
