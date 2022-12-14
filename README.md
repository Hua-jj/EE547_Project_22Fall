# EE547_Project_22Fall

## Github link:
https://github.com/Hua-jj/EE547_Project_22Fall

## Architecture
Home:  The initial page where the user can start all the movements. Various functionalities, including finding movies by section or keywords, will be presented on this page for users to choose from. Moreover, this page will also display selected popular movies which could be redirected to its forum by clicking on them.

Sign-in/Sign-up: Sign-in members can rate and review. Basic information is needed for signing up. (e-mail, nickname, favorite movie, etc.)

Movie forum: This page contains all the comments and ratings of a specific movie. The rating ranges from 1 to 5 stars(1 means dislike, 5 means highly recommend). If you are a sign-in member, you can add your comments and rate on this page.

Personal Profile: This page will display the user information and provide users with an entrance to edit.

Movie details: The information about the movie, including movie name, director, starring actor, etc.

## Database collections:
`Movies` `Users` `Comments` `Ratings`

## File details
`./node_moudules` downloaded node modules.

`./views/assets/brand` icons.

`./views/assets/dist` major css stylesheets and js scripts of `Bootstrap`.

`./views/css` self-define stylesheets.

`./views/imgs` poster of movies.

`./views/js` javascript files of the corresponding ejs pages.

`./view/pages` ejs template pages.

`./index.js` the code of the server.

`./package.json` required packages of this application.

`./schema.graphql` graphql schema.

`./spider_TMDB` the spider program which dynamically requests data from TMDB and insert into the mongoDB.

## Configration and usage
Before running the application, the address of the database and the url of the server should be configured properly.

The url of the server is defined by the `base_url` variable in `./views/js/module.js`.

The address of the database is defined by line 16-22 in `./index.js`

To run the server, use `node index.js`



