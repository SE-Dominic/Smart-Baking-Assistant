import React from "react";
import "./Dashboard.css";
import AboutPage from "./AboutPage";
import { Link } from 'react-router-dom';
export default function DashboardPage() {
    return (
        <>
            <nav className="main-nav-bar">
                <h2>Smart Baking App</h2>
                <ul>
                    <li><Link to="">Recipes</Link></li>
                    <li><Link to="/aboutpage">About</Link></li>
                    <li><Link to="">Contact</Link></li>
                </ul>
                <span id="search-bar"><input type="text" placeholder="Search"/></span>
            </nav>
            <NavBarComponent />
            <br/>
            <h3>Popular Recipes</h3>
            <div id="mostRecentRecipes">
                <img src="#"/>
                <img src="#"/>
                <img src="#"/>
            </div>
        </>
    );
}

