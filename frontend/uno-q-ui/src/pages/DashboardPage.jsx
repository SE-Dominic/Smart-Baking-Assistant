import React, { useState } from "react";
import "./Dashboard.css";
import "../recipeapi";
import { Link } from 'react-router-dom';
export default function DashboardPage() {
    const [searchContent, setSearchContent] = useState("");
    /*mostRecentRecipes --> api call to grab 'popular' recipes (for now it can just populate with random recipes) */
    /*startRecipe button will send the user to the cookbook or another page to select a recipe and begin cooking alongside the ai scale */
    return (
        <>
            <nav className="main-nav-bar">
                <h2>Smart Baking App</h2>
                <ul>
                    <li><Link to="/">Recipes</Link></li>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                </ul>
                <span id="search-bar">
                    <input
                        type="text"
                        value={searchContent}
                        onChange={(e) => setSearchContent(e.target.value)}
                        placeholder="Search"/>
                </span>
            </nav>
            <button id="startRecipe">Start a recipe</button>
            <br />
            <h3>Popular Recipes</h3>
            <div id="mostRecentRecipes">
               
            </div>
        </>
    );
}

