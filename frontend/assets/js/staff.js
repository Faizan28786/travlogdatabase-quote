document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    // Authentication check
    if (!token || !user) {
        window.location.href = "login.html";
        return;
    }

    // Only Super Admin can access Staff page
    if (user.role !== "superadmin") {
        alert("Access denied");
        window.location.href = "dashboard.html";
        return;
    }

    const staffTable = document.getElementById("staffTable");

    try {

        const response = await fetch(`${CONFIG.API_BASE}/staff`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        console.log("STAFF RESPONSE:", data);

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to load staff");
        }

        const staff = data.staff || data.users || [];

        if (!staff.length) {
            staffTable.innerHTML = `
                <tr>
                    <td colspan="5">No staff members found</td>
                </tr>
            `;
            return;
        }

        staffTable.innerHTML = staff.map(member => {

            const staffId = member.staffId || member.email || "-";

            const lastLogin = member.lastLogin
                ? new Date(member.lastLogin).toLocaleString("en-IN")
                : "Never";

            return `
                <tr>
                    <td>${staffId}</td>
                    <td>${member.name || "-"}</td>
                    <td>${member.email || "-"}</td>
                    <td>${member.active ? "Active" : "Inactive"}</td>
                    <td>${lastLogin}</td>
                </tr>
            `;

        }).join("");

    } catch (error) {

        console.error("Staff loading error:", error);

        staffTable.innerHTML = `
            <tr>
                <td colspan="5">Failed to load staff</td>
            </tr>
        `;
    }

});