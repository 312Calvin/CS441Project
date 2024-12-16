import React, { useState } from 'react';
import './App.css';

function App() {
  // States to manage user input
  const [ingredients, setIngredients] = useState([{ name: '', price: '' }]);
  const [pigWeight, setPigWeight] = useState('');
  const [pigAge, setPigAge] = useState('');
  const [daysAfterFarrowing, setDaysAfterFarrowing] = useState('');
  const [pigDataFilled, setPigDataFilled] = useState(null); //TODO, for editable pig req
  const [submittedData, setSubmittedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showError, setShowError] = useState(false);
  const [serverRes, setServerRes] = useState(null); //TODO, display proportions and total req

  // Handle adding new ingredient row
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', price: '' }]);
  };

  const handleSubtractIngredient = () => {
    setIngredients((ingredients)=> ingredients.slice(0,-1));
  };

  // Handle changing ingredient name or price
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage(null);
    setServerRes(null);

    setSubmittedData({
      pigWeight: pigWeight,
      pigAge: pigAge,
      daysAfterFarrowing: daysAfterFarrowing,
      ingredients: ingredients,
    });

    try {
      const response = await fetch('http://localhost:5001/submit-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submittedData }),
      });

      const data = await response.json();
      if (response.ok) {
        setServerRes(data);
      } else {
        setErrorMessage('Error finding data');
        setShowError(true);
      }
    } catch (err) {
      setErrorMessage('Error sending data');
      setShowError(true);
    }
  };

  const updatePig = (e) => {
    if (pigWeight && pigAge && daysAfterFarrowing) {
      setPigDataFilled(true);
    }
  } 

  return (
    <div className="App">
      <header className="App-header">
        <h1>Swine Nutrition Formulation</h1>
        <p>Enter the details below to calculate the nutritional needs of your herd.</p>
      </header>

      <main>
        <form onSubmit={handleSubmit} className="nutrition-form">
          <div className="input-group">
            <label>Pig Weight (kg):</label>
            <input
              type="number"
              value={pigWeight}
              onChange={(e) => setPigWeight(e.target.value)}
              placeholder="Enter the weight of the pig(s)"
            />
          </div>

          <div className="input-group">
            <label>Pig Age (weeks):</label>
            <input
              type="number"
              value={pigAge}
              onChange={(e) => setPigAge(e.target.value)}
              placeholder="Enter the age of the pig(s)"
            />
          </div>

          <div className="input-group">
            <label>Days After Farrowing:</label>
            <input
              type="number"
              value={daysAfterFarrowing}
              onChange={(e) => setDaysAfterFarrowing(e.target.value)}
              placeholder="Enter the number of days after farrowing"
            />
          </div>

          <div className="input-group">
            <label>Feedstuffs (change number by clicking '+/-'):</label>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-row">
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) =>
                    handleIngredientChange(index, 'name', e.target.value)
                  }
                  placeholder="Feedstuff name"
                />
                <input
                  type="number"
                  value={ingredient.price}
                  onChange={(e) =>
                    handleIngredientChange(index, 'price', e.target.value)
                  }
                  placeholder="Price per pound"
                  className="price-input"
                />
              </div>
            ))}
            <button type="button" onClick={handleAddIngredient}>+</button>
            <button type="button" className="subtract-button" onClick={handleSubtractIngredient} >-</button>
          </div>
          
          <button type="submit">Submit</button>
        </form>

        {serverRes && serverRes.names && (
          <div className="result">
            <h3>Calculated Diet Composition for Pig:</h3>

            <p><strong>Diet Composition:</strong></p>
            <p>Total Cost: {new Intl.NumberFormat('en-US', {style: 'currency',
                currency: 'USD',}).format(serverRes.cost.toFixed(2))}</p>
            <p>{serverRes.names.map((ingredient, index) => (
                  <p>
                    <p>{ingredient}:  {serverRes.portions[index].toFixed(2)}lbs</p>
                  </p>
                ))}</p>
          </div>
        )}

        {serverRes && serverRes.feed_req && (
          <div className="feed_req_box">
            <h4>Calculated Feed requirements</h4>

            <p>Net Energy: {serverRes.feed_req[0].toFixed(2)}Mcals</p>
            <p>Crude Protein: %{serverRes.feed_req[1].toFixed(2)}</p>
          </div>
        )}

        {showError && <div style={{ color: 'red' }}>{errorMessage}</div>}
        {serverRes && serverRes.error && <div style={{ color: 'red' }}>Incomplete balance, try again</div>}
      </main>
    </div>
  );
}

export default App;
