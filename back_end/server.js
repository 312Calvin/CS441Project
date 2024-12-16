const express = require('express');
const cors = require('cors');
const app = express();
const port = 5001;  // You can change this to any port you'd like

// Middleware to parse incoming JSON requests
// app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',  // Allow requests only from your React frontend
    methods: ['GET', 'POST'],  // Allow GET and POST requests
    allowedHeaders: ['Content-Type'],  // Allow these headers
  }));

app.use(express.json()); 

// Basic route to test server is running
app.post('/', (req, res) => {
    console.log('Received data:', req.body);
    res.json('Hello, this is backend');
    res.send('Hello, this is your backend server!');
});

const { exec } = require('child_process');

function findReq(age, weight, breedingGilt, sow, lactating, boar) {
  // Build the command string
  const command = `python3 ../src/nut_req.py ${age} ${weight} ${breedingGilt} ${sow} ${lactating} ${boar}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return reject(error);
      }

      try {
        const parsedOutput = JSON.parse(stdout.trim());
        console.log("Processed Output:", parsedOutput);
        resolve(parsedOutput);
      } catch (err) {
        console.error("Failed to parse JSON:", err);
        reject(err);
      }
    });
  });
}


function findNames(serializedIngredients) {
  const command = `python3 ../src/find_names.py '${serializedIngredients}'`;
  //const command2 = `python3 ../src/find_names.py ${serializedIngredients} ${req}`;
  console.log(command);
  return new Promise((resolve, reject) => {
    
    exec(command, (error, stdout, stderr) => {
      
      //console.log(`stdout: ${stdout}`);
      if (error) {
          console.error(`exec error: ${error}`);
          return;
      }
      // if (stderr) {
      //     console.error(`stderr: ${stderr}`);
      //     return;
      // } //Just some warnings

      // Log and process the stdout from the Python script
      //console.log(`stdout: ${stdout}`);

      // Parse the JSON output from Python
      try {
        ingredient_names = JSON.parse(stdout);
        console.log("Processed Output:", ingredient_names);
        resolve(ingredient_names);
      } catch (err) {
        console.error("Failed to parse JSON:", err);
      }
      
    });
  });
}

function findPortions(serializedIngredients, costArray, req) {
  return new Promise((resolve, reject) => {
    const command = `python3 ../src/find_portions.py "${serializedIngredients}" ${costArray} ${req}`;
    
    let portions = null;

    console.log(command);

    exec(command, (error, stdout, stderr) => {
      console.log(stdout);
      if (error) {
        console.error(`exec error: ${error}`);
        reject(`exec error: ${error}`);  // Reject the promise if there is an error
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        reject(`stderr: ${stderr}`);  // Reject the promise if there is a stderr
        return;
      }

      try {
        portions = JSON.parse(stdout);  // Parse the stdout from the Python script
        console.log("Processed Output:", portions);
        resolve(portions);  // Resolve the promise with the parsed portions
      } catch (err) {
        console.error("Failed to parse JSON:", err);
        reject("Failed to parse JSON");  // Reject if JSON parsing fails
      }
    });
  });
}


// Example POST route (you can modify this for your use case)
app.post('/submit-data', async (req, res) => {
  const { submittedData } = req.body;
  // setSubmittedData({
  //   pigWeight: pigWeight,
  //   pigAge: pigAge,
  //   daysAfterFarrowing: daysAfterFarrowing,
  //   ingredients: ingredients,
  // });
  // Here you can process the data, e.g., calculate the diet
  const feed_req = await findReq(submittedData.pigWeight, submittedData.pigAge, false, submittedData.daysAfterFarrowing < 0, submittedData.daysAfterFarrowing >= 0, false);
  

  const filteredIngredients = submittedData.ingredients.filter(ingredient => ingredient.name && ingredient.price);
  const namesArray = filteredIngredients.map(ingredient => ingredient.name);
  const costArray = filteredIngredients.map(ingredient => ingredient.price);
  const serializedCost = JSON.stringify(costArray);
  const serializedIngredients = JSON.stringify(namesArray);
  const serializedReq = JSON.stringify(feed_req);

  const ingredient_names = await findNames(serializedIngredients);
  // const ingredientArray = ingredient_names.split(',').map(item => item.trim());
  // const jsonIng = JSON.stringify(ingredientArray);
  try {
    const portions = await findPortions(ingredient_names, serializedCost, serializedReq)
    res.json({
      message: 'Data received successfully!',
      names: ingredient_names,
      portions: portions.portions,
      cost: portions.cost,
      feed_req: feed_req,
    });
  } catch (error) {
    res.json({error: "true"});
  }
  

  //console.log(portions);
  

});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
