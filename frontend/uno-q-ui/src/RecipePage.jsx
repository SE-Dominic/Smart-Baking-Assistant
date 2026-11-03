
import { useMemo, useState } from "react";
import "./RecipePage.css";

// Sample recipes until we connect our database.
// Real recipes can use the same structure later.
const sampleRecipes = [
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
    image: "/breadroll.png"
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

const categories = [
  {
    name: "All Recipes",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400"
  },
  {
    name: "Main Dishes",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400"
  },
  {
    name: "Breakfast",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400"
  },
  {
    name: "Desserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400"
  },
  {
    name: "Bread",
    image: "/breadroll.png"
  }
];

// Supports simple sample ingredients and structured database ingredients.
function ingredientText(ingredient) {
  if (typeof ingredient === "string") {
    return ingredient;
  }

  if (!ingredient || typeof ingredient !== "object") {
    return "";
  }

  const amount = ingredient.quantity ?? ingredient.amount ?? "";
  const unit = ingredient.unit ?? "";
  const name = ingredient.name ?? "";

  return [amount, unit, name]
    .filter((value) => value !== "")
    .join(" ");
}

// Supports instructions stored as text or structured steps.
function instructionText(instruction) {
  if (typeof instruction === "string") {
    return instruction;
  }

  return instruction?.description ?? instruction?.text ?? "";
}

export default function RecipePage({ recipes = sampleRecipes }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Recipes");
  const [type, setType] = useState("All");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState([]);

  // Keeps the page working with sample recipes or recipes from our backend.
  const recipeList = Array.isArray(recipes) ? recipes : [];

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return recipeList.filter((recipe) => {
      const name = String(recipe.name ?? recipe.title ?? "");
      const ingredients = Array.isArray(recipe.ingredients)
        ? recipe.ingredients
        : [];

      const matchesSearch =
        name.toLowerCase().includes(query) ||
        ingredients.some((ingredient) =>
          ingredientText(ingredient).toLowerCase().includes(query)
        );

      const matchesCategory =
        category === "All Recipes" || recipe.category === category;

      const matchesType =
        type === "All" || recipe.type === type;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [recipeList, search, category, type]);

  // Opens the recipe and resets the ingredient checklist.
  function openRecipe(recipe) {
    setSelectedRecipe(recipe);
    setCheckedIngredients([]);
  }

  // Marks ingredients as checked or unchecked.
  function toggleIngredient(index) {
    setCheckedIngredients((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  }

  const selectedIngredients = Array.isArray(selectedRecipe?.ingredients)
    ? selectedRecipe.ingredients
    : [];

  const selectedInstructions = Array.isArray(selectedRecipe?.instructions)
    ? selectedRecipe.instructions
    : [];

  return (
    <div className="recipe-page">
      {/* Header */}
      <header className="recipe-header">
        <div className="recipe-logo">Smart Baking Assistant</div>
        <span className="recipe-header-label">
          THE RECIPE COLLECTION
        </span>
      </header>

      {/* Cookbook title */}
      <section className="recipe-hero">
        <span className="recipe-eyebrow">
          YOUR KITCHEN COMPANION
        </span>

        <div className="recipe-hero-divider">
          <span className="recipe-divider-line"></span>

          <span className="recipe-whisk">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6.5 17.5 3 21" />
              <path d="M8 16c-3-3-3-7 0-10s7-3 10 0 3 7 0 10-7 3-10 0Z" />
              <path d="M8 16c-1-4 1-8 6-12" />
              <path d="M8 16c4 1 8-1 12-6" />
              <path d="M8 16 18 6" />
            </svg>
          </span>

          <span className="recipe-divider-line"></span>
        </div>

        <h1>The Recipe Book</h1>
      </section>

      {/* Search and filters */}
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
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </section>

      <main className="recipe-content">
        {selectedRecipe ? (
          <section className="recipe-detail">
            {/* Return to recipe collection */}
            <button
              type="button"
              className="recipe-back"
              onClick={() => setSelectedRecipe(null)}
            >
              ← Back to recipes
            </button>

            {selectedRecipe.image && (
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.name ?? selectedRecipe.title ?? "Recipe"}
              />
            )}

            <span className="recipe-eyebrow">
              {selectedRecipe.category}
              {selectedRecipe.type ? ` · ${selectedRecipe.type}` : ""}
            </span>

            <h2>{selectedRecipe.name ?? selectedRecipe.title}</h2>

            {/* Recipe information */}
            <p>
              {[
                selectedRecipe.time,
                selectedRecipe.difficulty
              ].filter(Boolean).join(" · ")}
            </p>

            {(selectedRecipe.prepTime != null ||
              selectedRecipe.cookTime != null ||
              selectedRecipe.servings != null) && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "25px"
                }}
              >
                {selectedRecipe.prepTime != null && (
                  <span>Prep: {selectedRecipe.prepTime} min</span>
                )}

                {selectedRecipe.cookTime != null && (
                  <span>Cook: {selectedRecipe.cookTime} min</span>
                )}

                {selectedRecipe.servings != null && (
                  <span>Servings: {selectedRecipe.servings}</span>
                )}
              </div>
            )}

            {/* Ingredient checklist */}
            <h3>Ingredients</h3>

            {selectedIngredients.length > 0 ? (
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {selectedIngredients.map((ingredient, index) => (
                  <li key={index}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checkedIngredients.includes(index)}
                        onChange={() => toggleIngredient(index)}
                        style={{ accentColor: "#697a66" }}
                      />

                      <span
                        style={{
                          textDecoration: checkedIngredients.includes(index)
                            ? "line-through"
                            : "none",
                          opacity: checkedIngredients.includes(index)
                            ? 0.55
                            : 1
                        }}
                      >
                        {ingredientText(ingredient)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Ingredients have not been added yet.</p>
            )}

            {/* Step-by-step directions */}
            <h3>Instructions</h3>

            {selectedInstructions.length > 0 ? (
              <ol>
                {selectedInstructions.map((instruction, index) => (
                  <li key={index}>
                    {instructionText(instruction)}
                  </li>
                ))}
              </ol>
            ) : (
              <p>Instructions have not been added yet.</p>
            )}

            {/* Hardware integration will be added later. */}
          </section>
        ) : (
          <>
            {/* Circular category pictures */}
            <div className="recipe-categories">
              {categories.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={`recipe-category ${
                    category === item.name ? "active" : ""
                  }`}
                  onClick={() => setCategory(item.name)}
                >
                  <span className="recipe-category-image">
                    <img src={item.image} alt="" />
                  </span>

                  <span className="recipe-category-label">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Recipe cards */}
            <div className="recipe-grid">
              {filteredRecipes.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  className="recipe-card"
                  onClick={() => openRecipe(recipe)}
                >
                  {recipe.image && (
                    <img
                      src={recipe.image}
                      alt={recipe.name ?? recipe.title ?? "Recipe"}
                    />
                  )}

                  <span className="recipe-card-category">
                    {recipe.category}
                    {recipe.type ? ` · ${recipe.type}` : ""}
                  </span>

                  <h3>{recipe.name ?? recipe.title}</h3>

                  <p>
                    {[recipe.time, recipe.difficulty]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </button>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <p className="recipe-empty">
                No recipes found. Try another search or category.
              </p>
            )}
          </>
        )}
      </main>

      <footer className="recipe-footer">
        Kitchen Companion
      </footer>
    </div>
  );
}
