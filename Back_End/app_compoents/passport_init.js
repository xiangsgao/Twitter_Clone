const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function init(passport, getUserByEmail, getUserById){
    // email will be pass by form post, password will be submit by form post, getUserByEmail will a callback for getting user in the data base. done will be the return result of this authenticate which lets passport figure out if login is succesful or not
    const callback = async function(username, password, done){
        try{
            let user = await getUserByEmail(username);
            if(user == null) return done(null, false, {message: 'user not found'}); // done callback for the passport takes in error code(server side), user(if database from getUserByEmail finds it), and the message, error in this case
                if(await bcrypt.compare(password, user.password)){
                    // this means both user is found and the password is correct
                    return done(null, user)
                }else{
                    return done(null, false, {message: 'password is incorrect'});
                }
        }catch(err){
            return done(err); // if the bycript errors
        }
    }

    // password field defaults to password, set the key value pair if the name is different from what form post submits. This email from post and password from post will be pass in to the callback authenticate_user
    passport.use(new LocalStrategy({usernameField: 'username'}, callback)); // this function logs in base on if user are found in the database
    passport.serializeUser((user, done) => done(null, user._id)); // user is user if return by authenticate_user which is return by the call back and done is just like in the call back, this stores the user document object id in session
    passport.deserializeUser( async (id, done) =>{
        try{
            let user = await getUserById(id);
            done(null, user);
        }catch (e) {
            done("deserialize error", false);
        }
    } ) // this get back the user document and store it in request
}

module.exports = init;