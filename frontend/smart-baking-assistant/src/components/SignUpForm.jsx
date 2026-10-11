import React, { useState } from "react";

function SignUpForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    async function signUpUser(event) {
        event.preventDefault(); //stop page reload
        //get both input fields
        if (username === "" || password === "") {
            alert("Cannot have empty input fields before submitting. Please try again");
            setUsername("");
            setPassword("");
            return;
        }
        /* possible code for when backend fast api is set up
        try {
            //send username to backend here
            const response = await fetch("http://localhost:5175/signup");
            if (!response.ok) {
                alert("Fetching error!!!\n[STATUS CODE]: ", response.status);
                return;
            }
            const responseToJson = response.json();
            console.log(responseToJson);
        } catch(error) {
            alert("[ERROR]: ", error);
        }
        */
    }
    return(
        <form id="signupForm" onSubmit={signUpUser}>
            <label htmlFor="username">Username: </label>
            <input type="text" name="username" id="usernameInput" value={username} onChange={(e) => setUsername(e.target.value)} />
            <br/>
            <br/>
            <label htmlFor="password">Password: </label>
            <input type="password" name="password" id="passwordInput" value={password} onChange={(e) => setPassword(e.target.value)} />
            <br/><br/>
            <button type="submit">Submit</button>
        </form>
    );
}
export default SignUpForm;
