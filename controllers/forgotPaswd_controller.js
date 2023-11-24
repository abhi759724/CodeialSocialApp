const User = require("../models/user");
const ForgotPswd = require("../models/forgotPassword");
const nodeMailer = require("../config/nodemailer");

module.exports.forgot = function (request, respond) {
  // return respond.end('<h1>forgot password</h1>');

  return respond.render("forgot-password", {
    title: "Codeial | Forgot Password",
  });
};

module.exports.setEmail = async function (request, respond) {
  try {
    console.log("inside forgot controller");
    const email = request.body.email;
    const user = await User.findOne({ email });

    if (!user) {
      return respond.render("forgot-password", {
        title: "Codeial | change password",
        message: "Email not found",
      });
    }

    // Create or update the forgot password document
    const accessToken = Math.random().toString(36).slice(2);
    console.log("access token", accessToken);

    let forgotPswdToken = await ForgotPswd.findOne({ user: user._id });

    if (!forgotPswdToken) {
      forgotPswdToken = new ForgotPswd({
        user: user._id,
        accessToken: accessToken,
      });
    } else {
      forgotPswdToken.accessToken = accessToken;
      forgotPswdToken.isValid = true;
    }

    await forgotPswdToken.save();

    // ---------- Send the reset password link to the user's email (you can implement this part)

    const mailOptions = {
      from: "simran2mandal@gmail.com",
      to: email,
      subject: "Reset Password Link",
      html: `<p>Click <a href="http://localhost:5000/forgotPswd/reset-password/${accessToken}" >here</a> to reset your password. </p>`,
    };

    nodeMailer.transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent: ", info.respond);
      }
    });

    console.log("email --->", email);
    return respond.render("forgot_check-email", {
      title: "Codeial | change password",
      token: accessToken,
      email: email,
    });
  } catch (err) {
    console.log("Error inside forgot Password controller", err);
    return respond.status(500).send("Internal Server Error");
  }
};

module.exports.getResetPaswd = async function (request, respond) {
  try {
    console.log("getReset Link--->", request);
    const token = request.params.token;
    console.log("token", token);
    // Find the forgot password document with the provided token
    const forgotPswdToken = await ForgotPswd.findOne({ accessToken: token });

    if (!forgotPswdToken || !forgotPswdToken.isValid) {
      return respond.render("forgot_reset-password-error", {
        title: "Codeial | change password",
      });
    }

    const user = await User.findById(forgotPswdToken.user);
    if (!user) {
      return respond.status(404).send("User not found");
    }

    return respond.render("forgot_change-password", {
      title: "Codeial | change password",
      token: token,
      email: user.email,
    });
  } catch (err) {
    console.log("Internal server error: ", err);
    return respond.status(500).send("Internal Server Error");
  }
};

module.exports.resetPaswd = async (request, respond) => {
  const token = request.params.token;
  const newPassword = request.body.newPassword;
  const confirmPassword = request.body.confirmPassword;

  try {
    // Find the forgot password document with the provided token
    const forgotPswdToken = await ForgotPswd.findOne({ accessToken: token });

    if (!forgotPswdToken || !forgotPswdToken.isValid) {
      return respond.render("forgot_reset-password-error", {
        title: "Codeial | change password",
      });
    }

    const user = await User.findById(forgotPswdToken.user);

    if (newPassword !== confirmPassword) {
      return respond.render("forgot_change-password", {
        title: "Codeial | change password",
        token: token,
        email: user.email,
      });
    }

    // Update the user's password and mark the token as used
    user.password = newPassword;
    await user.save();

    forgotPswdToken.isValid = false;
    await forgotPswdToken.save();

    // Redirect to the login page after changing the password
    return respond.render("forgot_password-changed", {
      title: "Codeial | change password",
    });
  } catch (err) {
    console.error(err);
    return respond.status(500).send("Internal Server Error");
  }
};
