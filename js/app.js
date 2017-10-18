(function() {
  'use strict';

  const movies = [];

  const renderMovies = function() {
    $('#listings').empty();

    for (const movie of movies) {
      const $col = $('<div>').addClass('col s6');
      const $card = $('<div>').addClass('card hoverable');
      const $content = $('<div>').addClass('card-content center');
      const $title = $('<h6>').addClass('card-title truncate');

      $title.attr({
        'data-position': 'top',
        'data-tooltip': movie.title
      });

      $title.tooltip({
        delay: 50
      }).text(movie.title);

      const $poster = $('<img>').addClass('poster');

      $poster.attr({
        src: movie.poster,
        alt: `${movie.poster} Poster`
      });

      $content.append($title, $poster);
      $card.append($content);

      const $action = $('<div>').addClass('card-action center');
      const $plot = $('<a>');

      $plot.addClass('waves-effect waves-light btn modal-trigger');
      $plot.attr('href', `#${movie.id}`);
      $plot.text('Plot Synopsis');

      $action.append($plot);
      $card.append($action);

      const $modal = $('<div>').addClass('modal').attr('id', movie.id);
      const $modalContent = $('<div>').addClass('modal-content');
      const $modalHeader = $('<h4>').text(movie.title);
      const $movieYear = $('<h6>').text(`Released in ${movie.year}`);
      const $modalText = $('<p>').text(movie.plot);

      $modalContent.append($modalHeader, $movieYear, $modalText);
      $modal.append($modalContent);

      $col.append($card, $modal);

      $('#listings').append($col);

      $('.modal-trigger').leanModal();
    }
  };

  //  find the movie with the matching title in the movies array
  function findLocalMovie(title) {
    for (let i = 0; i < movies.length; i++) {
      if (movies[i].title === title) {
        return movies[i];
      }
    }
    return false;
  }

  //  handle the data that came back from looking up the movie by ID
  function parsePlotData(data) {
    //  grab the synopsis from the data and stuff it into the proper movie object
    let thisMovie = findLocalMovie(data["Title"]);
    thisMovie["plot"] = data["Plot"];

    // now update the corresponding modal card
    let identifier = "#" + thisMovie["id"];
    let $modal = $(identifier);
    $modal.find('p').text(thisMovie.plot);
  }

  //  Make a separate call to get the movie plot for the movie with the
  //  input ID.  The plot came back with
  //  the data from the original call, so I assume this is just to get us
  //  used to making separate requests for data...
  function requestPlot(movieID) {
    var $xhr = $.getJSON('https://omdb-api.now.sh/?i=' + movieID);

    $xhr.done(function(data) {
      if ($xhr.status !== 200) {
        // The served an unsuccessful status code.
        alert("Done, but status not 200!");
        return;
      }
      //  Successful, so parse the returned data and get the plot.
      parsePlotData(data);
    });

    $xhr.fail(function(err) {
      // The request was unsuccessful for some reason (ie. the server couldn't even respond).
      alert("Request failed!")
      console.log(err);
    });
  }

  //  parse data for a full movie and update the UI
  function parseData(data) {
    //  make sure something came back...
    if (data["Response"] === "False") {
      alert("Sorry - couldn't find that movie!  Try again.")
      return;
    }
    let newMovie = {};
    newMovie["id"] = data["imdbID"];
    newMovie["title"] = data["Title"];
    newMovie["poster"] = data["Poster"];
    newMovie["year"] = data["Year"];
    movies.push(newMovie);
    renderMovies();
    requestPlot(newMovie.id);
  }

  // handle the click on the search icon
  function handleSearch(event) {
    event.preventDefault();
    event.stopPropagation();

    //  validate the search string, then clear it
    let searchStr = $('#search').val();
    if (searchStr === "") {
      return;
    }
    $('#search').val("");

    //  make the ajax request and handle the return states
    var $xhr = $.getJSON('https://omdb-api.now.sh/?t=' + searchStr);

    $xhr.done(function(data) {
      if ($xhr.status !== 200) {
        // The served an unsuccessful status code.
        alert("Done, but status not 200!");
        return;
      }

      //  call was successful, so parse the movie data and update the UI
      parseData(data);
    });

    $xhr.fail(function(err) {
      // The request was unsuccessful for some reason (ie. the server couldn't even respond).
      alert("Request failed!")
      console.log(err);
    });
  }

  //  add a listener to the search icon
  function addSearchListener() {
    $('form').submit(handleSearch);
  }

  addSearchListener();

})();
