
import { useMemo, useState } from "react";
import "./RecipePage.css";

// sample recipes for now until we connect the database
const recipes = [
  {
    id: 1,
    name: "Classic Chocolate Chip Cookies",
    category: "Desserts",
    type: "Baking",
    time: "30 min",
    difficulty: "Easy",
    ingredients: ["Flour", "Butter", "Sugar", "Chocolate chips"],
    instructions: [
      "Preheat the oven to 350°F.",
      "Cream together the butter and sugar.",
      "Mix in the remaining ingredients.",
      "Scoop dough onto a baking sheet.",
      "Bake until golden brown."
    ],
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=700"
  },
  {
    id: 2,
    name: "Homemade Sourdough Bread",
    category: "Bread",
    type: "Baking",
    time: "1 day",
    difficulty: "Intermediate",
    ingredients: ["Flour", "Water", "Salt", "Sourdough starter"],
    instructions: [
      "Combine the ingredients to form a dough.",
      "Stretch and fold the dough during fermentation.",
      "Shape the loaf and allow it to proof.",
      "Bake in a preheated Dutch oven."
    ],
    image: "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=700"
  },
  {
    id: 3,
    name: "Creamy Garlic Pasta",
    category: "Main Dishes",
    type: "Cooking",
    time: "25 min",
    difficulty: "Easy",
    ingredients: ["Pasta", "Garlic", "Cream", "Parmesan"],
    instructions: [
      "Cook the pasta until al dente.",
      "Sauté garlic in a pan.",
      "Add cream and Parmesan.",
      "Toss the pasta with the sauce."
    ],
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=700"
  },
  {
    id: 4,
    name: "Fluffy Buttermilk Pancakes",
    category: "Breakfast",
    type: "Cooking",
    time: "20 min",
    difficulty: "Easy",
    ingredients: ["Flour", "Buttermilk", "Eggs", "Baking powder"],
    instructions: [
      "Mix the dry ingredients.",
      "Whisk together the wet ingredients.",
      "Combine gently to form a batter.",
      "Cook on a lightly greased skillet."
    ],
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=700"
  },
  {
    id: 5,
    name: "Roasted Vegetable Medley",
    category: "Main Dishes",
    type: "Cooking",
    time: "40 min",
    difficulty: "Easy",
    ingredients: ["Carrots", "Zucchini", "Potatoes", "Olive oil"],
    instructions: [
      "Preheat the oven to 425°F.",
      "Cut the vegetables into even pieces.",
      "Toss with olive oil and seasoning.",
      "Roast until tender and golden."
    ],
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700"
  },
  {
    id: 6,
    name: "Vanilla Cupcakes",
    category: "Desserts",
    type: "Baking",
    time: "35 min",
    difficulty: "Easy",
    ingredients: ["Flour", "Sugar", "Butter", "Eggs", "Vanilla"],
    instructions: [
      "Preheat the oven to 350°F.",
      "Cream the butter and sugar.",
      "Add eggs, vanilla, and flour.",
      "Divide batter into cupcake liners.",
      "Bake until a toothpick comes out clean."
    ],
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=700"
  }
];

// categories users can choose from
const categories = [
  "All Recipes",
  "Main Dishes",
  "Breakfast",
  "Desserts",
  "Bread"
];

export default function RecipePage() {

  // keeps track of what the user searches for
  const [search, setSearch] = useState("");

  // keeps track of the selected category
  const [category, setCategory] = useState("All Recipes");

  // lets users filter between cooking and baking
  const [type, setType] = useState("All");

  // stores the recipe the user clicks on
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // filters the recipes based on the user's selections
  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return recipes.filter((recipe) => {

      // checks if the search matches the recipe name or ingredients
      const matchesSearch =
        recipe.name.toLowerCase().includes(query) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(query)
        );

      // checks which category is selected
      const matchesCategory =
        category === "All Recipes" || recipe.category === category;

      // checks if the user wants cooking, baking, or both
      const matchesType = type === "All" || recipe.type === type;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [search, category, type]);

  return (
    <div className="recipe-page">

      {/* top section of the recipe page */}
      <header className="recipe-header">
        <div className="recipe-logo">Smart Baking Assistant</div>
        <span className="recipe-header-label">THE RECIPE COLLECTION</span>
      </header>

      {/* main title and introduction */}
      <section className="recipe-hero">
        <span className="recipe-eyebrow">YOUR KITCHEN COMPANION</span>
        <h1>The Recipe Box</h1>
        <p>
          A little inspiration for your kitchen. Explore something
          delicious to cook or bake today.
        </p>
      </section>

      {/* search bar and dropdown filters */}
      <section className="recipe-filter-bar">
        <input
          aria-label="Search recipes"
          type="search"
          placeholder="Search recipes or ingredients..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          aria-label="Recipe type"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="All">Cooking & Baking</option>
          <option value="Cooking">Cooking</option>
          <option value="Baking">Baking</option>
        </select>

        <select
          aria-label="Recipe category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </section>

      <main className="recipe-content">

        {/* shows recipe details if a recipe was clicked */}
        {selectedRecipe ? (
          <section className="recipe-detail">

            {/* button to go back to the recipe list */}
            <button
              className="recipe-back"
              onClick={() => setSelectedRecipe(null)}
            >
              ← Back to recipes
            </button>

            <img src={selectedRecipe.image} alt={selectedRecipe.name} />

            <span className="recipe-eyebrow">
              {selectedRecipe.category} · {selectedRecipe.type}
            </span>

            <h2>{selectedRecipe.name}</h2>
            <p>{selectedRecipe.time} · {selectedRecipe.difficulty}</p>

            {/* lists the ingredients for the selected recipe */}
            <h3>Ingredients</h3>
            <ul>
              {selectedRecipe.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>

            {/* shows the recipe instructions in order */}
            <h3>Instructions</h3>
            <ol>
              {selectedRecipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </section>
        ) : (
          <>
            {/* heading above the recipe collection */}
            <div className="recipe-section-heading">
              <div>
                <span className="recipe-eyebrow">FIND YOUR NEXT FAVORITE</span>
                <h2>Browse Our Recipes</h2>
              </div>

              <span>{filteredRecipes.length} recipes</span>
            </div>

            {/* category buttons */}
            <div className="recipe-categories">
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* displays the recipes that match the filters */}
            <div className="recipe-grid">
              {filteredRecipes.map((recipe) => (
                <button
                  key={recipe.id}
                  className="recipe-card"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <img src={recipe.image} alt={recipe.name} />

                  <span className="recipe-card-category">
                    {recipe.category} · {recipe.type}
                  </span>

                  <h3>{recipe.name}</h3>
                  <p>{recipe.time} · {recipe.difficulty}</p>
                </button>
              ))}
            </div>

            {/* message if no recipes match the search */}
            {filteredRecipes.length === 0 && (
              <p className="recipe-empty">
                No recipes found. Try another search or category.
              </p>
            )}
          </>
        )}
      </main>

      {/* bottom of the page */}
      <footer className="recipe-footer">
        Made for little moments in the kitchen.
      </footer>
    </div>
  );
}
