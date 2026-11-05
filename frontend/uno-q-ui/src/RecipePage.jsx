import { useEffect, useMemo, useState } from "react";
import "./RecipePage.css";

// pictures for recipe category page
const categories = [
  {
    name: "All Recipes",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400",
  },
  {
    name: "Main Dishes",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400",
  },
  {
    name: "Breakfast",
    image: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400",
  },
  {
    name: "Desserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400",
  },
  {
    name: "Bread",
    image: "/breadroll.png",
  },
];

// Formats ingredient data into readable text for the recipe details.
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

  return [amount, unit, name].filter((value) => value !== "").join(" ");
}

// Supports instructions stored as text or structured steps.
function instructionText(instruction) {
  if (typeof instruction === "string") {
    return instruction;
  }

  return instruction?.description ?? instruction?.text ?? "";
}

export default function RecipePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Recipes");
  const [type, setType] = useState("All");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [apiRecipes, setApiRecipes] = useState(null);
  const [savedRecipeIds, setSavedRecipeIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("savedRecipes", JSON.stringify(savedRecipeIds));
  }, [savedRecipeIds]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  // recipe api & how its displayed on website
  // TEMPORARY
  useEffect(() => {
    async function loadRecipes() {
      try {
        const response = await fetch(
          "https://www.themealdb.com/api/json/v1/1/search.php?s=chicken",
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }

        const data = await response.json();
        const formattedRecipes = (data.meals || []).map((meal) => {
          const ingredients = [];

          for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`]?.trim();
            const measure = meal[`strMeasure${i}`]?.trim();

            if (ingredient) {
              ingredients.push(`${measure || ""} ${ingredient}`.trim());
            }
          }
          //display of individual meal cards
          return {
            id: meal.idMeal,
            name: meal.strMeal,
            category: meal.strCategory || "Other",
            type: "Cooking",
            time: "Not specified",
            difficulty: "Not specified",
            ingredients,
            instructions: meal.strInstructions
              ? meal.strInstructions
                  .split(/\r?\n/)
                  .map((step) => step.trim())
                  .filter((step) => step && !/^step\s*\d+\s*:?\s*$/i.test(step))
              : [],
            image: meal.strMealThumb,
          };
        });

        setApiRecipes(formattedRecipes);
      } catch (error) {
        console.error("Recipe API error:", error);
      }
    }

    loadRecipes();
  }, []);
  // Recipes loaded from TheMealDB API.
  // Use an empty list while recipes are loading.
  const recipeList = apiRecipes ?? [];
  /*
   * RECIPE SEARCH AND FILTERS
   * Filters recipes by name, ingredients, category, and cooking type
   * useMemo recalculates the results only when its dependencies change
   */
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
          ingredientText(ingredient).toLowerCase().includes(query),
        );

      const matchesCategory =
        category === "All Recipes" || recipe.category === category;

      const matchesType = type === "All" || recipe.type === type;

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
        : [...current, index],
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
        <span className="recipe-header-label">THE RECIPE COLLECTION</span>
      </header>

      {/* Cookbook title */}
      <section className="recipe-hero">
        <span className="recipe-eyebrow">YOUR KITCHEN COMPANION</span>

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

      {/* recipe search and filtering controls */}
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
            {/* Navigation back to the recipe collection */}
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

            {/* Recipe details: difficulty, preparation time, cooking time, and servings */}
            <p>
              {[selectedRecipe.time, selectedRecipe.difficulty]
                .filter(Boolean)
                .join(" · ")}
            </p>

            {(selectedRecipe.prepTime != null ||
              selectedRecipe.cookTime != null ||
              selectedRecipe.servings != null) && (
              <div className="recipe-time-details">
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
            <div className="recipe-cooking-layout">
              <div className="recipe-ingredients-column">
                {/* interactive ingredient checklist where users can checkoff as they cook */}
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
                            cursor: "pointer",
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
                                : 1,
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
              </div>
              <div className="recipe-instructions-column">
                {/* Step-by-step directions */}
                <h3>Instructions</h3>

                {selectedInstructions.length > 0 ? (
                  <ol>
                    {selectedInstructions.map((instruction, index) => (
                      <li key={index}>{instructionText(instruction)}</li>
                    ))}
                  </ol>
                ) : (
                  <p>Instructions have not been added yet.</p>
                )}
              </div>
            </div>
            {/* Hardware integration will be added later. */}
          </section>
        ) : (
          <>
            {/* Circular category pictures with navigation options */}
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

                  <span className="recipe-category-label">{item.name}</span>
                </button>
              ))}
            </div>
            {/* all recipes and my cookbook tabs */}
            <div className="recipe-collection-tabs">
              <button
                type="button"
                className={!showSavedOnly ? "active" : ""}
                onClick={() => setShowSavedOnly(false)}
              >
                All Recipes
              </button>

              <button
                type="button"
                className={showSavedOnly ? "active" : ""}
                onClick={() => setShowSavedOnly(true)}
              >
                My Cookbook ({savedRecipeIds.length})
              </button>
            </div>
            {/* Recipe cards */}
            <div className="recipe-grid">
              {filteredRecipes
                .filter(
                  (recipe) =>
                    !showSavedOnly || savedRecipeIds.includes(recipe.id),
                )
                .map((recipe) => (
                  <div className="recipe-card-wrapper" key={recipe.id}>
                    <button
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
                    <button
                      type="button"
                      className="recipe-bookmark"
                      aria-label={`Save ${recipe.name ?? recipe.title}`}
                      onClick={() => {
                        setSavedRecipeIds((current) =>
                          current.includes(recipe.id)
                            ? current.filter((id) => id !== recipe.id)
                            : [...current, recipe.id],
                        );
                      }}
                    >
                      {/*bookmark to save or remove recipes from my cookbook*/}
                      <svg
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill={
                          savedRecipeIds.includes(recipe.id)
                            ? "currentColor"
                            : "none"
                        }
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" />
                      </svg>
                    </button>
                  </div>
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

      <footer className="recipe-footer">Kitchen Companion</footer>
    </div>
  );
}
