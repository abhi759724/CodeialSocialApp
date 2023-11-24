const User = require("../models/user");
const Friendship = require("../models/friendship");

// Send a friend request
module.exports.addFriend = async function (request, respond) {
  try {
    console.log("inside friend controller");
    // console.log('query',request.query);
    // const { fromUserId, toUserId } = request.query;
    const fromUserId = request.user.id;
    const toUserId = request.query.toUser;

    let existingFriend = await Friendship.findOne({
      to_user: toUserId,
    });

    if (!existingFriend) {
      // create a new friendship request
      const friendship = new Friendship({
        from_user: fromUserId,
        to_user: toUserId,
      });

      // save the friendship request
      await friendship.save();

      // add a friend to friendlist of the from_user
      const fromUser = await User.findById(fromUserId);
      fromUser.friendships.push(friendship._id);

      const toUser = await User.findById(toUserId);
      toUser.friendships.push(friendship._id);

      await Promise.all([fromUser.save(), toUser.save()]);

      if (request.xhr) {
        return respond.status(200).json({
          message: "Friend request sent successfully",
          data: {
            fromUser: fromUser,
            toUser: toUser,
          },
        });
      }
    } else {
      console.log("existing friend");
      return respond.status(400).json({
        message:
          "This user is already your friend. Do you want to remove them?",
      });
    }
  } catch (err) {
    return respond.status(500).json({ error: "Something wet wrong" });
  }
};

module.exports.removeFriend = async function (request, respond) {
  try {
    console.log("Inside remove friend module");

    // console.log('request::::::', request.user);
    // console.log('friend params', request.params.id);

    const friendDelete = await Friendship.findById(request.params.id);

    if (friendDelete) {
      friendDelete.remove();
      const userWithFriend = await User.find({
        friendships: request.params.id,
      });

      for (const user of userWithFriend) {
        user.friendships.pull(request.params.id);
        await user.save();
      }

      if (request.xhr) {
        return respond.status(200).json({
          data: {
            to_user: request.params.id,
          },
          message: "Friend deleted",
        });
      }
    }
  } catch (error) {
    console.log("errir in delete friend", error);
  }
};
