"use client";

import { CSSProperties, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserList from "../components/UserList";
import ChatBox from "../components/ChatBox";

const HomePage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
    } else {
      const parsedUser = JSON.parse(user);
      if (parsedUser) {
        setCurrentUser(parsedUser);
      }
    }
  }, [router]);

  if (!currentUser) {
    return <p>Loading...</p>;
  }

  return (
    <div style={styles.container}>
      {/* Left Column: User List */}
      <div style={{ flex: 1, borderRight: "1px solid #ccc", padding: "10px" }}>
        <UserList onSelectUser={setSelectedUser} />
      </div>

      {/* Right Column: Chat Box */}
      <div style={{ flex: 2, padding: "10px" }}>
        {selectedUser && (
          <ChatBox currentUser={currentUser} selectedUser={selectedUser} />
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: CSSProperties } = {
  container: {
    height: "100vh",
    display: "flex",
    backgroundImage: "url('/pic8.jpg')",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "cover",
  },
};
// #edb601
export default HomePage;