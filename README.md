# CS441Project
My project for CS 441 using machine learning in animal nutrition

Allows one to plug ingredients and corresponding prices along with a pig weight, and it will find a rough estimate for the nutritional requirements of that pig. Then it will search the database for the ingredients most similar to the given ingredients and it will find an ideal ratio of the chosen ingredients that satisfy the nutritional requirements.

The machine learning aspect is how it looks through the database for the most similar ingredients. It uses BERT to find the ingredient names that are most similar to the given ingredient names. Similarity being closest distance when the ingredient names are converted to vectors.

Mainly to be used as a proof of concept.

Video -- https://youtu.be/B0gWs2m1W4Y