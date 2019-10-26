const User = require('../models/user');

let getUserByUserName = async function (userName) {
    try{
        let user = await User.findOne({username: userName});
        return user;
    }catch (e) {
        return null;
    }
}

let getUserById =  async function(id) {
    try{
        var user = await User.findOne({_id: id});
        return user;
    }catch (e) {
        return null;
    }

}


module.exports = {getUserById : getUserById,
    getUserByUserName: getUserByUserName};