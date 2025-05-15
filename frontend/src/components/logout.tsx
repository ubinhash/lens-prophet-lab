"use client";

import { Button } from "./ui/button";
import { useAuthenticatedUser } from "@lens-protocol/react"; // To check the authenticated user
import { useRouter } from "next/navigation";
import { useSessionClient } from "@lens-protocol/react"; // Correct import for session client
import { getLensClient } from "@/lib/lens/client";
export function Logout() {
  const { data: authenticatedUser } = useAuthenticatedUser();
  const sessionClient = useSessionClient(); // Get the session client from Lens
  const router = useRouter();

  // Logout logic
  const handleLogout = async () => {
    if (!sessionClient || !authenticatedUser) return;

    try {
      // Perform logout via the session client
      const client = await getLensClient();

      if (client.isSessionClient()) {
        await client.logout();
      }

      // Optionally, trigger any UI update or state change after logout
      router.push("/"); // Redirect to the homepage or any other page

      // Refresh to reflect the logged-out state
      window.location.reload(); // Refresh the page to clear the session
    } catch (error) {
      console.error("Lens logout failed:", error);
    }
  };

  // Display the logout button if the user is authenticated
  return authenticatedUser ? (
    <div className="flex items-center justify-between gap-2">
      {/* <span className="text-sm text-muted-foreground truncate">
        Signed in as: <span className="text-primary font-semibold">{authenticatedUser.address}</span>
      </span> */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="ml-4"
      >
        Logout
      </Button>
    </div>
  ) : null; // Return null if no user is authenticated
}

