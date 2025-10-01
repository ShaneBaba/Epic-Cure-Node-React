import React, { useEffect, useState } from "react";

function GrantList() {
    const [grants, setGrants] = useState([]);
    const [newGrant, setNewGrant] = useState({
        name: "",
        duedate: "",
        category: ""
    });

    useEffect(() => {
        fetch("http://localhost:5000/api/grants")
            .then(res => res.json())
            .then(data => setGrants(data));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewGrant(prev => ({ ...prev, [name]: value }));
    };

    const addGrant = async () => {
        const res = await fetch("http://localhost:5000/api/grants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newGrant)
        });
        const data = await res.json();
        setGrants([...grants, data]);
        setNewGrant({ name: "", duedate: "", category: "" });
    };

    return (
        <div>
            <h2>Add New Grant</h2>
            <input
                type="text"
                name="name"
                value={newGrant.name}
                onChange={handleChange}
                placeholder="Grant Name"
            />
            <input
                type="date"
                name="duedate"
                value={newGrant.duedate}
                onChange={handleChange}
                placeholder="Due Date"
            />
            <input
                type="text"
                name="category"
                value={newGrant.category}
                onChange={handleChange}
                placeholder="Category"
            />
            <button onClick={addGrant}>Add Grant</button>

            <h2>Grant List</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Due Date</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {grants.map(g => (
                        <tr key={g.id}>
                            <td>{g.name}</td>
                            <td>{g.duedate}</td>
                            <td>{g.category}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default GrantList;

