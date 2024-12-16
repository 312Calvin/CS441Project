import json
import re
import sys
import pandas as pd
import numpy as np
from ast import literal_eval
from scipy.optimize import linprog

datadir = "../data/feedstuffs.csv"
df_grower_req = pd.read_csv(datadir)
feedstuff_names = df_grower_req[df_grower_req.columns[0]]

def main(ingredient_names, cost_array, requirements):
    feedstuffs = []
    for i in ingredient_names:
        feedstuffs.append(np.where(feedstuff_names == i)[0][0])

    feeds = df_grower_req.iloc[feedstuffs, [0, 3, 4, 5, 6]]
    feeds['NEm Mcal/lb. '] = pd.to_numeric(feeds['NEm Mcal/lb. '], errors='coerce')
    feeds['NEg'] = pd.to_numeric(feeds['NEg'], errors='coerce')
    feeds['NE'] = pd.to_numeric(feeds['NEm Mcal/lb. '] + feeds['NEg'])
    feeds['CP(%)'] = pd.to_numeric(feeds['CP(%)'])
    result = feeds[['NE', 'CP(%)']]
    bounds = [(0, None), (0, None)]  
    b = [requirements[0], 0]
    A = np.array(result)
    A[:, 1] -= requirements[1]
    A = A.T

    final_result = linprog(c=cost_array, A_eq=A, b_eq=b, method='highs')

    if (final_result.success):
        result_dict = {
            "portions": final_result.x.tolist(),
            "cost": final_result.fun
        }

        # Process your ingredients, costs, and requirements
        # Output the result as JSON
        sys.stdout.write(json.dumps(result_dict))
        sys.exit(0)
    else:
        sys.stderr.write(final_result.message)
        sys.exit(0)

if __name__ == "__main__":
    # Parse the command-line arguments
    #print(sys.argv)
    suggested_ingredients = sys.argv[1]  # Expecting a string like 'Corn bran,Wheat hay'
    cost_array = sys.argv[2][1:-1]
    items = cost_array.split(",")

    cost_array = literal_eval(sys.argv[2])
    requirements = literal_eval(sys.argv[3])
    requirements[0] /= 1.2 #for a net energy estimation

    # Split and clean up ingredient names
    ingredient_names = [item.strip() for item in suggested_ingredients.split(",")]

    # Call the main function
    main(ingredient_names, cost_array, requirements)