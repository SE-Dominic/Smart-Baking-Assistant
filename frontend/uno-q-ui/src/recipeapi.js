export function getPopularRecipes() {
    const response = fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
    if (!response.ok) {
        console.log("[ERROR] API request status was not 200");
        return;
    }
    const jsonResponse = response.json();
    console.log(jsonResponse);
    return;
}