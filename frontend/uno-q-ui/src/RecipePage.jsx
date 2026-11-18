import { useEffect, useMemo, useState } from "react";
import "./RecipePage.css";
import CookbookShelf from "./CookbookShelf_Seamless.jsx";
// pictures for recipe category page
const categories = [
  {
    name: "All Recipes",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400",
  },
  {
    name: "Main Dishes",
    image: "entrees-cover.jpg",
  },
  {
    name: "Breakfast",
    image: "breakfast-cover.jpg",
  },
  {
    name: "Desserts",
    image: "desserts-cover.jpg",
  },
  {
    name: "Bread",
    image: "/breadroll.png",
  },
  {
    name: "Side Dishes",
    image: "sides-cover.jpg",
  },
  {
    name: "Starters",
    image: "starters-cover.jpg",
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
  const [openedBook, setOpenedBook] = useState(null);
  const [portalPhase, setPortalPhase] = useState("idle");


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
      <style>{`
        /* A full-screen light bridge connects the book's final zoom to the recipe world. */
        .recipe-portal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow: hidden;
          pointer-events: none;
          opacity: 0;
          background: #fff8eb;
        }
        .recipe-portal-light {
          position: absolute;
          inset: -25%;
          background: radial-gradient(circle at 50% 49%, #fffefa 0%, #fff7d9 20%, #f6dba8 48%, #f3e5d2 74%, #f8f0e5 100%);
          transform: scale(.35);
        }
        .recipe-portal-rays {
          position: absolute;
          inset: -45%;
          opacity: .45;
          background: repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg 13deg, rgba(255,255,255,.6) 15deg 17deg, transparent 20deg 35deg);
          animation: recipePortalSpin 8s linear infinite;
        }
        .recipe-portal-star {
          position: absolute;
          color: #e0b66e;
          text-shadow: 0 0 18px #fff;
          font-size: clamp(28px, 5vw, 72px);
        }
        .recipe-portal-star-a { top: 20%; left: 25%; }
        .recipe-portal-star-b { top: 64%; left: 72%; }
        .recipe-portal-star-c { top: 32%; left: 79%; }
        .recipe-portal-entering {
          animation: recipePortalEnter 3.20s linear forwards;
        }
        .recipe-portal-entering .recipe-portal-light {
          animation: recipePortalExpand 3.20s ease-in forwards;
        }
        .recipe-portal-revealing {
          opacity: 1;
          animation: recipePortalReveal .52s ease-out forwards;
        }
        .recipe-portal-revealing .recipe-portal-light {
          transform: scale(1.5);
        }
        @keyframes recipePortalEnter {
          0%, 75% { opacity: 0; }
          88% { opacity: .22; }
          98%, 100% { opacity: 1; }
        }
        @keyframes recipePortalExpand {
          0%, 73% { transform: scale(.3); }
          100% { transform: scale(1.5); }
        }
        @keyframes recipePortalReveal {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes recipePortalSpin {
          to { transform: rotate(360deg); }
        }
        .recipe-world-hero {
          position: relative;
          overflow: hidden;
          min-height: 270px;
          padding: 28px 24px 54px;
          text-align: center;
          color: #4d352b;
          background: radial-gradient(ellipse at center, #fffaf0 0%, #f6ead9 68%, #f1e1cf 100%);
          animation: recipeWorldReveal 480ms ease-out both;
        }
        .recipe-world-back {
          display: block;
          margin: 0 0 20px;
          padding: 10px 16px;
          border: 1px solid #c8ab8d;
          border-radius: 999px;
          background: #fffaf3;
          color: #5a4031;
          cursor: pointer;
          font: inherit;
        }
        .recipe-world-sparkle {
          color: #caa66b;
          font-size: 26px;
          letter-spacing: 14px;
          animation: recipeSparkle 2.4s ease-in-out infinite;
        }
        .recipe-world-eyebrow {
          margin: 12px 0 0;
          color: #9a7759;
          font-size: 12px;
          letter-spacing: 3px;
        }
        .recipe-world-hero h1 {
          margin: 8px 0 12px;
          font-family: Georgia, serif;
          font-size: clamp(42px, 6vw, 76px);
          font-weight: 400;
        }
        .recipe-world-hero > p:last-child {
          font-family: Georgia, serif;
          font-style: italic;
          font-size: 18px;
        }
        .recipe-world-hero + .recipe-filter-bar,
        .recipe-world-hero ~ .recipe-content {
          animation: recipeWorldReveal 540ms ease-out both;
        }
        @keyframes recipeWorldReveal {
          from { opacity: .45; transform: translateY(12px) scale(0.995); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes recipeSparkle {
          0%, 100% { opacity: .55; transform: scale(.94); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          .recipe-portal-overlay, .recipe-portal-light, .recipe-portal-rays,
          .recipe-world-hero,
          .recipe-world-hero + .recipe-filter-bar,
          .recipe-world-hero ~ .recipe-content,
          .recipe-world-sparkle { animation: none; }
        }
      `}</style>

      
      {portalPhase !== "idle" && (
        <div
          className={`recipe-portal-overlay recipe-portal-${portalPhase}`}
          aria-hidden="true"
          onAnimationEnd={(event) => {
            if (event.animationName === "recipePortalReveal" && portalPhase === "revealing") {
              setPortalPhase("idle");
            }
          }}
        >
          <div className="recipe-portal-light" />
          <div className="recipe-portal-rays" />
          <span className="recipe-portal-star recipe-portal-star-a">✦</span>
          <span className="recipe-portal-star recipe-portal-star-b">✧</span>
          <span className="recipe-portal-star recipe-portal-star-c">✦</span>
        </div>
      )}

      {/* Cookbook title */}
      

{/* Interactive cookbook library, or the selected book's recipe world */}
{!openedBook ? (
  <section className="recipe-hero">
    <CookbookShelf
      onStart={() => setPortalPhase("entering")}
      onSelect={(book) => {
        const categoryMap = {
          Breakfast: "Breakfast",
          Desserts: "Desserts",
          "Entrées": "Main Dishes",
          Sides: "Side",
          Starters: "Starter",
        };
        setCategory(categoryMap[book] || "All Recipes");
        setShowSavedOnly(false);
        setSelectedRecipe(null);
        setSearch("");
        setOpenedBook(book);
        setPortalPhase("revealing");
      }}
    />
    <p className="cookbook-intro">
      Choose a cookbook to explore its recipes!
    </p>
  </section>
) : (
  <header className="recipe-world-hero" aria-label={`${openedBook} cookbook`}>
    <button
      type="button"
      className="recipe-world-back"
      onClick={() => {
        setOpenedBook(null);
        setPortalPhase("idle");
        setCategory("All Recipes");
        setSelectedRecipe(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      ← Back to the bookshelf
    </button>
    <div className="recipe-world-sparkle" aria-hidden="true">✦ &nbsp; ✧ &nbsp; ✦</div>
    <p className="recipe-world-eyebrow">YOUR RECIPE COLLECTION</p>
    <h1>{openedBook}</h1>
    <p>Welcome inside your cookbook. Let's find something delicious.</p>
  </header>
)}

{/* recipe search and filtering controls */}
      <section className="recipe-filter-bar">
        <input
          aria-label="Search recipes"
          type="search"
          placeholder="Search recipes or ingredients..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

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
