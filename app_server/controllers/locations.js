var request = require('request');
var apiOptions = {
  server: "http://localhost:3000"
};

if(process.env.NODE_ENV === 'production'){
  apiOptions.server = "https://gettingmeanpractice.herokuapp.com"
}

var renderHomepage = function(req, res, responseBody){
  res.render('locations-list', {
    title: 'Loc8r - find a place to work with wifi',
    pageHeader: {
      title: 'Loc8r',
      strapline: 'find places to work with wifi near you!'
    },
    sidebar: "Loc8r helps you find places to work when out and about. hizzah",
    locations: responseBody
  });
};

var renderDetailPage = function(req, res, locDetail){
  res.render('location-info', {
    title: locDetail.name,
    pageHeader: {title: locDetail.name},
    sidebar:{
      context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
      callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
    },
    location: locDetail
  });
};

var _showError = function(req, res, status){
  var title, content;
  if(status === 404){
    title = "404, page not found";
    content = "Oh dear.";
  }
  else{
    title = status + ", something's wrong.";
    content = "Bad bad bad bad.";
  }

  res.status(status);
  res.render('generic-text', {
    title: title,
    content: content
  });
};

var getLocationInfo = function (req, res, callback) {
  var requestOptions, path;
  path = "/api/locations/" + req.params.locationid;
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      var data = body;
      if (response.statusCode === 200) {
        data.coords = {
          lng : body.coords[0],
          lat : body.coords[1]
        };
        callback(req, res, data);
      } else {
        _showError(req, res, response.statusCode);
      }
    }
  );
};

module.exports.homelist = function(req, res){

  var requestOptions, path;
  path = '/api/locations';

  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {},
    qs : {
      lng : -0.9690884,
      lat : 51.455041,
      maxDistance: 20
    }
  };

  request(requestOptions, function(err, response, body){
    renderHomepage(req, res, body);
  });
};

module.exports.locationInfo = function(req, res){
  getLocationInfo(req, res, function(re, res, responseData){
    renderDetailPage(req, res, responseData);
  });
};

var renderReviewForm = function(req, res, locDetail){
  res.render('location-review-form', {
    title: 'Review ' + locDetail.name + ' on Loc8r',
    pageHeader: { title: 'Review ' + locDetail.name},
    error: req.query.err
  });
};

module.exports.addReview = function(req, res){
  getLocationInfo(req, res, function(req, res, responseData){
    renderReviewForm(req, res, responseData);
  });
};

module.exports.doAddReview = function(req, res){
  var requestOptions, path, locationid, postdata;
  locationid = req.params.locationid;
  path = "/api/locations/" + locationid + '/reviews';
  postdata = {
    author: req.body.name,
    rating: parseInt(req.body.rating, 10),
    reviewText: req.body.review
  };

  requestOptions = {
    url : apiOptions.server + path,
    method : "POST",
    json : postdata
  };

  if(!postdata.author || !postdata.rating || !postdata.reviewText){
    res.redirect('/location/' + locationid + '/reviews/new?err=val');
  }
  else{
    request(
      requestOptions,
      function(err, response, body){
        if(response.statusCode === 201){
          res.redirect('/location/' + locationid);
        }
        else if(response.statusCode === 400 && body.name &&body.name === "ValidationError"){
          res.redirect('/location/' + locationid + '/reviews/new?err=val');
        }
        else{
          _showError(req, res, response.statudCode);
        }
      }
    );
  }
};
