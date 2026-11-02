/* Smart Baking Assistant- Recipe Page

Purpose:
- Allow users to browse, search, and filter baking and cooking recipes. 
*/
import { useState } from "react";
import "./recipes.css";
/*
 * Sample recipe data
 - Each recipe is an object with an ID, name, category,
   cooking time, and description.
 - temp exapmles
 */

const recipes = [
  {
    id: 1,
    name: "Chocolate Chip Cookies",
    category: "Baking",
    time: 25,
    description: "Classic cookies with chocolate chips.",
  },
  {
    id: 2,
    name: "Banana Bread",
    category: "Baking",
    time: 60,
    description: "Soft, homemade banana bread.",
  },
  {
    id: 3,
    name: "Creamy Garlic Pasta",
    category: "Cooking",
    time: 30,
    description: "A simple pasta dish with garlic sauce.",
  },
  {
    id: 4,
    name: "Blueberry Muffins",
    category: "Baking",
    time: 35,
    description: "Light muffins filled with blueberries.",
  },
];

// react component for recipe browsing page
export default function Recipes(){ 
  // stores the text the user enters into the recipe search bar
  const [searchTerm, setSearchTerm] = useState("");
 // filter recipies based on search
  //coverts it to lowercase-> check if the recipe name contains the searched text
  // makes it not case sensitive
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
return(
  <main className="recipe-page">
    {/* Main heading for recipe page*/}
    <h1>
    On the Menu
    </h1>
    {/* Intro for the user */}
    <p>
    Browse recipes for every day and every occasion.
    </p>
    {/*Search bar: allows users to type the name of a recipe */}
    <div> 
    <input 
      type="text"
      placeholder="Search recipes..."
      value={SearchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

{/* Display the recipes that match the user's search. */}
<section>
  
{/* Show a message when no recipes match the search. */}
{filteredRecipes.length === 0 && (
  <p>No recipes found. Try another search.</p>
)}

  {/* Loop through the filtered recipes to create a card for each one. */}
  {filteredRecipes.map((recipe) => (
    <article key={recipe.id}>
     {/* Image area for this recipe:
   replace this placeholder with a real photo later. */}
       <div className="recipe-image-placeholder">
       Recipe photo
       </div>

      {/* Recipe name */}
      <h2>{recipe.name}</h2>

      {/* Recipe category: Baking or Cooking */}
      <p>{recipe.category}</p>

      {/* Estimated recipe time in minutes */}
      <p>{recipe.time} minutes</p>

      {/* Short description of the recipe */}
      <p>{recipe.description}</p>
    </article>
  ))}
</section>

  </main>
  );
}
