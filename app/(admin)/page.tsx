import { currentUser } from "@clerk/nextjs/server";

export default async function AdminPage() {
  const user = await currentUser();
  return <h1>Admin Dashboard — Welcome {user?.firstName}</h1>;
}
