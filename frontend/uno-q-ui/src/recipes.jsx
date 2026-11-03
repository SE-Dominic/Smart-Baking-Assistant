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
    difficulty: "Easy"
    time: 25,
    description: "Classic cookies with chocolate chips.",
  },
  {
    id: 2,
    name: "Banana Bread",
    category: "Baking",
    time: 60,
    difficulty: "Easy"
    description: "Soft, homemade banana bread.",
  },
  {
    id: 3,
    name: "Creamy Garlic Pasta",
    category: "Cooking",
    time: 30,
    difficulty: "Medium"
    description: "A simple pasta dish with garlic sauce.",
  },
  {
    id: 4,
    name: "Blueberry Muffins",
    category: "Baking",
    time: 35,
    difficulty: "Hard"
    description: "Light muffins filled with blueberries.",
  },
];

// react component for recipe browsing page
export default function Recipes(){ 
  // stores the text the user enters into the recipe search bar
  const [searchTerm, setSearchTerm] = useState("");
 
/*
 * Stores the recipe category selected by the user.
 * All recipes is the default so every recipe
   appears when the page first loads.
 */
const [selectedCategory, setSelectedCategory] = useState("All Recipes");
/*
 * Stores the difficulty selected by the user.
 * "All" means recipes of every difficulty are shown.
 */
const [selectedDifficulty, setSelectedDifficulty] = useState("All");
/*
 * Stores how the user wants recipes sorted by time.
 * "Default" keeps the original recipe order.
 */
const [timeSort, setTimeSort] = useState("Default");
  // filter recipies based on search
  //coverts it to lowercase-> check if the recipe name contains the searched text
  // makes it not case sensitive
  
/*
 * Filter recipes based on:
  1. The text entered in the search bar.
  2. The difficulty selected from the dropdown.
 */
const filteredRecipes = recipes.filter((recipe) => {
  // Check whether the recipe name matches the search.
  const matchesSearch = recipe.name
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  // Show every difficulty when "All" is selected.
  const matchesDifficulty =
    selectedDifficulty === "All" ||
    recipe.difficulty === selectedDifficulty;

  // A recipe must match BOTH conditions to appear.
  return matchesSearch && matchesDifficulty;
});

/*
 * Sort the filtered recipes by preparation time.
 * Creates a copy so the original recipe list stays unchanged.
 */
const sortedRecipes = [...filteredRecipes].sort((a, b) => {
  // Recipes with fewer minutes appear first.
  if (timeSort === "Shortest") {
    return a.time - b.time;
  }

  // Recipes with more minutes appear first.
  if (timeSort === "Longest") {
    return b.time - a.time;
  }

  // Keep the original order when Default is selected.
  return 0;
});

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
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

{/* Recipe difficulty filter */}
<div className="recipe-filters">
  <label htmlFor="difficulty-filter">
    Difficulty
  </label>

  <select
    id="difficulty-filter"
    value={selectedDifficulty}
    onChange={(e) => setSelectedDifficulty(e.target.value)}
  >
    <option value="All">All Difficulties</option>
    <option value="Easy">Easy</option>
    <option value="Medium">Medium</option>
    <option value="Hard">Hard</option>
  </select>
</div>

{/* Sort recipes by estimated preparation time */}
<div className="recipe-filters">
  <label htmlFor="time-sort">
    Sort by Time
  </label>

  <select
    id="time-sort"
    value={timeSort}
    onChange={(e) => setTimeSort(e.target.value)}
  >
    <option value="Default">Default Order</option>
    <option value="Shortest">Shortest Time First</option>
    <option value="Longest">Longest Time First</option>
  </select>
</div>

{/* Display the recipes that match the user's search. */}
<section>
  
{/* Show a message when no recipes match the search. */}
{filteredRecipes.length === 0 && (
  <p>No recipes found. Try another search.</p>
)}

  {/* Loop through the filtered recipes to create a card for each one. */}
  {sortedRecipes.map((recipe) => (
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
