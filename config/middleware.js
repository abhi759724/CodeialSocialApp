module.exports.setFlash = function(request, respond, next){
    respond.locals.flash = {
        'success': request.flash('success'),
        'error': request.flash('error')
    }

    next();
}