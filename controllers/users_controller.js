const User = require("../models/user");
const fs = require("fs");
const path = require("path");

module.exports.profile = function (request, respond) {
  // return respond.end('<h1>User Profile</h1>');

  User.findById(request.params.id, function (err, user) {
    return respond.render("user_profile", {
      title: "user_profile",
      profile_user: user,
    });
  });

  // if(request.cookies.user_id){
  //     User.findById(request.cookies.user_id, function(err, user){
  //         if(err){ console.log('err in finding user in profile'); return; }
  //         if(user){
  //             return respond.render('user_profile', {
  //                 title: "User profile",
  //                 user: user
  //             })
  //         }
  //         else{
  //             return respond.redirect('/users/sign-in');
  //         }
  //     });
  // }
  // else{
  //     return respond.redirect('/users/sign-in');
  // }
};

// render the sign up page
module.exports.signUp = function (request, respond) {
  if (request.isAuthenticated()) {
    return respond.redirect("/users/profile");
  }

  return respond.render("user_sign_up", {
    title: "Codeial | Sign Up",
  });
};

// render the sign in page
module.exports.signIn = function (request, respond) {
  if (request.isAuthenticated()) {
    return respond.redirect("/users/profile");
  }

  return respond.render("user_sign_in", {
    title: "Codeial | Sign In",
  });
};

// get the signUp data
module.exports.create = function (request, respond) {
  // first we check pswd & confirm pswd same or not
  if (request.body.password != request.body.confirm_password) {
    return respond.redirect("back");
  }
  User.findOne({ email: request.body.email })
    .then((user) => {
      if (!user) {
        User.create(request.body)
          .then((user) => {
            return respond.redirect("/users/sign-in");
          })
          .catch((err) => {
            console.log("error in creating user while signing up ", err);
            return respond.redirect("back");
          });
      } else {
        //if user already exist we send back to sign-in page
        return respond.redirect("back");
      }
    })
    .catch((err) => {
      console.log("error in finding in signing up", err);
    });

  // -----same as above but due to callback in Model.findOne() this showing error. so we used promises to solve this issue---------------
  // User.findOne({email: request.body.email}, function(err, user){
  //     if(err){    console.log('error in finding in signing up');  return; }

  //     if(!user){
  //         User.create(request.body, function(err, user){
  //             if(err){    console.log('error in creating user while signing up');
  //                 return}

  //             return respond.redirect('/users/sign-in');
  //         })
  //     }else{  //if user already exist we send back to sign-in page
  //         return respond.redirect('back');
  //     }
  // });
};

// get the signIn data
module.exports.createSession = function (request, respond) {
  // -------------Manual-----------------
  // steps to authenticate
  // Find user found

  // User.findOne({email: request.body.email}, function(err, user){
  //     if(err){    console.log('error in finding in signing in');  return; }

  //     // handle user found
  //     if(user){
  //         // handle password which don't match
  //         if(user.password != request.body.password){
  //             return respond.redirect('back');
  //         }
  //         // handle session creation
  //         respond.cookie('user_id', user.id);
  //         return respond.redirect('/users/profile');
  //     }
  //     else{
  //         // handle user not found
  //         return respond.redirect('back');
  //     }

  // });
  // -------------------------------------

  // Using Passport

  request.flash("success", "Logged in Successfully");
  return respond.redirect("/");
};

// --------------Manual Authentication -----------------
// module.exports.signOut = function(request, respond){
//     // return respond.end('<h1>Sign-Out!! Congo You did it very well!! </h1>');

//     respond.clearCookie('user_id');
//     console.log("cookie clear");
//     return respond.render('user_sign_out',{
//         title: "Codeial | Sign Out"
//     })
// }
// ---------------------------------------------------

module.exports.destroySession = function (request, respond) {
  request.logout(function (err) {
    if (err) {
      return next(err);
    }

    request.flash("success", "You have Logged out!");
    respond.redirect("/");
  });
};

module.exports.update = async function (request, respond) {
  if (request.user.id == request.params.id) {
    try {
      let user = await User.findByIdAndUpdate(request.params.id);
      User.uploadedAvatar(request, respond, function (err) {
        if (err) {
          console.log("******Multer Error", err);
        }

        // console.log(request.file);
        // without body we can't read this bcoz its multi part
        user.name = request.body.name;
        user.email = request.body.email;

        if (request.file) {
          if (user.avatar) {
            // fs.unlinkSync(path.join(__dirname, '..', user.avatar));
            fs.existsSync(path.join(__dirname, "..", user.avatar));
          }
          // this is saving the path of the uploaded file into the avatar field in the user
          user.avatar = User.avatarPath + "/" + request.file.filename;
        }
        user.save();
        return respond.redirect("back");
      });
    } catch (err) {
      request.flash("error", err);
      return respond.redirect("back");
    }
  } else {
    request.flash("error", "Unauthorized!");
    return respond.status(401).send("Unauthorized");
  }
};
