import json
import re
import sys
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np

datadir = "../data/feedstuffs.csv"
df_grower_req = pd.read_csv(datadir)
feedstuffs = df_grower_req[df_grower_req.columns[0]]

model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(feedstuffs)


def main(ingredients):
    # Argument parsing
    new_names = []
    for ingredient in ingredients:
        word_embedding = model.encode(ingredient)
        similarities = []
        for i, term in enumerate(feedstuffs):
            similarity = cosine_similarity([word_embedding], [embeddings[i]])
            similarities.append((term, similarity[0][0]))
        similarities.sort(key=lambda x: x[1], reverse=True)
        new_names.append(similarities[0])

    names = [name for name, _ in new_names]
    #print(json.dumps(names))
    sys.stdout.write(json.dumps(names))
    sys.exit(0)


if __name__ == "__main__":
    
    #!?!?!? WHY WOULDNT JSON WORK

    suggested_ingredients = sys.argv[1][2:-2]
    items = suggested_ingredients.split(",")

    # Clean up whitespace and convert into a list
    result = [item.strip() for item in items]
    
    main(result)