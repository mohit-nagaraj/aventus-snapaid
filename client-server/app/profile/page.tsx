"use client";

import { Case, UserProfile, Roles } from "@/types/globals";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import toast from "react-hot-toast";

function ProfileContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("user");
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            setLoading(true);

            try {
                const res = await fetch(`/api/profile?userid=${userId}`);
                const json = await res.json();
                setUserData(json.data);

                const casesRes = await fetch(`/api/cases?userid=${userId}`);
                const casesJson = await casesRes.json();
                setCases(casesJson.data || []);
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleSave = async () => {
        if (!userId || !userData) return;

        try {
            const res = await fetch(`/api/profile?userid=${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    name: userData.name,
                    age: userData.age,
                    gender: userData.gender,
                }),
            });
            const result = await res.json();
            if (!res.ok) {
                console.error("Update failed:", result.error);
            } else {
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleNewCase = () => {
        router
            .push("/create")
    }

    if (!userId) {
        return <p className="text-gray-600 text-sm">No user ID provided in the URL.</p>;
    }
    if (loading || !userData) {
        return <p className="text-gray-600 text-sm">Loading user data...</p>;
    }

    return (
        <div className="max-w-xl mx-auto p-4 space-y-6 font-sans">
            <div className="flex items-center gap-4">
                <img
                    src={userData.image}
                    alt={userData.name ?? "Profile"}
                    className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                    <input
                        type="text"
                        value={userData.name ?? ""}
                        onChange={(e) =>
                            setUserData((prev) =>
                                prev ? { ...prev, name: e.target.value } : prev
                            )
                        }
                        className="mt-1 block w-full border rounded p-2 text-xl font-semibold"
                        placeholder="Name"
                    />
                    <p className="text-sm text-gray-500">{userData.email}</p>
                    <p className="text-sm text-gray-400 capitalize">{userData.role}</p>
                </div>
            </div>

            <div className="border-t pt-4 space-y-4">
                <h2 className="text-lg font-medium">Edit Profile</h2>
                <label className="block">
                    <span className="text-sm font-medium">Age</span>
                    <input
                        type="number"
                        value={userData.age ?? ""}
                        onChange={(e) =>
                            setUserData((prev) =>
                                prev ? { ...prev, age: e.target.value ? +e.target.value : null } : prev
                            )
                        }
                        className="mt-1 block w-full border rounded p-2"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Gender</span>
                    <select
                        value={userData.gender ?? ""}
                        onChange={(e) =>
                            setUserData((prev) =>
                                prev ? { ...prev, gender: e.target.value as Roles } : prev
                            )
                        }
                        className="mt-1 block w-full border rounded p-2"
                    >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </label>

                <button
                    onClick={handleSave}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    Save
                </button>
            </div>

            <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-medium mb-2">User Cases</h2>
                    <button
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        onClick={handleNewCase}>New case</button>
                </div>
                {cases.length > 0 ? (
                    <ul className="text-sm list-disc pl-5 space-y-1">
                        {cases.map((c, index) => (
                            <li key={index}>
                                <Link href={`/case?caseid=${c.id}`} className="text-blue-500 hover:underline">
                                    Link
                                </Link>
                                {JSON.stringify(c)}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">No cases found.</p>
                )}
            </div>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="text-center mt-10 text-gray-600">Loading profile page...</div>}>
            <ProfileContent />
        </Suspense>
    );
}
