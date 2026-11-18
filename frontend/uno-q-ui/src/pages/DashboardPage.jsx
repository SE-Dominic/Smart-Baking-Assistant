import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import "./Dashboard.css";
import { getPopularRecipes, getRecipeById, fetchLikedRecipeDtos } from "../recipeapi";
import { Link } from 'react-router-dom';

function RecipePlaceholders({ message }) {
    return (
        <div className="upcoming-recipes">
            <p>{message}</p>
            <div className="recipe-placeholder-grid" aria-hidden="true">
                {[1, 2, 3].map((card) => (
                    <div className="recipe-placeholder-card" key={card}>
                        <span className="placeholder-image" />
                        <span className="placeholder-line" />
                        <span className="placeholder-line placeholder-line-short" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    /*
        popular
        likes
        user's favorites
        recently liked
        saved
    */
    const [popularRecipes, setPopularRecipes] = useState([]);
    const [recipesLoading, setRecipesLoading] = useState(true);
    const [recipesError, setRecipesError] = useState("");
    const [likedRecipes, setLikedRecipes] = useState([]);
    const [likedLoading, setLikedLoading] = useState(true);
    const [likedError, setLikedError] = useState("");
    const navigate = useNavigate();

    //needed to populate ui with popular recipes
    useEffect(() => {
        let isMounted = true;

        getPopularRecipes()
            .then((recipes) => {
                if (isMounted) {
                    setPopularRecipes(recipes);
                    setRecipesLoading(false);
                }
            })
            .catch((error) => {
                if (isMounted) {
                    setRecipesError(error.message);
                    setRecipesLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    //effect used to populate ui with 
    useEffect(() => {
    let isMounted = true;
    const userId = "demo-user"; // replace with the logged-in user's id later

    async function loadLikedRecipes() {
        try {
            const dtos = await fetchLikedRecipeDtos(userId, 5);
            const recipes = await Promise.all(
                dtos.map((dto) => getRecipeById(dto.recipeId))
            );
            if (isMounted) setLikedRecipes(recipes.filter(Boolean));
        } catch (error) {
            if (isMounted) setLikedError(error.message);
            return <p>unable to load liked recipes...</p>
        } finally {
            if (isMounted) setLikedLoading(false);
        }
    }

    loadLikedRecipes();
    return () => {
        isMounted = false;
    };
}, []);
    function displayPopularRecipes() {
        if (recipesLoading) {
            return <p>Loading popular recipes...</p>; //implement dynamic loading symbol later
        }
        if (recipesError) {
            return <p role="alert">Unable to load popular recipes: {recipesError}</p>;
        }

        return popularRecipes.map((recipe) => (
            <article className="popular-recipe" key={recipe.idMeal}>
                <img src={recipe.strMealThumb} alt={recipe.strMeal} />
                <h4>{recipe.strMeal}</h4>
            </article>
        ));
    }

    return (
        <>
            <nav className="main-nav-bar">
                <h2>Smart Baking App</h2>
                <ul>
                    <li><Link to="/">Recipes</Link></li>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                </ul>
                <button
                    className="profile-button"
                    type="button"
                    aria-label="Profile page coming soon"
                    title="Profile page coming soon"
                    disabled
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="8" r="3.5" />
                        <path d="M5.5 20c.5-3.5 2.8-5.5 6.5-5.5s6 2 6.5 5.5" />
                    </svg>
                </button>
            </nav>
            <button id="startRecipe" onClick={() => navigate("/recipeProcessPage")}>Start Cooking</button>
            <h3>Popular Recipes</h3>
            <div id="mostRecentRecipes">
                {displayPopularRecipes()}
            </div>
            <h3>User Liked Recipes</h3>
            <div id="likedRecipesByUser">
                <RecipePlaceholders message="Your liked recipes will appear here." />
            </div>
            <h3>Favorites</h3>
            <div id="favoritedRecipesByUser">
                <RecipePlaceholders message="Your favorite recipes will appear here." />
            </div>
        </>
    );
}