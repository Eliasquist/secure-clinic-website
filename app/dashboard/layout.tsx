import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import DashboardNavbar from "./DashboardNavbar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <SessionProvider session={session}>
            <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
                <DashboardNavbar user={session.user} />
                <main style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
                    {children}
                </main>
            </div>
        </SessionProvider>
    );
}
