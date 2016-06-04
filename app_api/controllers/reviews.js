var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var sendJsonResponse = function(res, status, content){
  res.status(status);
  res.json(content);
};

module.exports.reviewsCreate = function(req, res) {
  sendJsonResponse(res, 200, {"status" : "success"});
};

module.exports.reviewsReadOne = function(req, res) {
  // Check if id exists in url.
  if(req.params && req.params.locationid){

    // Query the database.
    Loc.findById(req.params.locationid)
      .select('name reviews') // Only return the specified paths (columns)
      .exec(function(err, location){

        var response, review;

        // If no item was returned from database
        if(!location){
          sendJsonResponse(res, 404, {"message": "locationid not found"});
          return;
        }

        // If there was a database error
        else if (err){
          sendJsonResponse(res, 404, err);
          return;
        }

        // Return data
        if(location.reviews && location.reviews.length > 0){
          review = location.reviews.id(req.params.reviewid);

          if(!review){
            sendJsonResponse(res, 404, {"message": "reviewid not found"});
          }
          else{
            response = {
              location: {
                name: location.name,
                id: req.params.locationid
              },
              review: review
            };
            sendJsonResponse(res, 200, response);
          }
        }
        else{
          sendJsonResponse(res, 404, {"message": "No reviews found"});
        }
      });
    }
    else{
      sendJsonResponse(res, 404, {"message": "No locationid in request"});
    }
};

module.exports.reviewsUpdateOne = function(req, res) {
  sendJsonResponse(res, 200, {"status" : "success"});
};

module.exports.reviewsDeleteOne = function(req, res) {
  sendJsonResponse(res, 200, {"status" : "success"});
};
