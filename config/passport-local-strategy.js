const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

passport.use(new LocalStrategy({
    usernameField: 'email',
    // passReqToCallback: true
},
async function(email, password, done){
    // done- callback function reporting back to passport.js

    // find a user and establishe the identity
    let user = await User.findOne({email: email});

    if (!user || user.password != password){
        // console.log('Invalid Username/Password');
        // request.flash('error', 'Invalid Username/Password');
        return done(null, false);
        // null- no error  and  false- authentication
    }
    return done(null, user);

}
));

// serialize- the user to decide which key is to be kept in the cookies 
// serializeUser- inbuild function

    // (we find id --> sended to cookie --> browser)
passport.serializeUser(function(user,done){
done(null, user.id);
});

    // browser make request --> deserialize --> find user again)
// deserializing the user from the key in the cookies
passport.deserializeUser(function(id, done){
User.findById(id, function(err, user){
    if(err){
        console.log('Error in finding uer --> Passport');
        return done(err);
    }
    return done(null, user);    //null- no error, user- user found
})
});


// check if the user is authenticated
passport.checkAuthentication = function(request, respond, next){
    // if the user is signed in, then pass on the request to the next function(controller's action)
    if(request.isAuthenticated()){
        return next();
    }
// _________aurhentication using Passport________

// if the user is not signed in 
return respond.redirect('/users/sign-in');
}

passport.setAuthenticatedUser = function(request,respond, next){
if(request.isAuthenticated()){
    // request.user contains the current signed in user from the session cookie and we are just sending this to the locals for the views
    respond.locals.user = request.user;
}
next();
}

module.exports = passport;