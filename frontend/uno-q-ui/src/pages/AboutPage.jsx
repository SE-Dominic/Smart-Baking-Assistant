import React from "react";
import "./About.css";

// Replace the placeholder values when you have the real info
const TEAM_MEMBERS = [
    { id: 1, name: "Jose Bianchi", role: "Developer", image: "", bio: "Short description goes here." },
    { id: 2, name: "Dominic Allen", role: "Scrum Master", image: "", bio: "Short description goes here." },
    { id: 3, name: "Thomas Haugstad", role: "Developer", image: "", bio: "Short description goes here." },
    { id: 4, name: "Carlie Gonzalez", role: "Developer", image: "", bio: "Short description goes here." },
    { id: 5, name: "Alex Posadas", role: "Developer", image: "", bio: "Short description goes here." },
];

export default function AboutPage() {
    return (
        <>
            <section id="about-project">
                <h1>About Smart Baking Assistant</h1>
                <p>
                    
                Smart Baking Assistant is a kitchen companion that helps you get every
                measurement right, from the first ingredient to the last. Built around an
                Arduino Uno Q and an HX711 load sensor, it weighs your ingredients in real
                time and guides you step by step, so you always know when you've added the
                right amount. An OLED screen lets you record and verify each measurement at
                a glance. Because baking gets messy, the assistant is designed to work
                hands-free: you can talk to it, get instant feedback and responses, and keep
                your hands in the dough instead of on a screen. The result is a more
                accurate, more confident, and more enjoyable baking experience.

                </p>
            </section>

            <section id="about-team">
                <h2>Meet the Team</h2>
                <div className="team-grid">
                    {TEAM_MEMBERS.map((member) => (
                        <article className="team-card" key={member.id}>
                            {member.image ? (
                                <img src={member.image} alt={member.name} />
                            ) : (
                                <div className="team-photo-placeholder" aria-hidden="true" />
                            )}
                            <h3>{member.name}</h3>
                            <p className="team-role">{member.role}</p>
                            <p>{member.bio}</p>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}