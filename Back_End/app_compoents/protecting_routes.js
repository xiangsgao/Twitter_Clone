// for protecting the routes

function not_authen_redirect(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}

function authen_redirect(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/main');
    }
    next();
}

function none_rediret_not_authen(req, res, next){
    if(!req.isAuthenticated()){
        return res.send({status: "error", error: "not logged in"});
    }
    next();
}

function none_redirect_authen(req, res, next){
    if(req.isAuthenticated()){
        return res.send({status: "error", error: "log out first"});
    }
    next();
}


module.exports = {not_authen_redirect : not_authen_redirect, authen_redirect: authen_redirect, none_rediret_not_authen: none_rediret_not_authen, none_redirect_authen: none_redirect_authen};