const BASE = "https://www.themealdb.com/api/json/v1/1";
//makes api call to get recipes from www.themealdb.com (free api key)
export async function getPopularRecipes() {
    const requests = Array.from({ length: 4 }, async () => {
        const response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
        if (!response.ok) {
            throw new Error(`Recipe request failed with status ${response.status}`);
        }

        const data = await response.json();
        const recipe = data.meals?.[0];
        if (!recipe) {
            throw new Error("Recipe API returned no recipe");
        }

        return recipe;
    });

    return Promise.all(requests);
}

export async function getRecipeById(id) {
    const res = await fetch(`${BASE}/lookup.php?i=${id}`);
    if (!res.ok) {
        throw new Error("Recipe lookup failed");
    }
    const data = await res.json(); //format to json type
    const meal = data.meals?.[0];
    if (!meal) return null;
    return { id: meal.idMeal, title: meal.strMeal, image: meal.strMealThumb };
}

const USE_MOCK = true; // set to false once the liked_recipes table exists

// DTO shape for now: { recipeId: string, likedAt: string }
export async function fetchLikedRecipeDtos(userId, limit = 5) {
    if (USE_MOCK) {
        return [
            { recipeId: "52772", likedAt: "2026-10-28T10:00:00Z" },
            { recipeId: "52959", likedAt: "2026-10-27T10:00:00Z" },
            { recipeId: "52844", likedAt: "2026-10-26T10:00:00Z" },
        ];
    }

    //const { supabase } = await import("./supabase"); // adjust to client file
    const { data, error } = await supabase
        .from("liked_recipes")
        .select("recipe_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
    if (error) throw error;

    return data.map((row) => ({ recipeId: row.recipe_id, likedAt: row.created_at }));
}