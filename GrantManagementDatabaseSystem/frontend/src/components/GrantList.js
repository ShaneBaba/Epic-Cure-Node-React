import React, { useEffect, useState } from "react";

function GrantList() {
    const [grants, setGrants] = useState([]);
    const [newGrant, setNewGrant] = useState("");

    useEffect(() => {
        fetch("http://localhost:5000/api/grants")
            .then(res => res.json())
            .then(data => setGrants(data));
    }, []);

    const addGrant = async () => {
        const res = await fetch("http://localhost:5000/api/grants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newGrant })
        });
        const data = await res.json();
        setGrants([...grants, data]);
        setNewGrant("");
    };

    return (
        <div>
            <ul>
                {grants.map(u => (
                    <li key={u.id}>{u.name}</li>
                ))}
            </ul>

            <input
                type="text"
                value={newGrant}
                onChange={e => setNewGrant(e.target.value)}
                placeholder="New Grant"
            />
            <button onClick={addGrant}>Add Grant</button>
        </div>
    );
}

export default GrantList;
