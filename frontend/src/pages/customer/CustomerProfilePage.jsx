
import { useState } from "react";

function CustomerProfilePage() {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        company: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
    });

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Profile update will be available when the customer API is ready.");
    };

    const fields = [
        { name: "name", label: "Full Name", required: true },
        { name: "email", label: "Email Address", required: true },
        { name: "phone", label: "Phone Number" },
        { name: "company", label: "Company" },
        { name: "address", label: "Address" },
        { name: "city", label: "City" },
        { name: "state", label: "State" },
        { name: "country", label: "Country" },
        { name: "postalCode", label: "Postal Code" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm text-slate-400">Customer Portal / Profile</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-800">
                    My Profile
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    View and manage your personal information.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
                <div className="mb-6 border-b border-slate-100 pb-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
                        {profile.name.charAt(0).toUpperCase() || "C"}
                    </div>

                    <h2 className="mt-3 text-lg font-semibold text-slate-800">
                        Personal Information
                    </h2>
                    <p className="text-sm text-slate-500">
                        Keep your contact information up to date.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {fields.map((field) => (
                        <div key={field.name}>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                {field.label}
                            </label>

                            <input
                                name={field.name}
                                type={field.name === "email" ? "email" : "text"}
                                value={profile[field.name]}
                                onChange={handleChange}
                                required={field.required || false}
                                readOnly={field.name === "email"}
                                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 read-only:bg-slate-50"
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-7 flex justify-end">
                    <button
                        type="submit"
                        className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        Save Changes
                    </button>
                </div>

                <p className="mt-4 text-xs text-slate-400">
                    Profile editing will be enabled after the customer API is implemented.
                </p>
            </form>
        </div>
    );
}

export default CustomerProfilePage;
