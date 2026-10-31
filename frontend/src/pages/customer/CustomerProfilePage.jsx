
import { useEffect, useState } from "react";
import { getCustomerProfile } from "../../services/customerPortalService";

import CustomerPageHeader from "../../components/customer/CustomerPageHeader";
import CustomerLoading from "../../components/customer/CustomerLoading";
import CustomerError from "../../components/customer/CustomerError";

function CustomerProfilePage() {
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCustomerProfile();

            if (!response.success || !response.data) {
                throw new Error("Unable to load profile.");
            }

            setProfile(response.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) return <CustomerLoading message="Loading profile..." />;

    if (error) return <CustomerError message={error} onRetry={fetchProfile} />;

    const fields = [
        ["Full Name", profile.name],
        ["Email", profile.email],
        ["Phone", profile.phone],
        ["Company", profile.company],
        ["Address", profile.address],
        ["City", profile.city],
        ["State", profile.state],
        ["Country", profile.country],
        ["Postal Code", profile.postalCode],
    ];

    return (
        <div>
            <CustomerPageHeader
                title="My Profile"
                description="View your personal and account information."
            />

            <div className="max-w-3xl rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-4 border-b pb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
                        👤
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{profile.name || "Customer"}</h2>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {fields.map(([label, value]) => (
                        <div key={label}>
                            <p className="text-xs font-semibold uppercase text-gray-400">{label}</p>
                            <p className="mt-1 text-sm font-medium text-gray-800">{value || "Not provided"}</p>
                        </div>
                    ))}
                </div>

                <p className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
                    Profile editing is not available yet. Contact the administrator to update your information.
                </p>
            </div>
        </div>
    );
}

export default CustomerProfilePage;
