import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import AppShell from "./components/AppShell";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    // Extract subscription data from session if available
    // @ts-ignore - session may have extended properties
    const subscription = session.subscription || {
        status: 'INACTIVE',
        entitled: false
    };

    return (
        <SessionProvider session={session}>
            <AppShell user={session.user} subscription={subscription}>
                {children}
            </AppShell>
        </SessionProvider>
    );
}
