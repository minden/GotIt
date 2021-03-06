"use strict";

var possibleLecture;

Template.landingPage.events({

  'submit form#enter-lecture': function(e) {
    var lectureCode;
    e.preventDefault();
    lectureCode = $(e.target).find('#lecture-code-input').val();
    if (possibleLecture(lectureCode)) {
      Router.go('lecturePage', {lectureCode: lectureCode});
    }
  },

  'click #create-lecture': function(event) {
    event.preventDefault();

    Meteor.call('insertLecture', function(error, result) {
      Router.go('lecturePage', {lectureCode: result.lectureCode});
    });
  },

  /** Make enter button turn green on right lecture code input */
  'keyup #lecture-code-input': function() {
    var lectureCode = $('#lecture-code-input').val();
    var pLecture = possibleLecture(lectureCode);
    if (pLecture) {
      $('#btn-enter-lecture').addClass('btn-success');
      $('#btn-enter-lecture').removeClass('disabled');
    } else {
      $('#btn-enter-lecture').removeClass('btn-success');
      $('#btn-enter-lecture').addClass('disabled');
    }
  }

});

Template.landingPage.rendered = function() {
  $('#landing-page-carousel').carousel({
    interval: 4000
  });
};

/** Check weather a lecture with this lecture code exists in the Lectures collection */
possibleLecture = function(lectureCode) {
  return App.Lectures.Collection.findOne({lectureCode: lectureCode});
};
