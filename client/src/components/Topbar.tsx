"use client";
export default function Topbar() {
  const handleLogout = () => {
    // implement logout
    console.log("Logged out");
  };

  return (
    <header className="flex justify-between items-center p-4 border-b">
      <button onClick={() => alert("Edit Profile")}>Edit Profile</button>
      <button onClick={handleLogout}>Logout</button>
    </header>
  );
}
