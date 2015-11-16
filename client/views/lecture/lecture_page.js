Template.lecturePage.helpers({
  questions: function() {
    var questions =  Questions.find({lectureCode: this.lectureCode}).fetch();

    _.each(questions, function(question) {
      var amountVotes = Votes.find({questionId: question._id}).count();
      question.amountVotes = amountVotes;
    });

    questions.sort(function(a,b) {
      return b.amountVotes - a.amountVotes;
    });

    return questions;
  },

  // Prevent template rendering before lecture data is available
  lectureDataReady: function() {
    var lectureData = Lectures.findOne({lectureCode: this.lectureCode});

    if(lectureData) {
      return true;
    } else {
      return false;
    }
  }
});

Template.lecturePage.rendered = function() {
  Session.set('lecturePage.isLectureCodeVisible', true);
  Tracker.afterFlush(function() {
    $(window).trigger('resize');
  });

  //* Copyright (C) 2012--2014 Discover Meteor */
  this.find('.animated')._uihooks = {
    insertElement: function (node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn();
    },

    moveElement: function (node, next) {
      var $node = $(node), $next = $(next);
      var oldTop = $node.offset().top;
      var height = $(node).outerHeight(true);

      // find all the elements between next and node
      var $inBetween = $(next).nextUntil(node);
      if ($inBetween.length === 0) {
        $inBetween = $(node).nextUntil(next);
      }

      // now put node in place
      $(node).insertBefore(next);

      // measure new top
      var newTop = $(node).offset().top;

      // move node *back* to where it was before
      $(node)
        .removeClass('animate')
        .css('top', oldTop - newTop);

      // push every other element down (or up) to put them back
      $inBetween
        .removeClass('animate')
        .css('top', oldTop < newTop ? height : -1 * height);


      // force a redraw
      $(node).offset();

      // reset everything to 0, animated
      $(node).addClass('animate').css('top', 0);
      $inBetween.addClass('animate').css('top', 0);
    },

    removeElement: function(node) {
      $(node).fadeOut(function() {
        $(this).remove();
      });
    }
  };
};

/** call leaveLecture() before tab / window close */
Meteor.startup(function() {
  $(window).bind('beforeunload', function() {
    if(Router.current().route.getName() == 'lecturePage'){
      leaveLecture();
    }
  });

  // as the navbar poisition is fixed, the page content needs to be
  // pulled down when the navbar gets higher (on resize or when the title is edited)
  $(window).resize(function() {
    var navbarHeight, columnLectureCodeHeight, columnLectureCodeMargin,
      lectureCodeNavbarHeight, bodyPaddingTop;

    // reset the margin of the column to calculate proper dimensions
    $('#col-show-lecture-code').css('margin-top', '0');

    navbarHeight = $('#lecture-page-header').height();
    columnLectureCodeHeight = $('#col-show-lecture-code').height();
    lectureCodeNavbarHeight = 0;

    if (Session.get('lecturePage.isLectureCodeVisible')) {
      lectureCodeNavbarHeight = $('#lecture-page-navbar-lecture-code').height();
    }

    bodyPaddingTop = navbarHeight + lectureCodeNavbarHeight + 12;
    columnLectureCodeMargin = navbarHeight - columnLectureCodeHeight;

    $('#lecture-page-navbar-lecture-code').css('top', navbarHeight + 'px');
    $('#col-show-lecture-code').css('margin-top', columnLectureCodeMargin + 'px');
    $('body').css('padding-top', bodyPaddingTop + 'px');
  });
});


leaveLecture = function() {
  var lectureCode = Router.current().data().lectureCode;

  Meteor.call('deleteVotesFromUserFromLecture', lectureCode, function(error, result) {
    if(error) {
      return alert(error);
    }
  });
  Meteor.call('removeCurrentUserFromLecture', lectureCode, function(error, result) {
    if(error) {
      return alert(error);
    }
  });

  Router.go('landingPage');
  // trigger the resize event to reset the page top padding when returning
  // to the landing page
  Tracker.afterFlush(function() {
    $(window).trigger('resize');
  });
}
