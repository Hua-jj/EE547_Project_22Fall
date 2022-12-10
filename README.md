# EE547_Project_22Fall

## Architecture
Home:  The initial page where the user can start all the movements. Various functionalities, including finding movies by section or keywords, will be presented on this page for users to choose from. Moreover, this page will also display selected popular movies which could be redirected to its forum by clicking on them.

Sign-in/Sign-up: Sign-in members can rate and review. Basic information is needed for signing up. (e-mail, nickname, favorite movie, etc.)

Movie forum: This page contains all the comments and ratings of a specific movie. The rating ranges from 1 to 5 stars(1 means dislike, 5 means highly recommend). If you are a sign-in member, you can add your comments and rate on this page.

Personal Profile: This page will display the user information and provide users with an entrance to edit.

Movie details: The information about the movie, including movie name, director, starring actor, etc.

## Database collections we have:
Movies
Users
Comments
Ratings

## graphql schema:
stored in [schema](schema.graphql)

## server:
stored in [server](index.js)

