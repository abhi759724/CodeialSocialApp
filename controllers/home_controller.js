const Friendship = require("../models/friendship");
const Post = require("../models/post");
const User = require("../models/user");

module.exports.home = async function (request, respond) {
  // console.log(req.cookies);
  // res.cookie('user_id', 25);

  // Post.find({}, function(err, posts){
  //     return res.render('home', {
  //         title: "Codeial | Home",
  //         posts:  posts

  //     });
  // });

  // populate the user of each post
  try {
    const loggedInUserId = request.user;

    let posts = await Post.find({})
      .sort("-createdAt")
      .populate("user")
      .populate({
        path: "comments",
        populate: {
          path: "user",
        },
        // populate: { //for comment
        //     path: 'likes'
        // }
      })
      .populate({
        path: "comments",
        populate: {
          path: "likes",
        },
      })
      // .populate('comments')
      .populate("likes"); //for post

    // console.log('qqqq',posts[0].comments);

    let users = await User.find({});

    let friendlist = await Friendship.find({
      from_user: loggedInUserId,
    }).populate({
      path: "to_user",
      populate: {
        path: "name",
      },
    });

    // console.log('user frineds:: ',friendlist[0].to_user);

    return respond.render("home", {
      title: "Codeial | Home",
      posts: posts,
      all_users: users,
      all_friends: friendlist,
    });
  } catch (err) {
    console.log("Error", err);
  }
};

// module.exports.actionName = function(req, res){}

// using then
// Post.find({}).populate('comments').then(function());

// let posts = Post.find({}).populate('comments').exec();

// posts.then()
