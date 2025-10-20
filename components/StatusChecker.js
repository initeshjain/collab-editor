import { useEffect, useState } from "react";

export const StatusChecker = ({ children }) => {
    const [status, setStatus] = useState("checking");

    useEffect(() => {
        const checkHealth = () => {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/health`)
                .then(res => res.json())
                .then(() => setStatus("online"))
                .catch(() => setStatus("offline"));
        };

        checkHealth(); // run immediately once

        const interval = setInterval(checkHealth, 60 * 1000); // every 1 minute
        return () => clearInterval(interval); // cleanup
    }, []);

    if (status !== "online") {
        return <div>Server status is {status}...</div>;
    }

    return <>{children}</>;
};
