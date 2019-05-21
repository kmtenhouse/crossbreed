module.exports = function asyncMiddleware(handler) {
    return async (req, res, next) => {
      try {
        await handler(req, res);
      } catch (ex) {
        res.send({err: ex.message});
        //res.sendStatus(400); //next(ex);
      }
    };
  };